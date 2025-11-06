import { cloneDefaultSettings } from "../config/default-settings";
import type { RendererSettings } from "../shared/types";
import {
  Comment,
  type CommentDependencies,
  type CommentPrepareOptions,
  type TimeSource,
  createDefaultTimeSource,
  STATIC_VISIBLE_DURATION_MS,
} from "./comment";
import { createLogger, type Logger } from "../shared/logger";
import {
  configureDebugLogging,
  debugLog,
  formatCommentPreview,
  isDebugLoggingEnabled,
} from "../shared/debug";
import type { DebugLoggingOptions } from "../shared/debug";

export interface CommentRendererConfig {
  loggerNamespace?: string;
  timeSource?: TimeSource;
  animationFrameProvider?: AnimationFrameProvider;
  createCanvasElement?: () => HTMLCanvasElement;
  debug?: DebugLoggingOptions;
}

export interface CommentRendererInitializeOptions {
  video: HTMLVideoElement;
  container?: HTMLElement | null;
}

export interface AnimationFrameProvider {
  request(callback: FrameRequestCallback): ReturnType<typeof setTimeout>;
  cancel(handle: ReturnType<typeof setTimeout>): void;
}

type VideoFrameCallbackMetadataLike = {
  readonly mediaTime?: number;
};

type RequestVideoFrameCallback = (
  callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadataLike) => void,
) => number;

type CancelVideoFrameCallback = (handle: number) => void;

interface LaneReservation {
  comment: Comment;
  startTime: number;
  endTime: number;
  totalEndTime: number;
  startLeft: number;
  width: number;
  speed: number;
  buffer: number;
  directionSign: -1 | 1;
}

const toMilliseconds = (seconds: number): number => seconds * 1000;
const sanitizeVposMs = (value: number): number | null => {
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value < 0) {
    return null;
  }
  return Math.round(value);
};
const MAX_VISIBLE_DURATION_MS = 4_000;
const MIN_VISIBLE_DURATION_MS = 1_800;
const MAX_COMMENT_WIDTH_RATIO = 3;
const COLLISION_BUFFER_RATIO = 0.25;
const BASE_COLLISION_BUFFER_PX = 32;
const ENTRY_BUFFER_PX = 48;
const RESERVATION_TIME_MARGIN_MS = 120;
const FINAL_PHASE_THRESHOLD_MS = 4_000;
const FINAL_PHASE_MIN_GAP_MS = 120;
const FINAL_PHASE_MAX_GAP_MS = 800;
const FINAL_PHASE_ORDER_EPSILON_MS = 2;
const FINAL_PHASE_MIN_WINDOW_MS = 4_000;
// シーク後も画面上に残る可能性があるコメントを拾えるよう、可視時間と静止時間の合計を参照する
const ACTIVE_WINDOW_MS = STATIC_VISIBLE_DURATION_MS + MAX_VISIBLE_DURATION_MS;
const VIRTUAL_CANVAS_EXTENSION_PX = 1_000;
const MIN_LANE_COUNT = 1;
const DEFAULT_LANE_COUNT = 12;
const MIN_FONT_SIZE_PX = 24;
const SMALL_COMMENT_SCALE = 0.8;
const BIG_COMMENT_SCALE = 1.4;
const EDGE_EPSILON = 1e-3;
const SEEK_DIRECTION_EPSILON_MS = 50;

const clampOpacity = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
};

const normalizeSettings = (settings: RendererSettings): RendererSettings => {
  const rawDuration = settings.scrollVisibleDurationMs;
  const normalizedDuration =
    rawDuration === null || rawDuration === undefined
      ? null
      : Number.isFinite(rawDuration)
        ? Math.max(1, Math.floor(rawDuration))
        : null;

  const base: RendererSettings = {
    ...settings,
    scrollDirection: settings.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: clampOpacity(settings.commentOpacity),
    renderStyle: settings.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: normalizedDuration,
    syncMode: settings.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: Boolean(settings.useDprScaling),
  };
  return base;
};

export const createDefaultAnimationFrameProvider = (
  timeSource: TimeSource,
): AnimationFrameProvider => {
  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function" &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    return {
      request: (callback) => window.requestAnimationFrame(callback),
      cancel: (handle) => window.cancelAnimationFrame(handle),
    };
  }
  return {
    request: (callback) => {
      const timeoutId = globalThis.setTimeout(() => {
        callback(timeSource.now());
      }, 16);
      return timeoutId;
    },
    cancel: (handle) => {
      globalThis.clearTimeout(handle);
    },
  };
};

const createBrowserCanvasFactory = (): (() => HTMLCanvasElement) => {
  if (typeof document === "undefined") {
    return () => {
      throw new Error(
        "Document is not available. Provide a custom createCanvasElement implementation.",
      );
    };
  }
  return () => document.createElement("canvas");
};

const isRendererSettings = (input: unknown): input is RendererSettings => {
  if (!input || typeof input !== "object") {
    return false;
  }
  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.commentColor === "string" &&
    typeof candidate.commentOpacity === "number" &&
    typeof candidate.isCommentVisible === "boolean"
  );
};

export class CommentRenderer {
  private _settings: RendererSettings;
  private readonly comments: Comment[] = [];
  private readonly activeComments = new Set<Comment>();
  private readonly reservedLanes = new Map<number, LaneReservation[]>();
  private readonly topStaticLaneReservations = new Map<number, number>();
  private readonly bottomStaticLaneReservations = new Map<number, number>();
  private readonly log: Logger;
  private readonly timeSource: TimeSource;
  private readonly animationFrameProvider: AnimationFrameProvider;
  private readonly createCanvasElement: () => HTMLCanvasElement;
  private readonly commentDependencies: CommentDependencies;
  private settingsVersion = 0;
  private dynamicStrokeTextThreshold = 30;
  private normalizedNgWords: string[] = [];
  private compiledNgRegexps: RegExp[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private containerElement: HTMLElement | null = null;
  private fullscreenActive = false;
  private laneCount = DEFAULT_LANE_COUNT;
  private laneHeight = 0;
  private displayWidth = 0;
  private displayHeight = 0;
  private canvasDpr = 1;
  private currentTime = 0;
  private duration = 0;
  private playbackRate = 1;
  private isPlaying = true;
  private lastDrawTime = 0;
  private finalPhaseActive = false;
  private finalPhaseStartTime: number | null = null;
  private finalPhaseScheduleDirty = false;
  private playbackHasBegun = false;
  private skipDrawingForCurrentFrame = false;
  private readonly finalPhaseVposOverrides = new Map<Comment, number>();
  private frameId: ReturnType<typeof setTimeout> | null = null;
  private videoFrameHandle: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeObserverTarget: Element | null = null;
  private readonly isResizeObserverAvailable = typeof ResizeObserver !== "undefined";
  private readonly cleanupTasks: Array<() => void> = [];
  private commentSequence = 0;

  constructor(settings: RendererSettings | null, config?: CommentRendererConfig);
  constructor(config?: CommentRendererConfig);
  constructor(
    settingsOrConfig: RendererSettings | CommentRendererConfig | null = null,
    maybeConfig: CommentRendererConfig | undefined = undefined,
  ) {
    let baseSettings: RendererSettings;
    let config: CommentRendererConfig;

    if (isRendererSettings(settingsOrConfig)) {
      baseSettings = normalizeSettings({ ...(settingsOrConfig as RendererSettings) });
      config = maybeConfig ?? {};
    } else {
      const configCandidate = settingsOrConfig ?? maybeConfig ?? {};
      config =
        typeof configCandidate === "object" ? (configCandidate as CommentRendererConfig) : {};
      baseSettings = normalizeSettings(cloneDefaultSettings());
    }

    this._settings = normalizeSettings(baseSettings);
    this.dynamicStrokeTextThreshold = Math.max(0, Math.floor(this._settings.strokeTextThreshold));
    this.timeSource = config.timeSource ?? createDefaultTimeSource();
    this.animationFrameProvider =
      config.animationFrameProvider ?? createDefaultAnimationFrameProvider(this.timeSource);
    this.createCanvasElement = config.createCanvasElement ?? createBrowserCanvasFactory();
    this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion,
      strokeTextThreshold: this.dynamicStrokeTextThreshold,
    };
    this.log = createLogger(config.loggerNamespace ?? "CommentRenderer");

    this.rebuildNgMatchers();

    if (config.debug) {
      configureDebugLogging(config.debug);
    }
  }

  get settings(): RendererSettings {
    return this._settings;
  }

  set settings(value: RendererSettings) {
    this._settings = normalizeSettings(value);
    this.settingsVersion += 1;
    this.commentDependencies.settingsVersion = this.settingsVersion;
    this.dynamicStrokeTextThreshold = Math.max(0, Math.floor(this._settings.strokeTextThreshold));
    this.commentDependencies.strokeTextThreshold = this.dynamicStrokeTextThreshold;
    this.rebuildNgMatchers();
  }

  private resolveContainer(
    explicit: HTMLElement | null | undefined,
    video: HTMLVideoElement,
  ): HTMLElement {
    if (explicit) {
      return explicit;
    }
    if (video.parentElement) {
      return video.parentElement;
    }
    if (typeof document !== "undefined" && document.body) {
      return document.body;
    }
    throw new Error(
      "Cannot resolve container element. Provide container explicitly when DOM is unavailable.",
    );
  }

  private ensureContainerPositioning(container: HTMLElement): void {
    if (typeof getComputedStyle === "function") {
      const style = getComputedStyle(container);
      if (style.position === "static") {
        container.style.position = "relative";
      }
      return;
    }
    if (!container.style.position) {
      container.style.position = "relative";
    }
  }

  initialize(options: HTMLVideoElement | CommentRendererInitializeOptions): void {
    try {
      this.destroyCanvasOnly();

      const video = options instanceof HTMLVideoElement ? options : options.video;
      const containerCandidate =
        options instanceof HTMLVideoElement
          ? options.parentElement
          : (options.container ?? options.video.parentElement);
      const container = this.resolveContainer(containerCandidate ?? null, video);

      this.videoElement = video;
      this.containerElement = container;
      this.duration = Number.isFinite(video.duration) ? toMilliseconds(video.duration) : 0;
      this.currentTime = toMilliseconds(video.currentTime);
      this.playbackRate = video.playbackRate;
      this.isPlaying = !video.paused;
      this.lastDrawTime = this.timeSource.now();
      this.playbackHasBegun = this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS;
      this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();

      const canvas = this.createCanvasElement();
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Failed to acquire 2D canvas context");
      }

      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "1000";

      const parent = this.containerElement;
      if (parent instanceof HTMLElement) {
        this.ensureContainerPositioning(parent);
        parent.appendChild(canvas);
      }

      this.canvas = canvas;
      this.ctx = context;

      this.resize();
      this.calculateLaneMetrics();
      this.setupVideoEventListeners(video);
      this.setupResizeHandling(video);
      this.setupFullscreenHandling();
      this.setupVideoChangeDetection(video, container);
      this.startAnimation();
      this.setupVisibilityHandling();
    } catch (error) {
      this.log.error("CommentRenderer.initialize", error as Error);
      throw error;
    }
  }

  addComments(
    entries: ReadonlyArray<{ text: string; vposMs: number; commands?: string[] }>,
  ): Comment[] {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    const addedComments: Comment[] = [];
    this.commentDependencies.settingsVersion = this.settingsVersion;

    for (const entry of entries) {
      const { text, vposMs, commands = [] } = entry;
      const preview = formatCommentPreview(text);

      if (this.isNGComment(text)) {
        debugLog("comment-skip-ng", { preview, vposMs });
        continue;
      }

      const normalizedVposMs = sanitizeVposMs(vposMs);
      if (normalizedVposMs === null) {
        this.log.warn("CommentRenderer.addComment.invalidVpos", { text, vposMs });
        debugLog("comment-skip-invalid-vpos", { preview, vposMs });
        continue;
      }

      const duplicate =
        this.comments.some(
          (comment) => comment.text === text && comment.vposMs === normalizedVposMs,
        ) ||
        addedComments.some(
          (comment) => comment.text === text && comment.vposMs === normalizedVposMs,
        );
      if (duplicate) {
        debugLog("comment-skip-duplicate", { preview, vposMs: normalizedVposMs });
        continue;
      }

      const comment = new Comment(
        text,
        normalizedVposMs,
        commands,
        this._settings,
        this.commentDependencies,
      );
      comment.creationIndex = this.commentSequence++;
      addedComments.push(comment);
      debugLog("comment-added", {
        preview,
        vposMs: normalizedVposMs,
        commands: comment.commands.length,
        layout: comment.layout,
        isScrolling: comment.isScrolling,
        invisible: comment.isInvisible,
      });
    }

    if (addedComments.length === 0) {
      return [];
    }

    this.comments.push(...addedComments);
    if (this.finalPhaseActive) {
      this.finalPhaseScheduleDirty = true;
    }
    this.comments.sort((a, b) => {
      const vposMsDiff = a.vposMs - b.vposMs;
      if (Math.abs(vposMsDiff) > EDGE_EPSILON) {
        return vposMsDiff;
      }
      return a.creationIndex - b.creationIndex;
    });

    return addedComments;
  }

  addComment(text: string, vposMs: number, commands: string[] = []): Comment | null {
    const [comment] = this.addComments([{ text, vposMs, commands }]);
    return comment ?? null;
  }

  clearComments(): void {
    this.comments.length = 0;
    this.activeComments.clear();
    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
    this.commentSequence = 0;
    if (this.ctx && this.canvas) {
      const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
      const width = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / effectiveDpr;
      const height =
        this.displayHeight > 0 ? this.displayHeight : this.canvas.height / effectiveDpr;
      this.ctx.clearRect(0, 0, width, height);
    }
  }

  resetState(): void {
    this.clearComments();
    this.currentTime = 0;
    this.resetFinalPhaseState();
    this.playbackHasBegun = false;
    this.skipDrawingForCurrentFrame = false;
  }

  destroy(): void {
    this.stopAnimation();
    this.cleanupResizeHandling();
    this.runCleanupTasks();

    if (this.canvas) {
      this.canvas.remove();
    }
    this.canvas = null;
    this.ctx = null;
    this.videoElement = null;
    this.containerElement = null;
    this.comments.length = 0;
    this.activeComments.clear();
    this.reservedLanes.clear();
    this.resetFinalPhaseState();
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.canvasDpr = 1;
    this.commentSequence = 0;
    this.playbackHasBegun = false;
    this.skipDrawingForCurrentFrame = false;
  }

  private resetFinalPhaseState(): void {
    this.finalPhaseActive = false;
    this.finalPhaseStartTime = null;
    this.finalPhaseScheduleDirty = false;
    this.finalPhaseVposOverrides.clear();
  }

  private getEffectiveCommentVpos(comment: Comment): number {
    if (this.finalPhaseActive && this.finalPhaseScheduleDirty) {
      this.recomputeFinalPhaseTimeline();
    }
    const override = this.finalPhaseVposOverrides.get(comment);
    return override ?? comment.vposMs;
  }

  private getFinalPhaseDisplayDuration(comment: Comment): number {
    if (!comment.isScrolling) {
      return STATIC_VISIBLE_DURATION_MS;
    }

    const durations: number[] = [];
    if (Number.isFinite(comment.visibleDurationMs) && comment.visibleDurationMs > 0) {
      durations.push(comment.visibleDurationMs);
    }
    if (Number.isFinite(comment.totalDurationMs) && comment.totalDurationMs > 0) {
      durations.push(comment.totalDurationMs);
    }

    if (durations.length > 0) {
      return Math.max(...durations);
    }

    return MAX_VISIBLE_DURATION_MS;
  }

  private resolveFinalPhaseVpos(comment: Comment): number {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.delete(comment);
      return comment.vposMs;
    }
    if (this.finalPhaseScheduleDirty) {
      this.recomputeFinalPhaseTimeline();
    }
    const override = this.finalPhaseVposOverrides.get(comment);
    if (override !== undefined) {
      return override;
    }
    const fallback = Math.max(comment.vposMs, this.finalPhaseStartTime);
    this.finalPhaseVposOverrides.set(comment, fallback);
    return fallback;
  }

  private recomputeFinalPhaseTimeline(): void {
    if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
      this.finalPhaseVposOverrides.clear();
      this.finalPhaseScheduleDirty = false;
      return;
    }

    const windowStart = this.finalPhaseStartTime;
    const durationMs = this.duration > 0 ? this.duration : windowStart + FINAL_PHASE_MIN_WINDOW_MS;
    const windowEnd = Math.max(windowStart + FINAL_PHASE_MIN_WINDOW_MS, durationMs);

    const candidates = this.comments
      .filter((comment) => {
        if (comment.hasShown) {
          return false;
        }
        if (comment.isInvisible) {
          return false;
        }
        if (this.isNGComment(comment.text)) {
          return false;
        }
        return comment.vposMs >= windowStart - ACTIVE_WINDOW_MS;
      })
      .sort((a, b) => {
        const diff = a.vposMs - b.vposMs;
        if (Math.abs(diff) > EDGE_EPSILON) {
          return diff;
        }
        return a.creationIndex - b.creationIndex;
      });

    this.finalPhaseVposOverrides.clear();

    if (candidates.length === 0) {
      this.finalPhaseScheduleDirty = false;
      return;
    }

    const windowSpan = Math.max(windowEnd - windowStart, FINAL_PHASE_MIN_WINDOW_MS);
    const baseGap = windowSpan / Math.max(candidates.length, 1);
    const boundedGap = Number.isFinite(baseGap) ? baseGap : FINAL_PHASE_MIN_GAP_MS;
    const gap = Math.max(FINAL_PHASE_MIN_GAP_MS, Math.min(boundedGap, FINAL_PHASE_MAX_GAP_MS));

    let nextStart = windowStart;
    candidates.forEach((comment, index) => {
      const durationNeeded = Math.max(1, this.getFinalPhaseDisplayDuration(comment));
      const availableLatestStart = windowEnd - durationNeeded;
      let assigned = Math.max(windowStart, Math.min(nextStart, availableLatestStart));
      if (!Number.isFinite(assigned)) {
        assigned = windowStart;
      }
      const epsilon = FINAL_PHASE_ORDER_EPSILON_MS * index;
      if (assigned + epsilon <= availableLatestStart) {
        assigned += epsilon;
      }
      this.finalPhaseVposOverrides.set(comment, assigned);
      const spacing = Math.max(FINAL_PHASE_MIN_GAP_MS, Math.min(durationNeeded / 2, gap));
      nextStart = assigned + spacing;
    });

    this.finalPhaseScheduleDirty = false;
  }

  private shouldSuppressRendering(): boolean {
    return (
      !this.playbackHasBegun && !this.isPlaying && this.currentTime <= SEEK_DIRECTION_EPSILON_MS
    );
  }

  private updatePlaybackProgressState(): void {
    if (this.playbackHasBegun) {
      return;
    }
    if (this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS) {
      this.playbackHasBegun = true;
    }
  }

  updateSettings(newSettings: RendererSettings): void {
    const previousUseContainer = this._settings.useContainerResizeObserver;
    const previousDirection = this._settings.scrollDirection;
    const previousUseDprScaling = this._settings.useDprScaling;
    const previousSyncMode = this._settings.syncMode;
    this.settings = newSettings;
    const directionChanged = previousDirection !== this._settings.scrollDirection;
    const useDprScalingChanged = previousUseDprScaling !== this._settings.useDprScaling;
    const syncModeChanged = previousSyncMode !== this._settings.syncMode;

    this.comments.forEach((comment) => {
      comment.syncWithSettings(
        this._settings,
        this.settingsVersion,
        this.dynamicStrokeTextThreshold,
      );
    });

    if (directionChanged) {
      this.resetCommentActivity();
    }

    if (!this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((comment) => {
        comment.isActive = false;
        comment.clearActivation();
      });
      this.activeComments.clear();
      const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
      const width = this.displayWidth > 0 ? this.displayWidth : this.canvas.width / effectiveDpr;
      const height =
        this.displayHeight > 0 ? this.displayHeight : this.canvas.height / effectiveDpr;
      this.ctx.clearRect(0, 0, width, height);
      this.reservedLanes.clear();
      this.topStaticLaneReservations.clear();
      this.bottomStaticLaneReservations.clear();
    }

    if (previousUseContainer !== this._settings.useContainerResizeObserver && this.videoElement) {
      this.setupResizeHandling(this.videoElement);
    }

    if (useDprScalingChanged) {
      this.resize();
    }

    if (syncModeChanged && this.videoElement) {
      this.startAnimation();
    }

    this.calculateLaneMetrics();
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getCurrentVideoSource(): string | null {
    const video = this.videoElement;
    if (!video) {
      return null;
    }
    if (typeof video.currentSrc === "string" && video.currentSrc.length > 0) {
      return video.currentSrc;
    }
    const attribute = video.getAttribute("src");
    if (attribute && attribute.length > 0) {
      return attribute;
    }
    const sourceElement = video.querySelector("source[src]") as HTMLSourceElement | null;
    if (sourceElement && typeof sourceElement.src === "string") {
      return sourceElement.src;
    }
    return null;
  }

  getCommentsSnapshot(): Comment[] {
    return [...this.comments];
  }

  private rebuildNgMatchers(): void {
    const normalizedWords: string[] = [];
    const compiledRegexps: RegExp[] = [];

    const sourceWords = Array.isArray(this._settings.ngWords) ? this._settings.ngWords : [];
    for (const word of sourceWords) {
      if (typeof word !== "string") {
        continue;
      }
      const normalized = word.trim().toLowerCase();
      if (normalized.length === 0) {
        continue;
      }
      normalizedWords.push(normalized);
    }

    const sourcePatterns = Array.isArray(this._settings.ngRegexps) ? this._settings.ngRegexps : [];
    for (const pattern of sourcePatterns) {
      if (typeof pattern !== "string" || pattern.length === 0) {
        continue;
      }
      try {
        compiledRegexps.push(new RegExp(pattern));
      } catch (regexError) {
        this.log.error("CommentRenderer.rebuildNgMatchers.regex", regexError as Error, {
          pattern,
        });
      }
    }

    this.normalizedNgWords = normalizedWords;
    this.compiledNgRegexps = compiledRegexps;
  }

  isNGComment(text: string): boolean {
    try {
      if (typeof text !== "string") {
        return true;
      }

      if (this.normalizedNgWords.length > 0) {
        const normalizedText = text.toLowerCase();
        const containsNgWord = this.normalizedNgWords.some((word) => normalizedText.includes(word));
        if (containsNgWord) {
          return true;
        }
      }

      if (this.compiledNgRegexps.length > 0) {
        return this.compiledNgRegexps.some((regexp) => regexp.test(text));
      }

      return false;
    } catch (error) {
      this.log.error("CommentRenderer.isNGComment", error as Error, { text });
      return true;
    }
  }

  resize(width?: number, height?: number): void {
    const video = this.videoElement;
    const canvas = this.canvas;
    const context = this.ctx;
    if (!video || !canvas) {
      return;
    }

    const rect = video.getBoundingClientRect();
    const currentDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const fallbackWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / currentDpr;
    const fallbackHeight = this.displayHeight > 0 ? this.displayHeight : canvas.height / currentDpr;

    const measuredWidth = width ?? rect.width ?? fallbackWidth;
    const measuredHeight = height ?? rect.height ?? fallbackHeight;

    if (
      !Number.isFinite(measuredWidth) ||
      !Number.isFinite(measuredHeight) ||
      measuredWidth <= 0 ||
      measuredHeight <= 0
    ) {
      return;
    }

    const cssWidth = Math.max(1, Math.floor(measuredWidth));
    const cssHeight = Math.max(1, Math.floor(measuredHeight));
    const previousDisplayWidth = this.displayWidth > 0 ? this.displayWidth : cssWidth;
    const previousDisplayHeight = this.displayHeight > 0 ? this.displayHeight : cssHeight;
    const nextDpr = this._settings.useDprScaling ? this.resolveDevicePixelRatio() : 1;
    const pixelWidth = Math.max(1, Math.round(cssWidth * nextDpr));
    const pixelHeight = Math.max(1, Math.round(cssHeight * nextDpr));

    const needsResize =
      this.displayWidth !== cssWidth ||
      this.displayHeight !== cssHeight ||
      Math.abs(this.canvasDpr - nextDpr) > Number.EPSILON ||
      canvas.width !== pixelWidth ||
      canvas.height !== pixelHeight;

    if (!needsResize) {
      return;
    }

    this.displayWidth = cssWidth;
    this.displayHeight = cssHeight;
    this.canvasDpr = nextDpr;

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    if (context) {
      context.setTransform(1, 0, 0, 1, 0, 0);
      if (this._settings.useDprScaling) {
        context.scale(nextDpr, nextDpr);
      }
    }

    const scaleX = previousDisplayWidth > 0 ? cssWidth / previousDisplayWidth : 1;
    const scaleY = previousDisplayHeight > 0 ? cssHeight / previousDisplayHeight : 1;

    if (scaleX !== 1 || scaleY !== 1) {
      this.comments.forEach((comment) => {
        if (comment.isActive) {
          comment.x *= scaleX;
          comment.y *= scaleY;
          comment.width *= scaleX;
          comment.fontSize = Math.max(
            MIN_FONT_SIZE_PX,
            Math.floor(Math.max(1, comment.fontSize) * scaleY),
          );
          comment.height = comment.fontSize;
          comment.virtualStartX *= scaleX;
          comment.exitThreshold *= scaleX;
          comment.baseSpeed *= scaleX;
          comment.speed *= scaleX;
          comment.speedPixelsPerMs *= scaleX;
          comment.bufferWidth *= scaleX;
          comment.reservationWidth *= scaleX;
        }
      });
    }

    this.calculateLaneMetrics();
  }

  private resolveDevicePixelRatio(): number {
    if (typeof window === "undefined") {
      return 1;
    }
    const ratio = Number(window.devicePixelRatio);
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return 1;
    }
    return ratio;
  }

  private destroyCanvasOnly(): void {
    this.stopAnimation();
    this.cleanupResizeHandling();
    this.runCleanupTasks();
    if (this.canvas) {
      this.canvas.remove();
    }
    this.canvas = null;
    this.ctx = null;
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.canvasDpr = 1;
    this.fullscreenActive = false;
  }

  private calculateLaneMetrics(): void {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }

    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / Math.max(this.canvasDpr, 1);
    const baseHeight = Math.max(MIN_FONT_SIZE_PX, Math.floor(effectiveHeight * 0.05));
    this.laneHeight = baseHeight * 1.2;
    const availableLanes = Math.floor(effectiveHeight / Math.max(this.laneHeight, 1));
    if (this._settings.useFixedLaneCount) {
      // 利用可能レーン数の範囲にクランプして固定値を適用
      const desired = Number.isFinite(this._settings.fixedLaneCount)
        ? Math.floor(this._settings.fixedLaneCount)
        : DEFAULT_LANE_COUNT;
      const clamped = Math.max(MIN_LANE_COUNT, Math.min(availableLanes, desired));
      this.laneCount = clamped;
    } else {
      this.laneCount = Math.max(MIN_LANE_COUNT, availableLanes);
    }
    this.dynamicStrokeTextThreshold = this.estimateStrokeTextThreshold(
      effectiveHeight,
      this.laneCount,
      baseHeight,
    );
    this.commentDependencies.strokeTextThreshold = this.dynamicStrokeTextThreshold;
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
  }

  private estimateStrokeTextThreshold(
    effectiveHeight: number,
    laneCount: number,
    baseFontSizeCandidate: number,
  ): number {
    const normalizedBase = Math.max(MIN_FONT_SIZE_PX, baseFontSizeCandidate);
    const laneHeightEstimate =
      laneCount > 0 ? Math.max(1, Math.floor(effectiveHeight / laneCount)) : normalizedBase * 1.2;
    const laneBasedMedium = Math.max(MIN_FONT_SIZE_PX, Math.floor(laneHeightEstimate / 1.2));
    const mediumFontSize = Math.max(MIN_FONT_SIZE_PX, Math.min(normalizedBase, laneBasedMedium));
    const smallFontSize = Math.max(
      MIN_FONT_SIZE_PX,
      Math.floor(mediumFontSize * SMALL_COMMENT_SCALE),
    );
    const delta = Math.max(0, mediumFontSize - smallFontSize);
    const densityScale = Math.min(1.5, Math.max(0.7, DEFAULT_LANE_COUNT / Math.max(laneCount, 1)));
    const thresholdBase = mediumFontSize + Math.ceil(delta / 2);
    const scaledThreshold = Math.floor(thresholdBase * densityScale);
    const bigFontSize = Math.max(mediumFontSize, Math.floor(mediumFontSize * BIG_COMMENT_SCALE));
    const maxThreshold = bigFontSize > mediumFontSize ? bigFontSize - 1 : bigFontSize;
    const boundedThreshold = Math.max(mediumFontSize, scaledThreshold);
    const candidate =
      maxThreshold > mediumFontSize ? Math.min(boundedThreshold, maxThreshold) : boundedThreshold;
    return Math.max(MIN_FONT_SIZE_PX, candidate);
  }

  private updateComments(frameTimeMs?: number): void {
    const video = this.videoElement;
    const canvas = this.canvas;
    const context = this.ctx;
    if (!video || !canvas || !context) {
      return;
    }

    const referenceTime =
      typeof frameTimeMs === "number" ? frameTimeMs : toMilliseconds(video.currentTime);
    this.currentTime = referenceTime;
    this.playbackRate = video.playbackRate;
    this.isPlaying = !video.paused;
    this.updatePlaybackProgressState();
    this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
    if (this.skipDrawingForCurrentFrame) {
      return;
    }
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    const prepareOptions = this.buildPrepareOptions(effectiveWidth);

    const isNearEnd =
      this.duration > 0 && this.duration - this.currentTime <= FINAL_PHASE_THRESHOLD_MS;

    if (isNearEnd && !this.finalPhaseActive) {
      this.finalPhaseActive = true;
      this.finalPhaseStartTime = this.currentTime;
      this.finalPhaseVposOverrides.clear();
      this.finalPhaseScheduleDirty = true;
      context.clearRect(0, 0, effectiveWidth, effectiveHeight);
      this.comments.forEach((comment) => {
        comment.isActive = false;
        comment.clearActivation();
      });
      this.activeComments.clear();
      this.reservedLanes.clear();
      this.topStaticLaneReservations.clear();
      this.bottomStaticLaneReservations.clear();
    }

    if (!isNearEnd && this.finalPhaseActive) {
      this.resetFinalPhaseState();
    }

    if (this.finalPhaseActive && this.finalPhaseScheduleDirty) {
      this.recomputeFinalPhaseTimeline();
    }

    this.pruneStaticLaneReservations(this.currentTime);

    // 時間インデックスを用いて、アクティブウィンドウ内のコメントのみを処理
    const activeWindowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

    for (const comment of activeWindowComments) {
      const debugActive = isDebugLoggingEnabled();
      const preview = debugActive ? formatCommentPreview(comment.text) : "";
      if (debugActive) {
        debugLog("comment-evaluate", {
          stage: "update",
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(comment),
          currentTime: this.currentTime,
          isActive: comment.isActive,
          hasShown: comment.hasShown,
        });
      }

      if (this.isNGComment(comment.text)) {
        if (debugActive) {
          debugLog("comment-eval-skip", {
            preview,
            vposMs: comment.vposMs,
            effectiveVposMs: this.getEffectiveCommentVpos(comment),
            reason: "ng-runtime",
          });
        }
        continue;
      }
      if (comment.isInvisible) {
        if (debugActive) {
          debugLog("comment-eval-skip", {
            preview,
            vposMs: comment.vposMs,
            effectiveVposMs: this.getEffectiveCommentVpos(comment),
            reason: "invisible",
          });
        }
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.hasShown = true;
        comment.clearActivation();
        continue;
      }

      comment.syncWithSettings(
        this._settings,
        this.settingsVersion,
        this.dynamicStrokeTextThreshold,
      );

      if (this.shouldActivateCommentAtTime(comment, this.currentTime, preview)) {
        this.activateComment(
          comment,
          context,
          effectiveWidth,
          effectiveHeight,
          prepareOptions,
          this.currentTime,
        );
      }

      if (comment.isActive) {
        if (comment.layout !== "naka" && comment.hasStaticExpired(this.currentTime)) {
          const staticPosition = comment.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(staticPosition, comment.lane);
          comment.isActive = false;
          this.activeComments.delete(comment);
          comment.clearActivation();
          continue;
        }

        if (
          comment.layout === "naka" &&
          this.getEffectiveCommentVpos(comment) > this.currentTime + SEEK_DIRECTION_EPSILON_MS
        ) {
          comment.x = comment.virtualStartX;
          comment.lastUpdateTime = this.timeSource.now();
          continue;
        }

        comment.hasShown = true;
        comment.update(this.playbackRate, !this.isPlaying);
        if (!comment.isScrolling && comment.hasStaticExpired(this.currentTime)) {
          const staticPosition = comment.layout === "ue" ? "ue" : "shita";
          this.releaseStaticLane(staticPosition, comment.lane);
          comment.isActive = false;
          this.activeComments.delete(comment);
          comment.clearActivation();
        }
      }
    }

    for (const comment of this.comments) {
      if (
        comment.isActive &&
        comment.isScrolling &&
        ((comment.scrollDirection === "rtl" && comment.x <= comment.exitThreshold) ||
          (comment.scrollDirection === "ltr" && comment.x >= comment.exitThreshold))
      ) {
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
      }
    }
  }

  private buildPrepareOptions(visibleWidth: number): CommentPrepareOptions {
    const overrideDuration = this._settings.scrollVisibleDurationMs;
    let maxVisibleDurationMs = MAX_VISIBLE_DURATION_MS;
    let minVisibleDurationMs = MIN_VISIBLE_DURATION_MS;

    if (overrideDuration !== null) {
      maxVisibleDurationMs = overrideDuration;
      minVisibleDurationMs = Math.max(1, Math.min(overrideDuration, MIN_VISIBLE_DURATION_MS));
    }

    return {
      visibleWidth,
      virtualExtension: VIRTUAL_CANVAS_EXTENSION_PX,
      maxVisibleDurationMs,
      minVisibleDurationMs,
      maxWidthRatio: MAX_COMMENT_WIDTH_RATIO,
      bufferRatio: COLLISION_BUFFER_RATIO,
      baseBufferPx: BASE_COLLISION_BUFFER_PX,
      entryBufferPx: ENTRY_BUFFER_PX,
    };
  }

  private findAvailableLane(comment: Comment): number {
    const currentTime = this.currentTime;
    this.pruneLaneReservations(currentTime);
    this.pruneStaticLaneReservations(currentTime);
    const laneCandidates = this.getLanePriorityOrder(currentTime);
    const newReservation = this.createLaneReservation(comment, currentTime);

    for (const lane of laneCandidates) {
      if (this.isLaneAvailable(lane, newReservation, currentTime)) {
        this.storeLaneReservation(lane, newReservation);
        return lane;
      }
    }

    const fallbackLane = laneCandidates[0] ?? 0;
    this.storeLaneReservation(fallbackLane, newReservation);
    return fallbackLane;
  }

  /**
   * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
   */
  private findFirstValidReservationIndex(
    reservations: LaneReservation[],
    cutoffTime: number,
  ): number {
    let left = 0;
    let right = reservations.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const reservation = reservations[mid];
      if (
        reservation !== undefined &&
        reservation.totalEndTime + RESERVATION_TIME_MARGIN_MS <= cutoffTime
      ) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  private pruneLaneReservations(currentTime: number): void {
    for (const [lane, reservations] of this.reservedLanes.entries()) {
      // 二分探索で有効な予約の開始インデックスを取得
      const firstValidIndex = this.findFirstValidReservationIndex(reservations, currentTime);
      if (firstValidIndex >= reservations.length) {
        // 全て期限切れ
        this.reservedLanes.delete(lane);
      } else if (firstValidIndex > 0) {
        // 一部を削除
        this.reservedLanes.set(lane, reservations.slice(firstValidIndex));
      }
      // firstValidIndex === 0 の場合は何もしない（全て有効）
    }
  }

  private pruneStaticLaneReservations(currentTime: number): void {
    for (const [lane, releaseTime] of this.topStaticLaneReservations.entries()) {
      if (releaseTime <= currentTime) {
        this.topStaticLaneReservations.delete(lane);
      }
    }
    for (const [lane, releaseTime] of this.bottomStaticLaneReservations.entries()) {
      if (releaseTime <= currentTime) {
        this.bottomStaticLaneReservations.delete(lane);
      }
    }
  }

  /**
   * 二分探索で、指定した時刻以上の最初のコメントのインデックスを返す
   */
  private findCommentIndexAtOrAfter(targetVposMs: number): number {
    let left = 0;
    let right = this.comments.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const comment = this.comments[mid];
      if (comment !== undefined && comment.vposMs < targetVposMs) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    return left;
  }

  /**
   * 指定した時刻範囲内のコメントのみを返す
   */
  private getCommentsInTimeWindow(centerTimeMs: number, windowMs: number): Comment[] {
    if (this.comments.length === 0) {
      return [];
    }
    const startTime = centerTimeMs - windowMs;
    const endTime = centerTimeMs + windowMs;
    const startIndex = this.findCommentIndexAtOrAfter(startTime);

    // 開始インデックスから順に、終了時刻までのコメントを集める
    const result: Comment[] = [];
    for (let i = startIndex; i < this.comments.length; i++) {
      const comment = this.comments[i];
      if (comment === undefined) {
        break;
      }
      if (comment.vposMs > endTime) {
        break;
      }
      result.push(comment);
    }
    return result;
  }

  private getStaticLaneMap(position: "ue" | "shita"): Map<number, number> {
    return position === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
  }

  private getStaticLaneDepth(position: "ue" | "shita"): number {
    const laneMap = this.getStaticLaneMap(position);
    let maxIndex = -1;
    for (const lane of laneMap.keys()) {
      if (lane > maxIndex) {
        maxIndex = lane;
      }
    }
    return Math.max(0, maxIndex + 1);
  }

  private getStaticLaneLimit(position: "ue" | "shita"): number {
    const otherPosition = position === "ue" ? "shita" : "ue";
    const otherDepth = this.getStaticLaneDepth(otherPosition);
    const available = this.laneCount - otherDepth;
    if (available <= 0) {
      return -1;
    }
    return available - 1;
  }

  private getGlobalLaneIndexForBottom(localIndex: number): number {
    const clampedLaneCount = Math.max(1, this.laneCount);
    const clampedIndex = Math.max(0, localIndex);
    return Math.max(0, clampedLaneCount - 1 - clampedIndex);
  }

  private resolveStaticCommentOffset(
    position: "ue" | "shita",
    lane: number,
    displayHeight: number,
  ): number {
    if (position === "ue") {
      return lane * this.laneHeight;
    }
    const effectiveHeight = Math.max(1, displayHeight);
    const offsetFromBottom = (lane + 1) * this.laneHeight;
    const y = effectiveHeight - offsetFromBottom;
    return Math.max(0, y);
  }

  private getStaticReservedLaneSet(): Set<number> {
    const reserved = new Set<number>();
    for (const lane of this.topStaticLaneReservations.keys()) {
      reserved.add(lane);
    }
    for (const lane of this.bottomStaticLaneReservations.keys()) {
      reserved.add(this.getGlobalLaneIndexForBottom(lane));
    }
    return reserved;
  }

  private shouldActivateCommentAtTime(
    comment: Comment,
    timeMs: number,
    preview: string = "",
  ): boolean {
    const debugActive = preview.length > 0 && isDebugLoggingEnabled();
    const effectiveVpos = this.resolveFinalPhaseVpos(comment);

    if (
      this.finalPhaseActive &&
      this.finalPhaseStartTime !== null &&
      comment.vposMs < this.finalPhaseStartTime - EDGE_EPSILON
    ) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          reason: "final-phase-trimmed",
          finalPhaseStartTime: this.finalPhaseStartTime,
        });
      }
      this.finalPhaseVposOverrides.delete(comment);
      return false;
    }

    if (comment.isInvisible) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          reason: "invisible",
        });
      }
      return false;
    }
    if (comment.isActive) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          reason: "already-active",
        });
      }
      return false;
    }
    if (effectiveVpos > timeMs + SEEK_DIRECTION_EPSILON_MS) {
      if (debugActive) {
        debugLog("comment-eval-pending", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          reason: "future",
          currentTime: timeMs,
        });
      }
      return false;
    }
    if (effectiveVpos < timeMs - ACTIVE_WINDOW_MS) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          reason: "expired-window",
          currentTime: timeMs,
        });
      }
      return false;
    }

    if (debugActive) {
      debugLog("comment-eval-ready", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        currentTime: timeMs,
      });
    }
    return true;
  }

  private activateComment(
    comment: Comment,
    context: CanvasRenderingContext2D,
    displayWidth: number,
    displayHeight: number,
    options: CommentPrepareOptions,
    referenceTime: number,
  ): void {
    comment.prepare(context, displayWidth, displayHeight, options);
    const effectiveVpos = this.resolveFinalPhaseVpos(comment);

    if (isDebugLoggingEnabled()) {
      debugLog("comment-prepared", {
        preview: formatCommentPreview(comment.text),
        layout: comment.layout,
        isScrolling: comment.isScrolling,
        width: comment.width,
        height: comment.height,
        bufferWidth: comment.bufferWidth,
        visibleDurationMs: comment.visibleDurationMs,
        effectiveVposMs: effectiveVpos,
      });
    }

    if (comment.layout === "naka") {
      const elapsedMs = Math.max(0, referenceTime - effectiveVpos);
      const displacement = comment.speedPixelsPerMs * elapsedMs;

      // --- ファイナルフェーズ時の速度調整ロジック ---
      if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
        // コメントが画面を横断しきるべき最終時刻を決定
        const videoDuration =
          this.duration > 0 ? this.duration : this.finalPhaseStartTime + FINAL_PHASE_MIN_WINDOW_MS;
        const finalPhaseWindowEnd = Math.max(
          this.finalPhaseStartTime + FINAL_PHASE_MIN_WINDOW_MS,
          videoDuration,
        );

        // コメントが移動すべき全距離
        const travelDistance = Math.abs(comment.exitThreshold - comment.virtualStartX);
        // コメントが移動に使える時間
        const availableTravelTime = finalPhaseWindowEnd - effectiveVpos;

        if (availableTravelTime > 0 && travelDistance > 0) {
          const requiredSpeedPixelsPerMs = travelDistance / availableTravelTime;

          // 必要な速度が現在の速度より速い場合のみ調整
          if (requiredSpeedPixelsPerMs > comment.speedPixelsPerMs) {
            comment.speedPixelsPerMs = requiredSpeedPixelsPerMs;
            comment.baseSpeed = requiredSpeedPixelsPerMs * (1000 / 60); // px/ms を px/frame に変換
            comment.speed = comment.baseSpeed; // 即座に適用 (playbackRate は update() で適用される)
            comment.totalDurationMs = Math.ceil(travelDistance / requiredSpeedPixelsPerMs); // 総移動時間も更新
          }
        }
      }
      // --- ファイナルフェーズ時の速度調整ロジックここまで ---

      const directionSign = comment.getDirectionSign();
      const projectedX = comment.virtualStartX + directionSign * displacement;
      const exitThreshold = comment.exitThreshold;
      const direction = comment.scrollDirection;
      const alreadyExited =
        (direction === "rtl" && projectedX <= exitThreshold) ||
        (direction === "ltr" && projectedX >= exitThreshold);

      if (alreadyExited) {
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.hasShown = true;
        comment.clearActivation();
        comment.lane = -1;
        if (isDebugLoggingEnabled()) {
          debugLog("comment-skip-exited", {
            preview: formatCommentPreview(comment.text),
            vposMs: comment.vposMs,
            effectiveVposMs: effectiveVpos,
            referenceTime,
          });
        }
        return;
      }

      comment.lane = this.findAvailableLane(comment);
      comment.y = comment.lane * this.laneHeight;
      comment.x = projectedX;
      comment.isActive = true;
      this.activeComments.add(comment);
      comment.hasShown = true;
      comment.isPaused = !this.isPlaying;
      comment.markActivated(referenceTime);
      comment.lastUpdateTime = this.timeSource.now();
      if (isDebugLoggingEnabled()) {
        debugLog("comment-activate-scroll", {
          preview: formatCommentPreview(comment.text),
          lane: comment.lane,
          startX: comment.x,
          width: comment.width,
          visibleDurationMs: comment.visibleDurationMs,
          effectiveVposMs: effectiveVpos,
        });
      }
      return;
    }

    const displayEnd = effectiveVpos + STATIC_VISIBLE_DURATION_MS;
    if (referenceTime > displayEnd) {
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.hasShown = true;
      comment.clearActivation();
      comment.lane = -1;
      if (isDebugLoggingEnabled()) {
        debugLog("comment-skip-expired", {
          preview: formatCommentPreview(comment.text),
          vposMs: comment.vposMs,
          effectiveVposMs: effectiveVpos,
          referenceTime,
          displayEnd,
        });
      }
      return;
    }

    const staticPosition = comment.layout === "ue" ? "ue" : "shita";
    const laneIndex = this.assignStaticLane(staticPosition);
    comment.lane = laneIndex;
    comment.y = this.resolveStaticCommentOffset(staticPosition, laneIndex, displayHeight);
    comment.x = comment.virtualStartX;
    comment.isActive = true;
    this.activeComments.add(comment);
    comment.hasShown = true;
    comment.isPaused = !this.isPlaying;
    comment.markActivated(referenceTime);
    comment.lastUpdateTime = this.timeSource.now();
    comment.staticExpiryTimeMs = displayEnd;
    this.reserveStaticLane(staticPosition, laneIndex, displayEnd);
    if (isDebugLoggingEnabled()) {
      debugLog("comment-activate-static", {
        preview: formatCommentPreview(comment.text),
        lane: comment.lane,
        position: staticPosition,
        displayEnd,
        effectiveVposMs: effectiveVpos,
      });
    }
  }

  private assignStaticLane(position: "ue" | "shita"): number {
    const laneMap = this.getStaticLaneMap(position);
    const limit = this.getStaticLaneLimit(position);
    const laneCount = limit >= 0 ? limit + 1 : 0;
    const laneIndices = Array.from({ length: laneCount }, (_, index) => index);
    if (position === "shita") {
      // 下コメントは下段から順に埋めるため、0から順に評価する
    } else {
      // 上コメントは上段から詰めるため、0から順に評価する
    }
    for (const lane of laneIndices) {
      if (!laneMap.has(lane)) {
        return lane;
      }
    }
    let fallbackLane = laneIndices[0] ?? 0;
    let earliestRelease = Number.POSITIVE_INFINITY;
    for (const [lane, releaseTime] of laneMap.entries()) {
      if (releaseTime < earliestRelease) {
        earliestRelease = releaseTime;
        fallbackLane = lane;
      }
    }
    return fallbackLane;
  }

  private reserveStaticLane(position: "ue" | "shita", lane: number, releaseTime: number): void {
    const laneMap = this.getStaticLaneMap(position);
    laneMap.set(lane, releaseTime);
  }

  private releaseStaticLane(position: "ue" | "shita", lane: number): void {
    if (lane < 0) {
      return;
    }
    const laneMap = this.getStaticLaneMap(position);
    laneMap.delete(lane);
  }

  private getLanePriorityOrder(currentTime: number): number[] {
    const indices = Array.from({ length: this.laneCount }, (_, index) => index);
    const sorted = indices.sort((a, b) => {
      const nextA = this.getLaneNextAvailableTime(a, currentTime);
      const nextB = this.getLaneNextAvailableTime(b, currentTime);
      if (Math.abs(nextA - nextB) <= EDGE_EPSILON) {
        return a - b;
      }
      return nextA - nextB;
    });
    const staticReserved = this.getStaticReservedLaneSet();
    if (staticReserved.size === 0) {
      return sorted;
    }
    const preferred = sorted.filter((lane) => !staticReserved.has(lane));
    if (preferred.length === 0) {
      return sorted;
    }
    const blocked = sorted.filter((lane) => staticReserved.has(lane));
    return [...preferred, ...blocked];
  }

  private getLaneNextAvailableTime(lane: number, currentTime: number): number {
    const reservations = this.reservedLanes.get(lane);
    if (!reservations || reservations.length === 0) {
      return currentTime;
    }
    // 有効な予約から開始して最大のendTimeを見つける
    const firstValidIndex = this.findFirstValidReservationIndex(reservations, currentTime);
    let nextTime = currentTime;
    for (let i = firstValidIndex; i < reservations.length; i++) {
      const reservation = reservations[i];
      if (reservation !== undefined) {
        nextTime = Math.max(nextTime, reservation.endTime);
      }
    }
    return nextTime;
  }

  private createLaneReservation(comment: Comment, referenceTime: number): LaneReservation {
    const speed = Math.max(comment.speedPixelsPerMs, EDGE_EPSILON);
    const effectiveStart = this.getEffectiveCommentVpos(comment);
    const baseStartTime = Number.isFinite(effectiveStart) ? effectiveStart : referenceTime;
    const startTime = Math.max(0, baseStartTime);
    const endTime = startTime + comment.preCollisionDurationMs + RESERVATION_TIME_MARGIN_MS;
    const totalEndTime = startTime + comment.totalDurationMs + RESERVATION_TIME_MARGIN_MS;
    return {
      comment,
      startTime,
      endTime: Math.max(startTime, endTime),
      totalEndTime: Math.max(startTime, totalEndTime),
      startLeft: comment.virtualStartX,
      width: comment.width,
      speed,
      buffer: comment.bufferWidth,
      directionSign: comment.getDirectionSign(),
    };
  }

  private isLaneAvailable(lane: number, candidate: LaneReservation, currentTime: number): boolean {
    const reservations = this.reservedLanes.get(lane);
    if (!reservations || reservations.length === 0) {
      return true;
    }
    // リストはtotalEndTimeでソート済みなので、有効な予約から開始
    const firstValidIndex = this.findFirstValidReservationIndex(reservations, currentTime);
    for (let i = firstValidIndex; i < reservations.length; i++) {
      const reservation = reservations[i];
      if (reservation === undefined) {
        break;
      }
      if (this.areReservationsConflicting(reservation, candidate)) {
        return false;
      }
    }
    return true;
  }

  private storeLaneReservation(lane: number, reservation: LaneReservation): void {
    const existing = this.reservedLanes.get(lane) ?? [];
    // totalEndTimeでソートすることで、期限切れ予約の削除を効率化
    const updated = [...existing, reservation].sort((a, b) => a.totalEndTime - b.totalEndTime);
    this.reservedLanes.set(lane, updated);
  }

  private areReservationsConflicting(a: LaneReservation, b: LaneReservation): boolean {
    const overlapStart = Math.max(a.startTime, b.startTime);
    const overlapEnd = Math.min(a.endTime, b.endTime);
    if (overlapStart >= overlapEnd) {
      return false;
    }

    const evaluationTimes = new Set<number>([
      overlapStart,
      overlapEnd,
      overlapStart + (overlapEnd - overlapStart) / 2,
    ]);

    const forwardIntersection = this.solveLeftRightEqualityTime(a, b);
    if (
      forwardIntersection !== null &&
      forwardIntersection >= overlapStart - EDGE_EPSILON &&
      forwardIntersection <= overlapEnd + EDGE_EPSILON
    ) {
      evaluationTimes.add(forwardIntersection);
    }

    const backwardIntersection = this.solveLeftRightEqualityTime(b, a);
    if (
      backwardIntersection !== null &&
      backwardIntersection >= overlapStart - EDGE_EPSILON &&
      backwardIntersection <= overlapEnd + EDGE_EPSILON
    ) {
      evaluationTimes.add(backwardIntersection);
    }

    for (const time of evaluationTimes) {
      if (time < overlapStart - EDGE_EPSILON || time > overlapEnd + EDGE_EPSILON) {
        continue;
      }
      const forwardGap = this.computeForwardGap(a, b, time);
      const backwardGap = this.computeForwardGap(b, a, time);
      if (forwardGap <= EDGE_EPSILON && backwardGap <= EDGE_EPSILON) {
        return true;
      }
    }
    return false;
  }

  private computeForwardGap(from: LaneReservation, to: LaneReservation, time: number): number {
    const fromEdges = this.getBufferedEdges(from, time);
    const toEdges = this.getBufferedEdges(to, time);
    return fromEdges.left - toEdges.right;
  }

  private getBufferedEdges(
    reservation: LaneReservation,
    time: number,
  ): { left: number; right: number } {
    const elapsed = Math.max(0, time - reservation.startTime);
    const displacement = reservation.speed * elapsed;
    const rawLeft = reservation.startLeft + reservation.directionSign * displacement;
    const left = rawLeft - reservation.buffer;
    const right = rawLeft + reservation.width + reservation.buffer;
    return { left, right };
  }

  private solveLeftRightEqualityTime(left: LaneReservation, right: LaneReservation): number | null {
    const leftSign = left.directionSign;
    const rightSign = right.directionSign;
    const denominator = rightSign * right.speed - leftSign * left.speed;
    if (Math.abs(denominator) < EDGE_EPSILON) {
      return null;
    }
    const numerator =
      right.startLeft +
      rightSign * right.speed * right.startTime +
      right.width +
      right.buffer -
      left.startLeft -
      leftSign * left.speed * left.startTime +
      left.buffer;
    const time = numerator / denominator;
    if (!Number.isFinite(time)) {
      return null;
    }
    return time;
  }

  private draw(): void {
    const canvas = this.canvas;
    const context = this.ctx;
    if (!canvas || !context) {
      return;
    }

    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;

    const now = this.timeSource.now();

    if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering()) {
      context.clearRect(0, 0, effectiveWidth, effectiveHeight);
      this.lastDrawTime = now;
      return;
    }

    context.clearRect(0, 0, effectiveWidth, effectiveHeight);
    const activeComments = Array.from(this.activeComments);

    if (this._settings.isCommentVisible) {
      const deltaTime = (now - this.lastDrawTime) / (1000 / 60);
      activeComments.sort((a, b) => {
        const aVpos = this.getEffectiveCommentVpos(a);
        const bVpos = this.getEffectiveCommentVpos(b);
        const vposMsDiff = aVpos - bVpos;
        if (Math.abs(vposMsDiff) > EDGE_EPSILON) {
          return vposMsDiff;
        }
        if (a.isScrolling !== b.isScrolling) {
          return a.isScrolling ? 1 : -1;
        }
        return a.creationIndex - b.creationIndex;
      });
      activeComments.forEach((comment) => {
        const shouldInterpolate = this.isPlaying && !comment.isPaused;
        const interpolatedX = shouldInterpolate
          ? comment.x + comment.getDirectionSign() * comment.speed * deltaTime
          : comment.x;
        comment.draw(context, interpolatedX);
      });
    }

    this.lastDrawTime = now;
  }

  private processFrame(frameTimeMs?: number): void {
    if (!this.videoElement) {
      return;
    }
    if (!this._settings.isCommentVisible) {
      return;
    }
    this.updateComments(frameTimeMs);
    this.draw();
  }

  private readonly handleAnimationFrame = (): void => {
    const pendingId = this.frameId;
    this.frameId = null;
    if (pendingId !== null) {
      this.animationFrameProvider.cancel(pendingId);
    }
    this.processFrame();
    this.scheduleNextFrame();
  };

  private readonly handleVideoFrame = (
    _now: DOMHighResTimeStamp,
    metadata: VideoFrameCallbackMetadataLike,
  ): void => {
    this.videoFrameHandle = null;
    const mediaTime =
      typeof metadata?.mediaTime === "number" ? metadata.mediaTime * 1000 : undefined;
    this.processFrame(typeof mediaTime === "number" ? mediaTime : undefined);
    this.scheduleNextFrame();
  };

  private shouldUseVideoFrameCallback(): boolean {
    if (this._settings.syncMode !== "video-frame") {
      return false;
    }
    const video = this.videoElement as HTMLVideoElement & {
      requestVideoFrameCallback?: RequestVideoFrameCallback;
      cancelVideoFrameCallback?: CancelVideoFrameCallback;
    };
    return (
      Boolean(video) &&
      typeof video.requestVideoFrameCallback === "function" &&
      typeof video.cancelVideoFrameCallback === "function"
    );
  }

  private scheduleNextFrame(): void {
    const video = this.videoElement;
    if (!video) {
      return;
    }
    if (this.shouldUseVideoFrameCallback()) {
      this.cancelAnimationFrameRequest();
      this.cancelVideoFrameCallback();
      const request = (
        video as HTMLVideoElement & {
          requestVideoFrameCallback?: RequestVideoFrameCallback;
        }
      ).requestVideoFrameCallback;
      if (typeof request === "function") {
        this.videoFrameHandle = request.call(video, this.handleVideoFrame);
      }
      return;
    }
    this.cancelVideoFrameCallback();
    this.frameId = this.animationFrameProvider.request(this.handleAnimationFrame);
  }

  private cancelAnimationFrameRequest(): void {
    if (this.frameId !== null) {
      this.animationFrameProvider.cancel(this.frameId);
      this.frameId = null;
    }
  }

  private cancelVideoFrameCallback(): void {
    if (this.videoFrameHandle === null) {
      return;
    }
    const video = this.videoElement as HTMLVideoElement & {
      cancelVideoFrameCallback?: CancelVideoFrameCallback;
    };
    if (video && typeof video.cancelVideoFrameCallback === "function") {
      video.cancelVideoFrameCallback(this.videoFrameHandle);
    }
    this.videoFrameHandle = null;
  }

  private startAnimation(): void {
    this.stopAnimation();
    this.scheduleNextFrame();
  }

  private stopAnimation(): void {
    this.cancelAnimationFrameRequest();
    this.cancelVideoFrameCallback();
  }

  private onSeek(): void {
    const canvas = this.canvas;
    const context = this.ctx;
    const video = this.videoElement;
    if (!canvas || !context || !video) {
      return;
    }

    const nextTime = toMilliseconds(video.currentTime);
    this.currentTime = nextTime;
    this.resetFinalPhaseState();
    this.updatePlaybackProgressState();

    this.activeComments.clear();
    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    const prepareOptions = this.buildPrepareOptions(effectiveWidth);

    // シーク時も時間インデックスを用いて範囲を限定
    // ただし、シーク後のhasShown状態更新のため、範囲外も一部処理する
    const seekWindowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

    seekWindowComments.forEach((comment) => {
      const debugActive = isDebugLoggingEnabled();
      const preview = debugActive ? formatCommentPreview(comment.text) : "";
      if (debugActive) {
        debugLog("comment-evaluate", {
          stage: "seek",
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(comment),
          currentTime: this.currentTime,
          isActive: comment.isActive,
          hasShown: comment.hasShown,
        });
      }

      if (this.isNGComment(comment.text)) {
        if (debugActive) {
          debugLog("comment-eval-skip", {
            preview,
            vposMs: comment.vposMs,
            effectiveVposMs: this.getEffectiveCommentVpos(comment),
            reason: "ng-runtime",
          });
        }
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
        return;
      }

      if (comment.isInvisible) {
        if (debugActive) {
          debugLog("comment-eval-skip", {
            preview,
            vposMs: comment.vposMs,
            effectiveVposMs: this.getEffectiveCommentVpos(comment),
            reason: "invisible",
          });
        }
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.hasShown = true;
        comment.clearActivation();
        return;
      }

      comment.syncWithSettings(
        this._settings,
        this.settingsVersion,
        this.dynamicStrokeTextThreshold,
      );
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.lane = -1;
      comment.clearActivation();

      if (this.shouldActivateCommentAtTime(comment, this.currentTime, preview)) {
        this.activateComment(
          comment,
          context,
          effectiveWidth,
          effectiveHeight,
          prepareOptions,
          this.currentTime,
        );
        return;
      }

      const effectiveVpos = this.getEffectiveCommentVpos(comment);
      if (effectiveVpos < this.currentTime - ACTIVE_WINDOW_MS) {
        comment.hasShown = true;
      } else {
        comment.hasShown = false;
      }
    });

    if (this._settings.isCommentVisible) {
      this.lastDrawTime = this.timeSource.now();
      this.draw();
    }
  }

  private setupVideoEventListeners(videoElement: HTMLVideoElement): void {
    try {
      const onPlay = (): void => {
        this.isPlaying = true;
        this.playbackHasBegun = true;
        const now = this.timeSource.now();
        this.lastDrawTime = now;
        this.comments.forEach((comment) => {
          comment.lastUpdateTime = now;
          comment.isPaused = false;
        });
      };
      const onPause = (): void => {
        this.isPlaying = false;
        const now = this.timeSource.now();
        this.comments.forEach((comment) => {
          comment.lastUpdateTime = now;
          comment.isPaused = true;
        });
      };
      const onSeeking = (): void => {
        this.onSeek();
      };
      const onSeeked = (): void => {
        this.onSeek();
      };
      const onRateChange = (): void => {
        this.playbackRate = videoElement.playbackRate;
        const now = this.timeSource.now();
        this.comments.forEach((comment) => {
          comment.lastUpdateTime = now;
        });
      };
      const onLoadedMetadata = (): void => {
        this.handleVideoMetadataLoaded(videoElement);
      };
      const onDurationChange = (): void => {
        this.duration = Number.isFinite(videoElement.duration)
          ? toMilliseconds(videoElement.duration)
          : 0;
      };
      const onEmptied = (): void => {
        this.handleVideoSourceChange();
      };

      videoElement.addEventListener("play", onPlay);
      videoElement.addEventListener("pause", onPause);
      videoElement.addEventListener("seeking", onSeeking);
      videoElement.addEventListener("seeked", onSeeked);
      videoElement.addEventListener("ratechange", onRateChange);
      videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
      videoElement.addEventListener("durationchange", onDurationChange);
      videoElement.addEventListener("emptied", onEmptied);

      this.addCleanup(() => videoElement.removeEventListener("play", onPlay));
      this.addCleanup(() => videoElement.removeEventListener("pause", onPause));
      this.addCleanup(() => videoElement.removeEventListener("seeking", onSeeking));
      this.addCleanup(() => videoElement.removeEventListener("seeked", onSeeked));
      this.addCleanup(() => videoElement.removeEventListener("ratechange", onRateChange));
      this.addCleanup(() => videoElement.removeEventListener("loadedmetadata", onLoadedMetadata));
      this.addCleanup(() => videoElement.removeEventListener("durationchange", onDurationChange));
      this.addCleanup(() => videoElement.removeEventListener("emptied", onEmptied));
    } catch (error) {
      this.log.error("CommentRenderer.setupVideoEventListeners", error as Error);
      throw error;
    }
  }

  private handleVideoMetadataLoaded(videoElement: HTMLVideoElement): void {
    this.handleVideoSourceChange(videoElement);
    this.resize();
    this.calculateLaneMetrics();
    this.onSeek();
  }

  private handleVideoSourceChange(videoElement?: HTMLVideoElement | null): void {
    const target = videoElement ?? this.videoElement;
    if (!target) {
      this.isPlaying = false;
      this.resetFinalPhaseState();
      this.resetCommentActivity();
      return;
    }
    this.syncVideoState(target);
    this.resetFinalPhaseState();
    this.resetCommentActivity();
  }

  private syncVideoState(videoElement: HTMLVideoElement): void {
    this.duration = Number.isFinite(videoElement.duration)
      ? toMilliseconds(videoElement.duration)
      : 0;
    this.currentTime = toMilliseconds(videoElement.currentTime);
    this.playbackRate = videoElement.playbackRate;
    this.isPlaying = !videoElement.paused;
    this.playbackHasBegun = this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS;
    this.lastDrawTime = this.timeSource.now();
  }

  private resetCommentActivity(): void {
    const now = this.timeSource.now();
    const canvas = this.canvas;
    const context = this.ctx;
    this.resetFinalPhaseState();
    this.skipDrawingForCurrentFrame = false;
    this.playbackHasBegun = this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS;
    if (canvas && context) {
      const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
      const width = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
      const height = this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
      context.clearRect(0, 0, width, height);
    }
    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
    this.comments.forEach((comment) => {
      comment.isActive = false;
      comment.isPaused = !this.isPlaying;
      comment.hasShown = false;
      comment.lane = -1;
      comment.x = comment.virtualStartX;
      comment.speed = comment.baseSpeed;
      comment.lastUpdateTime = now;
      comment.clearActivation();
    });
    this.activeComments.clear();
  }

  private setupVideoChangeDetection(videoElement: HTMLVideoElement, container: HTMLElement): void {
    if (typeof MutationObserver === "undefined") {
      this.log.debug(
        "MutationObserver is not available in this environment. Video change detection is disabled.",
      );
      return;
    }

    const videoObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          const targetNode = mutation.target;
          let previous: string | null = null;
          let current: string | null = null;
          if (targetNode instanceof HTMLVideoElement || targetNode instanceof HTMLSourceElement) {
            previous = typeof mutation.oldValue === "string" ? mutation.oldValue : null;
            current = targetNode.getAttribute("src");
          }
          if (previous === current) {
            continue;
          }
          this.handleVideoSourceChange(videoElement);
          return;
        }
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(videoElement);
              return;
            }
          }
          for (const node of mutation.removedNodes) {
            if (node instanceof HTMLSourceElement) {
              this.handleVideoSourceChange(videoElement);
              return;
            }
          }
        }
      }
    });

    videoObserver.observe(videoElement, {
      attributes: true,
      attributeFilter: ["src"],
      attributeOldValue: true,
      childList: true,
      subtree: true,
    });
    this.addCleanup(() => videoObserver.disconnect());

    const containerObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") {
          continue;
        }
        for (const node of mutation.addedNodes) {
          const nextVideo = this.extractVideoElement(node);
          if (nextVideo && nextVideo !== this.videoElement) {
            this.initialize(nextVideo);
            return;
          }
        }
        for (const node of mutation.removedNodes) {
          if (node === this.videoElement) {
            this.videoElement = null;
            this.handleVideoSourceChange(null);
            return;
          }
          if (node instanceof Element) {
            const removedVideo = node.querySelector("video");
            if (removedVideo && removedVideo === this.videoElement) {
              this.videoElement = null;
              this.handleVideoSourceChange(null);
              return;
            }
          }
        }
      }
    });

    containerObserver.observe(container, { childList: true, subtree: true });
    this.addCleanup(() => containerObserver.disconnect());
  }

  private extractVideoElement(node: Node): HTMLVideoElement | null {
    if (node instanceof HTMLVideoElement) {
      return node;
    }
    if (node instanceof Element) {
      const candidate = node.querySelector("video");
      if (candidate instanceof HTMLVideoElement) {
        return candidate;
      }
    }
    return null;
  }

  private setupVisibilityHandling(): void {
    if (
      typeof document === "undefined" ||
      typeof document.addEventListener !== "function" ||
      typeof document.removeEventListener !== "function"
    ) {
      return;
    }

    const enforceVisibilityState = (): void => {
      const state = document.visibilityState;
      if (state !== "visible") {
        this.stopAnimation();
        return;
      }
      if (!this._settings.isCommentVisible) {
        return;
      }
      // ビジビリティ復帰時にコメント状態をリセット
      this.handleVisibilityRestore();
      this.startAnimation();
    };

    document.addEventListener("visibilitychange", enforceVisibilityState);
    this.addCleanup(() => document.removeEventListener("visibilitychange", enforceVisibilityState));

    if (document.visibilityState !== "visible") {
      this.stopAnimation();
    }
  }

  private handleVisibilityRestore(): void {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const video = this.videoElement;
    if (!canvas || !ctx || !video) {
      return;
    }

    // ビデオ時刻を更新（visibilitychange中に時間が進んでいる可能性がある）
    this.currentTime = toMilliseconds(video.currentTime);
    this.isPlaying = !video.paused;

    // 内部状態を完全にクリア
    this.activeComments.clear();
    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();

    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;

    // キャンバスをクリア
    ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);

    const prepareOptions = this.buildPrepareOptions(effectiveWidth);
    const now = this.timeSource.now();

    // アクティブウィンドウ内のコメントを再評価
    const windowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

    windowComments.forEach((comment) => {
      if (this.isNGComment(comment.text) || comment.isInvisible) {
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
        return;
      }

      comment.syncWithSettings(
        this._settings,
        this.settingsVersion,
        this.dynamicStrokeTextThreshold,
      );
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.lane = -1;
      comment.clearActivation();
      comment.lastUpdateTime = now;

      if (this.shouldActivateCommentAtTime(comment, this.currentTime)) {
        this.activateComment(
          comment,
          ctx,
          effectiveWidth,
          effectiveHeight,
          prepareOptions,
          this.currentTime,
        );
      }

      const effectiveVpos = this.getEffectiveCommentVpos(comment);
      if (effectiveVpos < this.currentTime - ACTIVE_WINDOW_MS) {
        comment.hasShown = true;
      } else if (effectiveVpos > this.currentTime) {
        comment.hasShown = false;
      }
    });

    // lastDrawTimeを更新して補間計算を正常化
    this.lastDrawTime = now;
  }

  private setupResizeHandling(videoElement: HTMLVideoElement): void {
    this.cleanupResizeHandling();

    if (this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
      const target = this.resolveResizeObserverTarget(videoElement);
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            this.resize(width, height);
          } else {
            this.resize();
          }
        }
      });
      observer.observe(target);
      this.resizeObserver = observer;
      this.resizeObserverTarget = target;
    } else if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      const onResize = (): void => {
        this.resize();
      };
      window.addEventListener("resize", onResize);
      this.addCleanup(() => window.removeEventListener("resize", onResize));
    } else {
      this.log.debug(
        "Resize handling is disabled because neither ResizeObserver nor window APIs are available.",
      );
    }
  }

  private cleanupResizeHandling(): void {
    if (this.resizeObserver && this.resizeObserverTarget) {
      this.resizeObserver.unobserve(this.resizeObserverTarget);
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.resizeObserverTarget = null;
  }

  private setupFullscreenHandling(): void {
    if (
      typeof document === "undefined" ||
      typeof document.addEventListener !== "function" ||
      typeof document.removeEventListener !== "function"
    ) {
      return;
    }

    const onFullscreenChange = (): void => {
      void this.handleFullscreenChange();
    };

    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ];

    events.forEach((eventName) => {
      document.addEventListener(eventName, onFullscreenChange);
      this.addCleanup(() => document.removeEventListener(eventName, onFullscreenChange));
    });

    void this.handleFullscreenChange();
  }

  private resolveResizeObserverTarget(videoElement: HTMLVideoElement): Element {
    const fullscreenContainer = this.resolveFullscreenContainer(videoElement);
    if (fullscreenContainer) {
      return fullscreenContainer;
    }
    return videoElement.parentElement ?? videoElement;
  }

  private async handleFullscreenChange(): Promise<void> {
    const canvas = this.canvas;
    const video = this.videoElement;
    if (!canvas || !video) {
      return;
    }

    const baseContainer = this.containerElement ?? video.parentElement ?? null;
    const fullscreenElement = this.getFullscreenElement();
    const nextContainer = this.resolveActiveOverlayContainer(
      video,
      baseContainer,
      fullscreenElement,
    );

    if (!(nextContainer instanceof HTMLElement)) {
      return;
    }

    if (canvas.parentElement !== nextContainer) {
      this.ensureContainerPositioning(nextContainer);
      nextContainer.appendChild(canvas);
    } else {
      this.ensureContainerPositioning(nextContainer);
    }

    const fullscreenContainer =
      fullscreenElement instanceof HTMLElement && fullscreenElement.contains(video)
        ? fullscreenElement
        : null;
    const isFullscreenNow = fullscreenContainer !== null;
    if (this.fullscreenActive !== isFullscreenNow) {
      this.fullscreenActive = isFullscreenNow;
      this.setupResizeHandling(video);
    }

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";

    this.resize();
  }

  private resolveFullscreenContainer(videoElement: HTMLVideoElement): HTMLElement | null {
    const fullscreenElement = this.getFullscreenElement();
    if (!(fullscreenElement instanceof HTMLElement)) {
      return null;
    }
    if (fullscreenElement === videoElement) {
      return fullscreenElement;
    }
    if (fullscreenElement.contains(videoElement)) {
      return fullscreenElement;
    }
    return null;
  }

  private resolveActiveOverlayContainer(
    videoElement: HTMLVideoElement,
    baseContainer: HTMLElement | null,
    fullscreenElement: Element | null,
  ): HTMLElement | null {
    if (fullscreenElement instanceof HTMLElement && fullscreenElement.contains(videoElement)) {
      if (fullscreenElement instanceof HTMLVideoElement) {
        if (baseContainer instanceof HTMLElement) {
          return baseContainer;
        }
        return fullscreenElement;
      }
      return fullscreenElement;
    }
    return baseContainer ?? null;
  }

  private getFullscreenElement(): Element | null {
    if (typeof document === "undefined") {
      return null;
    }
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      msFullscreenElement?: Element | null;
      mozFullScreenElement?: Element | null;
    };
    return (
      document.fullscreenElement ??
      doc.webkitFullscreenElement ??
      doc.mozFullScreenElement ??
      doc.msFullscreenElement ??
      null
    );
  }

  private addCleanup(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  private runCleanupTasks(): void {
    while (this.cleanupTasks.length > 0) {
      const task = this.cleanupTasks.pop();
      try {
        task?.();
      } catch (error) {
        this.log.error("CommentRenderer.cleanupTask", error as Error);
      }
    }
  }
}

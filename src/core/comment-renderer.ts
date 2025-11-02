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

export interface CommentRendererConfig {
  loggerNamespace?: string;
  timeSource?: TimeSource;
  animationFrameProvider?: AnimationFrameProvider;
  createCanvasElement?: () => HTMLCanvasElement;
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
const VPOS_UNIT_IN_MILLISECONDS = 10;
const convertVposToMilliseconds = (vposHundredth: number): number => {
  if (!Number.isFinite(vposHundredth)) {
    return 0;
  }
  const clamped = Math.max(0, vposHundredth);
  return Math.round(clamped * VPOS_UNIT_IN_MILLISECONDS);
};
const MAX_VISIBLE_DURATION_MS = 4_000;
const MIN_VISIBLE_DURATION_MS = 1_800;
const MAX_COMMENT_WIDTH_RATIO = 3;
const COLLISION_BUFFER_RATIO = 0.25;
const BASE_COLLISION_BUFFER_PX = 32;
const ENTRY_BUFFER_PX = 48;
const RESERVATION_TIME_MARGIN_MS = 120;
const FINAL_PHASE_THRESHOLD_MS = 4_000;
// シーク後も画面上に残る可能性があるコメントを拾えるよう、可視時間と静止時間の合計を参照する
const ACTIVE_WINDOW_MS = STATIC_VISIBLE_DURATION_MS + MAX_VISIBLE_DURATION_MS;
const VIRTUAL_CANVAS_EXTENSION_PX = 1_000;
const MIN_LANE_COUNT = 1;
const DEFAULT_LANE_COUNT = 12;
const MIN_FONT_SIZE_PX = 24;
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
  private readonly reservedLanes = new Map<number, LaneReservation[]>();
  private readonly topStaticLaneReservations = new Map<number, number>();
  private readonly bottomStaticLaneReservations = new Map<number, number>();
  private readonly log: Logger;
  private readonly timeSource: TimeSource;
  private readonly animationFrameProvider: AnimationFrameProvider;
  private readonly createCanvasElement: () => HTMLCanvasElement;
  private readonly commentDependencies: CommentDependencies;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private containerElement: HTMLElement | null = null;
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

    this.timeSource = config.timeSource ?? createDefaultTimeSource();
    this.animationFrameProvider =
      config.animationFrameProvider ?? createDefaultAnimationFrameProvider(this.timeSource);
    this.createCanvasElement = config.createCanvasElement ?? createBrowserCanvasFactory();
    this.commentDependencies = { timeSource: this.timeSource };
    this._settings = normalizeSettings(baseSettings);
    this.log = createLogger(config.loggerNamespace ?? "CommentRenderer");
  }

  get settings(): RendererSettings {
    return this._settings;
  }

  set settings(value: RendererSettings) {
    this._settings = normalizeSettings(value);
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
      this.setupVideoChangeDetection(video, container);
      this.startAnimation();
    } catch (error) {
      this.log.error("CommentRenderer.initialize", error as Error);
      throw error;
    }
  }

  addComment(text: string, vpos: number, commands: string[] = []): Comment | null {
    if (this.isNGComment(text)) {
      return null;
    }
    const vposMs = convertVposToMilliseconds(vpos);
    const duplicate = this.comments.some(
      (comment) => comment.text === text && comment.vpos === vposMs,
    );
    if (duplicate) {
      return null;
    }

    const comment = new Comment(text, vposMs, commands, this._settings, this.commentDependencies);
    comment.creationIndex = this.commentSequence++;
    this.comments.push(comment);
    this.comments.sort((a, b) => {
      const vposDiff = a.vpos - b.vpos;
      if (Math.abs(vposDiff) > EDGE_EPSILON) {
        return vposDiff;
      }
      return a.creationIndex - b.creationIndex;
    });
    return comment;
  }

  clearComments(): void {
    this.comments.length = 0;
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
    this.finalPhaseActive = false;
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
    this.reservedLanes.clear();
    this.finalPhaseActive = false;
    this.displayWidth = 0;
    this.displayHeight = 0;
    this.canvasDpr = 1;
    this.commentSequence = 0;
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
      comment.syncWithSettings(this._settings);
    });

    if (directionChanged) {
      this.resetCommentActivity();
    }

    if (!this._settings.isCommentVisible && this.ctx && this.canvas) {
      this.comments.forEach((comment) => {
        comment.isActive = false;
        comment.clearActivation();
      });
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

  isNGComment(text: string): boolean {
    try {
      if (typeof text !== "string") {
        return true;
      }

      if (Array.isArray(this._settings.ngWords) && this._settings.ngWords.length > 0) {
        const normalizedText = text.toLowerCase();
        const containsNgWord = this._settings.ngWords.some((word) => {
          if (typeof word !== "string") {
            return false;
          }
          const normalizedWord = word.trim().toLowerCase();
          if (normalizedWord.length === 0) {
            return false;
          }
          return normalizedText.includes(normalizedWord);
        });
        if (containsNgWord) {
          return true;
        }
      }

      if (Array.isArray(this._settings.ngRegexps)) {
        return this._settings.ngRegexps.some((pattern) => {
          if (typeof pattern !== "string" || pattern.length === 0) {
            return false;
          }
          try {
            return new RegExp(pattern).test(text);
          } catch (regexError) {
            this.log.error("CommentRenderer.isNGComment.regex", regexError as Error, {
              pattern,
              text,
            });
            return false;
          }
        });
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
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
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
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    const prepareOptions = this.buildPrepareOptions(effectiveWidth);

    const isNearEnd =
      this.duration > 0 && this.duration - this.currentTime <= FINAL_PHASE_THRESHOLD_MS;

    if (isNearEnd && !this.finalPhaseActive) {
      this.finalPhaseActive = true;
      context.clearRect(0, 0, effectiveWidth, effectiveHeight);
      this.comments.forEach((comment) => {
        comment.isActive = false;
        comment.clearActivation();
      });
      this.reservedLanes.clear();
      this.topStaticLaneReservations.clear();
      this.bottomStaticLaneReservations.clear();
    }

    if (!isNearEnd && this.finalPhaseActive) {
      this.finalPhaseActive = false;
    }

    this.pruneStaticLaneReservations(this.currentTime);

    for (const comment of this.comments) {
      if (this.isNGComment(comment.text)) {
        continue;
      }
      if (comment.isInvisible) {
        comment.isActive = false;
        comment.hasShown = true;
        comment.clearActivation();
        continue;
      }

      comment.syncWithSettings(this._settings);

      if (this.shouldActivateCommentAtTime(comment, this.currentTime)) {
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
          comment.clearActivation();
          continue;
        }

        if (
          comment.layout === "naka" &&
          comment.vpos > this.currentTime + SEEK_DIRECTION_EPSILON_MS
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
        comment.clearActivation();
      }
    }
  }

  private buildPrepareOptions(visibleWidth: number): CommentPrepareOptions {
    const overrideDuration = this._settings.scrollVisibleDurationMs;
    const maxVisibleDurationMs =
      overrideDuration !== null ? overrideDuration : MAX_VISIBLE_DURATION_MS;
    const minVisibleDurationMs =
      overrideDuration !== null ? overrideDuration : MIN_VISIBLE_DURATION_MS;
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

  private pruneLaneReservations(currentTime: number): void {
    for (const [lane, reservations] of this.reservedLanes.entries()) {
      const filtered = reservations.filter(
        (reservation) => reservation.totalEndTime + RESERVATION_TIME_MARGIN_MS > currentTime,
      );
      if (filtered.length > 0) {
        this.reservedLanes.set(lane, filtered);
      } else {
        this.reservedLanes.delete(lane);
      }
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

  private getStaticLaneMap(position: "ue" | "shita"): Map<number, number> {
    return position === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
  }

  private getStaticReservedLaneSet(): Set<number> {
    const reserved = new Set<number>();
    for (const lane of this.topStaticLaneReservations.keys()) {
      reserved.add(lane);
    }
    for (const lane of this.bottomStaticLaneReservations.keys()) {
      reserved.add(lane);
    }
    return reserved;
  }

  private shouldActivateCommentAtTime(comment: Comment, timeMs: number): boolean {
    if (comment.isInvisible || comment.isActive) {
      return false;
    }
    if (comment.vpos > timeMs + SEEK_DIRECTION_EPSILON_MS) {
      return false;
    }
    if (comment.vpos < timeMs - ACTIVE_WINDOW_MS) {
      return false;
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

    if (comment.layout === "naka") {
      const elapsedMs = Math.max(0, referenceTime - comment.vpos);
      const displacement = comment.speedPixelsPerMs * elapsedMs;
      const directionSign = comment.getDirectionSign();
      const projectedX = comment.virtualStartX + directionSign * displacement;
      const exitThreshold = comment.exitThreshold;
      const direction = comment.scrollDirection;
      const alreadyExited =
        (direction === "rtl" && projectedX <= exitThreshold) ||
        (direction === "ltr" && projectedX >= exitThreshold);

      if (alreadyExited) {
        comment.isActive = false;
        comment.hasShown = true;
        comment.clearActivation();
        comment.lane = -1;
        return;
      }

      comment.lane = this.findAvailableLane(comment);
      comment.y = comment.lane * this.laneHeight;
      comment.x = projectedX;
      comment.isActive = true;
      comment.hasShown = true;
      comment.isPaused = !this.isPlaying;
      comment.markActivated(referenceTime);
      comment.lastUpdateTime = this.timeSource.now();
      return;
    }

    const displayEnd = comment.vpos + STATIC_VISIBLE_DURATION_MS;
    if (referenceTime > displayEnd) {
      comment.isActive = false;
      comment.hasShown = true;
      comment.clearActivation();
      comment.lane = -1;
      return;
    }

    const staticPosition = comment.layout === "ue" ? "ue" : "shita";
    const laneIndex = this.assignStaticLane(staticPosition);
    comment.lane = laneIndex;
    comment.y = laneIndex * this.laneHeight;
    comment.x = comment.virtualStartX;
    comment.isActive = true;
    comment.hasShown = true;
    comment.isPaused = !this.isPlaying;
    comment.markActivated(referenceTime);
    comment.lastUpdateTime = this.timeSource.now();
    comment.staticExpiryTimeMs = displayEnd;
    this.reserveStaticLane(staticPosition, laneIndex, displayEnd);
  }

  private assignStaticLane(position: "ue" | "shita"): number {
    const laneMap = this.getStaticLaneMap(position);
    const laneIndices = Array.from({ length: this.laneCount }, (_, index) => index);
    if (position === "shita") {
      // 下コメントは下段から順に埋めることで、ニコ動の下詰め挙動を再現する
      laneIndices.reverse();
    } else {
      // 上コメントは上段から詰め、既存のニコ動と同一の割り当て順を保つ
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
    let nextTime = currentTime;
    for (const reservation of reservations) {
      nextTime = Math.max(nextTime, reservation.endTime);
    }
    return nextTime;
  }

  private createLaneReservation(comment: Comment, referenceTime: number): LaneReservation {
    const speed = Math.max(comment.speedPixelsPerMs, EDGE_EPSILON);
    const baseStartTime = Number.isFinite(comment.vpos) ? comment.vpos : referenceTime;
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
    for (const reservation of reservations) {
      if (reservation.totalEndTime + RESERVATION_TIME_MARGIN_MS <= currentTime) {
        continue;
      }
      if (this.areReservationsConflicting(reservation, candidate)) {
        return false;
      }
    }
    return true;
  }

  private storeLaneReservation(lane: number, reservation: LaneReservation): void {
    const existing = this.reservedLanes.get(lane) ?? [];
    const updated = [...existing, reservation].sort((a, b) => a.endTime - b.endTime);
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

    context.clearRect(0, 0, effectiveWidth, effectiveHeight);
    const activeComments = this.comments.filter((comment) => comment.isActive);
    const now = this.timeSource.now();

    if (this._settings.isCommentVisible) {
      const deltaTime = (now - this.lastDrawTime) / (1000 / 60);
      activeComments.sort((a, b) => {
        const vposDiff = a.vpos - b.vpos;
        if (Math.abs(vposDiff) > EDGE_EPSILON) {
          return vposDiff;
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

    this.finalPhaseActive = false;
    this.currentTime = nextTime;

    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    const prepareOptions = this.buildPrepareOptions(effectiveWidth);

    this.comments.forEach((comment) => {
      if (this.isNGComment(comment.text)) {
        comment.isActive = false;
        comment.clearActivation();
        return;
      }

      if (comment.isInvisible) {
        comment.isActive = false;
        comment.hasShown = true;
        comment.clearActivation();
        return;
      }

      comment.syncWithSettings(this._settings);
      comment.isActive = false;
      comment.lane = -1;
      comment.clearActivation();

      if (this.shouldActivateCommentAtTime(comment, this.currentTime)) {
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

      if (comment.vpos < this.currentTime - ACTIVE_WINDOW_MS) {
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
      this.finalPhaseActive = false;
      this.resetCommentActivity();
      return;
    }
    this.syncVideoState(target);
    this.finalPhaseActive = false;
    this.resetCommentActivity();
  }

  private syncVideoState(videoElement: HTMLVideoElement): void {
    this.duration = Number.isFinite(videoElement.duration)
      ? toMilliseconds(videoElement.duration)
      : 0;
    this.currentTime = toMilliseconds(videoElement.currentTime);
    this.playbackRate = videoElement.playbackRate;
    this.isPlaying = !videoElement.paused;
    this.lastDrawTime = this.timeSource.now();
  }

  private resetCommentActivity(): void {
    const now = this.timeSource.now();
    const canvas = this.canvas;
    const context = this.ctx;
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

  private setupResizeHandling(videoElement: HTMLVideoElement): void {
    this.cleanupResizeHandling();

    if (this._settings.useContainerResizeObserver && this.isResizeObserverAvailable) {
      const target = videoElement.parentElement ?? videoElement;
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

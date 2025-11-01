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
const FINAL_PHASE_THRESHOLD_MS = 10_000;
const ACTIVE_WINDOW_MS = 2_000;
const VIRTUAL_CANVAS_EXTENSION_PX = 1_000;
const MAX_VISIBLE_DURATION_MS = 4_000;
const MIN_VISIBLE_DURATION_MS = 1_800;
const MAX_COMMENT_WIDTH_RATIO = 3;
const COLLISION_BUFFER_RATIO = 0.25;
const BASE_COLLISION_BUFFER_PX = 32;
const ENTRY_BUFFER_PX = 48;
const RESERVATION_TIME_MARGIN_MS = 120;
const MIN_LANE_COUNT = 1;
const DEFAULT_LANE_COUNT = 12;
const MIN_FONT_SIZE_PX = 24;
const EDGE_EPSILON = 1e-3;
const SEEK_DIRECTION_EPSILON_MS = 50;

const normalizeSettings = (settings: RendererSettings): RendererSettings => ({
  ...settings,
  scrollDirection: settings.scrollDirection === "ltr" ? "ltr" : "rtl",
});

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
  private currentTime = 0;
  private duration = 0;
  private playbackRate = 1;
  private isPlaying = true;
  private lastDrawTime = 0;
  private finalPhaseActive = false;
  private frameId: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeObserverTarget: Element | null = null;
  private readonly isResizeObserverAvailable = typeof ResizeObserver !== "undefined";
  private readonly cleanupTasks: Array<() => void> = [];

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
    const duplicate = this.comments.some(
      (comment) => comment.text === text && comment.vpos === vpos,
    );
    if (duplicate) {
      return null;
    }

    const comment = new Comment(text, vpos, commands, this._settings, this.commentDependencies);
    this.comments.push(comment);
    this.comments.sort((a, b) => a.vpos - b.vpos);
    return comment;
  }

  clearComments(): void {
    this.comments.length = 0;
    this.reservedLanes.clear();
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
  }

  updateSettings(newSettings: RendererSettings): void {
    const previousUseContainer = this._settings.useContainerResizeObserver;
    const previousDirection = this._settings.scrollDirection;
    this.settings = newSettings;
    const directionChanged = previousDirection !== this._settings.scrollDirection;

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
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.reservedLanes.clear();
      this.topStaticLaneReservations.clear();
      this.bottomStaticLaneReservations.clear();
    }

    if (previousUseContainer !== this._settings.useContainerResizeObserver && this.videoElement) {
      this.setupResizeHandling(this.videoElement);
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
    if (!video || !canvas) {
      return;
    }

    const rect = video.getBoundingClientRect();
    const measuredWidth = width ?? rect.width ?? canvas.width;
    const measuredHeight = height ?? rect.height ?? canvas.height;

    if (
      !Number.isFinite(measuredWidth) ||
      !Number.isFinite(measuredHeight) ||
      measuredWidth <= 0 ||
      measuredHeight <= 0
    ) {
      return;
    }

    const nextWidth = Math.max(1, Math.floor(measuredWidth));
    const nextHeight = Math.max(1, Math.floor(measuredHeight));

    if (!Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) {
      return;
    }

    const previousWidth = canvas.width || nextWidth;
    const previousHeight = canvas.height || nextHeight;

    if (previousWidth === nextWidth && previousHeight === nextHeight) {
      return;
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${nextWidth}px`;
    canvas.style.height = `${nextHeight}px`;

    const scaleX = previousWidth > 0 ? nextWidth / previousWidth : 1;
    const scaleY = previousHeight > 0 ? nextHeight / previousHeight : 1;

    if (scaleX !== 1 || scaleY !== 1) {
      this.comments.forEach((comment) => {
        if (comment.isActive) {
          comment.x *= scaleX;
          comment.y *= scaleY;
          comment.baseSpeed *= scaleX;
          comment.speed *= scaleX;
          comment.fontSize = Math.max(MIN_FONT_SIZE_PX, Math.floor(nextHeight * 0.05));
        }
      });
    }

    this.calculateLaneMetrics();
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
  }

  private calculateLaneMetrics(): void {
    const canvas = this.canvas;
    if (!canvas) {
      return;
    }

    const baseHeight = Math.max(MIN_FONT_SIZE_PX, Math.floor(canvas.height * 0.05));
    this.laneHeight = baseHeight * 1.2;
    const availableLanes = Math.floor(canvas.height / Math.max(this.laneHeight, 1));
    this.laneCount = Math.max(MIN_LANE_COUNT, availableLanes);
    this.topStaticLaneReservations.clear();
    this.bottomStaticLaneReservations.clear();
  }

  private updateComments(): void {
    const video = this.videoElement;
    const canvas = this.canvas;
    const context = this.ctx;
    if (!video || !canvas || !context) {
      return;
    }

    this.currentTime = toMilliseconds(video.currentTime);
    this.playbackRate = video.playbackRate;
    this.isPlaying = !video.paused;
    const prepareOptions = this.buildPrepareOptions(canvas.width);

    const isNearEnd =
      this.duration > 0 && this.duration - this.currentTime <= FINAL_PHASE_THRESHOLD_MS;

    if (isNearEnd && !this.finalPhaseActive) {
      this.finalPhaseActive = true;
      context.clearRect(0, 0, canvas.width, canvas.height);
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
          canvas.width,
          canvas.height,
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
    return {
      visibleWidth,
      virtualExtension: VIRTUAL_CANVAS_EXTENSION_PX,
      maxVisibleDurationMs: MAX_VISIBLE_DURATION_MS,
      minVisibleDurationMs: MIN_VISIBLE_DURATION_MS,
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
    canvasWidth: number,
    canvasHeight: number,
    options: CommentPrepareOptions,
    referenceTime: number,
  ): void {
    comment.prepare(context, canvasWidth, canvasHeight, options);

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
      laneIndices.reverse();
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

  private createLaneReservation(comment: Comment, startTime: number): LaneReservation {
    const speed = Math.max(comment.speedPixelsPerMs, EDGE_EPSILON);
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

    context.clearRect(0, 0, canvas.width, canvas.height);
    const activeComments = this.comments.filter((comment) => comment.isActive);
    const now = this.timeSource.now();

    if (this._settings.isCommentVisible) {
      const deltaTime = (now - this.lastDrawTime) / (1000 / 60);
      activeComments.forEach((comment) => {
        const interpolatedX = comment.x + comment.getDirectionSign() * comment.speed * deltaTime;
        comment.draw(context, interpolatedX);
      });
    }

    this.lastDrawTime = now;
  }

  private readonly updateFrame = (): void => {
    if (!this.videoElement) {
      return;
    }
    if (!this._settings.isCommentVisible) {
      this.frameId = this.animationFrameProvider.request(this.updateFrame);
      return;
    }
    this.updateComments();
    this.draw();
    this.frameId = this.animationFrameProvider.request(this.updateFrame);
  };

  private startAnimation(): void {
    this.stopAnimation();
    this.frameId = this.animationFrameProvider.request(this.updateFrame);
  }

  private stopAnimation(): void {
    if (this.frameId !== null) {
      this.animationFrameProvider.cancel(this.frameId);
      this.frameId = null;
    }
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
    const prepareOptions = this.buildPrepareOptions(canvas.width);

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
          canvas.width,
          canvas.height,
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
      context.clearRect(0, 0, canvas.width, canvas.height);
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

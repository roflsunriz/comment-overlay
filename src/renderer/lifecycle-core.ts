import type { CommentRenderer } from "@/renderer/comment-renderer";
import { resetInitialPlaybackAutoResetState } from "@/renderer/auto-hard-reset";
import type { CommentRendererInitializeOptions } from "@/shared/types";
import { SEEK_DIRECTION_EPSILON_MS, toMilliseconds } from "@/shared/constants";

const resolveContainerImpl = function (
  this: CommentRenderer,
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
};

const ensureContainerPositioningImpl = function (
  this: CommentRenderer,
  container: HTMLElement,
): void {
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
};

const initializeImpl = function (
  this: CommentRenderer,
  options: HTMLVideoElement | CommentRendererInitializeOptions,
): void {
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
    this.lastVideoSource = this.getCurrentVideoSource();
    this.duration = Number.isFinite(video.duration) ? toMilliseconds(video.duration) : 0;
    this.currentTime = toMilliseconds(video.currentTime);
    this.playbackRate = video.playbackRate;
    this.isPlaying = !video.paused;
    this.isStalled = false;
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
};

const destroyImpl = function (this: CommentRenderer): void {
  this.stopAnimation();
  this.cleanupResizeHandling();
  this.runCleanupTasks();
  resetInitialPlaybackAutoResetState(this);

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
  this.isStalled = false;
  this.pendingInitialSync = false;
};

const destroyCanvasOnlyImpl = function (this: CommentRenderer): void {
  this.stopAnimation();
  resetInitialPlaybackAutoResetState(this);
  if (this.canvas) {
    this.canvas.remove();
  }
  this.canvas = null;
  this.ctx = null;
  this.displayWidth = 0;
  this.displayHeight = 0;
  this.canvasDpr = 1;
  this.fullscreenActive = false;
};

export const registerLifecycleCoreMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.resolveContainer = resolveContainerImpl;
  ctor.prototype.ensureContainerPositioning = ensureContainerPositioningImpl;
  ctor.prototype.initialize = initializeImpl;
  ctor.prototype.destroy = destroyImpl;
  ctor.prototype.destroyCanvasOnly = destroyCanvasOnlyImpl;
};

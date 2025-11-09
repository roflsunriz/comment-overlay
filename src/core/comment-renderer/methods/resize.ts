import type { CommentRenderer } from "../../comment-renderer";
import { DEFAULT_LANE_COUNT, MIN_FONT_SIZE_PX, MIN_LANE_COUNT } from "../constants";

const resizeImpl = function (this: CommentRenderer, width?: number, height?: number): void {
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
};

const resolveDevicePixelRatioImpl = function (this: CommentRenderer): number {
  if (typeof window === "undefined") {
    return 1;
  }
  const ratio = Number(window.devicePixelRatio);
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return 1;
  }
  return ratio;
};

const calculateLaneMetricsImpl = function (this: CommentRenderer): void {
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
    const desired = Number.isFinite(this._settings.fixedLaneCount)
      ? Math.floor(this._settings.fixedLaneCount)
      : DEFAULT_LANE_COUNT;
    const clamped = Math.max(MIN_LANE_COUNT, Math.min(availableLanes, desired));
    this.laneCount = clamped;
  } else {
    this.laneCount = Math.max(MIN_LANE_COUNT, availableLanes);
  }
  this.topStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.length = 0;
};

const setupResizeHandlingImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
): void {
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
};

const cleanupResizeHandlingImpl = function (this: CommentRenderer): void {
  if (this.resizeObserver && this.resizeObserverTarget) {
    this.resizeObserver.unobserve(this.resizeObserverTarget);
  }
  this.resizeObserver?.disconnect();
  this.resizeObserver = null;
  this.resizeObserverTarget = null;
};

export const registerResizeMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.resize = resizeImpl;
  ctor.prototype.resolveDevicePixelRatio = resolveDevicePixelRatioImpl;
  ctor.prototype.calculateLaneMetrics = calculateLaneMetricsImpl;
  ctor.prototype.setupResizeHandling = setupResizeHandlingImpl;
  ctor.prototype.cleanupResizeHandling = cleanupResizeHandlingImpl;
};

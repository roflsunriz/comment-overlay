import type { RendererSettings } from "../shared/types";
import { createLogger } from "../shared/logger";

const logger = createLogger("CommentEngine:Comment");

export interface TimeSource {
  now(): number;
}

const createPerformanceTimeSource = (): TimeSource => ({
  now: () => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  },
});

export const createDefaultTimeSource = (): TimeSource => createPerformanceTimeSource();

export interface CommentDependencies {
  timeSource?: TimeSource;
}

export interface CommentPrepareOptions {
  visibleWidth: number;
  virtualExtension: number;
  maxVisibleDurationMs: number;
  minVisibleDurationMs: number;
  maxWidthRatio: number;
  bufferRatio: number;
  baseBufferPx: number;
  entryBufferPx: number;
}

export class Comment {
  readonly text: string;
  readonly vpos: number;
  readonly commands: string[];

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  baseSpeed = 0;
  speed = 0;
  lane = -1;
  color: string;
  fontSize = 0;
  fontFamily = "Arial";
  opacity: number;
  isActive = false;
  hasShown = false;
  isPaused = false;
  lastUpdateTime = 0;
  reservationWidth = 0;
  bufferWidth = 0;
  visibleDurationMs = 0;
  totalDurationMs = 0;
  preCollisionDurationMs = 0;
  speedPixelsPerMs = 0;
  virtualStartX = 0;
  private readonly timeSource: TimeSource;

  constructor(
    text: string,
    vpos: number,
    commands: string[] | undefined,
    settings: RendererSettings,
    dependencies: CommentDependencies = {},
  ) {
    if (typeof text !== "string") {
      throw new Error("Comment text must be a string");
    }
    if (!Number.isFinite(vpos) || vpos < 0) {
      throw new Error("Comment vpos must be a non-negative number");
    }

    this.text = text;
    this.vpos = vpos;
    this.commands = Array.isArray(commands) ? [...commands] : [];
    this.color = settings.commentColor;
    this.opacity = settings.commentOpacity;
    this.timeSource = dependencies.timeSource ?? createDefaultTimeSource();
  }

  prepare(
    ctx: CanvasRenderingContext2D,
    visibleWidth: number,
    canvasHeight: number,
    options: CommentPrepareOptions,
  ): void {
    try {
      if (!ctx) {
        throw new Error("Canvas context is required");
      }
      if (!Number.isFinite(visibleWidth) || !Number.isFinite(canvasHeight)) {
        throw new Error("Canvas dimensions must be numbers");
      }
      if (!options) {
        throw new Error("Prepare options are required");
      }

      const safeVisibleWidth = Math.max(visibleWidth, 1);
      this.fontSize = Math.max(24, Math.floor(canvasHeight * 0.05));
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      this.width = ctx.measureText(this.text).width;
      this.height = this.fontSize;

      const maxReservationWidth = ctx.measureText("??".repeat(150)).width;

      const bufferFromWidth = this.width * Math.max(options.bufferRatio, 0);
      this.bufferWidth = Math.max(options.baseBufferPx, bufferFromWidth);
      const entryBuffer = Math.max(options.entryBufferPx, this.bufferWidth);

      this.virtualStartX = safeVisibleWidth + options.virtualExtension;
      this.x = this.virtualStartX;

      const widthRatio = this.width / safeVisibleWidth;
      let visibleDurationMs = options.maxVisibleDurationMs;
      if (widthRatio > 1) {
        const clampedRatio = Math.min(widthRatio, options.maxWidthRatio);
        const adjustedDuration = options.maxVisibleDurationMs / Math.max(clampedRatio, 1);
        visibleDurationMs = Math.max(options.minVisibleDurationMs, Math.floor(adjustedDuration));
      }

      const visibleDistance = safeVisibleWidth + this.width + this.bufferWidth + entryBuffer;
      const safeVisibleDuration = Math.max(visibleDurationMs, 1);
      const pixelsPerMs = visibleDistance / safeVisibleDuration;
      const pixelsPerFrame = (pixelsPerMs * 1000) / 60;
      this.baseSpeed = pixelsPerFrame;
      this.speed = this.baseSpeed;
      this.speedPixelsPerMs = pixelsPerMs;

      const travelDistance = this.virtualStartX + this.width + this.bufferWidth + entryBuffer;
      const preCollisionBoundary = safeVisibleWidth + entryBuffer;
      const startRight = this.virtualStartX + this.width + this.bufferWidth;
      const safePixelsPerMs = Math.max(pixelsPerMs, Number.EPSILON);
      const preCollisionDistance = Math.max(0, startRight - preCollisionBoundary);

      this.visibleDurationMs = visibleDurationMs;
      this.preCollisionDurationMs = Math.max(0, Math.ceil(preCollisionDistance / safePixelsPerMs));
      this.totalDurationMs = Math.max(
        this.preCollisionDurationMs,
        Math.ceil(travelDistance / safePixelsPerMs),
      );

      const reservationBase = this.width + this.bufferWidth + entryBuffer;
      this.reservationWidth = Math.min(maxReservationWidth, reservationBase);
      this.lastUpdateTime = this.timeSource.now();
      this.isPaused = false;
    } catch (error) {
      logger.error("Comment.prepare", error as Error, {
        text: this.text,
        visibleWidth,
        canvasHeight,
        hasContext: Boolean(ctx),
      });
      throw error;
    }
  }

  update(playbackRate = 1.0, isPaused = false): void {
    try {
      if (!this.isActive) {
        this.isPaused = isPaused;
        return;
      }

      const currentTime = this.timeSource.now();
      if (isPaused) {
        this.isPaused = true;
        this.lastUpdateTime = currentTime;
        return;
      }

      const deltaTime = (currentTime - this.lastUpdateTime) / (1000 / 60);
      this.speed = this.baseSpeed * playbackRate;
      this.x -= this.speed * deltaTime;
      if (this.x < -this.width) {
        this.isActive = false;
      }
      this.lastUpdateTime = currentTime;
      this.isPaused = false;
    } catch (error) {
      logger.error("Comment.update", error as Error, {
        text: this.text,
        playbackRate,
        isPaused,
        isActive: this.isActive,
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D, interpolatedX: number | null = null): void {
    try {
      if (!this.isActive || !ctx) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;

      const drawX = interpolatedX ?? this.x;
      const drawY = this.y + this.fontSize;

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(3, this.fontSize / 8);
      ctx.lineJoin = "round";
      ctx.strokeText(this.text, drawX, drawY);

      const baseShadowOffset = Math.max(1, this.fontSize * 0.04);
      const baseShadowBlur = this.fontSize * 0.18;
      const shadowLayers: ReadonlyArray<{
        readonly offsetMultiplier: number;
        readonly blurMultiplier: number;
        readonly alpha: number;
      }> = [
        { offsetMultiplier: 1, blurMultiplier: 0.6, alpha: 0.45 },
        { offsetMultiplier: 2, blurMultiplier: 1, alpha: 0.3 },
        { offsetMultiplier: 3.2, blurMultiplier: 1.6, alpha: 0.18 },
      ];

      shadowLayers.forEach((layer) => {
        const offset = baseShadowOffset * layer.offsetMultiplier;
        ctx.shadowColor = `rgba(0, 0, 0, ${layer.alpha})`;
        ctx.shadowBlur = baseShadowBlur * layer.blurMultiplier;
        ctx.shadowOffsetX = offset;
        ctx.shadowOffsetY = offset;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, drawX, drawY);
      });

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = this.color;
      ctx.fillText(this.text, drawX, drawY);

      ctx.restore();
    } catch (error) {
      logger.error("Comment.draw", error as Error, {
        text: this.text,
        isActive: this.isActive,
        hasContext: Boolean(ctx),
        interpolatedX,
      });
    }
  }
}

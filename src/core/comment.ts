import type { RendererSettings } from "../shared/types";
import { createLogger } from "../shared/logger";
import { parseCommentCommands } from "./comment-commands";
import type { CommentLayoutCommand } from "../types/comment";

const logger = createLogger("CommentEngine:Comment");

export const STATIC_VISIBLE_DURATION_MS = 4_000;

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
  readonly layout: CommentLayoutCommand;
  readonly isScrolling: boolean;
  readonly sizeScale: number;
  readonly opacityMultiplier: number;
  readonly opacityOverride: number | null;
  readonly colorOverride: string | null;
  readonly isInvisible: boolean;

  x = 0;
  y = 0;
  width = 0;
  height = 0;
  baseSpeed = 0;
  speed = 0;
  lane = -1;
  color: string;
  fontSize = 0;
  fontFamily: string;
  opacity: number;
  activationTimeMs: number | null = null;
  staticExpiryTimeMs: number | null = null;
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

    const parsedCommands = parseCommentCommands(this.commands, {
      defaultColor: settings.commentColor,
    });

    this.layout = parsedCommands.layout;
    this.isScrolling = this.layout === "naka";
    this.sizeScale = parsedCommands.sizeScale;
    this.opacityMultiplier = parsedCommands.opacityMultiplier;
    this.opacityOverride = parsedCommands.opacityOverride;
    this.colorOverride = parsedCommands.colorOverride;
    this.isInvisible = parsedCommands.isInvisible;
    this.fontFamily = parsedCommands.fontFamily;
    this.color = parsedCommands.resolvedColor;
    this.opacity = this.getEffectiveOpacity(settings.commentOpacity);

    this.timeSource = dependencies.timeSource ?? createDefaultTimeSource();
    this.syncWithSettings(settings);
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
      const baseFontSize = Math.max(24, Math.floor(canvasHeight * 0.05));
      const scaledFontSize = Math.max(24, Math.floor(baseFontSize * this.sizeScale));
      this.fontSize = scaledFontSize;
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      this.width = ctx.measureText(this.text).width;
      this.height = this.fontSize;

      if (!this.isScrolling) {
        this.bufferWidth = 0;
        const centeredX = Math.max((safeVisibleWidth - this.width) / 2, 0);
        this.virtualStartX = centeredX;
        this.x = centeredX;
        this.baseSpeed = 0;
        this.speed = 0;
        this.speedPixelsPerMs = 0;
        this.visibleDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.preCollisionDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.totalDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.reservationWidth = this.width;
        this.staticExpiryTimeMs = this.vpos + STATIC_VISIBLE_DURATION_MS;
        this.lastUpdateTime = this.timeSource.now();
        this.isPaused = false;
        return;
      }

      this.staticExpiryTimeMs = null;
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

      if (!this.isScrolling) {
        this.isPaused = isPaused;
        this.lastUpdateTime = currentTime;
        return;
      }

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
        const effectiveShadowAlpha = Math.max(0, Math.min(1, layer.alpha * this.opacity));
        ctx.shadowColor = `rgba(0, 0, 0, ${effectiveShadowAlpha})`;
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

  syncWithSettings(settings: RendererSettings): void {
    this.color = this.getEffectiveColor(settings.commentColor);
    this.opacity = this.getEffectiveOpacity(settings.commentOpacity);
  }

  getEffectiveColor(defaultColor: string): string {
    const candidate = this.colorOverride ?? defaultColor;
    if (typeof candidate !== "string" || candidate.length === 0) {
      return defaultColor;
    }
    return candidate.toUpperCase();
  }

  getEffectiveOpacity(defaultOpacity: number): number {
    if (typeof this.opacityOverride === "number") {
      return Math.max(0, Math.min(1, this.opacityOverride));
    }
    const scaled = defaultOpacity * this.opacityMultiplier;
    if (!Number.isFinite(scaled)) {
      return 0;
    }
    return Math.max(0, Math.min(1, scaled));
  }

  markActivated(atTimeMs: number): void {
    this.activationTimeMs = atTimeMs;
  }

  clearActivation(): void {
    this.activationTimeMs = null;
    if (!this.isScrolling) {
      this.staticExpiryTimeMs = null;
    }
  }

  hasStaticExpired(currentTimeMs: number): boolean {
    if (this.isScrolling) {
      return false;
    }
    if (this.staticExpiryTimeMs === null) {
      return false;
    }
    return currentTimeMs >= this.staticExpiryTimeMs;
  }
}

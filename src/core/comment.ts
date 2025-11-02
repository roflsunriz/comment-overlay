import type {
  CommentLayoutCommand,
  RenderStyle,
  RendererSettings,
  ScrollDirection,
} from "../shared/types";
import { createLogger } from "../shared/logger";
import { parseCommentCommands } from "./comment-commands";

const logger = createLogger("CommentEngine:Comment");

export const STATIC_VISIBLE_DURATION_MS = 4_000;

const HEX_COLOR_PATTERN = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

const clampOpacity = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
};

const expandHex = (fragment: string): string =>
  fragment.length === 1 ? fragment.repeat(2) : fragment;

const parseHexComponent = (component: string): number => Number.parseInt(component, 16);

const resolveFillStyleWithOpacity = (color: string, opacity: number): string => {
  const match = HEX_COLOR_PATTERN.exec(color);
  if (!match) {
    return color;
  }
  const body = match[1];
  let red: number;
  let green: number;
  let blue: number;
  let alpha = 1;

  if (body.length === 3 || body.length === 4) {
    red = parseHexComponent(expandHex(body[0]));
    green = parseHexComponent(expandHex(body[1]));
    blue = parseHexComponent(expandHex(body[2]));
    if (body.length === 4) {
      alpha = parseHexComponent(expandHex(body[3])) / 255;
    }
  } else {
    red = parseHexComponent(body.slice(0, 2));
    green = parseHexComponent(body.slice(2, 4));
    blue = parseHexComponent(body.slice(4, 6));
    if (body.length === 8) {
      alpha = parseHexComponent(body.slice(6, 8)) / 255;
    }
  }

  const combinedAlpha = clampOpacity(alpha * clampOpacity(opacity));
  return `rgba(${red}, ${green}, ${blue}, ${combinedAlpha})`;
};

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

const resolveScrollDirection = (input: ScrollDirection | string): ScrollDirection =>
  input === "ltr" ? "ltr" : "rtl";

const getDirectionSign = (direction: ScrollDirection): -1 | 1 => (direction === "ltr" ? 1 : -1);

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
  exitThreshold = 0;
  scrollDirection: ScrollDirection = "rtl";
  renderStyle: RenderStyle = "outline-only";
  creationIndex = 0;
  letterSpacing = 0;
  lineHeightMultiplier = 1;
  lineHeightPx = 0;
  lines: string[] = [];
  private directionSign: -1 | 1 = -1;
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
    this.renderStyle = settings.renderStyle;
    this.letterSpacing = parsedCommands.letterSpacing;
    this.lineHeightMultiplier = parsedCommands.lineHeight;

    this.timeSource = dependencies.timeSource ?? createDefaultTimeSource();
    this.applyScrollDirection(settings.scrollDirection);
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
      const rawLines = this.text.includes("\n") ? this.text.split(/\r?\n/) : [this.text];
      this.lines = rawLines.length > 0 ? rawLines : [""];
      let maxLineWidth = 0;
      const effectiveLetterSpacing = this.letterSpacing;
      for (const line of this.lines) {
        const baseWidth = ctx.measureText(line).width;
        const extraSpacing = line.length > 1 ? effectiveLetterSpacing * (line.length - 1) : 0;
        const totalWidth = Math.max(0, baseWidth + extraSpacing);
        if (totalWidth > maxLineWidth) {
          maxLineWidth = totalWidth;
        }
      }
      this.width = maxLineWidth;
      const computedLineHeightPx = Math.max(
        1,
        Math.floor(this.fontSize * this.lineHeightMultiplier),
      );
      this.lineHeightPx = computedLineHeightPx;
      this.height =
        this.fontSize +
        (this.lines.length > 1 ? (this.lines.length - 1) * computedLineHeightPx : 0);

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

      const direction = this.scrollDirection;

      const startLeft =
        direction === "rtl"
          ? safeVisibleWidth + options.virtualExtension
          : -this.width - this.bufferWidth - options.virtualExtension;
      const exitLeft =
        direction === "rtl"
          ? -this.width - this.bufferWidth - entryBuffer
          : safeVisibleWidth + entryBuffer;
      const trailingBoundary = direction === "rtl" ? safeVisibleWidth + entryBuffer : -entryBuffer;
      const trailingEdgeAtStart =
        direction === "rtl"
          ? startLeft + this.width + this.bufferWidth
          : startLeft - this.bufferWidth;

      this.virtualStartX = startLeft;
      this.x = startLeft;
      this.exitThreshold = exitLeft;

      const widthRatio = safeVisibleWidth > 0 ? this.width / safeVisibleWidth : 0;
      const hasFixedDuration = options.maxVisibleDurationMs === options.minVisibleDurationMs;
      let visibleDurationMs = options.maxVisibleDurationMs;
      if (!hasFixedDuration && widthRatio > 1) {
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

      const travelDistance = Math.abs(exitLeft - startLeft);
      const preCollisionDistance =
        direction === "rtl"
          ? Math.max(0, trailingEdgeAtStart - trailingBoundary)
          : Math.max(0, trailingBoundary - trailingEdgeAtStart);
      const safePixelsPerMs = Math.max(pixelsPerMs, Number.EPSILON);

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
      this.x += this.speed * deltaTime * this.directionSign;
      const hasExited =
        (this.scrollDirection === "rtl" && this.x <= this.exitThreshold) ||
        (this.scrollDirection === "ltr" && this.x >= this.exitThreshold);
      if (hasExited) {
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
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      const effectiveOpacity = clampOpacity(this.opacity);
      const drawX = interpolatedX ?? this.x;
      const linesToRender = this.lines.length > 0 ? this.lines : [this.text];
      const lineAdvance =
        this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize;
      const baselineStart = this.y + this.fontSize;

      const drawSegment = (line: string, baselineY: number, mode: "stroke" | "fill"): void => {
        if (line.length === 0) {
          return;
        }
        if (Math.abs(this.letterSpacing) < Number.EPSILON) {
          if (mode === "stroke") {
            ctx.strokeText(line, drawX, baselineY);
          } else {
            ctx.fillText(line, drawX, baselineY);
          }
          return;
        }
        let cursorX = drawX;
        for (let index = 0; index < line.length; index += 1) {
          const char = line[index];
          if (mode === "stroke") {
            ctx.strokeText(char, cursorX, baselineY);
          } else {
            ctx.fillText(char, cursorX, baselineY);
          }
          const metrics = ctx.measureText(char);
          const advance = Number.isFinite(metrics.width) ? metrics.width : 0;
          cursorX += advance;
          if (index < line.length - 1) {
            cursorX += this.letterSpacing;
          }
        }
      };

      const drawStroke = (): void => {
        ctx.globalAlpha = effectiveOpacity;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(3, this.fontSize / 8);
        ctx.lineJoin = "round";
        linesToRender.forEach((line, index) => {
          const baseline = baselineStart + index * lineAdvance;
          drawSegment(line, baseline, "stroke");
        });
        ctx.globalAlpha = 1;
      };

      const drawFill = (): void => {
        linesToRender.forEach((line, index) => {
          const baseline = baselineStart + index * lineAdvance;
          drawSegment(line, baseline, "fill");
        });
      };

      drawStroke();

      if (this.renderStyle === "classic") {
        const baseShadowOffset = Math.max(1, this.fontSize * 0.04);
        const baseShadowBlur = this.fontSize * 0.18;
        type ShadowLayer = Readonly<{
          offsetXMultiplier: number;
          offsetYMultiplier: number;
          blurMultiplier: number;
          alpha: number;
          rgb: string;
        }>;
        const shadowLayers: ReadonlyArray<ShadowLayer> = [
          {
            offsetXMultiplier: 0.9,
            offsetYMultiplier: 1.1,
            blurMultiplier: 0.55,
            alpha: 0.52,
            rgb: "20, 28, 40",
          },
          {
            offsetXMultiplier: 2.4,
            offsetYMultiplier: 2.7,
            blurMultiplier: 1.45,
            alpha: 0.32,
            rgb: "0, 0, 0",
          },
          {
            offsetXMultiplier: -0.7,
            offsetYMultiplier: -0.6,
            blurMultiplier: 0.4,
            alpha: 0.42,
            rgb: "255, 255, 255",
          },
        ];

        shadowLayers.forEach((layer) => {
          const effectiveShadowAlpha = clampOpacity(layer.alpha * effectiveOpacity);
          ctx.shadowColor = `rgba(${layer.rgb}, ${effectiveShadowAlpha})`;
          ctx.shadowBlur = baseShadowBlur * layer.blurMultiplier;
          ctx.shadowOffsetX = baseShadowOffset * layer.offsetXMultiplier;
          ctx.shadowOffsetY = baseShadowOffset * layer.offsetYMultiplier;
          ctx.fillStyle = "rgba(0, 0, 0, 0)";
          drawFill();
        });
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.globalAlpha = 1;
      ctx.fillStyle = resolveFillStyleWithOpacity(this.color, effectiveOpacity);
      drawFill();

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
    this.applyScrollDirection(settings.scrollDirection);
    this.renderStyle = settings.renderStyle;
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
      return clampOpacity(this.opacityOverride);
    }
    const scaled = defaultOpacity * this.opacityMultiplier;
    if (!Number.isFinite(scaled)) {
      return 0;
    }
    return clampOpacity(scaled);
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

  getDirectionSign(): -1 | 1 {
    return this.directionSign;
  }

  private applyScrollDirection(direction: ScrollDirection | string): void {
    const resolved = resolveScrollDirection(direction);
    this.scrollDirection = resolved;
    this.directionSign = getDirectionSign(resolved);
  }
}

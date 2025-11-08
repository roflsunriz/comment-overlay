import type {
  CommentLayoutCommand,
  RenderStyle,
  RendererSettings,
  ScrollDirection,
} from "../shared/types";
import { createLogger } from "../shared/logger";
import { parseCommentCommands } from "./comment-commands";
import { isDebugLoggingEnabled } from "../shared/debug";

const logger = createLogger("CommentEngine:Comment");

type TextMeasurementCache = Map<string, number>;
type DrawMode = "fill" | "outline";

const textMeasurementCaches = new WeakMap<CanvasRenderingContext2D, TextMeasurementCache>();

const getTextMeasurementCache = (ctx: CanvasRenderingContext2D): TextMeasurementCache => {
  let cache = textMeasurementCaches.get(ctx);
  if (!cache) {
    cache = new Map();
    textMeasurementCaches.set(ctx, cache);
  }
  return cache;
};

const measureTextWidth = (ctx: CanvasRenderingContext2D, text: string): number => {
  if (!ctx) {
    return 0;
  }
  const fontKey = ctx.font ?? "";
  const cacheKey = `${fontKey}::${text}`;
  const cache = getTextMeasurementCache(ctx);
  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const width = ctx.measureText(text).width;
  cache.set(cacheKey, width);
  return width;
};

export const STATIC_VISIBLE_DURATION_MS = 4_000;

const HEX_COLOR_PATTERN = /^#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;

const STATIC_COMMENT_SIDE_MARGIN_PX = 8;
const MIN_STATIC_FONT_SIZE_PX = 12;

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
  settingsVersion?: number;
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
  readonly vposMs: number;
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
  epochId = 0;
  private directionSign: -1 | 1 = -1;
  private readonly timeSource: TimeSource;
  private lastSyncedSettingsVersion = -1;
  private cachedTexture: OffscreenCanvas | null = null;
  private textureCacheKey = "";

  constructor(
    text: string,
    vposMs: number,
    commands: string[] | undefined,
    settings: RendererSettings,
    dependencies: CommentDependencies = {},
  ) {
    if (typeof text !== "string") {
      throw new Error("Comment text must be a string");
    }
    if (!Number.isFinite(vposMs) || vposMs < 0) {
      throw new Error("Comment vposMs must be a non-negative number");
    }

    this.text = text;
    this.vposMs = vposMs;
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
    this.syncWithSettings(settings, dependencies.settingsVersion);
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
      this.updateTextMetrics(ctx);

      const isStaticTopOrBottom =
        !this.isScrolling && (this.layout === "ue" || this.layout === "shita");
      if (isStaticTopOrBottom) {
        const maxStaticWidth = Math.max(1, safeVisibleWidth - STATIC_COMMENT_SIDE_MARGIN_PX * 2);
        if (this.width > maxStaticWidth) {
          const minimumFontSize = Math.max(
            MIN_STATIC_FONT_SIZE_PX,
            Math.min(this.fontSize, Math.floor(baseFontSize * 0.6)),
          );
          const shrinkFactor = maxStaticWidth / Math.max(this.width, 1);
          const initialShrink = Math.max(
            minimumFontSize,
            Math.floor(this.fontSize * Math.min(shrinkFactor, 1)),
          );
          if (initialShrink < this.fontSize) {
            this.fontSize = initialShrink;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            this.updateTextMetrics(ctx);
          }
          let iteration = 0;
          while (this.width > maxStaticWidth && this.fontSize > minimumFontSize && iteration < 5) {
            const currentShrink = maxStaticWidth / Math.max(this.width, 1);
            const proposedSize = Math.max(
              minimumFontSize,
              Math.floor(this.fontSize * Math.max(currentShrink, 0.7)),
            );
            if (proposedSize >= this.fontSize) {
              this.fontSize = Math.max(minimumFontSize, this.fontSize - 1);
            } else {
              this.fontSize = proposedSize;
            }
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            this.updateTextMetrics(ctx);
            iteration += 1;
          }
        }
      }

      if (!this.isScrolling) {
        this.bufferWidth = 0;
        const margin = isStaticTopOrBottom ? STATIC_COMMENT_SIDE_MARGIN_PX : 0;
        const centeredX = Math.max((safeVisibleWidth - this.width) / 2, margin);
        const maxStart = Math.max(margin, safeVisibleWidth - this.width - margin);
        const clampedX = Math.min(centeredX, Math.max(maxStart, margin));
        this.virtualStartX = clampedX;
        this.x = clampedX;
        this.baseSpeed = 0;
        this.speed = 0;
        this.speedPixelsPerMs = 0;
        this.visibleDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.preCollisionDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.totalDurationMs = STATIC_VISIBLE_DURATION_MS;
        this.reservationWidth = this.width;
        this.staticExpiryTimeMs = this.vposMs + STATIC_VISIBLE_DURATION_MS;
        this.lastUpdateTime = this.timeSource.now();
        this.isPaused = false;
        return;
      }

      this.staticExpiryTimeMs = null;
      const maxReservationWidth = measureTextWidth(ctx, "??".repeat(150));

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

  private generateTextureCacheKey(): string {
    // v2: 行頭スペース処理を追加したためキャッシュを無効化
    return `v2::${this.text}::${this.fontSize}::${this.fontFamily}::${this.color}::${this.opacity}::${this.renderStyle}::${this.letterSpacing}::${this.lines.length}`;
  }

  // デバッグ用：キャッシュ統計
  private static cacheStats = {
    hits: 0,
    misses: 0,
    creates: 0,
    fallbacks: 0,
    outlineCallsInCache: 0,
    fillCallsInCache: 0,
    outlineCallsInFallback: 0,
    fillCallsInFallback: 0,
    letterSpacingComments: 0,
    normalComments: 0,
    multiLineComments: 0,
    totalCharactersDrawn: 0,
    lastReported: 0,
  };

  private static reportCacheStats(): void {
    if (!isDebugLoggingEnabled()) {
      return;
    }
    const now = performance.now();
    if (now - Comment.cacheStats.lastReported > 5000) {
      const total = Comment.cacheStats.hits + Comment.cacheStats.misses;
      const hitRate = total > 0 ? (Comment.cacheStats.hits / total) * 100 : 0;
      const avgCharsPerComment =
        Comment.cacheStats.creates > 0
          ? (Comment.cacheStats.totalCharactersDrawn / Comment.cacheStats.creates).toFixed(1)
          : "0";
      const totalOutlineCalls =
        Comment.cacheStats.outlineCallsInCache + Comment.cacheStats.outlineCallsInFallback;
      const totalFillCalls =
        Comment.cacheStats.fillCallsInCache + Comment.cacheStats.fillCallsInFallback;
      console.log(
        `[TextureCache Stats]`,
        `\n  Cache: Hits=${Comment.cacheStats.hits}, Misses=${Comment.cacheStats.misses}, Hit Rate=${hitRate.toFixed(1)}%`,
        `\n  Creates: ${Comment.cacheStats.creates}, Fallbacks: ${Comment.cacheStats.fallbacks}`,
        `\n  Comments: Normal=${Comment.cacheStats.normalComments}, LetterSpacing=${Comment.cacheStats.letterSpacingComments}, MultiLine=${Comment.cacheStats.multiLineComments}`,
        `\n  Draw Calls: Outline=${totalOutlineCalls}, Fill=${totalFillCalls}`,
        `\n  Avg Characters/Comment: ${avgCharsPerComment}`,
      );
      Comment.cacheStats.lastReported = now;
    }
  }

  private isOffscreenCanvasSupported(): boolean {
    return typeof OffscreenCanvas !== "undefined";
  }

  private createTextureCanvas(ctx: CanvasRenderingContext2D): OffscreenCanvas | null {
    if (!this.isOffscreenCanvasSupported()) {
      return null;
    }

    // 統計収集
    const hasLetterSpacing = Math.abs(this.letterSpacing) >= Number.EPSILON;
    const isMultiLine = this.lines.length > 1;
    if (hasLetterSpacing) {
      Comment.cacheStats.letterSpacingComments++;
    }
    if (isMultiLine) {
      Comment.cacheStats.multiLineComments++;
    }
    if (!hasLetterSpacing && !isMultiLine) {
      Comment.cacheStats.normalComments++;
    }
    Comment.cacheStats.totalCharactersDrawn += this.text.length;

    // テクスチャサイズは実際のコメントサイズより少し大きめに取る（影やエフェクトのため）
    const padding = Math.max(10, this.fontSize * 0.5);
    const textureWidth = Math.ceil(this.width + padding * 2);
    const textureHeight = Math.ceil(this.height + padding * 2);

    const offscreen = new OffscreenCanvas(textureWidth, textureHeight);
    const offscreenCtx = offscreen.getContext("2d");
    if (!offscreenCtx) {
      return null;
    }

    // オフスクリーンキャンバスに描画
    offscreenCtx.save();
    offscreenCtx.font = `${this.fontSize}px ${this.fontFamily}`;
    const effectiveOpacity = clampOpacity(this.opacity);
    const drawX = padding; // パディング分オフセット
    const linesToRender = this.lines.length > 0 ? this.lines : [this.text];
    const lineAdvance =
      this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize;
    const baselineStart = padding + this.fontSize;
    const drawSegment = this.createSegmentDrawer(offscreenCtx, ctx, "cache", drawX);

    const outlineOffsets = this.getOutlineOffsets();

    const drawOutline = (): void => {
      const outlineAlpha = clampOpacity(effectiveOpacity * 0.6);
      offscreenCtx.save();
      offscreenCtx.fillStyle = `rgba(0, 0, 0, ${outlineAlpha})`;
      for (const [offsetX, offsetY] of outlineOffsets) {
        linesToRender.forEach((line, index) => {
          const baseline = baselineStart + index * lineAdvance + offsetY;
          drawSegment(line, baseline, "outline", offsetX);
        });
      }
      offscreenCtx.restore();
    };

    const drawFill = (fillStyle: string): void => {
      offscreenCtx.save();
      offscreenCtx.fillStyle = fillStyle;
      linesToRender.forEach((line, index) => {
        const baseline = baselineStart + index * lineAdvance;
        drawSegment(line, baseline, "fill");
      });
      offscreenCtx.restore();
    };

    drawOutline();

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
        offscreenCtx.save();
        offscreenCtx.shadowColor = `rgba(${layer.rgb}, ${effectiveShadowAlpha})`;
        offscreenCtx.shadowBlur = baseShadowBlur * layer.blurMultiplier;
        offscreenCtx.shadowOffsetX = baseShadowOffset * layer.offsetXMultiplier;
        offscreenCtx.shadowOffsetY = baseShadowOffset * layer.offsetYMultiplier;
        offscreenCtx.fillStyle = "rgba(0, 0, 0, 0)";
        linesToRender.forEach((line, index) => {
          const baseline = baselineStart + index * lineAdvance;
          drawSegment(line, baseline, "fill");
        });
        offscreenCtx.restore();
      });
    }

    const resolvedFillStyle = resolveFillStyleWithOpacity(this.color, effectiveOpacity);
    drawFill(resolvedFillStyle);

    offscreenCtx.restore();
    return offscreen;
  }

  draw(ctx: CanvasRenderingContext2D, interpolatedX: number | null = null): void {
    try {
      if (!this.isActive || !ctx) {
        return;
      }

      // テクスチャキャッシュを使用
      const currentCacheKey = this.generateTextureCacheKey();
      if (this.textureCacheKey !== currentCacheKey || !this.cachedTexture) {
        // キャッシュが無効または古い場合は再生成
        Comment.cacheStats.misses++;
        Comment.cacheStats.creates++;
        this.cachedTexture = this.createTextureCanvas(ctx);
        this.textureCacheKey = currentCacheKey;
      } else {
        Comment.cacheStats.hits++;
      }

      // テクスチャが利用可能な場合はdrawImageで描画
      if (this.cachedTexture) {
        const drawX = interpolatedX ?? this.x;
        const padding = Math.max(10, this.fontSize * 0.5);
        ctx.drawImage(this.cachedTexture, drawX - padding, this.y - padding);
        Comment.reportCacheStats();
        return;
      }

      // フォールバック使用
      Comment.cacheStats.fallbacks++;

      // フォールバック: 通常の描画処理

      ctx.save();
      ctx.font = `${this.fontSize}px ${this.fontFamily}`;
      const effectiveOpacity = clampOpacity(this.opacity);
      const drawX = interpolatedX ?? this.x;
      const linesToRender = this.lines.length > 0 ? this.lines : [this.text];
      const lineAdvance =
        this.lines.length > 1 && this.lineHeightPx > 0 ? this.lineHeightPx : this.fontSize;
      const baselineStart = this.y + this.fontSize;

      const drawSegment = this.createSegmentDrawer(ctx, ctx, "fallback", drawX);
      const outlineOffsets = this.getOutlineOffsets();

      const drawOutline = (): void => {
        const outlineAlpha = clampOpacity(effectiveOpacity * 0.6);
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${outlineAlpha})`;
        for (const [offsetX, offsetY] of outlineOffsets) {
          linesToRender.forEach((line, index) => {
            const baseline = baselineStart + index * lineAdvance + offsetY;
            drawSegment(line, baseline, "outline", offsetX);
          });
        }
        ctx.restore();
      };

      const drawFill = (fillStyle: string): void => {
        ctx.save();
        ctx.fillStyle = fillStyle;
        linesToRender.forEach((line, index) => {
          const baseline = baselineStart + index * lineAdvance;
          drawSegment(line, baseline, "fill");
        });
        ctx.restore();
      };

      drawOutline();

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
          ctx.save();
          ctx.shadowColor = `rgba(${layer.rgb}, ${effectiveShadowAlpha})`;
          ctx.shadowBlur = baseShadowBlur * layer.blurMultiplier;
          ctx.shadowOffsetX = baseShadowOffset * layer.offsetXMultiplier;
          ctx.shadowOffsetY = baseShadowOffset * layer.offsetYMultiplier;
          ctx.fillStyle = "rgba(0, 0, 0, 0)";
          linesToRender.forEach((line, index) => {
            const baseline = baselineStart + index * lineAdvance;
            drawSegment(line, baseline, "fill");
          });
          ctx.restore();
        });
      }

      const resolvedFillStyle = resolveFillStyleWithOpacity(this.color, effectiveOpacity);
      drawFill(resolvedFillStyle);

      ctx.restore();
      Comment.reportCacheStats();
    } catch (error) {
      logger.error("Comment.draw", error as Error, {
        text: this.text,
        isActive: this.isActive,
        hasContext: Boolean(ctx),
        interpolatedX,
      });
    }
  }

  syncWithSettings(settings: RendererSettings, settingsVersion?: number): void {
    const hasSyncedVersion =
      typeof settingsVersion === "number" && settingsVersion === this.lastSyncedSettingsVersion;
    if (hasSyncedVersion) {
      return;
    }
    this.color = this.getEffectiveColor(settings.commentColor);
    this.opacity = this.getEffectiveOpacity(settings.commentOpacity);
    this.applyScrollDirection(settings.scrollDirection);
    this.renderStyle = settings.renderStyle;
    if (typeof settingsVersion === "number") {
      this.lastSyncedSettingsVersion = settingsVersion;
    }
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
    // テクスチャキャッシュをクリア
    this.cachedTexture = null;
    this.textureCacheKey = "";
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

  private createSegmentDrawer(
    targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    measurementCtx: CanvasRenderingContext2D,
    statsTarget: "cache" | "fallback",
    baseDrawX: number,
  ): (line: string, baselineY: number, mode: DrawMode, offsetX?: number) => void {
    return (line, baselineY, mode, offsetX = 0) => {
      if (line.length === 0) {
        return;
      }
      const leadingSpaces = line.match(/^[\u3000\u00A0]+/);
      const leadingSpaceCount = leadingSpaces ? leadingSpaces[0].length : 0;
      const leadingSpaceOffset =
        leadingSpaceCount > 0 ? measureTextWidth(measurementCtx, leadingSpaces![0]) : 0;
      const effectiveDrawX = baseDrawX + leadingSpaceOffset + offsetX;
      const trimmedLine = leadingSpaceCount > 0 ? line.substring(leadingSpaceCount) : line;

      const recordDraw = (): void => {
        if (statsTarget === "cache") {
          if (mode === "outline") {
            Comment.cacheStats.outlineCallsInCache++;
          } else {
            Comment.cacheStats.fillCallsInCache++;
          }
        } else if (mode === "outline") {
          Comment.cacheStats.outlineCallsInFallback++;
        } else {
          Comment.cacheStats.fillCallsInFallback++;
        }
      };

      if (Math.abs(this.letterSpacing) < Number.EPSILON) {
        recordDraw();
        targetCtx.fillText(trimmedLine, effectiveDrawX, baselineY);
        return;
      }

      let cursorX = effectiveDrawX;
      for (let index = 0; index < trimmedLine.length; index += 1) {
        const char = trimmedLine[index];
        recordDraw();
        targetCtx.fillText(char, cursorX, baselineY);
        const advance = measureTextWidth(measurementCtx, char);
        cursorX += advance;
        if (index < trimmedLine.length - 1) {
          cursorX += this.letterSpacing;
        }
      }
    };
  }

  private getOutlineOffsets(): Array<[number, number]> {
    const outlineThickness = Math.max(1, Math.round(this.fontSize * 0.08));
    const offsets: Array<[number, number]> = [
      [-outlineThickness, 0],
      [outlineThickness, 0],
      [0, -outlineThickness],
      [0, outlineThickness],
    ];
    if (outlineThickness > 1) {
      const diagonal = Math.max(1, Math.round(outlineThickness * 0.7));
      offsets.push(
        [-diagonal, -diagonal],
        [-diagonal, diagonal],
        [diagonal, -diagonal],
        [diagonal, diagonal],
      );
    }
    return offsets;
  }

  private updateTextMetrics(ctx: CanvasRenderingContext2D): void {
    let maxLineWidth = 0;
    const effectiveLetterSpacing = this.letterSpacing;
    for (const line of this.lines) {
      const baseWidth = measureTextWidth(ctx, line);
      const extraSpacing = line.length > 1 ? effectiveLetterSpacing * (line.length - 1) : 0;
      const totalWidth = Math.max(0, baseWidth + extraSpacing);
      if (totalWidth > maxLineWidth) {
        maxLineWidth = totalWidth;
      }
    }
    this.width = maxLineWidth;
    const computedLineHeightPx = Math.max(1, Math.floor(this.fontSize * this.lineHeightMultiplier));
    this.lineHeightPx = computedLineHeightPx;
    const additionalHeight =
      this.lines.length > 1 ? (this.lines.length - 1) * computedLineHeightPx : 0;
    this.height = this.fontSize + additionalHeight;
  }
}

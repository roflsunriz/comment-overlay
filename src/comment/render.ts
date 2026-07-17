import type { Comment } from "@/comment/comment";
import type { DrawMode } from "@/shared/types";
import { clampOpacity, resolveFillStyleWithOpacity } from "@/comment/color";
import { commentLogger as logger } from "@/comment/logger";
import { isDebugLoggingEnabled } from "@/shared/debug";
import { emitCalibrationTrace } from "@/shared/calibration-trace";
import { measureTextWidth } from "@/comment/text-measure";
import { getCommentCanvasFont } from "@/comment/prepare";
import { resolveNicoScrollTexturePaddingX } from "@/comment/nico-scroll";

const cacheStats = {
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

const reportCacheStats = (): void => {
  if (!isDebugLoggingEnabled()) {
    return;
  }
  const now = performance.now();
  if (now - cacheStats.lastReported <= 5000) {
    return;
  }
  const total = cacheStats.hits + cacheStats.misses;
  const hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0;
  const avgCharsPerComment =
    cacheStats.creates > 0
      ? (cacheStats.totalCharactersDrawn / cacheStats.creates).toFixed(1)
      : "0";
  const totalOutlineCalls = cacheStats.outlineCallsInCache + cacheStats.outlineCallsInFallback;
  const totalFillCalls = cacheStats.fillCallsInCache + cacheStats.fillCallsInFallback;
  console.log(
    `[TextureCache Stats]`,
    `\n  Cache: Hits=${cacheStats.hits}, Misses=${cacheStats.misses}, Hit Rate=${hitRate.toFixed(1)}%`,
    `\n  Creates: ${cacheStats.creates}, Fallbacks: ${cacheStats.fallbacks}`,
    `\n  Comments: Normal=${cacheStats.normalComments}, LetterSpacing=${cacheStats.letterSpacingComments}, MultiLine=${cacheStats.multiLineComments}`,
    `\n  Draw Calls: Outline=${totalOutlineCalls}, Fill=${totalFillCalls}`,
    `\n  Avg Characters/Comment: ${avgCharsPerComment}`,
  );
  cacheStats.lastReported = now;
};

const isOffscreenCanvasSupported = (): boolean => typeof OffscreenCanvas !== "undefined";

type ShadowParams = {
  blur: number;
  alpha: number;
};

const getShadowParams = (
  intensity: import("@/shared/types").ShadowIntensity,
  fontSize: number,
  baseOpacity: number,
): ShadowParams => {
  if (intensity === "none") {
    return { blur: 0, alpha: 0 };
  }

  const blurRatio = {
    light: 0.06,
    medium: 0.1,
    strong: 0.15,
  }[intensity];

  const alphaMultiplier = {
    light: 0.6,
    medium: 0.8,
    strong: 0.95,
  }[intensity];

  const blur = Math.max(2, fontSize * blurRatio);
  const alpha = clampOpacity(baseOpacity * alphaMultiplier);

  return { blur, alpha };
};

const getStrokeWidth = (): number => 2.8;
const NICO_STATIC_WIDE_SCALE_CENTERING_RATIO = 0.5;

const isNearBlackColor = (color: string): boolean => {
  const normalized = color.trim().toLowerCase();
  if (normalized === "black") {
    return true;
  }
  const match = normalized.match(/^#([0-9a-f]{3,8})$/i);
  if (!match) {
    return false;
  }
  const hex = match[1];
  const isShort = hex.length === 3 || hex.length === 4;
  const expand = (value: string): string => (value.length === 1 ? `${value}${value}` : value);
  const red = Number.parseInt(expand(isShort ? hex[0] : hex.slice(0, 2)), 16);
  const green = Number.parseInt(expand(isShort ? hex[1] : hex.slice(2, 4)), 16);
  const blue = Number.parseInt(expand(isShort ? hex[2] : hex.slice(4, 6)), 16);
  return red === 0 && green === 0 && blue === 0;
};

const getOutlineStrokeStyle = (comment: Comment): string =>
  isNearBlackColor(comment.color) ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)";

const getTextureBaselineStart = (comment: Comment, paddingY: number): number => {
  if (!comment.isScrolling) {
    return paddingY + comment.fontSize;
  }
  const smallFontAdjustment = comment.fontSize <= 18 ? comment.fontSize * 0.08 : 0;
  return comment.fontSize * 1.5 + smallFontAdjustment;
};

const getTexturePadding = (
  comment: Comment,
): { paddingX: number; paddingY: number; textureWidth: number; textureHeight: number } => {
  if (comment.isScrolling && comment.lines.length > 1) {
    const paddingX = resolveNicoScrollTexturePaddingX(comment.fontSize);
    const paddingY = comment.fontSize * 0.5;
    return {
      paddingX,
      paddingY,
      textureWidth: Math.ceil(comment.width + paddingX * 2),
      textureHeight: Math.ceil(comment.height + comment.fontSize * 1.25),
    };
  }

  if (!comment.isScrolling) {
    const paddingX = 0;
    const textureHeight = Math.ceil(
      comment.lines.length > 1 ? comment.height : comment.height + comment.fontSize / 3,
    );
    const paddingY = Math.max(0, (textureHeight - comment.height) / 2);
    return {
      paddingX,
      paddingY,
      textureWidth: Math.ceil(comment.width + paddingX * 2),
      textureHeight,
    };
  }

  const paddingX = comment.isScrolling
    ? resolveNicoScrollTexturePaddingX(comment.fontSize)
    : Math.max(10, comment.fontSize * 0.5);
  const scrollTextureFontSize = comment.fontSize;
  const minimumTextureHeight = comment.isScrolling
    ? Math.round(scrollTextureFontSize * (20 / 9))
    : comment.height + comment.fontSize / 3;
  const textureHeight = Math.ceil(
    Math.max(comment.height + Math.max(10, comment.fontSize), minimumTextureHeight),
  );
  const paddingY = comment.isScrolling
    ? comment.fontSize * 0.5
    : Math.max(0, (textureHeight - comment.height) / 2);

  return {
    paddingX,
    paddingY,
    textureWidth: Math.ceil(comment.width + paddingX * 2),
    textureHeight,
  };
};

const getTextureDrawScale = (comment: Comment): number =>
  comment.isScrolling ? 1 : comment.staticWidthScale;

const getTextureDrawScaleX = (comment: Comment, drawScaleY: number): number =>
  comment.isScrolling ? 1 : drawScaleY;

type TextureDrawPlacement = {
  x: number;
  scaleX: number;
  scaleY: number;
};

const resolveTextureDrawPlacement = (
  comment: Comment,
  texture: OffscreenCanvas,
  drawX: number,
  paddingX: number,
  drawScaleY: number,
): TextureDrawPlacement => {
  const scaleX = getTextureDrawScaleX(comment, drawScaleY);
  const staticScaleOffsetX =
    !comment.isScrolling && scaleX !== 1
      ? texture.width * (1 - scaleX) * NICO_STATIC_WIDE_SCALE_CENTERING_RATIO
      : 0;
  return {
    x: drawX - paddingX + staticScaleOffsetX,
    scaleX,
    scaleY: drawScaleY,
  };
};

const createSegmentDrawer = (
  comment: Comment,
  targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  measurementCtx: CanvasRenderingContext2D,
  statsTarget: "cache" | "fallback",
  baseDrawX: number,
): ((line: string, baselineY: number, mode: DrawMode, offsetX?: number) => void) => {
  return (line, baselineY, mode, offsetX = 0) => {
    if (line.length === 0) {
      return;
    }

    const effectiveDrawX = baseDrawX + offsetX;

    const recordDraw = (): void => {
      if (statsTarget === "cache") {
        if (mode === "outline") {
          cacheStats.outlineCallsInCache++;
        } else {
          cacheStats.fillCallsInCache++;
        }
      } else if (mode === "outline") {
        cacheStats.outlineCallsInFallback++;
      } else {
        cacheStats.fillCallsInFallback++;
      }
    };

    const drawText = (text: string, x: number, meta?: Record<string, number>): void => {
      recordDraw();
      if (mode === "outline") {
        targetCtx.strokeText(text, x, baselineY);
        emitCalibrationTrace("strokeText", targetCtx, comment, {
          text,
          x,
          y: baselineY,
          meta: { statsTarget, mode, ...meta },
        });
        return;
      }
      targetCtx.fillText(text, x, baselineY);
      emitCalibrationTrace("fillText", targetCtx, comment, {
        text,
        x,
        y: baselineY,
        meta: { statsTarget, mode, ...meta },
      });
    };

    if (Math.abs(comment.letterSpacing) < Number.EPSILON) {
      drawText(line, effectiveDrawX);
      return;
    }

    let cursorX = effectiveDrawX;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      drawText(char, cursorX, { characterIndex: index });
      const advance = measureTextWidth(measurementCtx, char);
      cursorX += advance;
      if (index < line.length - 1) {
        cursorX += comment.letterSpacing;
      }
    }
  };
};

const generateTextureCacheKey = (comment: Comment): string => {
  return `v9::${comment.text}::${comment.fontSize}::${comment.fontFamily}::${comment.fontWeight}::${comment.color}::${comment.opacity}::${comment.renderStyle}::${comment.letterSpacing}::${comment.lineHeightPx}::${comment.width}::${comment.height}::${comment.staticWidthScale}::${comment.lines.length}`;
};

const createTextureCanvas = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
): OffscreenCanvas | null => {
  if (!isOffscreenCanvasSupported()) {
    return null;
  }

  const hasLetterSpacing = Math.abs(comment.letterSpacing) >= Number.EPSILON;
  const isMultiLine = comment.lines.length > 1;
  if (hasLetterSpacing) {
    cacheStats.letterSpacingComments++;
  }
  if (isMultiLine) {
    cacheStats.multiLineComments++;
  }
  if (!hasLetterSpacing && !isMultiLine) {
    cacheStats.normalComments++;
  }
  cacheStats.totalCharactersDrawn += comment.text.length;

  const { paddingX, paddingY, textureWidth, textureHeight } = getTexturePadding(comment);
  const offscreen = new OffscreenCanvas(textureWidth, textureHeight);
  const offscreenCtx = offscreen.getContext("2d");
  if (!offscreenCtx) {
    return null;
  }

  offscreenCtx.save();
  offscreenCtx.font = getCommentCanvasFont(comment);
  const effectiveOpacity = clampOpacity(comment.opacity);
  const drawX = paddingX;
  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const lineAdvance =
    comment.lines.length > 1 && comment.lineHeightPx > 0 ? comment.lineHeightPx : comment.fontSize;
  const baselineStart = getTextureBaselineStart(comment, paddingY);
  const drawSegment = createSegmentDrawer(comment, offscreenCtx, ctx, "cache", drawX);

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);

  const shouldUseStrokeOutline = comment.renderStyle === "outline-only";
  const shadowParams = shouldUseStrokeOutline
    ? { blur: 0, alpha: 0 }
    : getShadowParams(comment.shadowIntensity, comment.fontSize, effectiveOpacity);

  if (isDebugLoggingEnabled()) {
    console.log(
      `[Shadow Debug - Cache]`,
      `\n  Text: "${comment.text}"`,
      `\n  FontSize: ${comment.fontSize}`,
      `\n  Shadow intensity: ${comment.shadowIntensity}`,
      `\n  Shadow blur: ${shadowParams.blur}px`,
      `\n  Shadow alpha: ${shadowParams.alpha}`,
      `\n  Fill style: ${resolvedFillStyle}`,
    );
  }

  offscreenCtx.save();
  offscreenCtx.shadowColor = `rgba(0, 0, 0, ${shadowParams.alpha})`;
  offscreenCtx.shadowBlur = shadowParams.blur;
  offscreenCtx.shadowOffsetX = 0;
  offscreenCtx.shadowOffsetY = 0;
  offscreenCtx.lineJoin = "round";
  offscreenCtx.lineWidth = getStrokeWidth();
  offscreenCtx.strokeStyle = getOutlineStrokeStyle(comment);
  offscreenCtx.fillStyle = resolvedFillStyle;

  if (shouldUseStrokeOutline) {
    linesToRender.forEach((line: string, index: number) => {
      const baseline = baselineStart + index * lineAdvance;
      drawSegment(line, baseline, "outline");
    });
  }

  linesToRender.forEach((line: string, index: number) => {
    const baseline = baselineStart + index * lineAdvance;
    drawSegment(line, baseline, "fill");
  });

  offscreenCtx.restore();

  offscreenCtx.restore();
  return offscreen;
};

const drawWithFallback = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  interpolatedX: number | null,
): void => {
  cacheStats.fallbacks++;
  ctx.save();
  ctx.font = getCommentCanvasFont(comment);
  const effectiveOpacity = clampOpacity(comment.opacity);
  let drawX = interpolatedX ?? comment.x;
  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const lineAdvance =
    comment.lines.length > 1 && comment.lineHeightPx > 0 ? comment.lineHeightPx : comment.fontSize;
  let baselineStart = comment.y + comment.fontSize;
  if (!comment.isScrolling && comment.staticWidthScale !== 1) {
    const centerX = drawX + comment.width / 2;
    ctx.translate(centerX, comment.y);
    ctx.scale(comment.staticWidthScale, comment.staticWidthScale);
    drawX = -comment.width / 2;
    baselineStart = comment.fontSize;
  }
  const drawSegment = createSegmentDrawer(comment, ctx, ctx, "fallback", drawX);

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);

  const shouldUseStrokeOutline = comment.renderStyle === "outline-only";
  const shadowParams = shouldUseStrokeOutline
    ? { blur: 0, alpha: 0 }
    : getShadowParams(comment.shadowIntensity, comment.fontSize, effectiveOpacity);

  if (isDebugLoggingEnabled()) {
    console.log(
      `[Shadow Debug - Fallback]`,
      `\n  Text: "${comment.text}"`,
      `\n  FontSize: ${comment.fontSize}`,
      `\n  Shadow intensity: ${comment.shadowIntensity}`,
      `\n  Shadow blur: ${shadowParams.blur}px`,
      `\n  Shadow alpha: ${shadowParams.alpha}`,
      `\n  Fill style: ${resolvedFillStyle}`,
    );
  }

  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${shadowParams.alpha})`;
  ctx.shadowBlur = shadowParams.blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineJoin = "round";
  ctx.lineWidth = getStrokeWidth();
  ctx.strokeStyle = getOutlineStrokeStyle(comment);
  ctx.fillStyle = resolvedFillStyle;

  if (shouldUseStrokeOutline) {
    linesToRender.forEach((line: string, index: number) => {
      const baseline = baselineStart + index * lineAdvance;
      drawSegment(line, baseline, "outline");
    });
  }

  linesToRender.forEach((line: string, index: number) => {
    const baseline = baselineStart + index * lineAdvance;
    drawSegment(line, baseline, "fill");
  });

  ctx.restore();

  ctx.restore();
};

export const drawComment = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  interpolatedX: number | null,
): void => {
  try {
    if (!comment.isActive || !ctx) {
      return;
    }
    const currentCacheKey = generateTextureCacheKey(comment);
    const cachedTexture = comment.getCachedTexture();
    if (comment.getTextureCacheKey() !== currentCacheKey || !cachedTexture) {
      cacheStats.misses++;
      cacheStats.creates++;
      const created = createTextureCanvas(comment, ctx);
      comment.setCachedTexture(created);
      comment.setTextureCacheKey(currentCacheKey);
    } else {
      cacheStats.hits++;
    }

    const texture = comment.getCachedTexture();
    if (texture) {
      const drawX = interpolatedX ?? comment.x;
      const { paddingX, paddingY } = getTexturePadding(comment);
      const drawScale = getTextureDrawScale(comment);
      const placement = resolveTextureDrawPlacement(comment, texture, drawX, paddingX, drawScale);
      const targetX = placement.x;
      const targetY = comment.y - paddingY;
      if (placement.scaleX === 1 && placement.scaleY === 1) {
        ctx.drawImage(texture, targetX, targetY);
      } else {
        ctx.drawImage(
          texture,
          targetX,
          targetY,
          texture.width * placement.scaleX,
          texture.height * placement.scaleY,
        );
      }
      emitCalibrationTrace("drawImage", ctx, comment, {
        x: targetX,
        y: targetY,
        width: texture.width * placement.scaleX,
        height: texture.height * placement.scaleY,
        sourceWidth: texture.width,
        sourceHeight: texture.height,
        meta: {
          statsTarget: "cache",
          paddingX,
          paddingY,
          drawScale,
          drawScaleX: placement.scaleX,
          drawScaleY: placement.scaleY,
        },
      });
      reportCacheStats();
      return;
    }

    drawWithFallback(comment, ctx, interpolatedX);
    reportCacheStats();
  } catch (error) {
    logger.error("Comment.draw", error as Error, {
      text: comment.text,
      isActive: comment.isActive,
      hasContext: Boolean(ctx),
      interpolatedX,
    });
  }
};

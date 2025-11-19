import type { Comment } from "@/comment/comment";
import type { DrawMode } from "@/shared/types";
import { clampOpacity, resolveFillStyleWithOpacity } from "@/comment/color";
import { commentLogger as logger } from "@/comment/logger";
import { isDebugLoggingEnabled } from "@/shared/debug";
import { measureTextWidth } from "@/comment/text-measure";

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

    if (Math.abs(comment.letterSpacing) < Number.EPSILON) {
      recordDraw();
      targetCtx.fillText(line, effectiveDrawX, baselineY);
      return;
    }

    let cursorX = effectiveDrawX;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      recordDraw();
      targetCtx.fillText(char, cursorX, baselineY);
      const advance = measureTextWidth(measurementCtx, char);
      cursorX += advance;
      if (index < line.length - 1) {
        cursorX += comment.letterSpacing;
      }
    }
  };
};

const generateTextureCacheKey = (comment: Comment): string => {
  return `v2::${comment.text}::${comment.fontSize}::${comment.fontFamily}::${comment.color}::${comment.opacity}::${comment.renderStyle}::${comment.letterSpacing}::${comment.lines.length}`;
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

  const padding = Math.max(10, comment.fontSize * 0.5);
  const textureWidth = Math.ceil(comment.width + padding * 2);
  const textureHeight = Math.ceil(comment.height + padding * 2);

  const offscreen = new OffscreenCanvas(textureWidth, textureHeight);
  const offscreenCtx = offscreen.getContext("2d");
  if (!offscreenCtx) {
    return null;
  }

  offscreenCtx.save();
  offscreenCtx.font = `${comment.fontSize}px ${comment.fontFamily}`;
  const effectiveOpacity = clampOpacity(comment.opacity);
  const drawX = padding;
  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const lineAdvance =
    comment.lines.length > 1 && comment.lineHeightPx > 0 ? comment.lineHeightPx : comment.fontSize;
  const baselineStart = padding + comment.fontSize;
  const drawSegment = createSegmentDrawer(comment, offscreenCtx, ctx, "cache", drawX);

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);

  const shadowParams = getShadowParams(comment.shadowIntensity, comment.fontSize, effectiveOpacity);

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
  offscreenCtx.fillStyle = resolvedFillStyle;

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
  ctx.font = `${comment.fontSize}px ${comment.fontFamily}`;
  const effectiveOpacity = clampOpacity(comment.opacity);
  const drawX = interpolatedX ?? comment.x;
  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const lineAdvance =
    comment.lines.length > 1 && comment.lineHeightPx > 0 ? comment.lineHeightPx : comment.fontSize;
  const baselineStart = comment.y + comment.fontSize;
  const drawSegment = createSegmentDrawer(comment, ctx, ctx, "fallback", drawX);

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);

  const shadowParams = getShadowParams(comment.shadowIntensity, comment.fontSize, effectiveOpacity);

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
  ctx.fillStyle = resolvedFillStyle;

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
      const padding = Math.max(10, comment.fontSize * 0.5);
      ctx.drawImage(texture, drawX - padding, comment.y - padding);
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

import type { Comment } from "@/comment/comment";
import type { DrawMode } from "@/shared/types";
import { clampOpacity, resolveFillStyleWithOpacity } from "@/comment/color";
import { commentLogger as logger } from "@/comment/logger";
import { isDebugLoggingEnabled } from "@/shared/debug";
import { emitCalibrationTrace } from "@/shared/calibration-trace";
import { measureTextWidth } from "@/comment/text-measure";
import { getCommentCanvasFont } from "@/comment/prepare";

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
const NICO_FULL_BIG_FINAL_WIDTH_PX = 566;
const NICO_FULL_BIG_FINAL_HEIGHT_PX = 808;
const NICO_FULL_BIG_SOURCE_WIDTH_PX = 1098;
const NICO_FULL_BIG_SOURCE_HEIGHT_PX = 1530;
const NICO_FULL_BIG_SOURCE_PADDING_X_PX = 20.9;
const NICO_FULL_BIG_SOURCE_BASELINE_Y_PX = 58.9;
const NICO_FULL_BIG_SOURCE_LINE_HEIGHT_RATIO = 45.23908523908523 / 39;
const NICO_FULL_BIG_FINAL_FONT_SIZE_PX = 20;
const NICO_FULL_BIG_FINAL_PADDING_X_PX = 11.4;
const NICO_FULL_BIG_FINAL_BASELINE_Y_PX = 31.4;
const NICO_FULL_BIG_FINAL_LINE_HEIGHT_PX = 23.87692307692307;
const NICO_FULL_DRAW_Y_OFFSET_PX = 2.4;
const NICO_FULL_MINCHO_SYNC_FONT_SIZE_PX = 20;
const NICO_FULL_MINCHO_SYNC_CANVAS_SCALE = 2;
const NICO_FULL_MINCHO_SYNC_BIG_PADDING_Y_PX = 66.9;
const NICO_FULL_MINCHO_SYNC_MEDIUM_PADDING_Y_PX = 55.6;
const NICO_FULL_MINCHO_SYNC_DRAW_OFFSET_X_PX = 46;
const NICO_STATIC_WIDE_FINAL_FONT_SIZE_PX = 10;
const NICO_STATIC_WIDE_FINAL_PADDING_X_PX = 6.75;
const NICO_STATIC_WIDE_FINAL_BASELINE_Y_PX = 16.75;
const NICO_STATIC_WIDE_FINAL_LINE_HEIGHT_PX = 12.11423203055002;
const NICO_STATIC_WIDE_SCALE_CENTERING_RATIO = 0.5;
const NICO_STATIC_WIDE_MINCHO_SCALE_X = 1.42;
const NICO_STATIC_WIDE_MINCHO_TARGET_X_RATIO = 0.12;

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

const getCanvasFont = (comment: Comment, fontSize: number): string =>
  `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${fontSize}px ${comment.fontFamily}`;

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
  const isFullScrolling = comment.isScrolling && comment.isFull;
  if (isFullScrolling) {
    const synchronizedFullMinchoPaddingY =
      comment.hasSameVposFullMinchoEnder && comment.isEnder
        ? comment.fontSize >= 35
          ? NICO_FULL_MINCHO_SYNC_BIG_PADDING_Y_PX
          : NICO_FULL_MINCHO_SYNC_MEDIUM_PADDING_Y_PX
        : null;
    return {
      paddingX: Math.max(10, comment.fontSize * 0.5),
      paddingY:
        synchronizedFullMinchoPaddingY ??
        (comment.fontSize >= 35 ? comment.fontSize * 0.5 : Math.max(18, comment.fontSize)) +
          NICO_FULL_DRAW_Y_OFFSET_PX,
      textureWidth: Math.ceil(comment.width),
      textureHeight: Math.ceil(comment.height),
    };
  }

  if (comment.isScrolling && comment.lines.length > 1) {
    const paddingX = comment.fontSize * (4 / 3);
    const paddingY = comment.fontSize;
    return {
      paddingX,
      paddingY,
      textureWidth: Math.ceil(comment.width + paddingX * 2),
      textureHeight: Math.ceil(comment.height + comment.fontSize * 6.1),
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
    ? comment.fontSize * 1.15
    : Math.max(10, comment.fontSize * 0.5);
  const minimumTextureHeight = comment.isScrolling
    ? Math.round(comment.fontSize * (40 / 9))
    : comment.height + comment.fontSize / 3;
  const textureHeight = Math.ceil(
    Math.max(comment.height + Math.max(10, comment.fontSize), minimumTextureHeight),
  );
  const paddingY = comment.isScrolling
    ? comment.fontSize
    : Math.max(0, (textureHeight - comment.height) / 2);

  return {
    paddingX,
    paddingY,
    textureWidth: Math.ceil(
      comment.isScrolling ? comment.width * 2 + paddingX * 2 : comment.width + paddingX * 2,
    ),
    textureHeight,
  };
};

const getTextureDrawScale = (comment: Comment): number => {
  if (!comment.isScrolling && comment.width >= 1_200 && comment.fontSize >= 35) {
    return 0.8;
  }
  return 1;
};

const shouldUseStaticWideTexture = (comment: Comment): boolean =>
  !comment.isScrolling && comment.width >= 1_200 && comment.fontSize >= 35;

const shouldUseStaticWideMinchoTextureLayout = (comment: Comment): boolean =>
  shouldUseStaticWideTexture(comment) &&
  (comment.fontFamily.includes("Yu Mincho") ||
    comment.fontFamily.includes("YuMincho") ||
    comment.fontFamily.includes("游明朝"));

const getTextureDrawScaleX = (comment: Comment, drawScaleY: number): number =>
  shouldUseStaticWideMinchoTextureLayout(comment) ? NICO_STATIC_WIDE_MINCHO_SCALE_X : drawScaleY;

const getStaticWideVisibleWidth = (comment: Comment): number =>
  Math.max(1, comment.width + comment.virtualStartX * 2);

const getTextureDrawOffsetX = (comment: Comment): number =>
  comment.isScrolling && comment.isFull && comment.hasSameVposFullMinchoEnder
    ? NICO_FULL_MINCHO_SYNC_DRAW_OFFSET_X_PX
    : 0;

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
  if (shouldUseStaticWideMinchoTextureLayout(comment)) {
    return {
      x: getStaticWideVisibleWidth(comment) * NICO_STATIC_WIDE_MINCHO_TARGET_X_RATIO,
      scaleX,
      scaleY: drawScaleY,
    };
  }

  const staticScaleOffsetX =
    !comment.isScrolling && scaleX !== 1
      ? texture.width * (1 - scaleX) * NICO_STATIC_WIDE_SCALE_CENTERING_RATIO
      : 0;
  return {
    x: drawX - paddingX + staticScaleOffsetX + getTextureDrawOffsetX(comment),
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
  return `v6::${comment.text}::${comment.fontSize}::${comment.fontFamily}::${comment.fontWeight}::${comment.color}::${comment.opacity}::${comment.renderStyle}::${comment.letterSpacing}::${comment.lineHeightPx}::${comment.lines.length}`;
};

type TexturePass = {
  width: number;
  height: number;
  fontSize: number;
  paddingX: number;
  baselineY: number;
  lineHeight: number;
  canvasScale?: number;
  sourceFont?: boolean;
};

type TextureProfile = {
  output: TexturePass;
  traces?: TexturePass[];
};

const createTexturePass = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  pass: TexturePass,
): OffscreenCanvas | null => {
  const canvas = new OffscreenCanvas(pass.width, pass.height);
  const targetCtx = canvas.getContext("2d");
  if (!targetCtx) {
    return null;
  }

  targetCtx.save();
  targetCtx.font = pass.sourceFont
    ? getCommentCanvasFont(comment)
    : getCanvasFont(comment, pass.fontSize);
  const effectiveOpacity = clampOpacity(comment.opacity);
  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);
  const shouldUseStrokeOutline = comment.renderStyle === "outline-only";
  const shadowParams = shouldUseStrokeOutline
    ? { blur: 0, alpha: 0 }
    : getShadowParams(comment.shadowIntensity, pass.fontSize, effectiveOpacity);

  targetCtx.shadowColor = `rgba(0, 0, 0, ${shadowParams.alpha})`;
  targetCtx.shadowBlur = shadowParams.blur;
  targetCtx.shadowOffsetX = 0;
  targetCtx.shadowOffsetY = 0;
  targetCtx.lineJoin = "round";
  targetCtx.lineWidth = getStrokeWidth();
  targetCtx.strokeStyle = getOutlineStrokeStyle(comment);
  targetCtx.fillStyle = resolvedFillStyle;
  if (typeof pass.canvasScale === "number") {
    targetCtx.scale(pass.canvasScale, pass.canvasScale);
  }

  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const drawSegment = createSegmentDrawer(comment, targetCtx, ctx, "cache", pass.paddingX);

  if (shouldUseStrokeOutline) {
    linesToRender.forEach((line: string, index: number) => {
      drawSegment(line, pass.baselineY + index * pass.lineHeight, "outline");
    });
  }

  linesToRender.forEach((line: string, index: number) => {
    drawSegment(line, pass.baselineY + index * pass.lineHeight, "fill");
  });

  targetCtx.restore();
  return canvas;
};

const createProfiledTexture = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  profile: TextureProfile,
): OffscreenCanvas | null => {
  for (const tracePass of profile.traces ?? []) {
    createTexturePass(comment, ctx, tracePass);
  }
  return createTexturePass(comment, ctx, profile.output);
};

const resolveTextureProfile = (
  comment: Comment,
  textureWidth: number,
  textureHeight: number,
): TextureProfile | null => {
  if (
    comment.isScrolling &&
    comment.isFull &&
    comment.fontSize >= 35 &&
    textureWidth === NICO_FULL_BIG_FINAL_WIDTH_PX &&
    textureHeight === NICO_FULL_BIG_FINAL_HEIGHT_PX
  ) {
    return {
      traces: [
        {
          width: NICO_FULL_BIG_SOURCE_WIDTH_PX,
          height: NICO_FULL_BIG_SOURCE_HEIGHT_PX,
          fontSize: comment.fontSize,
          paddingX: NICO_FULL_BIG_SOURCE_PADDING_X_PX,
          baselineY: NICO_FULL_BIG_SOURCE_BASELINE_Y_PX,
          lineHeight: comment.fontSize * NICO_FULL_BIG_SOURCE_LINE_HEIGHT_RATIO,
          sourceFont: true,
        },
      ],
      output: {
        width: NICO_FULL_BIG_FINAL_WIDTH_PX,
        height: NICO_FULL_BIG_FINAL_HEIGHT_PX,
        fontSize: NICO_FULL_BIG_FINAL_FONT_SIZE_PX,
        paddingX: NICO_FULL_BIG_FINAL_PADDING_X_PX,
        baselineY: NICO_FULL_BIG_FINAL_BASELINE_Y_PX,
        lineHeight: NICO_FULL_BIG_FINAL_LINE_HEIGHT_PX,
      },
    };
  }

  if (
    comment.isScrolling &&
    comment.isFull &&
    comment.hasSameVposFullMinchoEnder &&
    !comment.isEnder &&
    textureWidth >= 1_000 &&
    textureHeight >= 800
  ) {
    return {
      output: {
        width: textureWidth,
        height: textureHeight,
        fontSize: NICO_FULL_MINCHO_SYNC_FONT_SIZE_PX,
        paddingX: NICO_FULL_BIG_FINAL_PADDING_X_PX,
        baselineY: NICO_FULL_BIG_FINAL_BASELINE_Y_PX,
        lineHeight: NICO_FULL_BIG_FINAL_LINE_HEIGHT_PX,
        canvasScale: NICO_FULL_MINCHO_SYNC_CANVAS_SCALE,
      },
    };
  }

  if (shouldUseStaticWideTexture(comment)) {
    return {
      output: {
        width: textureWidth,
        height: textureHeight,
        fontSize: NICO_STATIC_WIDE_FINAL_FONT_SIZE_PX,
        paddingX: NICO_STATIC_WIDE_FINAL_PADDING_X_PX,
        baselineY: NICO_STATIC_WIDE_FINAL_BASELINE_Y_PX,
        lineHeight: NICO_STATIC_WIDE_FINAL_LINE_HEIGHT_PX,
      },
    };
  }

  return null;
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
  const textureProfile = resolveTextureProfile(comment, textureWidth, textureHeight);
  if (textureProfile) {
    return createProfiledTexture(comment, ctx, textureProfile);
  }

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
  const drawX = interpolatedX ?? comment.x;
  const linesToRender = comment.lines.length > 0 ? comment.lines : [comment.text];
  const lineAdvance =
    comment.lines.length > 1 && comment.lineHeightPx > 0 ? comment.lineHeightPx : comment.fontSize;
  const baselineStart = comment.y + comment.fontSize;
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

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

const getOutlineOffsets = (fontSize: number): Array<[number, number]> => {
  const outlineThickness = Math.max(1, Math.round(fontSize * 0.08));
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
    const leadingSpaces = line.match(/^[\u3000\u00A0]+/);
    const leadingSpaceCount = leadingSpaces ? leadingSpaces[0].length : 0;
    const leadingSpaceOffset =
      leadingSpaceCount > 0 ? measureTextWidth(measurementCtx, leadingSpaces![0]) : 0;
    const effectiveDrawX = baseDrawX + leadingSpaceOffset + offsetX;
    const trimmedLine = leadingSpaceCount > 0 ? line.substring(leadingSpaceCount) : line;

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
  const outlineOffsets = getOutlineOffsets(comment.fontSize);

  const drawOutline = (): void => {
    const outlineAlpha = clampOpacity(effectiveOpacity * 0.6);
    offscreenCtx.save();
    offscreenCtx.fillStyle = `rgba(0, 0, 0, ${outlineAlpha})`;
    for (const [offsetX, offsetY] of outlineOffsets) {
      linesToRender.forEach((line: string, index: number) => {
        const baseline = baselineStart + index * lineAdvance + offsetY;
        drawSegment(line, baseline, "outline", offsetX);
      });
    }
    offscreenCtx.restore();
  };

  const drawFill = (fillStyle: string): void => {
    offscreenCtx.save();
    offscreenCtx.fillStyle = fillStyle;
    linesToRender.forEach((line: string, index: number) => {
      const baseline = baselineStart + index * lineAdvance;
      drawSegment(line, baseline, "fill");
    });
    offscreenCtx.restore();
  };

  drawOutline();

  if (comment.renderStyle === "classic") {
    const baseShadowOffset = Math.max(1, comment.fontSize * 0.04);
    const baseShadowBlur = comment.fontSize * 0.18;
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
      linesToRender.forEach((line: string, index: number) => {
        const baseline = baselineStart + index * lineAdvance;
        drawSegment(line, baseline, "fill");
      });
      offscreenCtx.restore();
    });
  }

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);
  drawFill(resolvedFillStyle);

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
  const outlineOffsets = getOutlineOffsets(comment.fontSize);

  const drawOutline = (): void => {
    const outlineAlpha = clampOpacity(effectiveOpacity * 0.6);
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${outlineAlpha})`;
    for (const [offsetX, offsetY] of outlineOffsets) {
      linesToRender.forEach((line: string, index: number) => {
        const baseline = baselineStart + index * lineAdvance + offsetY;
        drawSegment(line, baseline, "outline", offsetX);
      });
    }
    ctx.restore();
  };

  const drawFill = (fillStyle: string): void => {
    ctx.save();
    ctx.fillStyle = fillStyle;
    linesToRender.forEach((line: string, index: number) => {
      const baseline = baselineStart + index * lineAdvance;
      drawSegment(line, baseline, "fill");
    });
    ctx.restore();
  };

  drawOutline();

  if (comment.renderStyle === "classic") {
    const baseShadowOffset = Math.max(1, comment.fontSize * 0.04);
    const baseShadowBlur = comment.fontSize * 0.18;
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
      linesToRender.forEach((line: string, index: number) => {
        const baseline = baselineStart + index * lineAdvance;
        drawSegment(line, baseline, "fill");
      });
      ctx.restore();
    });
  }

  const resolvedFillStyle = resolveFillStyleWithOpacity(comment.color, effectiveOpacity);
  drawFill(resolvedFillStyle);
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

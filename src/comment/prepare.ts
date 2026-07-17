import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
import { STATIC_VISIBLE_DURATION_MS } from "@/shared/constants";
import { commentLogger as logger } from "@/comment/logger";
import { measureTextWidth } from "@/comment/text-measure";
import { resolveNicoCommentLayoutMetrics } from "@/comment/nico-layout";
import {
  NICO_SCROLL_TRAVERSAL_DURATION_MS,
  resolveNicoScrollMotion,
  resolveNicoScrollTexturePaddingX,
} from "@/comment/nico-scroll";
import { resolveNicoStaticWidthFit } from "@/comment/static-width-fit";

export const getCommentCanvasFont = (
  comment: Pick<Comment, "fontSize" | "fontFamily" | "fontWeight">,
): string =>
  `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${comment.fontSize}px ${comment.fontFamily}`;

const NICO_TAB_REPLACEMENT = "\u2003\u2003";

const normalizeCommentTextForCanvas = (text: string): string =>
  text.replaceAll("\t", NICO_TAB_REPLACEMENT);

const ensureLines = (text: string): string[] => {
  const normalizedText = normalizeCommentTextForCanvas(text);
  if (normalizedText.includes("\n")) {
    const rawLines = normalizedText.split(/\r?\n/);
    return rawLines.length > 0 ? rawLines : [""];
  }
  return [normalizedText];
};

const updateTextMetrics = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  lineHeightPx = Math.max(1, comment.fontSize * comment.lineHeightMultiplier),
): void => {
  let maxLineWidth = 0;
  const effectiveLetterSpacing = comment.letterSpacing;
  for (const line of comment.lines) {
    const baseWidth = measureTextWidth(ctx, line);
    const extraSpacing = line.length > 1 ? effectiveLetterSpacing * (line.length - 1) : 0;
    const totalWidth = Math.max(0, baseWidth + extraSpacing);
    if (totalWidth > maxLineWidth) {
      maxLineWidth = totalWidth;
    }
  }
  comment.width = maxLineWidth;
  comment.lineHeightPx = Math.max(1, lineHeightPx);
  const additionalHeight =
    comment.lines.length > 1 ? (comment.lines.length - 1) * comment.lineHeightPx : 0;
  comment.height = comment.fontSize + additionalHeight;
};

const measureMaxLineWidthAtFont = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  fontSize: number,
): number => {
  ctx.font = `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${fontSize}px ${comment.fontFamily}`;
  return Math.max(
    0,
    ...comment.lines.map((line) => {
      const extraSpacing = line.length > 1 ? comment.letterSpacing * (line.length - 1) : 0;
      return Math.max(0, measureTextWidth(ctx, line) + extraSpacing);
    }),
  );
};

export const prepareComment = (
  comment: Comment,
  ctx: CanvasRenderingContext2D,
  visibleWidth: number,
  canvasHeight: number,
  options: CommentPrepareOptions,
): void => {
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
    comment.lines = ensureLines(comment.text);
    const layoutMetrics = resolveNicoCommentLayoutMetrics({
      canvasHeight,
      size: comment.size,
      lineCount: comment.lines.length,
      isEnder: comment.isEnder,
      lineHeightMultiplier: comment.lineHeightMultiplier,
    });
    comment.fontSize = layoutMetrics.fontSize;
    comment.slotHeight = layoutMetrics.slotHeight;
    comment.staticWidthScale = 1;
    ctx.font = getCommentCanvasFont(comment);
    updateTextMetrics(comment, ctx, layoutMetrics.lineAdvance);
    if (!comment.isScrolling) {
      const verticalTextWidth = comment.width;
      const originalMetrics = resolveNicoCommentLayoutMetrics({
        canvasHeight,
        size: comment.size,
        lineCount: comment.lines.length,
        isEnder: true,
        lineHeightMultiplier: comment.lineHeightMultiplier,
      });
      const originalTextWidth = measureMaxLineWidthAtFont(comment, ctx, originalMetrics.fontSize);
      const widthFit = resolveNicoStaticWidthFit({
        visibleWidth: safeVisibleWidth,
        canvasHeight,
        isFull: comment.isFull,
        isEnder: comment.isEnder,
        lineCount: comment.lines.length,
        verticalFontSize: layoutMetrics.fontSize,
        verticalTextWidth,
        originalFontSize: originalMetrics.fontSize,
        originalTextWidth,
      });
      const baseMetrics = widthFit.useOriginalMetrics ? originalMetrics : layoutMetrics;
      const fontRatio = widthFit.fontSize / Math.max(1, baseMetrics.fontSize);
      comment.fontSize = widthFit.fontSize;
      comment.staticWidthScale = widthFit.drawScale;
      ctx.font = getCommentCanvasFont(comment);
      updateTextMetrics(comment, ctx, baseMetrics.lineAdvance * fontRatio);
      comment.slotHeight = Math.max(1, baseMetrics.slotHeight * fontRatio * widthFit.drawScale);
    }
    if (!comment.isScrolling) {
      comment.bufferWidth = 0;
      const centeredX = (safeVisibleWidth - comment.width) / 2;
      comment.virtualStartX = centeredX;
      comment.x = centeredX;
      comment.baseSpeed = 0;
      comment.speed = 0;
      comment.speedPixelsPerMs = 0;
      comment.visibleDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.preCollisionDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.totalDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.reservationWidth = comment.width * comment.staticWidthScale;
      comment.staticExpiryTimeMs = comment.vposMs + STATIC_VISIBLE_DURATION_MS;
      comment.lastUpdateTime = comment.getTimeSource().now();
      comment.isPaused = false;
      return;
    }

    comment.staticExpiryTimeMs = null;
    const hasFixedDuration = options.maxVisibleDurationMs === options.minVisibleDurationMs;
    const traversalDurationMs = hasFixedDuration
      ? options.maxVisibleDurationMs
      : NICO_SCROLL_TRAVERSAL_DURATION_MS;
    const texturePaddingX = resolveNicoScrollTexturePaddingX(comment.fontSize);
    const motion = resolveNicoScrollMotion({
      visibleWidth: safeVisibleWidth,
      inkWidth: comment.width,
      texturePaddingX,
      direction: comment.scrollDirection,
      traversalDurationMs,
    });
    comment.bufferWidth = 0;
    comment.virtualStartX = motion.startX;
    comment.x = motion.startX;
    comment.exitThreshold = motion.exitX;
    const pixelsPerFrame = (motion.pixelsPerMs * 1000) / 60;
    comment.baseSpeed = pixelsPerFrame;
    comment.speed = comment.baseSpeed;
    comment.speedPixelsPerMs = motion.pixelsPerMs;
    comment.visibleDurationMs = traversalDurationMs;
    comment.preCollisionDurationMs = Math.ceil(motion.collisionDurationMs);
    comment.totalDurationMs = Math.ceil(motion.totalDurationMs);
    comment.reservationWidth = comment.width;
    comment.lastUpdateTime = comment.getTimeSource().now();
    comment.isPaused = false;
  } catch (error) {
    logger.error("Comment.prepare", error as Error, {
      text: comment.text,
      visibleWidth,
      canvasHeight,
      hasContext: Boolean(ctx),
    });
    throw error;
  }
};

export { updateTextMetrics };

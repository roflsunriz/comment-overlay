import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
import {
  STATIC_VISIBLE_DURATION_MS,
  STATIC_COMMENT_SIDE_MARGIN_PX,
  MIN_STATIC_FONT_SIZE_PX,
} from "@/shared/constants";
import { commentLogger as logger } from "@/comment/logger";
import { measureTextWidth } from "@/comment/text-measure";

const ensureLines = (text: string): string[] => {
  if (text.includes("\n")) {
    const rawLines = text.split(/\r?\n/);
    return rawLines.length > 0 ? rawLines : [""];
  }
  return [text];
};

const clampFontSize = (value: number): number => Math.max(24, value);

const updateTextMetrics = (comment: Comment, ctx: CanvasRenderingContext2D): void => {
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
  const computedLineHeightPx = Math.max(
    1,
    Math.floor(comment.fontSize * comment.lineHeightMultiplier),
  );
  comment.lineHeightPx = computedLineHeightPx;
  const additionalHeight =
    comment.lines.length > 1 ? (comment.lines.length - 1) * computedLineHeightPx : 0;
  comment.height = comment.fontSize + additionalHeight;
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
    const baseFontSize = clampFontSize(Math.floor(canvasHeight * 0.05));
    const scaledFontSize = clampFontSize(Math.floor(baseFontSize * comment.sizeScale));
    comment.fontSize = scaledFontSize;
    ctx.font = `${comment.fontSize}px ${comment.fontFamily}`;
    comment.lines = ensureLines(comment.text);
    updateTextMetrics(comment, ctx);

    const isStaticTopOrBottom =
      !comment.isScrolling && (comment.layout === "ue" || comment.layout === "shita");
    if (isStaticTopOrBottom) {
      const maxStaticWidth = Math.max(1, safeVisibleWidth - STATIC_COMMENT_SIDE_MARGIN_PX * 2);
      if (comment.width > maxStaticWidth) {
        const minimumFontSize = Math.max(
          MIN_STATIC_FONT_SIZE_PX,
          Math.min(comment.fontSize, Math.floor(baseFontSize * 0.6)),
        );
        const shrinkFactor = maxStaticWidth / Math.max(comment.width, 1);
        const initialShrink = Math.max(
          minimumFontSize,
          Math.floor(comment.fontSize * Math.min(shrinkFactor, 1)),
        );
        if (initialShrink < comment.fontSize) {
          comment.fontSize = initialShrink;
          ctx.font = `${comment.fontSize}px ${comment.fontFamily}`;
          updateTextMetrics(comment, ctx);
        }
        let iteration = 0;
        while (
          comment.width > maxStaticWidth &&
          comment.fontSize > minimumFontSize &&
          iteration < 5
        ) {
          const currentShrink = maxStaticWidth / Math.max(comment.width, 1);
          const proposedSize = Math.max(
            minimumFontSize,
            Math.floor(comment.fontSize * Math.max(currentShrink, 0.7)),
          );
          if (proposedSize >= comment.fontSize) {
            comment.fontSize = Math.max(minimumFontSize, comment.fontSize - 1);
          } else {
            comment.fontSize = proposedSize;
          }
          ctx.font = `${comment.fontSize}px ${comment.fontFamily}`;
          updateTextMetrics(comment, ctx);
          iteration += 1;
        }
      }
    }

    if (!comment.isScrolling) {
      comment.bufferWidth = 0;
      const margin = isStaticTopOrBottom ? STATIC_COMMENT_SIDE_MARGIN_PX : 0;
      const centeredX = Math.max((safeVisibleWidth - comment.width) / 2, margin);
      const maxStart = Math.max(margin, safeVisibleWidth - comment.width - margin);
      const clampedX = Math.min(centeredX, Math.max(maxStart, margin));
      comment.virtualStartX = clampedX;
      comment.x = clampedX;
      comment.baseSpeed = 0;
      comment.speed = 0;
      comment.speedPixelsPerMs = 0;
      comment.visibleDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.preCollisionDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.totalDurationMs = STATIC_VISIBLE_DURATION_MS;
      comment.reservationWidth = comment.width;
      comment.staticExpiryTimeMs = comment.vposMs + STATIC_VISIBLE_DURATION_MS;
      comment.lastUpdateTime = comment.getTimeSource().now();
      comment.isPaused = false;
      return;
    }

    comment.staticExpiryTimeMs = null;
    const maxReservationWidth = measureTextWidth(ctx, "??".repeat(150));

    const bufferFromWidth = comment.width * Math.max(options.bufferRatio, 0);
    comment.bufferWidth = Math.max(options.baseBufferPx, bufferFromWidth);
    const entryBuffer = Math.max(options.entryBufferPx, comment.bufferWidth);

    const direction = comment.scrollDirection;

    const startLeft =
      direction === "rtl"
        ? safeVisibleWidth + options.virtualExtension
        : -comment.width - comment.bufferWidth - options.virtualExtension;
    const exitLeft =
      direction === "rtl"
        ? -comment.width - comment.bufferWidth - entryBuffer
        : safeVisibleWidth + entryBuffer;
    const trailingBoundary = direction === "rtl" ? safeVisibleWidth + entryBuffer : -entryBuffer;
    const trailingEdgeAtStart =
      direction === "rtl"
        ? startLeft + comment.width + comment.bufferWidth
        : startLeft - comment.bufferWidth;

    comment.virtualStartX = startLeft;
    comment.x = startLeft;
    comment.exitThreshold = exitLeft;

    const widthRatio = safeVisibleWidth > 0 ? comment.width / safeVisibleWidth : 0;
    const hasFixedDuration = options.maxVisibleDurationMs === options.minVisibleDurationMs;
    let visibleDurationMs = options.maxVisibleDurationMs;
    if (!hasFixedDuration && widthRatio > 1) {
      const clampedRatio = Math.min(widthRatio, options.maxWidthRatio);
      const adjustedDuration = options.maxVisibleDurationMs / Math.max(clampedRatio, 1);
      visibleDurationMs = Math.max(options.minVisibleDurationMs, Math.floor(adjustedDuration));
    }

    const visibleDistance = safeVisibleWidth + comment.width + comment.bufferWidth + entryBuffer;
    const safeVisibleDuration = Math.max(visibleDurationMs, 1);
    const pixelsPerMs = visibleDistance / safeVisibleDuration;
    const pixelsPerFrame = (pixelsPerMs * 1000) / 60;
    comment.baseSpeed = pixelsPerFrame;
    comment.speed = comment.baseSpeed;
    comment.speedPixelsPerMs = pixelsPerMs;

    const travelDistance = Math.abs(exitLeft - startLeft);
    const preCollisionDistance =
      direction === "rtl"
        ? Math.max(0, trailingEdgeAtStart - trailingBoundary)
        : Math.max(0, trailingBoundary - trailingEdgeAtStart);
    const safePixelsPerMs = Math.max(pixelsPerMs, Number.EPSILON);

    comment.visibleDurationMs = visibleDurationMs;
    comment.preCollisionDurationMs = Math.max(0, Math.ceil(preCollisionDistance / safePixelsPerMs));
    comment.totalDurationMs = Math.max(
      comment.preCollisionDurationMs,
      Math.ceil(travelDistance / safePixelsPerMs),
    );

    const reservationBase = comment.width + comment.bufferWidth + entryBuffer;
    comment.reservationWidth = Math.min(maxReservationWidth, reservationBase);
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

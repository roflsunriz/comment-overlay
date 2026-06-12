import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
import {
  STATIC_VISIBLE_DURATION_MS,
  STATIC_COMMENT_SIDE_MARGIN_PX,
  MIN_STATIC_FONT_SIZE_PX,
} from "@/shared/constants";
import { commentLogger as logger } from "@/comment/logger";
import { measureTextWidth } from "@/comment/text-measure";

export const getCommentCanvasFont = (
  comment: Pick<Comment, "fontSize" | "fontFamily" | "fontWeight">,
): string =>
  `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${comment.fontSize}px ${comment.fontFamily}`;

const NICO_BASE_FONT_SIZE_RATIO = 27 / 665;
const MIN_SCROLL_FONT_SIZE_PX = 12;

const NICO_TAB_REPLACEMENT = "\u2003\u2003";
const NICO_FULL_SMALL_WIDTH_BUCKETS = [366, 510, 1662] as const;
const NICO_FULL_BIG_WIDTH_PX = 566;
const NICO_FULL_SMALL_HEIGHT_RATIO = 806 / 665;
const NICO_FULL_BIG_HEIGHT_RATIO = 808 / 665;
const NICO_FULL_SCROLL_X_OFFSET_RATIO = 0.25;
const NICO_FULL_SCROLL_MIN_X_OFFSET_PX = 160;
const NICO_FULL_SCROLL_MAX_X_OFFSET_PX = 420;
const NICO_SCROLL_EXTENSION_BASE_PX = 80;
const NICO_SCROLL_EXTENSION_WIDTH_RATIO = 0.18;
const NICO_SCROLL_EXTENSION_WIDE_THRESHOLD_PX = 400;
const NICO_SCROLL_EXTENSION_WIDE_RATIO = 0.2;
const NICO_SCROLL_EXTENSION_MAX_PX = 420;
const NICO_SCROLL_EXIT_EXTENSION_THRESHOLD_PX = 250;
const NICO_SCROLL_EXIT_EXTENSION_RATIO = 1.8;
const NICO_SCROLL_EXIT_EXTENSION_MAX_PX = 420;
const NICO_FULL_SCROLL_SPEED_EXTENSION_BASE_PX = 20;
const NICO_FULL_SCROLL_SPEED_EXTENSION_WIDTH_RATIO = 0.045;

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

const clampFontSize = (value: number, minSize = MIN_SCROLL_FONT_SIZE_PX): number =>
  Math.max(minSize, value);

const snapFullCommentWidth = (comment: Comment): number => {
  if (comment.fontSize >= 35) {
    return NICO_FULL_BIG_WIDTH_PX;
  }
  const rawLines = comment.text.split(/\r?\n/);
  const maxRawTabCount = Math.max(0, ...rawLines.map((line) => (line.match(/\t/g) || []).length));
  if (maxRawTabCount >= 12) {
    return NICO_FULL_SMALL_WIDTH_BUCKETS[2];
  }
  if (comment.width >= 1_200) {
    return NICO_FULL_SMALL_WIDTH_BUCKETS[2];
  }
  if (comment.width >= 300) {
    return NICO_FULL_SMALL_WIDTH_BUCKETS[1];
  }
  return NICO_FULL_SMALL_WIDTH_BUCKETS[0];
};

const getFullScrollXOffset = (comment: Comment): number =>
  Math.min(
    NICO_FULL_SCROLL_MAX_X_OFFSET_PX,
    Math.max(NICO_FULL_SCROLL_MIN_X_OFFSET_PX, comment.width * NICO_FULL_SCROLL_X_OFFSET_RATIO),
  );

const getScrollDistanceExtension = (comment: Comment): number =>
  Math.min(
    NICO_SCROLL_EXTENSION_MAX_PX,
    NICO_SCROLL_EXTENSION_BASE_PX +
      comment.width * NICO_SCROLL_EXTENSION_WIDTH_RATIO +
      Math.max(0, comment.width - NICO_SCROLL_EXTENSION_WIDE_THRESHOLD_PX) *
        NICO_SCROLL_EXTENSION_WIDE_RATIO,
  );

const getScrollExitExtension = (comment: Comment): number =>
  Math.min(
    NICO_SCROLL_EXIT_EXTENSION_MAX_PX,
    Math.max(0, comment.width - NICO_SCROLL_EXIT_EXTENSION_THRESHOLD_PX) *
      NICO_SCROLL_EXIT_EXTENSION_RATIO,
  );

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
    const baseFontSize = clampFontSize(Math.floor(canvasHeight * NICO_BASE_FONT_SIZE_RATIO));
    const scaledFontSize = clampFontSize(Math.floor(baseFontSize * comment.sizeScale));
    comment.fontSize = scaledFontSize;
    ctx.font = getCommentCanvasFont(comment);
    comment.lines = ensureLines(comment.text);
    updateTextMetrics(comment, ctx);
    if (comment.isScrolling && comment.isFull) {
      const fullHeightRatio =
        comment.fontSize >= 35 ? NICO_FULL_BIG_HEIGHT_RATIO : NICO_FULL_SMALL_HEIGHT_RATIO;
      comment.width = snapFullCommentWidth(comment);
      comment.height = Math.max(comment.height, Math.round(canvasHeight * fullHeightRatio));
    }

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
          ctx.font = getCommentCanvasFont(comment);
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
          ctx.font = getCommentCanvasFont(comment);
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

    const fullScrollXOffset = comment.isFull ? getFullScrollXOffset(comment) : 0;
    const fullScrollSpeedExtension = comment.isFull
      ? NICO_FULL_SCROLL_SPEED_EXTENSION_BASE_PX +
        comment.width * NICO_FULL_SCROLL_SPEED_EXTENSION_WIDTH_RATIO
      : 0;
    const scrollDistanceExtension = comment.isFull ? 0 : getScrollDistanceExtension(comment);
    const scrollExitExtension = comment.isFull ? 0 : getScrollExitExtension(comment);
    const startLeft =
      direction === "rtl"
        ? safeVisibleWidth + options.virtualExtension + fullScrollXOffset + scrollDistanceExtension
        : -comment.width -
          comment.bufferWidth -
          options.virtualExtension -
          fullScrollXOffset -
          scrollDistanceExtension;
    const exitLeft =
      direction === "rtl"
        ? -comment.width -
          comment.bufferWidth -
          entryBuffer +
          fullScrollXOffset -
          scrollDistanceExtension -
          scrollExitExtension
        : safeVisibleWidth +
          entryBuffer -
          fullScrollXOffset +
          scrollDistanceExtension +
          scrollExitExtension;
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
    if (!hasFixedDuration && widthRatio > 1 && !comment.isFull) {
      const clampedRatio = Math.min(widthRatio, options.maxWidthRatio);
      const adjustedDuration = options.maxVisibleDurationMs / Math.max(clampedRatio, 1);
      visibleDurationMs = Math.max(options.minVisibleDurationMs, Math.floor(adjustedDuration));
    }

    const visibleDistance =
      safeVisibleWidth +
      comment.width +
      comment.bufferWidth +
      entryBuffer +
      options.virtualExtension +
      fullScrollSpeedExtension +
      scrollDistanceExtension * 2 +
      scrollExitExtension;
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

import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
import { STATIC_VISIBLE_DURATION_MS } from "@/shared/constants";
import { commentLogger as logger } from "@/comment/logger";
import { measureTextWidth } from "@/comment/text-measure";
import { resolveNicoCommentLayoutMetrics } from "@/comment/nico-layout";
import { resolveNicoStaticWidthFit } from "@/comment/static-width-fit";

export const getCommentCanvasFont = (
  comment: Pick<Comment, "fontSize" | "fontFamily" | "fontWeight">,
): string =>
  `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${comment.fontSize}px ${comment.fontFamily}`;

const NICO_REFERENCE_HEIGHT_PX = 665;

const NICO_TAB_REPLACEMENT = "\u2003\u2003";
const NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS = [
  366 / NICO_REFERENCE_HEIGHT_PX,
  510 / NICO_REFERENCE_HEIGHT_PX,
  1662 / NICO_REFERENCE_HEIGHT_PX,
] as const;
const NICO_FULL_BIG_WIDTH_RATIO = 566 / NICO_REFERENCE_HEIGHT_PX;
const NICO_FULL_SMALL_HEIGHT_RATIO = 806 / 665;
const NICO_FULL_BIG_HEIGHT_RATIO = 808 / 665;
const NICO_FULL_MINCHO_BIG_WIDTH_RATIO = 1176 / 665;
const NICO_FULL_MINCHO_BIG_HEIGHT_RATIO = 900 / 665;
const NICO_FULL_MINCHO_MEDIUM_WIDTH_RATIO = 1126 / 665;
const NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO = 810 / 665;
const NICO_FULL_MINCHO_SYNC_MEMBER_BIG_WIDTH_RATIO = 1126 / 665;
const NICO_FULL_MINCHO_SYNC_SPARSE_MEMBER_WIDTH_RATIO = 1046 / 665;
const NICO_FULL_MINCHO_SYNC_SPARSE_ENDER_WIDTH_RATIO = 1254 / 665;
const NICO_FULL_MINCHO_SYNC_MEMBER_MEDIUM_WIDTH_RATIO = 1140 / 665;
const NICO_FULL_MINCHO_SYNC_MEMBER_MEDIUM_HEIGHT_RATIO = 878 / 665;
const NICO_FULL_SCROLL_X_OFFSET_RATIO = 0.25;
const NICO_FULL_SCROLL_MIN_X_OFFSET_BASE_PX = 160;
const NICO_FULL_SCROLL_MAX_X_OFFSET_BASE_PX = 420;
const NICO_SCROLL_EXTENSION_BASE_PX = 80;
const NICO_SCROLL_EXTENSION_WIDTH_RATIO = 0.18;
const NICO_SCROLL_EXTENSION_WIDE_THRESHOLD_BASE_PX = 400;
const NICO_SCROLL_EXTENSION_WIDE_RATIO = 0.2;
const NICO_SCROLL_EXTENSION_MAX_BASE_PX = 420;
const NICO_SCROLL_EXIT_EXTENSION_THRESHOLD_BASE_PX = 250;
const NICO_SCROLL_EXIT_EXTENSION_RATIO = 1.8;
const NICO_SCROLL_EXIT_EXTENSION_MAX_BASE_PX = 420;
const NICO_FULL_SCROLL_SPEED_EXTENSION_BASE_PX = 20;
const NICO_FULL_SCROLL_SPEED_EXTENSION_WIDTH_RATIO = 0.045;
const NICO_SCROLL_RESERVATION_TEXTURE_WIDTH_RATIO = 850 / 1182;

const getHeightScale = (canvasHeight: number): number =>
  Math.max(0.01, canvasHeight / NICO_REFERENCE_HEIGHT_PX);

const scaleReferencePx = (value: number, canvasHeight: number): number =>
  value * getHeightScale(canvasHeight);

const normalizeCommentTextForCanvas = (text: string): string =>
  text.replaceAll("\t", NICO_TAB_REPLACEMENT);

const NICO_LAYOUT_BLANK_CHARS_PATTERN = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g;

const ensureLines = (text: string): string[] => {
  const normalizedText = normalizeCommentTextForCanvas(text);
  if (normalizedText.includes("\n")) {
    const rawLines = normalizedText.split(/\r?\n/);
    return rawLines.length > 0 ? rawLines : [""];
  }
  return [normalizedText];
};

const snapFullCommentWidth = (comment: Comment, canvasHeight: number): number => {
  if (comment.fontSize >= 35) {
    return Math.round(canvasHeight * NICO_FULL_BIG_WIDTH_RATIO);
  }
  const rawLines = comment.text.split(/\r?\n/);
  const maxRawLineLength = Math.max(0, ...rawLines.map((line) => line.length));
  if (comment.isEnder && maxRawLineLength >= 25) {
    return Math.round(canvasHeight * NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS[2]);
  }
  const maxRawTabCount = Math.max(0, ...rawLines.map((line) => (line.match(/\t/g) || []).length));
  if (maxRawTabCount >= 12) {
    return Math.round(canvasHeight * NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS[2]);
  }
  if (comment.width >= 1_200) {
    return Math.round(canvasHeight * NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS[2]);
  }
  if (comment.width >= 300) {
    return Math.round(canvasHeight * NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS[1]);
  }
  return Math.round(canvasHeight * NICO_FULL_SMALL_WIDTH_BUCKET_RATIOS[0]);
};

const getFullScrollXOffset = (motionWidth: number, canvasHeight: number): number => {
  return Math.min(
    scaleReferencePx(NICO_FULL_SCROLL_MAX_X_OFFSET_BASE_PX, canvasHeight),
    Math.max(
      scaleReferencePx(NICO_FULL_SCROLL_MIN_X_OFFSET_BASE_PX, canvasHeight),
      motionWidth * NICO_FULL_SCROLL_X_OFFSET_RATIO,
    ),
  );
};

const getScrollDistanceExtension = (comment: Comment, canvasHeight: number): number => {
  const wideThreshold = scaleReferencePx(
    NICO_SCROLL_EXTENSION_WIDE_THRESHOLD_BASE_PX,
    canvasHeight,
  );
  return Math.min(
    scaleReferencePx(NICO_SCROLL_EXTENSION_MAX_BASE_PX, canvasHeight),
    scaleReferencePx(NICO_SCROLL_EXTENSION_BASE_PX, canvasHeight) +
      comment.width * NICO_SCROLL_EXTENSION_WIDTH_RATIO +
      Math.max(0, comment.width - wideThreshold) * NICO_SCROLL_EXTENSION_WIDE_RATIO,
  );
};

const getScrollExitExtension = (comment: Comment, canvasHeight: number): number =>
  Math.min(
    scaleReferencePx(NICO_SCROLL_EXIT_EXTENSION_MAX_BASE_PX, canvasHeight),
    Math.max(
      0,
      comment.width - scaleReferencePx(NICO_SCROLL_EXIT_EXTENSION_THRESHOLD_BASE_PX, canvasHeight),
    ) * NICO_SCROLL_EXIT_EXTENSION_RATIO,
  );

const getScrollReservationTextureWidth = (comment: Comment, visibleWidth: number): number => {
  if (comment.isFull) {
    return comment.width;
  }
  const baseScale = Math.max(comment.sizeScale, 1);
  const baseWidth = comment.width / baseScale;
  const textureWidth = baseWidth;
  const textureCap = visibleWidth * NICO_SCROLL_RESERVATION_TEXTURE_WIDTH_RATIO;
  return Math.min(textureWidth, textureCap);
};

const getNonEmptyLineCount = (comment: Comment): number =>
  comment.lines.filter((line) => line.replace(NICO_LAYOUT_BLANK_CHARS_PATTERN, "").length > 0)
    .length;

const isSparseMultilineLayer = (comment: Comment): boolean =>
  comment.lines.length > 1 && getNonEmptyLineCount(comment) === 1;

const getNonEmptyLineTokens = (comment: Comment): string[] =>
  comment.lines
    .map((line) => line.replace(NICO_LAYOUT_BLANK_CHARS_PATTERN, ""))
    .filter((line) => line.length > 0);

const isNarrowMarkerMultilineLayer = (comment: Comment): boolean => {
  if (comment.lines.length <= 1) {
    return false;
  }
  const tokens = getNonEmptyLineTokens(comment);
  return tokens.length === 1 && /^[●○◉◎]+$/u.test(tokens[0]);
};

const isLargeComment = (comment: Comment): boolean =>
  comment.size === "big" || comment.fontSize >= 35;

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
    if (comment.isScrolling && comment.isFull) {
      const isFullMinchoMultiline =
        comment.lines.length > 1 &&
        (comment.fontFamily.includes("Yu Mincho") || comment.fontFamily.includes("游明朝"));
      if (
        isFullMinchoMultiline &&
        comment.hasSameVposFullMinchoEnder &&
        !comment.isEnder &&
        isLargeComment(comment)
      ) {
        comment.width = Math.round(
          canvasHeight *
            (isNarrowMarkerMultilineLayer(comment)
              ? NICO_FULL_MINCHO_SYNC_SPARSE_MEMBER_WIDTH_RATIO
              : NICO_FULL_MINCHO_SYNC_MEMBER_BIG_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO),
        );
      } else if (
        isFullMinchoMultiline &&
        comment.hasSameVposFullMinchoEnder &&
        comment.isEnder &&
        isLargeComment(comment)
      ) {
        comment.width = Math.round(
          canvasHeight *
            (isSparseMultilineLayer(comment)
              ? NICO_FULL_MINCHO_SYNC_SPARSE_ENDER_WIDTH_RATIO
              : NICO_FULL_MINCHO_BIG_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_BIG_HEIGHT_RATIO),
        );
      } else if (isFullMinchoMultiline && comment.hasSameVposFullMinchoEnder && comment.isEnder) {
        comment.width = Math.round(
          canvasHeight *
            (isSparseMultilineLayer(comment)
              ? NICO_FULL_MINCHO_SYNC_SPARSE_ENDER_WIDTH_RATIO
              : NICO_FULL_MINCHO_SYNC_MEMBER_MEDIUM_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_SYNC_MEMBER_MEDIUM_HEIGHT_RATIO),
        );
      } else if (isFullMinchoMultiline && isLargeComment(comment)) {
        comment.width = Math.round(
          canvasHeight *
            (isNarrowMarkerMultilineLayer(comment)
              ? NICO_FULL_MINCHO_SYNC_SPARSE_MEMBER_WIDTH_RATIO
              : NICO_FULL_MINCHO_BIG_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_BIG_HEIGHT_RATIO),
        );
      } else if (isFullMinchoMultiline) {
        comment.width = Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_WIDTH_RATIO);
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO),
        );
      } else {
        const fullHeightRatio = isLargeComment(comment)
          ? NICO_FULL_BIG_HEIGHT_RATIO
          : NICO_FULL_SMALL_HEIGHT_RATIO;
        comment.width = snapFullCommentWidth(comment, canvasHeight);
        comment.height = Math.max(comment.height, Math.round(canvasHeight * fullHeightRatio));
      }
      comment.slotHeight = Math.max(comment.slotHeight, comment.height);
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
    const maxReservationWidth = measureTextWidth(ctx, "??".repeat(150));
    const motionWidth = comment.width;

    const bufferFromWidth = motionWidth * Math.max(options.bufferRatio, 0);
    comment.bufferWidth = Math.max(options.baseBufferPx, bufferFromWidth);
    const entryBuffer = Math.max(options.entryBufferPx, comment.bufferWidth);

    const direction = comment.scrollDirection;

    const fullMotionScale = Math.min(1, canvasHeight / NICO_REFERENCE_HEIGHT_PX);
    const virtualExtension = comment.isFull
      ? options.virtualExtension * fullMotionScale
      : options.virtualExtension;
    const fullScrollXOffset = comment.isFull
      ? getFullScrollXOffset(comment.width, canvasHeight)
      : 0;
    const fullScrollSpeedExtension = comment.isFull
      ? scaleReferencePx(NICO_FULL_SCROLL_SPEED_EXTENSION_BASE_PX, canvasHeight) +
        comment.width * NICO_FULL_SCROLL_SPEED_EXTENSION_WIDTH_RATIO
      : 0;
    const scrollDistanceExtension = comment.isFull
      ? 0
      : getScrollDistanceExtension(comment, canvasHeight);
    const scrollExitExtension = comment.isFull ? 0 : getScrollExitExtension(comment, canvasHeight);
    const startLeft =
      direction === "rtl"
        ? safeVisibleWidth + virtualExtension + fullScrollXOffset + scrollDistanceExtension
        : -motionWidth -
          comment.bufferWidth -
          virtualExtension -
          fullScrollXOffset -
          scrollDistanceExtension;
    const exitLeft =
      direction === "rtl"
        ? -motionWidth -
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
    comment.virtualStartX = startLeft;
    comment.x = startLeft;
    comment.exitThreshold = exitLeft;

    const widthRatio = safeVisibleWidth > 0 ? motionWidth / safeVisibleWidth : 0;
    const hasFixedDuration = options.maxVisibleDurationMs === options.minVisibleDurationMs;
    let visibleDurationMs = options.maxVisibleDurationMs;
    if (!hasFixedDuration && widthRatio > 1 && !comment.isFull) {
      const clampedRatio = Math.min(widthRatio, options.maxWidthRatio);
      const adjustedDuration = options.maxVisibleDurationMs / Math.max(clampedRatio, 1);
      visibleDurationMs = Math.max(options.minVisibleDurationMs, Math.floor(adjustedDuration));
    }

    const visibleDistance =
      safeVisibleWidth +
      motionWidth +
      comment.bufferWidth +
      entryBuffer +
      virtualExtension +
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
    const trailingEdgeAtStart =
      direction === "rtl"
        ? startLeft + motionWidth + comment.bufferWidth
        : startLeft - comment.bufferWidth;
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

    const reservationBase = motionWidth + comment.bufferWidth + entryBuffer;
    const textureReservationWidth = getScrollReservationTextureWidth(comment, safeVisibleWidth);
    comment.reservationWidth = Math.min(
      maxReservationWidth,
      Math.max(reservationBase, textureReservationWidth),
    );
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

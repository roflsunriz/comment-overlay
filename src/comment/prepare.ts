import type { CommentPrepareOptions } from "@/shared/types";
import type { Comment } from "@/comment/comment";
import { STATIC_VISIBLE_DURATION_MS } from "@/shared/constants";
import { commentLogger as logger } from "@/comment/logger";
import { measureTextWidth } from "@/comment/text-measure";

export const getCommentCanvasFont = (
  comment: Pick<Comment, "fontSize" | "fontFamily" | "fontWeight">,
): string =>
  `${comment.fontWeight ? `${comment.fontWeight} ` : ""}${comment.fontSize}px ${comment.fontFamily}`;

const NICO_BASE_FONT_SIZE_RATIO = 27 / 665;
const MIN_SCROLL_FONT_SIZE_PX = 12;

const NICO_TAB_REPLACEMENT = "\u2003\u2003";
const NICO_STATIC_WIDE_ART_WIDTH_RATIO = 2300 / 665;
const NICO_FULL_SMALL_WIDTH_BUCKETS = [366, 510, 1662] as const;
const NICO_FULL_BIG_WIDTH_PX = 566;
const NICO_FULL_SMALL_HEIGHT_RATIO = 806 / 665;
const NICO_FULL_BIG_HEIGHT_RATIO = 808 / 665;
const NICO_FULL_MINCHO_BIG_WIDTH_RATIO = 1176 / 665;
const NICO_FULL_MINCHO_BIG_HEIGHT_RATIO = 900 / 665;
const NICO_FULL_MINCHO_MEDIUM_WIDTH_RATIO = 1126 / 665;
const NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO = 810 / 665;
const NICO_ENDER_MINCHO_BIG_EYE_WIDTH_RATIO = 1254 / 665;
const NICO_ENDER_GROUP_MINCHO_BODY_WIDTH_RATIO = 1126 / 665;
const NICO_ENDER_GROUP_MINCHO_EYE_WIDTH_RATIO = 1046 / 665;
const NICO_ENDER_GROUP_MINCHO_MEDIUM_WIDTH_RATIO = 1140 / 665;
const NICO_ENDER_GROUP_MINCHO_MEDIUM_HEIGHT_RATIO = 878 / 665;
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

const NICO_ART_BLANK_CHARS_PATTERN = /[\s\u00a0\u2000-\u200f\u202f\u205f\u3000]/g;

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

const getNonEmptyLineCount = (comment: Comment): number =>
  comment.lines.filter((line) => line.replace(NICO_ART_BLANK_CHARS_PATTERN, "").length > 0).length;

const isSparseEyeLayer = (comment: Comment): boolean => {
  if (getNonEmptyLineCount(comment) !== 1) {
    return false;
  }
  const compactText = comment.text.replace(NICO_ART_BLANK_CHARS_PATTERN, "");
  return (
    compactText === "●" ||
    compactText.includes("●●") ||
    compactText.includes("○○") ||
    compactText.includes("◉")
  );
};

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
      const isMinchoFullArt =
        comment.lines.length > 1 &&
        (comment.fontFamily.includes("Yu Mincho") || comment.fontFamily.includes("游明朝"));
      if (isMinchoFullArt && comment.isEnderGroup && !comment.isEnder && comment.fontSize >= 35) {
        comment.width = Math.round(
          canvasHeight *
            (isSparseEyeLayer(comment)
              ? NICO_ENDER_GROUP_MINCHO_EYE_WIDTH_RATIO
              : NICO_ENDER_GROUP_MINCHO_BODY_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO),
        );
      } else if (
        isMinchoFullArt &&
        comment.isEnderGroup &&
        comment.isEnder &&
        comment.fontSize >= 35
      ) {
        comment.width = Math.round(
          canvasHeight *
            (isSparseEyeLayer(comment)
              ? NICO_ENDER_MINCHO_BIG_EYE_WIDTH_RATIO
              : NICO_FULL_MINCHO_BIG_WIDTH_RATIO),
        );
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_BIG_HEIGHT_RATIO),
        );
      } else if (isMinchoFullArt && comment.isEnderGroup && comment.isEnder) {
        comment.width = Math.round(canvasHeight * NICO_ENDER_GROUP_MINCHO_MEDIUM_WIDTH_RATIO);
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_ENDER_GROUP_MINCHO_MEDIUM_HEIGHT_RATIO),
        );
      } else if (isMinchoFullArt && comment.fontSize >= 35) {
        comment.width = Math.round(canvasHeight * NICO_FULL_MINCHO_BIG_WIDTH_RATIO);
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_BIG_HEIGHT_RATIO),
        );
      } else if (isMinchoFullArt) {
        comment.width = Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_WIDTH_RATIO);
        comment.height = Math.max(
          comment.height,
          Math.round(canvasHeight * NICO_FULL_MINCHO_MEDIUM_HEIGHT_RATIO),
        );
      } else {
        const fullHeightRatio =
          comment.fontSize >= 35 ? NICO_FULL_BIG_HEIGHT_RATIO : NICO_FULL_SMALL_HEIGHT_RATIO;
        comment.width = snapFullCommentWidth(comment);
        comment.height = Math.max(comment.height, Math.round(canvasHeight * fullHeightRatio));
      }
    }

    if (!comment.isScrolling) {
      const nicoStaticTextureWidth = safeVisibleWidth + baseFontSize * (8 / 3);
      if (comment.width >= nicoStaticTextureWidth * 0.95 && comment.fontSize >= 35) {
        comment.width = Math.round(canvasHeight * NICO_STATIC_WIDE_ART_WIDTH_RATIO);
      } else {
        comment.width = Math.min(comment.width, nicoStaticTextureWidth);
      }
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

import type { CommentSizeCommand } from "@/shared/types";

const NICO_REFERENCE_CANVAS_HEIGHT = 768;
const NICO_REFERENCE_VERTICAL_SLOT_GAP_PX = 0.1;

export const resolveNicoVerticalSlotGap = (canvasHeight: number): number =>
  NICO_REFERENCE_VERTICAL_SLOT_GAP_PX * (Math.max(1, canvasHeight) / NICO_REFERENCE_CANVAS_HEIGHT);

type MetricProfile = {
  fontSize: number;
  blockHeight: number;
  lineAdvance: number;
};

type SizeMetrics = {
  resizeAtLineCount: number;
  normal: MetricProfile;
  resized: MetricProfile;
};

const NICO_SIZE_METRICS: Record<CommentSizeCommand, SizeMetrics> = {
  small: {
    resizeAtLineCount: 7,
    normal: {
      fontSize: 36,
      blockHeight: 46.4650603532791,
      lineAdvance: 36.0867458283901,
    },
    resized: {
      fontSize: 20,
      blockHeight: 25.9252893924713,
      lineAdvance: 20.065746307373,
    },
  },
  medium: {
    resizeAtLineCount: 5,
    normal: {
      fontSize: 54,
      blockHeight: 68.1645984649658,
      lineAdvance: 57.8541674613953,
    },
    resized: {
      fontSize: 28,
      blockHeight: 35.4883227944374,
      lineAdvance: 30.0388290286064,
    },
  },
  big: {
    resizeAtLineCount: 3,
    normal: {
      fontSize: 78,
      blockHeight: 98.6615376472473,
      lineAdvance: 90.4781694412232,
    },
    resized: {
      fontSize: 40,
      blockHeight: 52.1674284785986,
      lineAdvance: 47.7538447529078,
    },
  },
};

export type NicoCommentLayoutMetrics = {
  fontSize: number;
  lineAdvance: number;
  textHeight: number;
  slotHeight: number;
  wasResizedForLineCount: boolean;
};

export const resolveNicoCommentLayoutMetrics = ({
  canvasHeight,
  size,
  lineCount,
  isEnder,
  lineHeightMultiplier,
}: {
  canvasHeight: number;
  size: CommentSizeCommand;
  lineCount: number;
  isEnder: boolean;
  lineHeightMultiplier: number;
}): NicoCommentLayoutMetrics => {
  const safeHeight = Math.max(1, canvasHeight);
  const safeLineCount = Math.max(1, Math.floor(lineCount));
  const sizeMetrics = NICO_SIZE_METRICS[size];
  const wasResizedForLineCount = !isEnder && safeLineCount >= sizeMetrics.resizeAtLineCount;
  const profile = wasResizedForLineCount ? sizeMetrics.resized : sizeMetrics.normal;
  const scale = safeHeight / NICO_REFERENCE_CANVAS_HEIGHT;
  const fontSize = Math.max(1, profile.fontSize * scale);
  const hasCustomLineHeight = Math.abs(lineHeightMultiplier - 1) > Number.EPSILON;
  const lineAdvance = hasCustomLineHeight
    ? Math.max(1, fontSize * lineHeightMultiplier)
    : Math.max(1, profile.lineAdvance * scale);
  const textHeight = fontSize + (safeLineCount - 1) * lineAdvance;
  const measuredBlockHeight =
    (profile.blockHeight + (safeLineCount - 1) * profile.lineAdvance) * scale;
  const slotHeight = hasCustomLineHeight
    ? textHeight
    : Math.max(1, measuredBlockHeight - resolveNicoVerticalSlotGap(safeHeight));

  return { fontSize, lineAdvance, textHeight, slotHeight, wasResizedForLineCount };
};

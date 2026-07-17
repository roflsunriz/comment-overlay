const NICO_REFERENCE_CANVAS_HEIGHT = 768;
const NICO_PLAIN_STATIC_WIDTH_RATIO = 0.75;
const NICO_MIN_SOURCE_FONT_PX = 10;
const NICO_SOURCE_TO_LAYOUT_SCALE = 2;

export type NicoStaticWidthFit = {
  fontSize: number;
  drawScale: number;
  useOriginalMetrics: boolean;
  targetWidth: number;
};

const quantizeFontDown = (fontSize: number, quantum: number): number =>
  Math.floor((fontSize + Number.EPSILON) / quantum) * quantum;

export const resolveNicoStaticWidthFit = ({
  visibleWidth,
  canvasHeight,
  isFull,
  isEnder,
  lineCount,
  verticalFontSize,
  verticalTextWidth,
  originalFontSize,
  originalTextWidth,
}: {
  visibleWidth: number;
  canvasHeight: number;
  isFull: boolean;
  isEnder: boolean;
  lineCount: number;
  verticalFontSize: number;
  verticalTextWidth: number;
  originalFontSize: number;
  originalTextWidth: number;
}): NicoStaticWidthFit => {
  const heightScale = Math.max(0.01, canvasHeight / NICO_REFERENCE_CANVAS_HEIGHT);
  const quantum = NICO_SOURCE_TO_LAYOUT_SCALE * heightScale;
  const minimumFontSize = NICO_MIN_SOURCE_FONT_PX * NICO_SOURCE_TO_LAYOUT_SCALE * heightScale;
  const narrowTarget = Math.max(1, visibleWidth * (isFull ? 1 : NICO_PLAIN_STATIC_WIDTH_RATIO));
  const useOriginalMetrics = !isEnder && lineCount > 1 && verticalTextWidth > narrowTarget;
  const candidateFontSize = useOriginalMetrics ? originalFontSize : verticalFontSize;
  const candidateTextWidth = useOriginalMetrics ? originalTextWidth : verticalTextWidth;
  const targetWidth = useOriginalMetrics ? narrowTarget * 2 : narrowTarget;

  let fontSize = candidateFontSize;
  if (candidateTextWidth > targetWidth) {
    fontSize = quantizeFontDown(candidateFontSize * (targetWidth / candidateTextWidth), quantum);
  }
  if (useOriginalMetrics && !isFull) {
    fontSize -= quantum;
  }
  fontSize = Math.max(minimumFontSize, Math.min(candidateFontSize, fontSize));

  const fittedTextWidth =
    candidateFontSize > 0 ? candidateTextWidth * (fontSize / candidateFontSize) : 0;
  let drawScale = 1;
  if (fittedTextWidth > targetWidth && fontSize <= minimumFontSize + Number.EPSILON) {
    drawScale = Math.max(0.1, Math.floor((targetWidth / fittedTextWidth) * 10) / 10);
  }

  return { fontSize, drawScale, useOriginalMetrics, targetWidth };
};

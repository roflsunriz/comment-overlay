const NICO_REFERENCE_OUTER_WIDTH_PX = 1364;
const NICO_REFERENCE_RENDER_WIDTH_PX = 1024;

export const NICO_SCROLL_TRAVERSAL_DURATION_MS = 4000;
export const NICO_SCROLL_ACTIVATION_LEAD_MS = 2000;
const NICO_SCROLL_PRE_ENTRY_DURATION_MS = 1000;

export const resolveNicoScrollTexturePaddingX = (fontSize: number): number =>
  Math.max(0, fontSize) / 2 + 3;

export type NicoScrollMotion = {
  renderLeft: number;
  renderWidth: number;
  pixelsPerMs: number;
  startX: number;
  exitX: number;
  collisionDurationMs: number;
  totalDurationMs: number;
};

export const resolveNicoScrollMotion = ({
  visibleWidth,
  inkWidth,
  texturePaddingX,
  direction,
  traversalDurationMs = NICO_SCROLL_TRAVERSAL_DURATION_MS,
}: {
  visibleWidth: number;
  inkWidth: number;
  texturePaddingX: number;
  direction: "rtl" | "ltr";
  traversalDurationMs?: number;
}): NicoScrollMotion => {
  const safeVisibleWidth = Math.max(1, visibleWidth);
  const safeInkWidth = Math.max(0, inkWidth);
  const safePaddingX = Math.max(0, texturePaddingX);
  const safeTraversalDurationMs = Math.max(1, traversalDurationMs);
  const renderWidth =
    safeVisibleWidth * (NICO_REFERENCE_RENDER_WIDTH_PX / NICO_REFERENCE_OUTER_WIDTH_PX);
  const renderLeft = (safeVisibleWidth - renderWidth) / 2;
  const pixelsPerMs = (renderWidth + safeInkWidth) / safeTraversalDurationMs;
  const preEntryDistance = pixelsPerMs * NICO_SCROLL_PRE_ENTRY_DURATION_MS;
  const startX =
    direction === "rtl"
      ? renderLeft + renderWidth + safePaddingX + preEntryDistance
      : renderLeft - safeInkWidth - safePaddingX - preEntryDistance;
  const exitX =
    direction === "rtl" ? -safeInkWidth - safePaddingX : safeVisibleWidth + safePaddingX;
  const totalDurationMs = Math.abs(exitX - startX) / Math.max(pixelsPerMs, Number.EPSILON);
  const collisionDurationMs = safeInkWidth / Math.max(pixelsPerMs, Number.EPSILON);

  return {
    renderLeft,
    renderWidth,
    pixelsPerMs,
    startX,
    exitX,
    collisionDurationMs,
    totalDurationMs,
  };
};

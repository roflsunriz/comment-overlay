export const toMilliseconds = (seconds: number): number => seconds * 1000;

export const sanitizeVposMs = (value: number): number | null => {
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value < 0) {
    return null;
  }
  return Math.round(value);
};

export const MAX_VISIBLE_DURATION_MS = 4_000;
export const MIN_VISIBLE_DURATION_MS = 1_800;
export const MAX_COMMENT_WIDTH_RATIO = 3;
export const COLLISION_BUFFER_RATIO = 0.25;
export const BASE_COLLISION_BUFFER_PX = 32;
export const ENTRY_BUFFER_PX = 48;
export const RESERVATION_TIME_MARGIN_MS = 120;
export const FINAL_PHASE_THRESHOLD_MS = 4_000;
export const FINAL_PHASE_MIN_GAP_MS = 120;
export const FINAL_PHASE_MAX_GAP_MS = 800;
export const FINAL_PHASE_ORDER_EPSILON_MS = 2;
export const FINAL_PHASE_MIN_WINDOW_MS = 4_000;
export const STATIC_VISIBLE_DURATION_MS = 4_000;
export const ACTIVE_WINDOW_MS = STATIC_VISIBLE_DURATION_MS + MAX_VISIBLE_DURATION_MS;
export const VIRTUAL_CANVAS_EXTENSION_PX = 1_000;
export const MIN_LANE_COUNT = 1;
export const DEFAULT_LANE_COUNT = 12;
export const MIN_FONT_SIZE_PX = 24;
export const EDGE_EPSILON = 1e-3;
export const SEEK_DIRECTION_EPSILON_MS = 50;
export const STATIC_COMMENT_VERTICAL_PADDING_RATIO = 0.05;
export const STATIC_COMMENT_MIN_VERTICAL_PADDING_PX = 10;
export const STATIC_COMMENT_SIDE_MARGIN_PX = 8;
export const MIN_STATIC_FONT_SIZE_PX = 12;

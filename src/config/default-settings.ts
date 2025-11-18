import type { RendererSettings, ReadonlyRendererSettings } from "@/shared/types";

export const NICO_COMPAT_SCROLL_VISIBLE_DURATION_MS = 4_000;

const BASE_SETTINGS: RendererSettings = {
  commentColor: "#FFFFFF",
  commentOpacity: 1,
  isCommentVisible: true,
  useContainerResizeObserver: true,
  ngWords: [],
  ngRegexps: [],
  scrollDirection: "rtl",
  renderStyle: "outline-only",
  syncMode: "raf",
  scrollVisibleDurationMs: NICO_COMPAT_SCROLL_VISIBLE_DURATION_MS,
  useFixedLaneCount: false,
  fixedLaneCount: 12,
  useDprScaling: true,
  enableAutoHardReset: true,
};

export const DEFAULT_RENDERER_SETTINGS: ReadonlyRendererSettings = BASE_SETTINGS;

export const cloneDefaultSettings = (): RendererSettings => ({
  ...BASE_SETTINGS,
  ngWords: [...BASE_SETTINGS.ngWords],
  ngRegexps: [...BASE_SETTINGS.ngRegexps],
});

export const COMMENT_OVERLAY_VERSION = "v2.7.1";

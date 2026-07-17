import type { RendererSettings, ReadonlyRendererSettings } from "@/shared/types";

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
  scrollVisibleDurationMs: null,
  useFixedLaneCount: false,
  fixedLaneCount: 12,
  useDprScaling: true,
  shadowIntensity: "medium",
};

export const DEFAULT_RENDERER_SETTINGS: ReadonlyRendererSettings = BASE_SETTINGS;

export const cloneDefaultSettings = (): RendererSettings => ({
  ...BASE_SETTINGS,
  ngWords: [...BASE_SETTINGS.ngWords],
  ngRegexps: [...BASE_SETTINGS.ngRegexps],
});

export const COMMENT_OVERLAY_VERSION = "v4.1.3";

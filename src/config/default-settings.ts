import type { RendererSettings } from "../shared/types";

type ReadonlySettings = {
  readonly [K in keyof RendererSettings]: RendererSettings[K] extends
    | string
    | number
    | boolean
    | null
    | undefined
    ? RendererSettings[K]
    : ReadonlyArray<string>;
};

const BASE_SETTINGS: RendererSettings = {
  commentColor: "#FFFFFF",
  commentOpacity: 0.75,
  isCommentVisible: true,
  useContainerResizeObserver: true,
  ngWords: [],
  ngRegexps: [],
};

export const DEFAULT_RENDERER_SETTINGS: ReadonlySettings = BASE_SETTINGS;

export const cloneDefaultSettings = (): RendererSettings => ({
  ...BASE_SETTINGS,
  ngWords: [...BASE_SETTINGS.ngWords],
  ngRegexps: [...BASE_SETTINGS.ngRegexps],
});

export const RENDERER_VERSION = "v1.0.0";

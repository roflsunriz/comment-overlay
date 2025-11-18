import type { RendererSettings, AnimationFrameProvider, TimeSource } from "@/shared/types";
import {
  STATIC_COMMENT_EDGE_PADDING_PX,
  STATIC_COMMENT_STACKING_PADDING_PX,
} from "@/shared/constants";

export const clampOpacity = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1;
  }
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return 1;
  }
  return value;
};

export const calculateStaticCommentVerticalPadding = (
  _fontSize: number,
  laneIndex: number = 0,
): number => {
  if (laneIndex === 0) {
    return STATIC_COMMENT_EDGE_PADDING_PX;
  }
  return STATIC_COMMENT_STACKING_PADDING_PX;
};

export const normalizeSettings = (settings: RendererSettings): RendererSettings => {
  const rawDuration = settings.scrollVisibleDurationMs;
  const normalizedDuration =
    rawDuration === null || rawDuration === undefined
      ? null
      : Number.isFinite(rawDuration)
        ? Math.max(1, Math.floor(rawDuration))
        : null;

  return {
    ...settings,
    scrollDirection: settings.scrollDirection === "ltr" ? "ltr" : "rtl",
    commentOpacity: clampOpacity(settings.commentOpacity),
    renderStyle: settings.renderStyle === "classic" ? "classic" : "outline-only",
    scrollVisibleDurationMs: normalizedDuration,
    syncMode: settings.syncMode === "video-frame" ? "video-frame" : "raf",
    useDprScaling: Boolean(settings.useDprScaling),
    enableAutoHardReset: settings.enableAutoHardReset !== false,
  };
};

export const createDefaultAnimationFrameProvider = (
  timeSource: TimeSource,
): AnimationFrameProvider => {
  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function" &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    return {
      request: (callback) => window.requestAnimationFrame(callback),
      cancel: (handle) => window.cancelAnimationFrame(handle),
    };
  }
  return {
    request: (callback) => {
      const timeoutId = globalThis.setTimeout(() => {
        callback(timeSource.now());
      }, 16);
      return timeoutId;
    },
    cancel: (handle) => {
      globalThis.clearTimeout(handle);
    },
  };
};

export const createBrowserCanvasFactory = (): (() => HTMLCanvasElement) => {
  if (typeof document === "undefined") {
    return () => {
      throw new Error(
        "Document is not available. Provide a custom createCanvasElement implementation.",
      );
    };
  }
  return () => document.createElement("canvas");
};

export const isRendererSettings = (input: unknown): input is RendererSettings => {
  if (!input || typeof input !== "object") {
    return false;
  }
  const candidate = input as Record<string, unknown>;
  return (
    typeof candidate.commentColor === "string" &&
    typeof candidate.commentOpacity === "number" &&
    typeof candidate.isCommentVisible === "boolean"
  );
};

import type { CommentRenderer } from "@/renderer/comment-renderer";

export type AutoHardResetReason =
  | "play-resume"
  | "first-play-delay"
  | "resize"
  | "visibility-restore"
  | "seeked";

const shouldAutoHardReset = (renderer: CommentRenderer): boolean =>
  renderer._settings.enableAutoHardReset;

export const requestAutoHardReset = (
  renderer: CommentRenderer,
  reason: AutoHardResetReason,
): void => {
  if (!shouldAutoHardReset(renderer)) {
    return;
  }
  void reason;
  const now = renderer.timeSource.now();
  if (now - renderer.lastHardResetAt < renderer.autoHardResetDedupWindowMs) {
    return;
  }
  renderer.hardReset();
};

export const scheduleInitialPlaybackAutoReset = (renderer: CommentRenderer): void => {
  if (!shouldAutoHardReset(renderer)) {
    return;
  }
  if (renderer.initialPlaybackAutoResetTriggered) {
    return;
  }
  if (renderer.initialPlaybackAutoResetTimer !== null) {
    return;
  }
  renderer.initialPlaybackAutoResetTimer = globalThis.setTimeout(() => {
    renderer.initialPlaybackAutoResetTimer = null;
    if (!shouldAutoHardReset(renderer)) {
      return;
    }
    renderer.initialPlaybackAutoResetTriggered = true;
    requestAutoHardReset(renderer, "first-play-delay");
  }, renderer.initialPlaybackAutoResetDelayMs);
};

export const resetInitialPlaybackAutoResetState = (renderer: CommentRenderer): void => {
  if (renderer.initialPlaybackAutoResetTimer !== null) {
    globalThis.clearTimeout(renderer.initialPlaybackAutoResetTimer);
    renderer.initialPlaybackAutoResetTimer = null;
  }
  renderer.initialPlaybackAutoResetTriggered = false;
};

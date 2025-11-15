import type { CommentRenderer } from "@/renderer/comment-renderer";
import { requestAutoHardReset } from "@/renderer/auto-hard-reset";
import { toMilliseconds } from "@/shared/constants";

const setupVisibilityHandlingImpl = function (this: CommentRenderer): void {
  if (
    typeof document === "undefined" ||
    typeof document.addEventListener !== "function" ||
    typeof document.removeEventListener !== "function"
  ) {
    return;
  }

  const enforceVisibilityState = (): void => {
    const state = document.visibilityState;
    if (state !== "visible") {
      this.stopAnimation();
      return;
    }
    if (!this._settings.isCommentVisible) {
      return;
    }
    this.handleVisibilityRestore();
    this.startAnimation();
  };

  document.addEventListener("visibilitychange", enforceVisibilityState);
  this.addCleanup(() => document.removeEventListener("visibilitychange", enforceVisibilityState));

  if (document.visibilityState !== "visible") {
    this.stopAnimation();
  }
};

const handleVisibilityRestoreImpl = function (this: CommentRenderer): void {
  const canvas = this.canvas;
  const ctx = this.ctx;
  const video = this.videoElement;
  if (!canvas || !ctx || !video) {
    return;
  }

  this.currentTime = toMilliseconds(video.currentTime);
  this.lastDrawTime = this.timeSource.now();
  this.isPlaying = !video.paused;
  this.isStalled = false;
  this.pendingInitialSync = true;
  this.resetFinalPhaseState();
  this.updatePlaybackProgressState();
  requestAutoHardReset(this, "visibility-restore");
  this.draw();
};

export const registerVisibilityMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.setupVisibilityHandling = setupVisibilityHandlingImpl;
  ctor.prototype.handleVisibilityRestore = handleVisibilityRestoreImpl;
};

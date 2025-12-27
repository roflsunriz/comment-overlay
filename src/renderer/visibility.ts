import type { CommentRenderer } from "@/renderer/comment-renderer";
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
  this.draw();
};

const setCommentVisibilityImpl = function (this: CommentRenderer, visible: boolean): void {
  const previousVisible = this._settings.isCommentVisible;
  this._settings.isCommentVisible = visible;

  // 状態が変化した場合のみ処理
  if (previousVisible === visible) {
    return;
  }

  this.settingsVersion += 1;
  this.commentDependencies.settingsVersion = this.settingsVersion;

  const canvas = this.canvas;
  const ctx = this.ctx;

  if (!canvas || !ctx) {
    return;
  }

  if (!visible) {
    // 非表示に変更：キャンバスをクリアしてコメントを消す
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);
  } else {
    // 表示に変更：即座に描画を再開
    this.lastDrawTime = this.timeSource.now();
    this.pendingInitialSync = true;
    this.scheduleNextFrame();
  }
};

export const registerVisibilityMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.setupVisibilityHandling = setupVisibilityHandlingImpl;
  ctor.prototype.handleVisibilityRestore = handleVisibilityRestoreImpl;
  ctor.prototype.setCommentVisibility = setCommentVisibilityImpl;
};

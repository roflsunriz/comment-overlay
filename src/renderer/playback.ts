import type { CommentRenderer } from "@/renderer/comment-renderer";
import { SEEK_DIRECTION_EPSILON_MS } from "@/shared/constants";

const shouldSuppressRenderingImpl = function (this: CommentRenderer): boolean {
  return !this.playbackHasBegun && !this.isPlaying && this.currentTime <= SEEK_DIRECTION_EPSILON_MS;
};

const updatePlaybackProgressStateImpl = function (this: CommentRenderer): void {
  if (this.playbackHasBegun) {
    return;
  }
  if (this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS) {
    this.playbackHasBegun = true;
  }
};

export const registerPlaybackHelpers = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.shouldSuppressRendering = shouldSuppressRenderingImpl;
  ctor.prototype.updatePlaybackProgressState = updatePlaybackProgressStateImpl;
};

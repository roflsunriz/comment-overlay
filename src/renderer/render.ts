import type { CommentRenderer } from "@/renderer/comment-renderer";
import { ACTIVE_WINDOW_MS, EDGE_EPSILON, toMilliseconds } from "@/shared/constants";

const drawImpl = function (this: CommentRenderer): void {
  const canvas = this.canvas;
  const context = this.ctx;
  if (!canvas || !context) {
    return;
  }

  const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
  const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
  const effectiveHeight =
    this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;

  const now = this.timeSource.now();

  if (this.skipDrawingForCurrentFrame || this.shouldSuppressRendering() || this.isStalled) {
    context.clearRect(0, 0, effectiveWidth, effectiveHeight);
    this.lastDrawTime = now;
    return;
  }

  context.clearRect(0, 0, effectiveWidth, effectiveHeight);
  const activeComments = Array.from(this.activeComments);

  if (this._settings.isCommentVisible) {
    const deltaTime = (now - this.lastDrawTime) / (1000 / 60);
    activeComments.sort((a, b) => {
      const aVpos = this.getEffectiveCommentVpos(a);
      const bVpos = this.getEffectiveCommentVpos(b);
      const vposMsDiff = aVpos - bVpos;
      if (Math.abs(vposMsDiff) > EDGE_EPSILON) {
        return vposMsDiff;
      }
      if (a.isScrolling !== b.isScrolling) {
        return a.isScrolling ? 1 : -1;
      }
      return a.creationIndex - b.creationIndex;
    });
    activeComments.forEach((comment) => {
      const shouldInterpolate = this.isPlaying && !comment.isPaused;
      const interpolatedX = shouldInterpolate
        ? comment.x + comment.getDirectionSign() * comment.speed * deltaTime
        : comment.x;
      comment.draw(context, interpolatedX);
    });
  }

  this.lastDrawTime = now;
};

const performInitialSyncImpl = function (this: CommentRenderer, frameTimeMs?: number): void {
  const video = this.videoElement;
  const canvas = this.canvas;
  const context = this.ctx;
  if (!video || !canvas || !context) {
    return;
  }

  const absoluteTime =
    typeof frameTimeMs === "number" ? frameTimeMs : toMilliseconds(video.currentTime);
  this.currentTime = absoluteTime;
  this.lastDrawTime = this.timeSource.now();

  const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
  const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
  const effectiveHeight =
    this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
  const prepareOptions = this.buildPrepareOptions(effectiveWidth);

  const windowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

  windowComments.forEach((comment) => {
    if (this.isNGComment(comment.text) || comment.isInvisible) {
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.clearActivation();
      return;
    }

    comment.syncWithSettings(this._settings, this.settingsVersion);
    comment.isActive = false;
    this.activeComments.delete(comment);
    comment.lane = -1;
    comment.clearActivation();

    if (this.shouldActivateCommentAtTime(comment, this.currentTime)) {
      this.activateComment(
        comment,
        context,
        effectiveWidth,
        effectiveHeight,
        prepareOptions,
        this.currentTime,
      );
      return;
    }

    const effectiveVpos = this.getEffectiveCommentVpos(comment);
    if (effectiveVpos < this.currentTime - ACTIVE_WINDOW_MS) {
      comment.hasShown = true;
    } else {
      comment.hasShown = false;
    }
  });
};

export const registerRenderMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.draw = drawImpl;
  ctor.prototype.performInitialSync = performInitialSyncImpl;
};

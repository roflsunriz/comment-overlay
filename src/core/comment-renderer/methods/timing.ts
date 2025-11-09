import type { CommentRenderer } from "../../comment-renderer";
import { ACTIVE_WINDOW_MS, SEEK_DIRECTION_EPSILON_MS, toMilliseconds } from "../constants";
import type {
  RequestVideoFrameCallback,
  CancelVideoFrameCallback,
  VideoFrameCallbackMetadataLike,
} from "../types";
import { formatCommentPreview, debugLog, isDebugLoggingEnabled } from "../../../shared/debug";

const processFrameImpl = function (this: CommentRenderer, frameTimeMs?: number): void {
  if (!this.videoElement) {
    return;
  }
  if (!this._settings.isCommentVisible) {
    return;
  }

  if (this.pendingInitialSync) {
    this.performInitialSync(frameTimeMs);
    this.pendingInitialSync = false;
  }

  this.updateComments(frameTimeMs);
  this.draw();
};

const handleAnimationFrameImpl = function (this: CommentRenderer): void {
  const pendingId = this.frameId;
  this.frameId = null;
  if (pendingId !== null) {
    this.animationFrameProvider.cancel(pendingId);
  }
  this.processFrame();
  this.scheduleNextFrame();
};

const handleVideoFrameImpl = function (
  this: CommentRenderer,
  _now: DOMHighResTimeStamp,
  metadata: VideoFrameCallbackMetadataLike,
): void {
  this.videoFrameHandle = null;
  const mediaTime = typeof metadata?.mediaTime === "number" ? metadata.mediaTime * 1000 : undefined;
  this.processFrame(typeof mediaTime === "number" ? mediaTime : undefined);
  this.scheduleNextFrame();
};

const shouldUseVideoFrameCallbackImpl = function (this: CommentRenderer): boolean {
  if (this._settings.syncMode !== "video-frame") {
    return false;
  }
  const video = this.videoElement as HTMLVideoElement & {
    requestVideoFrameCallback?: RequestVideoFrameCallback;
    cancelVideoFrameCallback?: CancelVideoFrameCallback;
  };
  return (
    Boolean(video) &&
    typeof video.requestVideoFrameCallback === "function" &&
    typeof video.cancelVideoFrameCallback === "function"
  );
};

const scheduleNextFrameImpl = function (this: CommentRenderer): void {
  const video = this.videoElement;
  if (!video) {
    return;
  }
  if (this.shouldUseVideoFrameCallback()) {
    this.cancelAnimationFrameRequest();
    this.cancelVideoFrameCallback();
    const request = (
      video as HTMLVideoElement & {
        requestVideoFrameCallback?: RequestVideoFrameCallback;
      }
    ).requestVideoFrameCallback;
    if (typeof request === "function") {
      this.videoFrameHandle = request.call(video, this.handleVideoFrame);
    }
    return;
  }
  this.cancelVideoFrameCallback();
  this.frameId = this.animationFrameProvider.request(this.handleAnimationFrame);
};

const cancelAnimationFrameRequestImpl = function (this: CommentRenderer): void {
  if (this.frameId !== null) {
    this.animationFrameProvider.cancel(this.frameId);
    this.frameId = null;
  }
};

const cancelVideoFrameCallbackImpl = function (this: CommentRenderer): void {
  if (this.videoFrameHandle === null) {
    return;
  }
  const video = this.videoElement as HTMLVideoElement & {
    cancelVideoFrameCallback?: CancelVideoFrameCallback;
  };
  if (video && typeof video.cancelVideoFrameCallback === "function") {
    video.cancelVideoFrameCallback(this.videoFrameHandle);
  }
  this.videoFrameHandle = null;
};

const startAnimationImpl = function (this: CommentRenderer): void {
  this.stopAnimation();
  this.scheduleNextFrame();
};

const stopAnimationImpl = function (this: CommentRenderer): void {
  this.cancelAnimationFrameRequest();
  this.cancelVideoFrameCallback();
};

const onSeekImpl = function (this: CommentRenderer): void {
  const canvas = this.canvas;
  const context = this.ctx;
  const video = this.videoElement;
  if (!canvas || !context || !video) {
    return;
  }

  const nextTime = toMilliseconds(video.currentTime);
  const timeDelta = Math.abs(nextTime - this.currentTime);
  const now = this.timeSource.now();

  const isRecentPlayResume = now - this.lastPlayResumeTime < this.playResumeSeekIgnoreDurationMs;
  if (isRecentPlayResume) {
    this.currentTime = nextTime;
    if (this._settings.isCommentVisible) {
      this.lastDrawTime = now;
      this.draw();
    }
    return;
  }

  const isSignificantSeek = timeDelta > SEEK_DIRECTION_EPSILON_MS;

  this.currentTime = nextTime;
  this.resetFinalPhaseState();
  this.updatePlaybackProgressState();

  if (!isSignificantSeek) {
    if (this._settings.isCommentVisible) {
      this.lastDrawTime = this.timeSource.now();
      this.draw();
    }
    return;
  }

  this.activeComments.clear();
  this.reservedLanes.clear();
  this.topStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.length = 0;
  const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
  const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
  const effectiveHeight =
    this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
  const prepareOptions = this.buildPrepareOptions(effectiveWidth);

  const seekWindowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

  seekWindowComments.forEach((comment) => {
    const debugActive = isDebugLoggingEnabled();
    const preview = debugActive ? formatCommentPreview(comment.text) : "";
    if (debugActive) {
      debugLog("comment-evaluate", {
        stage: "seek",
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: this.getEffectiveCommentVpos(comment),
        currentTime: this.currentTime,
        isActive: comment.isActive,
        hasShown: comment.hasShown,
      });
    }

    if (this.isNGComment(comment.text)) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(comment),
          reason: "ng-runtime",
        });
      }
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.clearActivation();
      return;
    }

    if (comment.isInvisible) {
      if (debugActive) {
        debugLog("comment-eval-skip", {
          preview,
          vposMs: comment.vposMs,
          effectiveVposMs: this.getEffectiveCommentVpos(comment),
          reason: "invisible",
        });
      }
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.hasShown = true;
      comment.clearActivation();
      return;
    }

    comment.syncWithSettings(this._settings, this.settingsVersion);
    comment.isActive = false;
    this.activeComments.delete(comment);
    comment.lane = -1;
    comment.clearActivation();

    if (this.shouldActivateCommentAtTime(comment, this.currentTime, preview)) {
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

  if (this._settings.isCommentVisible) {
    this.lastDrawTime = this.timeSource.now();
    this.draw();
  }
};

export const registerTimingMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.processFrame = processFrameImpl;
  ctor.prototype.handleAnimationFrame = handleAnimationFrameImpl;
  ctor.prototype.handleVideoFrame = handleVideoFrameImpl;
  ctor.prototype.shouldUseVideoFrameCallback = shouldUseVideoFrameCallbackImpl;
  ctor.prototype.scheduleNextFrame = scheduleNextFrameImpl;
  ctor.prototype.cancelAnimationFrameRequest = cancelAnimationFrameRequestImpl;
  ctor.prototype.cancelVideoFrameCallback = cancelVideoFrameCallbackImpl;
  ctor.prototype.startAnimation = startAnimationImpl;
  ctor.prototype.stopAnimation = stopAnimationImpl;
  ctor.prototype.onSeek = onSeekImpl;
};

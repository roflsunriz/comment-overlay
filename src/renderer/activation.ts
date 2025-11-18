import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { CommentPrepareOptions } from "@/shared/types";
import { Comment } from "@/comment/comment";
import {
  ACTIVE_WINDOW_MS,
  BASE_COLLISION_BUFFER_PX,
  COLLISION_BUFFER_RATIO,
  ENTRY_BUFFER_PX,
  FINAL_PHASE_THRESHOLD_MS,
  MAX_COMMENT_WIDTH_RATIO,
  MAX_VISIBLE_DURATION_MS,
  MIN_VISIBLE_DURATION_MS,
  SEEK_DIRECTION_EPSILON_MS,
  VIRTUAL_CANVAS_EXTENSION_PX,
  toMilliseconds,
} from "@/shared/constants";
import { formatCommentPreview, debugLog, isDebugLoggingEnabled } from "@/shared/debug";

const updateCommentsImpl = function (this: CommentRenderer, frameTimeMs?: number): void {
  const video = this.videoElement;
  const canvas = this.canvas;
  const context = this.ctx;
  if (!video || !canvas || !context) {
    return;
  }

  const referenceTime =
    typeof frameTimeMs === "number" ? frameTimeMs : toMilliseconds(video.currentTime);
  this.currentTime = referenceTime;
  this.playbackRate = video.playbackRate;
  this.isPlaying = !video.paused;
  this.updatePlaybackProgressState();
  this.skipDrawingForCurrentFrame = this.shouldSuppressRendering();
  if (this.skipDrawingForCurrentFrame) {
    return;
  }
  const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
  const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
  const effectiveHeight =
    this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
  const prepareOptions = this.buildPrepareOptions(effectiveWidth);

  const isNearEnd =
    this.duration > 0 && this.duration - this.currentTime <= FINAL_PHASE_THRESHOLD_MS;

  if (isNearEnd && !this.finalPhaseActive) {
    this.finalPhaseActive = true;
    this.finalPhaseStartTime = this.currentTime;
    this.finalPhaseVposOverrides.clear();
    this.finalPhaseScheduleDirty = true;
    context.clearRect(0, 0, effectiveWidth, effectiveHeight);
    this.comments.forEach((comment) => {
      comment.isActive = false;
      comment.clearActivation();
    });
    this.activeComments.clear();
    this.reservedLanes.clear();
    this.topStaticLaneReservations.length = 0;
    this.bottomStaticLaneReservations.length = 0;
  }

  if (!isNearEnd && this.finalPhaseActive) {
    this.resetFinalPhaseState();
  }

  if (this.finalPhaseActive && this.finalPhaseScheduleDirty) {
    this.recomputeFinalPhaseTimeline();
  }

  this.pruneStaticLaneReservations(this.currentTime);

  // ==== activeComments の定期クリーンアップ（古いコメント回収） ====
  // 時間窓外のコメント、または画面外に完全に流れたコメントを削除
  for (const comment of Array.from(this.activeComments)) {
    const effectiveVpos = this.getEffectiveCommentVpos(comment);
    const isPastWindow = effectiveVpos < this.currentTime - ACTIVE_WINDOW_MS;
    const isFutureWindow = effectiveVpos > this.currentTime + ACTIVE_WINDOW_MS;

    // 時間窓外のコメントを削除
    if (isPastWindow || isFutureWindow) {
      comment.isActive = false;
      this.activeComments.delete(comment);
      comment.clearActivation();
      if (comment.lane >= 0) {
        if (comment.layout === "ue") {
          this.releaseStaticLane("ue", comment.lane);
        } else if (comment.layout === "shita") {
          this.releaseStaticLane("shita", comment.lane);
        }
      }
      continue;
    }

    // スクロール完了したコメントを削除（再生中でなくても実行）
    if (comment.isScrolling && comment.hasShown) {
      const isOffScreen =
        (comment.scrollDirection === "rtl" && comment.x <= comment.exitThreshold) ||
        (comment.scrollDirection === "ltr" && comment.x >= comment.exitThreshold);

      if (isOffScreen) {
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
      }
    }
  }

  const activeWindowComments = this.getCommentsInTimeWindow(this.currentTime, ACTIVE_WINDOW_MS);

  for (const comment of activeWindowComments) {
    const debugActive = isDebugLoggingEnabled();
    const preview = debugActive ? formatCommentPreview(comment.text) : "";
    if (debugActive) {
      debugLog("comment-evaluate", {
        stage: "update",
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
      continue;
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
      continue;
    }

    comment.syncWithSettings(this._settings, this.settingsVersion);

    if (this.shouldActivateCommentAtTime(comment, this.currentTime, preview)) {
      this.activateComment(
        comment,
        context,
        effectiveWidth,
        effectiveHeight,
        prepareOptions,
        this.currentTime,
      );
    }

    if (comment.isActive) {
      if (comment.layout !== "naka" && comment.hasStaticExpired(this.currentTime)) {
        const staticPosition = comment.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(staticPosition, comment.lane);
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
        continue;
      }

      if (
        comment.layout === "naka" &&
        this.getEffectiveCommentVpos(comment) > this.currentTime + SEEK_DIRECTION_EPSILON_MS
      ) {
        comment.x = comment.virtualStartX;
        comment.lastUpdateTime = this.timeSource.now();
        continue;
      }

      comment.hasShown = true;
      comment.update(this.playbackRate, !this.isPlaying);
      if (!comment.isScrolling && comment.hasStaticExpired(this.currentTime)) {
        const staticPosition = comment.layout === "ue" ? "ue" : "shita";
        this.releaseStaticLane(staticPosition, comment.lane);
        comment.isActive = false;
        this.activeComments.delete(comment);
        comment.clearActivation();
      }
    }
  }
};

const buildPrepareOptionsImpl = function (
  this: CommentRenderer,
  visibleWidth: number,
): CommentPrepareOptions {
  const overrideDuration = this._settings.scrollVisibleDurationMs;
  let maxVisibleDurationMs = MAX_VISIBLE_DURATION_MS;
  let minVisibleDurationMs = MIN_VISIBLE_DURATION_MS;

  if (overrideDuration !== null) {
    maxVisibleDurationMs = overrideDuration;
    minVisibleDurationMs = Math.max(1, Math.min(overrideDuration, MIN_VISIBLE_DURATION_MS));
  }

  return {
    visibleWidth,
    virtualExtension: VIRTUAL_CANVAS_EXTENSION_PX,
    maxVisibleDurationMs,
    minVisibleDurationMs,
    maxWidthRatio: MAX_COMMENT_WIDTH_RATIO,
    bufferRatio: COLLISION_BUFFER_RATIO,
    baseBufferPx: BASE_COLLISION_BUFFER_PX,
    entryBufferPx: ENTRY_BUFFER_PX,
  };
};

const findAvailableLaneImpl = function (this: CommentRenderer, comment: Comment): number {
  const currentTime = this.currentTime;
  this.pruneLaneReservations(currentTime);
  this.pruneStaticLaneReservations(currentTime);
  const laneCandidates = this.getLanePriorityOrder(currentTime);
  const newReservation = this.createLaneReservation(comment, currentTime);

  for (const lane of laneCandidates) {
    if (this.isLaneAvailable(lane, newReservation, currentTime)) {
      this.storeLaneReservation(lane, newReservation);
      return lane;
    }
  }

  const fallbackLane = laneCandidates[0] ?? 0;
  this.storeLaneReservation(fallbackLane, newReservation);
  return fallbackLane;
};

export const registerActivationMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.updateComments = updateCommentsImpl;
  ctor.prototype.buildPrepareOptions = buildPrepareOptionsImpl;
  ctor.prototype.findAvailableLane = findAvailableLaneImpl;
};

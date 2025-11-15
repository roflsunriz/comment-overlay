import type { CommentRenderer } from "@/renderer/comment-renderer";
import { Comment } from "@/comment/comment";
import {
  ACTIVE_WINDOW_MS,
  EDGE_EPSILON,
  FINAL_PHASE_MIN_GAP_MS,
  FINAL_PHASE_MAX_GAP_MS,
  FINAL_PHASE_ORDER_EPSILON_MS,
  FINAL_PHASE_MIN_WINDOW_MS,
  MAX_VISIBLE_DURATION_MS,
  STATIC_VISIBLE_DURATION_MS,
} from "@/shared/constants";
import { dumpRendererState, logEpochChange } from "@/shared/debug";
import type { EpochChangeInfo, RendererStateSnapshot } from "@/shared/types";

const hardResetImpl = function (this: CommentRenderer): void {
  const canvas = this.canvas;
  const ctx = this.ctx;
  const now = this.timeSource.now();
  this.lastHardResetAt = now;

  this.incrementEpoch("manual-reset");

  this.activeComments.clear();
  this.reservedLanes.clear();
  this.topStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.length = 0;

  this.comments.forEach((comment) => {
    comment.isActive = false;
    comment.hasShown = false;
    comment.lane = -1;
    comment.clearActivation();
    comment.epochId = this.epochId;
  });

  if (canvas && ctx) {
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const effectiveHeight =
      this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);
  }

  this.pendingInitialSync = true;
  this.resetFinalPhaseState();
  this.emitStateSnapshot("hardReset");
};

const resetFinalPhaseStateImpl = function (this: CommentRenderer): void {
  this.finalPhaseActive = false;
  this.finalPhaseStartTime = null;
  this.finalPhaseScheduleDirty = false;
  this.finalPhaseVposOverrides.clear();
};

const incrementEpochImpl = function (
  this: CommentRenderer,
  reason: "source-change" | "metadata-loaded" | "manual-reset",
): void {
  const previousEpochId = this.epochId;
  this.epochId += 1;

  logEpochChange(previousEpochId, this.epochId, reason);

  if (this.eventHooks.onEpochChange) {
    const info: EpochChangeInfo = {
      previousEpochId,
      newEpochId: this.epochId,
      reason,
      timestamp: this.timeSource.now(),
    };
    try {
      this.eventHooks.onEpochChange(info);
    } catch (error) {
      this.log.error("CommentRenderer.incrementEpoch.callback", error as Error, { info });
    }
  }

  this.comments.forEach((comment) => {
    comment.epochId = this.epochId;
  });
};

const emitStateSnapshotImpl = function (this: CommentRenderer, label: string): void {
  const now = this.timeSource.now();
  if (now - this.lastSnapshotEmitTime < this.snapshotEmitThrottleMs) {
    return;
  }

  const snapshot: RendererStateSnapshot = {
    currentTime: this.currentTime,
    duration: this.duration,
    isPlaying: this.isPlaying,
    epochId: this.epochId,
    totalComments: this.comments.length,
    activeComments: this.activeComments.size,
    reservedLanes: this.reservedLanes.size,
    finalPhaseActive: this.finalPhaseActive,
    playbackHasBegun: this.playbackHasBegun,
    isStalled: this.isStalled,
  };

  dumpRendererState(label, snapshot);

  if (this.eventHooks.onStateSnapshot) {
    try {
      this.eventHooks.onStateSnapshot(snapshot);
    } catch (error) {
      this.log.error("CommentRenderer.emitStateSnapshot.callback", error as Error);
    }
  }

  this.lastSnapshotEmitTime = now;
};

const getEffectiveCommentVposImpl = function (this: CommentRenderer, comment: Comment): number {
  if (this.finalPhaseActive && this.finalPhaseScheduleDirty) {
    this.recomputeFinalPhaseTimeline();
  }
  const override = this.finalPhaseVposOverrides.get(comment);
  return override ?? comment.vposMs;
};

const getFinalPhaseDisplayDurationImpl = function (
  this: CommentRenderer,
  comment: Comment,
): number {
  if (!comment.isScrolling) {
    return STATIC_VISIBLE_DURATION_MS;
  }

  const durations: number[] = [];
  if (Number.isFinite(comment.visibleDurationMs) && comment.visibleDurationMs > 0) {
    durations.push(comment.visibleDurationMs);
  }
  if (Number.isFinite(comment.totalDurationMs) && comment.totalDurationMs > 0) {
    durations.push(comment.totalDurationMs);
  }

  if (durations.length > 0) {
    return Math.max(...durations);
  }

  return MAX_VISIBLE_DURATION_MS;
};

const resolveFinalPhaseVposImpl = function (this: CommentRenderer, comment: Comment): number {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.delete(comment);
    return comment.vposMs;
  }
  if (this.finalPhaseScheduleDirty) {
    this.recomputeFinalPhaseTimeline();
  }
  const override = this.finalPhaseVposOverrides.get(comment);
  if (override !== undefined) {
    return override;
  }
  const fallback = Math.max(comment.vposMs, this.finalPhaseStartTime);
  this.finalPhaseVposOverrides.set(comment, fallback);
  return fallback;
};

const recomputeFinalPhaseTimelineImpl = function (this: CommentRenderer): void {
  if (!this.finalPhaseActive || this.finalPhaseStartTime === null) {
    this.finalPhaseVposOverrides.clear();
    this.finalPhaseScheduleDirty = false;
    return;
  }

  const windowStart = this.finalPhaseStartTime;
  const durationMs = this.duration > 0 ? this.duration : windowStart + FINAL_PHASE_MIN_WINDOW_MS;
  const windowEnd = Math.max(windowStart + FINAL_PHASE_MIN_WINDOW_MS, durationMs);

  const candidates = this.comments
    .filter((comment) => {
      if (comment.hasShown) {
        return false;
      }
      if (comment.isInvisible) {
        return false;
      }
      if (this.isNGComment(comment.text)) {
        return false;
      }
      return comment.vposMs >= windowStart - ACTIVE_WINDOW_MS;
    })
    .sort((a, b) => {
      const diff = a.vposMs - b.vposMs;
      if (Math.abs(diff) > EDGE_EPSILON) {
        return diff;
      }
      return a.creationIndex - b.creationIndex;
    });

  this.finalPhaseVposOverrides.clear();

  if (candidates.length === 0) {
    this.finalPhaseScheduleDirty = false;
    return;
  }

  const windowSpan = Math.max(windowEnd - windowStart, FINAL_PHASE_MIN_WINDOW_MS);
  const baseGap = windowSpan / Math.max(candidates.length, 1);
  const boundedGap = Number.isFinite(baseGap) ? baseGap : FINAL_PHASE_MIN_GAP_MS;
  const gap = Math.max(FINAL_PHASE_MIN_GAP_MS, Math.min(boundedGap, FINAL_PHASE_MAX_GAP_MS));

  let nextStart = windowStart;
  candidates.forEach((comment, index) => {
    const durationNeeded = Math.max(1, this.getFinalPhaseDisplayDuration(comment));
    const availableLatestStart = windowEnd - durationNeeded;
    let assigned = Math.max(windowStart, Math.min(nextStart, availableLatestStart));
    if (!Number.isFinite(assigned)) {
      assigned = windowStart;
    }
    const epsilon = FINAL_PHASE_ORDER_EPSILON_MS * index;
    if (assigned + epsilon <= availableLatestStart) {
      assigned += epsilon;
    }
    this.finalPhaseVposOverrides.set(comment, assigned);
    const spacing = Math.max(FINAL_PHASE_MIN_GAP_MS, Math.min(durationNeeded / 2, gap));
    nextStart = assigned + spacing;
  });

  this.finalPhaseScheduleDirty = false;
};

export const registerFinalPhaseMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.hardReset = hardResetImpl;
  ctor.prototype.resetFinalPhaseState = resetFinalPhaseStateImpl;
  ctor.prototype.incrementEpoch = incrementEpochImpl;
  ctor.prototype.emitStateSnapshot = emitStateSnapshotImpl;
  ctor.prototype.getEffectiveCommentVpos = getEffectiveCommentVposImpl;
  ctor.prototype.getFinalPhaseDisplayDuration = getFinalPhaseDisplayDurationImpl;
  ctor.prototype.resolveFinalPhaseVpos = resolveFinalPhaseVposImpl;
  ctor.prototype.recomputeFinalPhaseTimeline = recomputeFinalPhaseTimelineImpl;
};

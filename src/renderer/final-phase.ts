import type { CommentRenderer } from "@/renderer/comment-renderer";
import { Comment } from "@/comment/comment";
import { resolveNicoCommentTiming } from "@/comment/nico-timing";
import { MAX_VISIBLE_DURATION_MS, STATIC_VISIBLE_DURATION_MS } from "@/shared/constants";
import { dumpRendererState, logEpochChange } from "@/shared/debug";
import type { EpochChangeInfo, RendererStateSnapshot } from "@/shared/types";

const resetFinalPhaseStateImpl = function (this: CommentRenderer): void {
  this.finalPhaseActive = false;
  this.finalPhaseStartTime = null;
  this.finalPhaseScheduleDirty = false;
  this.finalPhaseVposOverrides.clear();
};

const incrementEpochImpl = function (
  this: CommentRenderer,
  reason: "source-change" | "metadata-loaded",
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
  return resolveNicoCommentTiming({
    vposMs: comment.vposMs,
    durationMs: this.duration,
    isScrolling: comment.isScrolling,
  }).activationVposMs;
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
  return this.getEffectiveCommentVpos(comment);
};

const recomputeFinalPhaseTimelineImpl = function (this: CommentRenderer): void {
  // Kept as a no-op for API compatibility. Official timing uses the same
  // duration-bound vpos rule for every comment and requires no phase schedule.
  this.finalPhaseVposOverrides.clear();
  this.finalPhaseScheduleDirty = false;
};

export const registerFinalPhaseMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.resetFinalPhaseState = resetFinalPhaseStateImpl;
  ctor.prototype.incrementEpoch = incrementEpochImpl;
  ctor.prototype.emitStateSnapshot = emitStateSnapshotImpl;
  ctor.prototype.getEffectiveCommentVpos = getEffectiveCommentVposImpl;
  ctor.prototype.getFinalPhaseDisplayDuration = getFinalPhaseDisplayDurationImpl;
  ctor.prototype.resolveFinalPhaseVpos = resolveFinalPhaseVposImpl;
  ctor.prototype.recomputeFinalPhaseTimeline = recomputeFinalPhaseTimelineImpl;
};

import type { CommentRenderer } from "../../comment-renderer";
import type { CommentPrepareOptions } from "../../comment";
import { Comment, STATIC_VISIBLE_DURATION_MS } from "../../comment";
import {
  ACTIVE_WINDOW_MS,
  EDGE_EPSILON,
  FINAL_PHASE_MIN_WINDOW_MS,
  SEEK_DIRECTION_EPSILON_MS,
} from "../constants";
import { calculateStaticCommentVerticalPadding } from "../settings";
import { debugLog, formatCommentPreview, isDebugLoggingEnabled } from "../../../shared/debug";

const shouldActivateCommentAtTimeImpl = function (
  this: CommentRenderer,
  comment: Comment,
  timeMs: number,
  preview: string = "",
): boolean {
  const debugActive = preview.length > 0 && isDebugLoggingEnabled();
  const effectiveVpos = this.resolveFinalPhaseVpos(comment);

  if (
    this.finalPhaseActive &&
    this.finalPhaseStartTime !== null &&
    comment.vposMs < this.finalPhaseStartTime - EDGE_EPSILON
  ) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "final-phase-trimmed",
        finalPhaseStartTime: this.finalPhaseStartTime,
      });
    }
    this.finalPhaseVposOverrides.delete(comment);
    return false;
  }

  if (comment.isInvisible) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "invisible",
      });
    }
    return false;
  }
  if (comment.isActive) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "already-active",
      });
    }
    return false;
  }
  if (comment.hasShown && effectiveVpos <= timeMs) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "already-shown",
        currentTime: timeMs,
      });
    }
    return false;
  }
  if (effectiveVpos > timeMs + SEEK_DIRECTION_EPSILON_MS) {
    if (debugActive) {
      debugLog("comment-eval-pending", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "future",
        currentTime: timeMs,
      });
    }
    return false;
  }
  if (effectiveVpos < timeMs - ACTIVE_WINDOW_MS) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "expired-window",
        currentTime: timeMs,
      });
    }
    return false;
  }

  if (debugActive) {
    debugLog("comment-eval-ready", {
      preview,
      vposMs: comment.vposMs,
      effectiveVposMs: effectiveVpos,
      currentTime: timeMs,
    });
  }
  return true;
};

const activateCommentImpl = function (
  this: CommentRenderer,
  comment: Comment,
  context: CanvasRenderingContext2D,
  displayWidth: number,
  displayHeight: number,
  options: CommentPrepareOptions,
  referenceTime: number,
): void {
  comment.prepare(context, displayWidth, displayHeight, options);
  const effectiveVpos = this.resolveFinalPhaseVpos(comment);

  if (isDebugLoggingEnabled()) {
    debugLog("comment-prepared", {
      preview: formatCommentPreview(comment.text),
      layout: comment.layout,
      isScrolling: comment.isScrolling,
      width: comment.width,
      height: comment.height,
      bufferWidth: comment.bufferWidth,
      visibleDurationMs: comment.visibleDurationMs,
      effectiveVposMs: effectiveVpos,
    });
  }

  if (comment.layout === "naka") {
    const elapsedMs = Math.max(0, referenceTime - effectiveVpos);
    const displacement = comment.speedPixelsPerMs * elapsedMs;

    if (this.finalPhaseActive && this.finalPhaseStartTime !== null) {
      const videoDuration =
        this.duration > 0 ? this.duration : this.finalPhaseStartTime + FINAL_PHASE_MIN_WINDOW_MS;
      const finalPhaseWindowEnd = Math.max(
        this.finalPhaseStartTime + FINAL_PHASE_MIN_WINDOW_MS,
        videoDuration,
      );
      const totalTravelDistance = comment.width + displayWidth;
      const projectedTravelMs =
        totalTravelDistance > 0 ? totalTravelDistance / Math.max(comment.speedPixelsPerMs, 1) : 0;
      const projectedEndTime = effectiveVpos + projectedTravelMs;
      if (projectedEndTime > finalPhaseWindowEnd) {
        const remainingTime = finalPhaseWindowEnd - referenceTime;
        const allowedTravel = Math.max(0, remainingTime) * comment.speedPixelsPerMs;
        const startX =
          comment.scrollDirection === "rtl"
            ? Math.max(comment.virtualStartX - displacement, displayWidth - allowedTravel)
            : Math.min(comment.virtualStartX + displacement, allowedTravel - comment.width);
        comment.x = startX;
      } else {
        comment.x =
          comment.scrollDirection === "rtl"
            ? comment.virtualStartX - displacement
            : comment.virtualStartX + displacement;
      }
    } else {
      comment.x =
        comment.scrollDirection === "rtl"
          ? comment.virtualStartX - displacement
          : comment.virtualStartX + displacement;
    }
    const laneIndex = this.findAvailableLane(comment);
    comment.lane = laneIndex;
    const laneHeight = Math.max(1, this.laneHeight);
    const maxY = Math.max(0, displayHeight - comment.height);
    const laneY = laneIndex * laneHeight;
    comment.y = Math.max(0, Math.min(laneY, maxY));
  } else {
    const staticPosition = comment.layout === "ue" ? "ue" : "shita";
    const laneIndex = this.assignStaticLane(staticPosition, comment, displayHeight, referenceTime);
    const verticalOffset = this.resolveStaticCommentOffset(
      staticPosition,
      laneIndex,
      displayHeight,
      comment,
    );
    comment.x = Math.max(0, Math.min(displayWidth - comment.width, comment.virtualStartX));
    comment.y = verticalOffset;
    comment.lane =
      staticPosition === "ue" ? laneIndex : this.getGlobalLaneIndexForBottom(laneIndex);
    comment.speed = 0;
    comment.baseSpeed = 0;
    comment.speedPixelsPerMs = 0;
    comment.visibleDurationMs = STATIC_VISIBLE_DURATION_MS;
    const displayEnd = referenceTime + comment.visibleDurationMs;
    this.activeComments.add(comment);
    comment.isActive = true;
    comment.hasShown = true;
    comment.isPaused = !this.isPlaying;
    comment.markActivated(referenceTime);
    comment.lastUpdateTime = this.timeSource.now();
    comment.staticExpiryTimeMs = displayEnd;
    this.reserveStaticLane(staticPosition, comment, laneIndex, displayEnd);
    if (isDebugLoggingEnabled()) {
      debugLog("comment-activate-static", {
        preview: formatCommentPreview(comment.text),
        lane: comment.lane,
        position: staticPosition,
        displayEnd,
        effectiveVposMs: effectiveVpos,
      });
    }
    return;
  }

  this.activeComments.add(comment);
  comment.isActive = true;
  comment.hasShown = true;
  comment.isPaused = !this.isPlaying;
  comment.markActivated(referenceTime);
  comment.lastUpdateTime = this.timeSource.now();
};

const assignStaticLaneImpl = function (
  this: CommentRenderer,
  position: "ue" | "shita",
  comment: Comment,
  displayHeight: number,
  currentTime: number,
): number {
  const reservations = this.getStaticReservations(position);
  const limit = this.getStaticLaneLimit(position);
  const laneCount = limit >= 0 ? limit + 1 : 0;
  const laneIndices = Array.from({ length: laneCount }, (_, index) => index);

  for (const lane of laneIndices) {
    const yOffset = this.resolveStaticCommentOffset(position, lane, displayHeight, comment);
    const commentHeight = Math.max(comment.height, comment.fontSize);
    const padding = calculateStaticCommentVerticalPadding(comment.fontSize);
    const yStart = yOffset - padding;
    const yEnd = yOffset + commentHeight + padding;

    const hasConflict = reservations.some((reservation) => {
      const timeOverlap = reservation.releaseTime > currentTime;
      if (!timeOverlap) {
        return false;
      }
      const yOverlap = !(yEnd <= reservation.yStart || yStart >= reservation.yEnd);
      return yOverlap;
    });

    if (!hasConflict) {
      return lane;
    }
  }

  let fallbackLane = laneIndices[0] ?? 0;
  let earliestRelease = Number.POSITIVE_INFINITY;
  for (const reservation of reservations) {
    if (reservation.releaseTime < earliestRelease) {
      earliestRelease = reservation.releaseTime;
      fallbackLane = reservation.lane;
    }
  }
  return fallbackLane;
};

const reserveStaticLaneImpl = function (
  this: CommentRenderer,
  position: "ue" | "shita",
  comment: Comment,
  lane: number,
  releaseTime: number,
): void {
  const reservations = this.getStaticReservations(position);
  const commentHeight = Math.max(comment.height, comment.fontSize);
  const padding = calculateStaticCommentVerticalPadding(comment.fontSize);
  const yStart = comment.y - padding;
  const yEnd = comment.y + commentHeight + padding;

  reservations.push({
    comment,
    releaseTime,
    yStart,
    yEnd,
    lane,
  });
};

const releaseStaticLaneImpl = function (
  this: CommentRenderer,
  position: "ue" | "shita",
  lane: number,
): void {
  if (lane < 0) {
    return;
  }
  const reservations = this.getStaticReservations(position);
  const index = reservations.findIndex((r) => r.lane === lane);
  if (index >= 0) {
    reservations.splice(index, 1);
  }
};

export const registerLaneActivationMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.shouldActivateCommentAtTime = shouldActivateCommentAtTimeImpl;
  ctor.prototype.activateComment = activateCommentImpl;
  ctor.prototype.assignStaticLane = assignStaticLaneImpl;
  ctor.prototype.reserveStaticLane = reserveStaticLaneImpl;
  ctor.prototype.releaseStaticLane = releaseStaticLaneImpl;
};

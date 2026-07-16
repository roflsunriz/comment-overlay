import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { CommentPrepareOptions } from "@/shared/types";
import { Comment } from "@/comment/comment";
import {
  ACTIVE_WINDOW_MS,
  EDGE_EPSILON,
  FINAL_PHASE_MIN_WINDOW_MS,
  SEEK_DIRECTION_EPSILON_MS,
  STATIC_VISIBLE_DURATION_MS,
} from "@/shared/constants";
import { debugLog, formatCommentPreview, isDebugLoggingEnabled } from "@/shared/debug";

const isWideStaticComment = (comment: Comment): boolean =>
  !comment.isScrolling && comment.width >= 1_200 && comment.fontSize >= 35;

const calculateStaticReservationHeight = (comment: Comment): number =>
  Math.max(
    1,
    isWideStaticComment(comment) ? comment.fontSize * 0.46 : comment.slotHeight || comment.height,
  );

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
  if (!comment.isScrolling && effectiveVpos + STATIC_VISIBLE_DURATION_MS <= timeMs) {
    if (debugActive) {
      debugLog("comment-eval-skip", {
        preview,
        vposMs: comment.vposMs,
        effectiveVposMs: effectiveVpos,
        reason: "static-expired",
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
    const slotTop = this.findAvailableLane(comment);
    const laneHeight = Math.max(1, this.laneHeight);
    comment.lane = Math.max(0, Math.round(slotTop / laneHeight));
    const maxY = Math.max(0, displayHeight - comment.height);
    comment.y = comment.isFull ? 0 : Math.max(0, Math.min(slotTop, maxY));
  } else {
    const staticPosition = comment.layout === "ue" ? "ue" : "shita";
    const laneIndex = this.assignStaticLane(staticPosition, comment, displayHeight, referenceTime);
    const verticalOffset = this.resolveStaticCommentOffset(
      staticPosition,
      laneIndex,
      displayHeight,
      comment,
    );
    comment.x = comment.virtualStartX;
    comment.y = verticalOffset;
    comment.lane =
      staticPosition === "ue" ? laneIndex : this.getGlobalLaneIndexForBottom(laneIndex);
    comment.speed = 0;
    comment.baseSpeed = 0;
    comment.speedPixelsPerMs = 0;
    const displayEnd = effectiveVpos + STATIC_VISIBLE_DURATION_MS;
    comment.visibleDurationMs = Math.max(0, displayEnd - referenceTime);
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
  const reservationHeight = calculateStaticReservationHeight(comment);
  const estimatedStep = Math.max(1, reservationHeight);
  const laneCount = Math.max(
    this.laneCount,
    Math.ceil(Math.max(1, displayHeight) / estimatedStep) + reservations.length + 1,
  );
  const laneIndices = Array.from({ length: laneCount }, (_, index) => index);

  for (const lane of laneIndices) {
    const yOffset = this.resolveStaticCommentOffset(position, lane, displayHeight, comment);
    const yStart = yOffset;
    const yEnd = yOffset + reservationHeight;

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
  const yStart = comment.y;
  const yEnd = comment.y + calculateStaticReservationHeight(comment);

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

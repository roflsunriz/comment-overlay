import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { Comment } from "@/comment/comment";

const findCommentIndexAtOrAfterImpl = function (
  this: CommentRenderer,
  targetVposMs: number,
): number {
  let left = 0;
  let right = this.comments.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const comment = this.comments[mid];
    if (comment !== undefined && comment.vposMs < targetVposMs) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};

const getCommentsInTimeWindowImpl = function (
  this: CommentRenderer,
  centerTimeMs: number,
  windowMs: number,
): Comment[] {
  if (this.comments.length === 0) {
    return [];
  }
  const startTime = centerTimeMs - windowMs;
  const endTime = centerTimeMs + windowMs;
  const startIndex = this.findCommentIndexAtOrAfter(startTime);
  const result: Comment[] = [];
  for (let i = startIndex; i < this.comments.length; i++) {
    const comment = this.comments[i];
    if (!comment) {
      continue;
    }
    if (comment.vposMs > endTime) {
      break;
    }
    result.push(comment);
  }
  return result;
};

const getStaticReservationsImpl = function (
  this: CommentRenderer,
  position: "ue" | "shita",
): CommentRenderer["topStaticLaneReservations"] {
  return position === "ue" ? this.topStaticLaneReservations : this.bottomStaticLaneReservations;
};

const getStaticLaneDepthImpl = function (this: CommentRenderer, position: "ue" | "shita"): number {
  return position === "ue"
    ? this.topStaticLaneReservations.length
    : this.bottomStaticLaneReservations.length;
};

const getStaticLaneLimitImpl = function (this: CommentRenderer, position: "ue" | "shita"): number {
  const otherPosition = position === "ue" ? "shita" : "ue";
  const otherDepth = this.getStaticLaneDepth(otherPosition);
  const available = this.laneCount - otherDepth;
  if (available <= 0) {
    return -1;
  }
  return available - 1;
};

const getGlobalLaneIndexForBottomImpl = function (
  this: CommentRenderer,
  localIndex: number,
): number {
  return Math.max(0, this.laneCount - 1 - localIndex);
};

const resolveStaticCommentOffsetImpl = function (
  this: CommentRenderer,
  position: "ue" | "shita",
  lane: number,
  displayHeight: number,
  comment: Comment,
): number {
  const effectiveHeight = Math.max(1, displayHeight);
  const commentHeight = Math.max(comment.height, comment.fontSize);
  const padding = Math.max(1, Math.floor(comment.fontSize * 0.05));

  if (position === "ue") {
    const baseY = lane * this.laneHeight;
    const minY = padding;
    const maxY = Math.max(padding, effectiveHeight - commentHeight - padding);
    return Math.max(minY, Math.min(baseY, maxY));
  }

  const targetBottomY = effectiveHeight - lane * this.laneHeight;
  const adjustedY = targetBottomY - commentHeight - padding;
  return Math.max(padding, adjustedY);
};

const getStaticReservedLaneSetImpl = function (this: CommentRenderer): Set<number> {
  const reserved = new Set<number>();
  for (const reservation of this.topStaticLaneReservations) {
    reserved.add(reservation.lane);
  }
  for (const reservation of this.bottomStaticLaneReservations) {
    reserved.add(this.getGlobalLaneIndexForBottom(reservation.lane));
  }
  return reserved;
};

export const registerLaneStaticMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.findCommentIndexAtOrAfter = findCommentIndexAtOrAfterImpl;
  ctor.prototype.getCommentsInTimeWindow = getCommentsInTimeWindowImpl;
  ctor.prototype.getStaticReservations = getStaticReservationsImpl;
  ctor.prototype.getStaticLaneDepth = getStaticLaneDepthImpl;
  ctor.prototype.getStaticLaneLimit = getStaticLaneLimitImpl;
  ctor.prototype.getGlobalLaneIndexForBottom = getGlobalLaneIndexForBottomImpl;
  ctor.prototype.resolveStaticCommentOffset = resolveStaticCommentOffsetImpl;
  ctor.prototype.getStaticReservedLaneSet = getStaticReservedLaneSetImpl;
};

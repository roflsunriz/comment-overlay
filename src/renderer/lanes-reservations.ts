import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { LaneReservation } from "@/shared/types";
import { EDGE_EPSILON, RESERVATION_TIME_MARGIN_MS } from "@/shared/constants";

const getLanePriorityOrderImpl = function (this: CommentRenderer, currentTime: number): number[] {
  const indices = Array.from({ length: this.laneCount }, (_, index) => index);
  const sorted = indices.sort((a, b) => {
    const nextA = this.getLaneNextAvailableTime(a, currentTime);
    const nextB = this.getLaneNextAvailableTime(b, currentTime);
    if (Math.abs(nextA - nextB) <= EDGE_EPSILON) {
      return a - b;
    }
    return nextA - nextB;
  });
  const staticReserved = this.getStaticReservedLaneSet();
  if (staticReserved.size === 0) {
    return sorted;
  }
  const preferred = sorted.filter((lane) => !staticReserved.has(lane));
  if (preferred.length === 0) {
    return sorted;
  }
  const blocked = sorted.filter((lane) => staticReserved.has(lane));
  return [...preferred, ...blocked];
};

const getLaneNextAvailableTimeImpl = function (
  this: CommentRenderer,
  lane: number,
  currentTime: number,
): number {
  const reservations = this.reservedLanes.get(lane);
  if (!reservations || reservations.length === 0) {
    return currentTime;
  }
  const validIndex = this.findFirstValidReservationIndex(reservations, currentTime);
  const candidate = reservations[validIndex];
  if (!candidate) {
    return currentTime;
  }
  return Math.max(currentTime, candidate.endTime + RESERVATION_TIME_MARGIN_MS);
};

const createLaneReservationImpl = function (
  this: CommentRenderer,
  comment: CommentRenderer["comments"][number],
  referenceTime: number,
): LaneReservation {
  const speed = Math.max(comment.speedPixelsPerMs, EDGE_EPSILON);
  const effectiveStart = this.getEffectiveCommentVpos(comment);
  const baseStartTime = Number.isFinite(effectiveStart) ? effectiveStart : referenceTime;
  const startTime = Math.max(0, baseStartTime);
  const endTime = startTime + comment.preCollisionDurationMs + RESERVATION_TIME_MARGIN_MS;
  const totalEndTime = startTime + comment.totalDurationMs + RESERVATION_TIME_MARGIN_MS;
  return {
    comment,
    startTime,
    endTime: Math.max(startTime, endTime),
    totalEndTime: Math.max(startTime, totalEndTime),
    startLeft: comment.virtualStartX,
    width: comment.width,
    speed,
    buffer: comment.bufferWidth,
    directionSign: comment.getDirectionSign(),
  };
};

const isLaneAvailableImpl = function (
  this: CommentRenderer,
  lane: number,
  candidate: LaneReservation,
  currentTime: number,
): boolean {
  const reservations = this.reservedLanes.get(lane);
  if (!reservations || reservations.length === 0) {
    return true;
  }
  const firstValidIndex = this.findFirstValidReservationIndex(reservations, currentTime);
  for (let i = firstValidIndex; i < reservations.length; i += 1) {
    const reservation = reservations[i];
    if (!reservation) {
      continue;
    }
    if (this.areReservationsConflicting(reservation, candidate)) {
      return false;
    }
  }
  return true;
};

const storeLaneReservationImpl = function (
  this: CommentRenderer,
  lane: number,
  reservation: LaneReservation,
): void {
  const existing = this.reservedLanes.get(lane) ?? [];
  const updated = [...existing, reservation].sort((a, b) => a.totalEndTime - b.totalEndTime);
  this.reservedLanes.set(lane, updated);
};

const areReservationsConflictingImpl = function (
  this: CommentRenderer,
  a: LaneReservation,
  b: LaneReservation,
): boolean {
  const overlapStart = Math.max(a.startTime, b.startTime);
  const overlapEnd = Math.min(a.endTime, b.endTime);
  if (overlapStart >= overlapEnd) {
    return false;
  }

  const evaluationTimes = new Set<number>([
    overlapStart,
    overlapEnd,
    overlapStart + (overlapEnd - overlapStart) / 2,
  ]);

  const forwardIntersection = this.solveLeftRightEqualityTime(a, b);
  if (
    forwardIntersection !== null &&
    forwardIntersection >= overlapStart - EDGE_EPSILON &&
    forwardIntersection <= overlapEnd + EDGE_EPSILON
  ) {
    evaluationTimes.add(forwardIntersection);
  }

  const backwardIntersection = this.solveLeftRightEqualityTime(b, a);
  if (
    backwardIntersection !== null &&
    backwardIntersection >= overlapStart - EDGE_EPSILON &&
    backwardIntersection <= overlapEnd + EDGE_EPSILON
  ) {
    evaluationTimes.add(backwardIntersection);
  }

  for (const time of evaluationTimes) {
    if (time < overlapStart - EDGE_EPSILON || time > overlapEnd + EDGE_EPSILON) {
      continue;
    }
    const forwardGap = this.computeForwardGap(a, b, time);
    const backwardGap = this.computeForwardGap(b, a, time);
    if (forwardGap <= EDGE_EPSILON && backwardGap <= EDGE_EPSILON) {
      return true;
    }
  }
  return false;
};

const computeForwardGapImpl = function (
  this: CommentRenderer,
  from: LaneReservation,
  to: LaneReservation,
  time: number,
): number {
  const fromEdges = this.getBufferedEdges(from, time);
  const toEdges = this.getBufferedEdges(to, time);
  return fromEdges.left - toEdges.right;
};

const getBufferedEdgesImpl = function (
  this: CommentRenderer,
  reservation: LaneReservation,
  time: number,
): { left: number; right: number } {
  const elapsed = Math.max(0, time - reservation.startTime);
  const displacement = reservation.speed * elapsed;
  const rawLeft = reservation.startLeft + reservation.directionSign * displacement;
  const left = rawLeft - reservation.buffer;
  const right = rawLeft + reservation.width + reservation.buffer;
  return { left, right };
};

const solveLeftRightEqualityTimeImpl = function (
  this: CommentRenderer,
  left: LaneReservation,
  right: LaneReservation,
): number | null {
  const leftSign = left.directionSign;
  const rightSign = right.directionSign;
  const denominator = rightSign * right.speed - leftSign * left.speed;
  if (Math.abs(denominator) < EDGE_EPSILON) {
    return null;
  }
  const numerator =
    right.startLeft +
    rightSign * right.speed * right.startTime +
    right.width +
    right.buffer -
    left.startLeft -
    leftSign * left.speed * left.startTime +
    left.buffer;
  const time = numerator / denominator;
  if (!Number.isFinite(time)) {
    return null;
  }
  return time;
};

export const registerLaneReservationMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.getLanePriorityOrder = getLanePriorityOrderImpl;
  ctor.prototype.getLaneNextAvailableTime = getLaneNextAvailableTimeImpl;
  ctor.prototype.createLaneReservation = createLaneReservationImpl;
  ctor.prototype.isLaneAvailable = isLaneAvailableImpl;
  ctor.prototype.storeLaneReservation = storeLaneReservationImpl;
  ctor.prototype.areReservationsConflicting = areReservationsConflictingImpl;
  ctor.prototype.computeForwardGap = computeForwardGapImpl;
  ctor.prototype.getBufferedEdges = getBufferedEdgesImpl;
  ctor.prototype.solveLeftRightEqualityTime = solveLeftRightEqualityTimeImpl;
};

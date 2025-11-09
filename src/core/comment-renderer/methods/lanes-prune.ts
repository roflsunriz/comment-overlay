import type { CommentRenderer } from "../../comment-renderer";
import type { LaneReservation, StaticLaneReservation } from "../types";
import { RESERVATION_TIME_MARGIN_MS } from "../constants";

const findFirstValidReservationIndexImpl = function (
  this: CommentRenderer,
  reservations: LaneReservation[],
  cutoffTime: number,
): number {
  let left = 0;
  let right = reservations.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const reservation = reservations[mid];
    if (
      reservation !== undefined &&
      reservation.totalEndTime + RESERVATION_TIME_MARGIN_MS <= cutoffTime
    ) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};

const pruneLaneReservationsImpl = function (this: CommentRenderer, currentTime: number): void {
  for (const [lane, reservations] of this.reservedLanes.entries()) {
    const firstValidIndex = this.findFirstValidReservationIndex(reservations, currentTime);
    if (firstValidIndex >= reservations.length) {
      this.reservedLanes.delete(lane);
    } else if (firstValidIndex > 0) {
      this.reservedLanes.set(lane, reservations.slice(firstValidIndex));
    }
  }
};

const pruneStaticLaneReservationsImpl = function (
  this: CommentRenderer,
  currentTime: number,
): void {
  const filterValid = (reservations: StaticLaneReservation[]): StaticLaneReservation[] =>
    reservations.filter((reservation) => reservation.releaseTime > currentTime);

  const topFiltered = filterValid(this.topStaticLaneReservations);
  const bottomFiltered = filterValid(this.bottomStaticLaneReservations);

  this.topStaticLaneReservations.length = 0;
  this.topStaticLaneReservations.push(...topFiltered);

  this.bottomStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.push(...bottomFiltered);
};

export const registerLanePruneMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.findFirstValidReservationIndex = findFirstValidReservationIndexImpl;
  ctor.prototype.pruneLaneReservations = pruneLaneReservationsImpl;
  ctor.prototype.pruneStaticLaneReservations = pruneStaticLaneReservationsImpl;
};

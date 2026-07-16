import type { CommentRenderer } from "@/renderer/comment-renderer";
type StaticPlacementReservation = Pick<import("@/shared/types").StaticLaneReservation, "releaseTime" | "yStart" | "yEnd">;
export declare const resolveStaticPlacement: ({ position, reservationHeight, displayHeight, reservations, currentTime, random, }: {
    position: "ue" | "shita";
    reservationHeight: number;
    displayHeight: number;
    reservations: StaticPlacementReservation[];
    currentTime: number;
    random?: () => number;
}) => {
    y: number;
    usedFallback: boolean;
};
export declare const registerLaneActivationMethods: (ctor: typeof CommentRenderer) => void;
export {};
//# sourceMappingURL=lanes-activation.d.ts.map
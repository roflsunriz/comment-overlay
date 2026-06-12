import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { CalibrationTraceRecord } from "@/shared/calibration-trace";
export interface CalibrationActiveCommentSnapshot {
    readonly text: string;
    readonly vposMs: number;
    readonly commands: readonly string[];
    readonly layout: string;
    readonly lane: number;
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly color: string;
    readonly opacity: number;
    readonly visibleDurationMs: number;
    readonly totalDurationMs: number;
    readonly speedPixelsPerMs: number;
    readonly creationIndex: number;
}
export interface CalibrationFrameSnapshot {
    readonly frameTimeMs: number;
    readonly canvas: {
        readonly width: number;
        readonly height: number;
        readonly cssWidth: number;
        readonly cssHeight: number;
        readonly dpr: number;
    } | null;
    readonly activeComments: readonly CalibrationActiveCommentSnapshot[];
    readonly records: readonly CalibrationTraceRecord[];
}
export interface CaptureCalibrationFrameOptions {
    readonly collectTrace?: boolean;
}
export declare const captureRendererCalibrationFrame: (renderer: CommentRenderer, frameTimeMs: number, options?: CaptureCalibrationFrameOptions) => CalibrationFrameSnapshot;
//# sourceMappingURL=calibration-debug.d.ts.map
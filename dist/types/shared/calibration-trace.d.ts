import type { Comment } from "@/comment/comment";
type TraceValue = string | number | boolean | null;
export interface CalibrationTraceRecord {
    readonly source: "comment-overlay";
    readonly op: "fillText" | "strokeText" | "drawImage";
    readonly timestampMs: number;
    readonly text?: string;
    readonly x?: number;
    readonly y?: number;
    readonly width?: number;
    readonly height?: number;
    readonly sourceWidth?: number;
    readonly sourceHeight?: number;
    readonly canvasWidth?: number;
    readonly canvasHeight?: number;
    readonly font?: string;
    readonly fillStyle?: string;
    readonly strokeStyle?: string;
    readonly lineWidth?: number;
    readonly lineJoin?: string;
    readonly globalAlpha?: number;
    readonly shadowColor?: string;
    readonly shadowBlur?: number;
    readonly shadowOffsetX?: number;
    readonly shadowOffsetY?: number;
    readonly transform?: readonly [number, number, number, number, number, number];
    readonly comment?: {
        readonly text: string;
        readonly vposMs: number;
        readonly layout: string;
        readonly lane: number;
        readonly fontSize: number;
        readonly width: number;
        readonly height: number;
        readonly color: string;
        readonly opacity: number;
        readonly creationIndex: number;
    };
    readonly meta?: Readonly<Record<string, TraceValue>>;
}
export type CalibrationTraceEmitter = (record: CalibrationTraceRecord) => void;
declare global {
    var __COMMENT_OVERLAY_TRACE__: CalibrationTraceEmitter | undefined;
    var __COMMENT_OVERLAY_TRACE_ENABLED__: boolean | undefined;
}
export declare const emitCalibrationTrace: (op: CalibrationTraceRecord["op"], ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, comment: Comment, details: Omit<CalibrationTraceRecord, "source" | "op" | "timestampMs" | "comment">) => void;
export {};
//# sourceMappingURL=calibration-trace.d.ts.map
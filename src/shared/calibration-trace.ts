import type { Comment } from "@/comment/comment";

type TraceValue = string | number | boolean | null;

export interface CalibrationTraceRecord {
  readonly source: "comment-overlay";
  readonly op: "fillText" | "strokeText" | "drawImage" | "laneDecision";
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

const toTraceString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  return String(value);
};

const getTimestampMs = (): number => {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
};

const snapshotTransform = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): readonly [number, number, number, number, number, number] | undefined => {
  if (typeof ctx.getTransform !== "function") {
    return undefined;
  }
  const transform = ctx.getTransform();
  return [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f];
};

const snapshotCanvasSize = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
): { readonly canvasWidth?: number; readonly canvasHeight?: number } => {
  const canvas = ctx.canvas;
  if (!canvas) {
    return {};
  }
  return {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  };
};

const snapshotComment = (comment: Comment): CalibrationTraceRecord["comment"] => ({
  text: comment.text,
  vposMs: comment.vposMs,
  layout: comment.layout,
  lane: comment.lane,
  fontSize: comment.fontSize,
  width: comment.width,
  height: comment.height,
  color: comment.color,
  opacity: comment.opacity,
  creationIndex: comment.creationIndex,
});

export const emitCalibrationTrace = (
  op: CalibrationTraceRecord["op"],
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  comment: Comment,
  details: Omit<CalibrationTraceRecord, "source" | "op" | "timestampMs" | "comment">,
): void => {
  const emitter = globalThis.__COMMENT_OVERLAY_TRACE__;
  if (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== true || typeof emitter !== "function") {
    return;
  }

  emitter({
    source: "comment-overlay",
    op,
    timestampMs: getTimestampMs(),
    font: ctx.font,
    fillStyle: toTraceString(ctx.fillStyle),
    strokeStyle: toTraceString(ctx.strokeStyle),
    lineWidth: ctx.lineWidth,
    lineJoin: ctx.lineJoin,
    globalAlpha: ctx.globalAlpha,
    shadowColor: ctx.shadowColor,
    shadowBlur: ctx.shadowBlur,
    shadowOffsetX: ctx.shadowOffsetX,
    shadowOffsetY: ctx.shadowOffsetY,
    transform: snapshotTransform(ctx),
    ...snapshotCanvasSize(ctx),
    comment: snapshotComment(comment),
    ...details,
  });
};

export const emitCalibrationTraceEvent = (
  op: CalibrationTraceRecord["op"],
  comment: Comment,
  details: Omit<CalibrationTraceRecord, "source" | "op" | "timestampMs" | "comment">,
): void => {
  const emitter = globalThis.__COMMENT_OVERLAY_TRACE__;
  if (globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ !== true || typeof emitter !== "function") {
    return;
  }

  emitter({
    source: "comment-overlay",
    op,
    timestampMs: getTimestampMs(),
    comment: snapshotComment(comment),
    ...details,
  });
};

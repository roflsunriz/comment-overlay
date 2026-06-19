import type { CommentRenderer } from "@/renderer/comment-renderer";
import type { CalibrationTraceEmitter, CalibrationTraceRecord } from "@/shared/calibration-trace";

export interface CalibrationActiveCommentSnapshot {
  readonly text: string;
  readonly vposMs: number;
  readonly no?: number;
  readonly fork?: string;
  readonly source?: string;
  readonly threadId?: string;
  readonly date?: number;
  readonly userIdHash?: string;
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
  readonly preCollisionDurationMs: number;
  readonly speedPixelsPerMs: number;
  readonly virtualStartX: number;
  readonly exitThreshold: number;
  readonly bufferWidth: number;
  readonly reservationWidth: number;
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
  readonly traceOps?: readonly CalibrationTraceRecord["op"][];
}

const snapshotActiveComment = (
  comment: CommentRenderer["comments"][number],
): CalibrationActiveCommentSnapshot => ({
  text: comment.text,
  vposMs: comment.vposMs,
  ...(comment.meta?.no !== undefined ? { no: comment.meta.no } : {}),
  ...(comment.meta?.fork !== undefined ? { fork: comment.meta.fork } : {}),
  ...(comment.meta?.source !== undefined ? { source: comment.meta.source } : {}),
  ...(comment.meta?.threadId !== undefined ? { threadId: comment.meta.threadId } : {}),
  ...(comment.meta?.date !== undefined ? { date: comment.meta.date } : {}),
  ...(comment.meta?.userIdHash !== undefined ? { userIdHash: comment.meta.userIdHash } : {}),
  commands: comment.commands,
  layout: comment.layout,
  lane: comment.lane,
  x: comment.x,
  y: comment.y,
  width: comment.width,
  height: comment.height,
  fontSize: comment.fontSize,
  fontFamily: comment.fontFamily,
  color: comment.color,
  opacity: comment.opacity,
  visibleDurationMs: comment.visibleDurationMs,
  totalDurationMs: comment.totalDurationMs,
  preCollisionDurationMs: comment.preCollisionDurationMs,
  speedPixelsPerMs: comment.speedPixelsPerMs,
  virtualStartX: comment.virtualStartX,
  exitThreshold: comment.exitThreshold,
  bufferWidth: comment.bufferWidth,
  reservationWidth: comment.reservationWidth,
  creationIndex: comment.creationIndex,
});

const snapshotCanvas = (renderer: CommentRenderer): CalibrationFrameSnapshot["canvas"] => {
  const canvas = renderer.canvas;
  if (!canvas) {
    return null;
  }
  const dpr = renderer.canvasDpr > 0 ? renderer.canvasDpr : 1;
  return {
    width: canvas.width,
    height: canvas.height,
    cssWidth: renderer.displayWidth > 0 ? renderer.displayWidth : canvas.width / dpr,
    cssHeight: renderer.displayHeight > 0 ? renderer.displayHeight : canvas.height / dpr,
    dpr,
  };
};

export const captureRendererCalibrationFrame = (
  renderer: CommentRenderer,
  frameTimeMs: number,
  options: CaptureCalibrationFrameOptions = {},
): CalibrationFrameSnapshot => {
  const records: CalibrationTraceRecord[] = [];
  const previousEnabled = globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__;
  const previousEmitter = globalThis.__COMMENT_OVERLAY_TRACE__;

  if (options.collectTrace === true) {
    const allowedOps =
      options.traceOps && options.traceOps.length > 0 ? new Set(options.traceOps) : null;
    globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = true;
    globalThis.__COMMENT_OVERLAY_TRACE__ = ((record) => {
      if (allowedOps && !allowedOps.has(record.op)) {
        return;
      }
      records.push(record);
    }) satisfies CalibrationTraceEmitter;
  }

  try {
    renderer.processFrame(frameTimeMs);
  } finally {
    if (options.collectTrace === true) {
      globalThis.__COMMENT_OVERLAY_TRACE_ENABLED__ = previousEnabled;
      globalThis.__COMMENT_OVERLAY_TRACE__ = previousEmitter;
    }
  }

  return {
    frameTimeMs,
    canvas: snapshotCanvas(renderer),
    activeComments: Array.from(renderer.activeComments, snapshotActiveComment),
    records,
  };
};

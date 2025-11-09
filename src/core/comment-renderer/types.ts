import type {
  CommentRendererEventHooks,
  RendererStateSnapshot,
  EpochChangeInfo,
} from "../../shared/types";
import type { TimeSource } from "../comment";
import type { DebugLoggingOptions } from "../../shared/debug";
import type { Comment } from "../comment";

export interface CommentRendererConfig {
  loggerNamespace?: string;
  timeSource?: TimeSource;
  animationFrameProvider?: AnimationFrameProvider;
  createCanvasElement?: () => HTMLCanvasElement;
  debug?: DebugLoggingOptions;
  eventHooks?: CommentRendererEventHooks;
}

export interface CommentRendererInitializeOptions {
  video: HTMLVideoElement;
  container?: HTMLElement | null;
}

export interface AnimationFrameProvider {
  request(callback: FrameRequestCallback): ReturnType<typeof setTimeout>;
  cancel(handle: ReturnType<typeof setTimeout>): void;
}

export type VideoFrameCallbackMetadataLike = {
  readonly mediaTime?: number;
};

export type RequestVideoFrameCallback = (
  callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadataLike) => void,
) => number;

export type CancelVideoFrameCallback = (handle: number) => void;

export interface LaneReservation {
  comment: Comment;
  startTime: number;
  endTime: number;
  totalEndTime: number;
  startLeft: number;
  width: number;
  speed: number;
  buffer: number;
  directionSign: -1 | 1;
}

export interface StaticLaneReservation {
  comment: Comment;
  releaseTime: number;
  yStart: number;
  yEnd: number;
  lane: number;
}

export type SnapshotEmitter = (info: RendererStateSnapshot) => void;

export type EpochLogger = (info: EpochChangeInfo) => void;

import type { Comment } from "@/comment/comment";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (...messages: unknown[]) => void;
  info: (...messages: unknown[]) => void;
  warn: (...messages: unknown[]) => void;
  error: (...messages: unknown[]) => void;
}

export interface LoggerOptions {
  level?: LogLevel;
  emitter?: (level: LogLevel, namespace: string, args: unknown[]) => void;
}

export interface DebugLoggingOptions {
  readonly enabled: boolean;
  readonly maxLogsPerCategory?: number;
}

export interface DebugState {
  enabled: boolean;
  maxLogsPerCategory: number;
}

export interface TimeSource {
  now(): number;
}

export type DrawMode = "fill" | "outline";

export type TextMeasurementCache = Map<string, number>;

export type ScrollDirection = "rtl" | "ltr";
export type RenderStyle = "classic" | "outline-only";
export type SyncMode = "raf" | "video-frame";

export interface RendererSettings {
  commentColor: string;
  commentOpacity: number;
  isCommentVisible: boolean;
  useContainerResizeObserver: boolean;
  ngWords: string[];
  ngRegexps: string[];
  scrollDirection: ScrollDirection;
  // 互換系オプション（既定は現行挙動を維持）
  renderStyle: RenderStyle;
  syncMode: SyncMode;
  // スクロール可視時間（ms）。null の場合は自動（現行挙動）
  scrollVisibleDurationMs: number | null;
  // レーン数固定の可否と値
  useFixedLaneCount: boolean;
  fixedLaneCount: number;
  // DPR対応の可否（キャンバス実解像度スケーリング）。実装は後続。
  useDprScaling: boolean;
  enableAutoHardReset: boolean;
}

export type ReadonlyRendererSettings = {
  readonly [K in keyof RendererSettings]: RendererSettings[K] extends
    | string
    | number
    | boolean
    | null
    | undefined
    ? RendererSettings[K]
    : ReadonlyArray<string>;
};

export type CommentLayoutCommand = "naka" | "ue" | "shita";

export type CommentSizeCommand = "small" | "medium" | "big";

export type CommentFontCommand = "defont" | "gothic" | "mincho";

export type CommentColorCommand =
  | "white"
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "black"
  | "white2"
  | "red2"
  | "pink2"
  | "orange2"
  | "yellow2"
  | "green2"
  | "cyan2"
  | "blue2"
  | "purple2"
  | "black2";

export type CommentSpecialCommand = "_live" | "invisible";

export type CommentHexColorCommand = `#${string}`;

export interface CommentCommandParseContext {
  readonly defaultColor: string;
}

export interface CommentCommandParseResult {
  readonly size: CommentSizeCommand;
  readonly sizeScale: number;
  readonly layout: CommentLayoutCommand;
  readonly font: CommentFontCommand;
  readonly fontFamily: string;
  readonly resolvedColor: string;
  readonly colorOverride: string | null;
  readonly opacityMultiplier: number;
  readonly opacityOverride: number | null;
  readonly isInvisible: boolean;
  readonly letterSpacing: number;
  readonly lineHeight: number;
}

export interface VideoMetadata {
  videoId: string;
  title: string;
  viewCount: number;
  commentCount: number;
  mylistCount: number;
  postedAt: string;
  thumbnail: string;
  owner?: { nickname?: string; name?: string } | null;
  channel?: { name?: string } | null;
}

// エポック変更情報
export interface EpochChangeInfo {
  readonly previousEpochId: number;
  readonly newEpochId: number;
  readonly reason: "source-change" | "metadata-loaded" | "manual-reset";
  readonly timestamp: number;
}

// 内部状態スナップショット（デバッグ用）
export interface RendererStateSnapshot {
  readonly currentTime: number;
  readonly duration: number;
  readonly isPlaying: boolean;
  readonly epochId: number;
  readonly totalComments: number;
  readonly activeComments: number;
  readonly reservedLanes: number;
  readonly finalPhaseActive: boolean;
  readonly playbackHasBegun: boolean;
  readonly isStalled: boolean;
}

// イベントフック定義
export interface CommentRendererEventHooks {
  /** エポックが変更されたときのコールバック */
  onEpochChange?: (info: EpochChangeInfo) => void;
  /** 状態スナップショットが更新されたときのコールバック（デバッグ用） */
  onStateSnapshot?: (snapshot: RendererStateSnapshot) => void;
}

export type CommentRendererLogger = (message: string, ...args: unknown[]) => void;
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

export interface CommentDependencies {
  timeSource?: TimeSource;
  settingsVersion?: number;
}

export interface CommentPrepareOptions {
  visibleWidth: number;
  virtualExtension: number;
  maxVisibleDurationMs: number;
  minVisibleDurationMs: number;
  maxWidthRatio: number;
  bufferRatio: number;
  baseBufferPx: number;
  entryBufferPx: number;
}

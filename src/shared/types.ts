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
}

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

// ゴースト検出情報
export interface GhostCommentInfo {
  readonly comment: {
    readonly text: string;
    readonly vposMs: number;
    readonly epochId: number;
  };
  readonly reason: "epoch-mismatch" | "stale-activation" | "orphaned";
  readonly detectedAt: number;
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
  /** ゴーストコメントが検出されたときのコールバック */
  onGhostCommentDetected?: (ghosts: GhostCommentInfo[]) => void;
  /** エポックが変更されたときのコールバック */
  onEpochChange?: (info: EpochChangeInfo) => void;
  /** 状態スナップショットが更新されたときのコールバック（デバッグ用） */
  onStateSnapshot?: (snapshot: RendererStateSnapshot) => void;
}

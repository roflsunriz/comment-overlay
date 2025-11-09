export interface CommentDependencies {
  timeSource?: import("./time-source").TimeSource;
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

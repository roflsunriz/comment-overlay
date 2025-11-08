export {
  Comment,
  type CommentPrepareOptions,
  type CommentDependencies,
  type TimeSource,
  createDefaultTimeSource,
} from "./core/comment";
export {
  CommentRenderer,
  type CommentRendererConfig,
  type CommentRendererInitializeOptions,
  type AnimationFrameProvider,
  createDefaultAnimationFrameProvider,
} from "./core/comment-renderer";
export {
  cloneDefaultSettings,
  DEFAULT_RENDERER_SETTINGS,
  COMMENT_OVERLAY_VERSION,
} from "./config/default-settings";
export type {
  RendererSettings,
  VideoMetadata,
  CommentRendererEventHooks,
  EpochChangeInfo,
  RendererStateSnapshot,
} from "./shared/types";
export { createLogger, type LogLevel, type Logger } from "./shared/logger";
export {
  configureDebugLogging,
  debugLog,
  isDebugLoggingEnabled,
  resetDebugCounters,
  dumpRendererState,
  logEpochChange,
} from "./shared/debug";
export type { DebugLoggingOptions } from "./shared/debug";

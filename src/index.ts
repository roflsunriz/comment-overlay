export { Comment } from "@/comment/comment";
export type { CommentPrepareOptions, CommentDependencies } from "@/shared/types";
export { createDefaultTimeSource } from "@/comment/time-source";
export type { TimeSource } from "@/shared/types";
export {
  CommentRenderer,
  type CommentRendererConfig,
  type CommentRendererInitializeOptions,
  type AnimationFrameProvider,
  createDefaultAnimationFrameProvider,
} from "@/renderer/comment-renderer";
export {
  cloneDefaultSettings,
  DEFAULT_RENDERER_SETTINGS,
  COMMENT_OVERLAY_VERSION,
} from "@/config/default-settings";
export type {
  RendererSettings,
  VideoMetadata,
  CommentRendererEventHooks,
  EpochChangeInfo,
  RendererStateSnapshot,
} from "@/shared/types";
export { createLogger, type LogLevel, type Logger } from "@/shared/logger";
export {
  configureDebugLogging,
  debugLog,
  isDebugLoggingEnabled,
  resetDebugCounters,
  dumpRendererState,
  logEpochChange,
} from "@/shared/debug";
export type { DebugLoggingOptions } from "@/shared/debug";

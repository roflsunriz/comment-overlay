import type { CommentRenderer } from "@/renderer/comment-renderer";
export type AutoHardResetReason = "play-resume" | "first-play-delay" | "resize" | "visibility-restore" | "seeked";
export declare const requestAutoHardReset: (renderer: CommentRenderer, reason: AutoHardResetReason) => void;
export declare const scheduleInitialPlaybackAutoReset: (renderer: CommentRenderer) => void;
export declare const resetInitialPlaybackAutoResetState: (renderer: CommentRenderer) => void;
//# sourceMappingURL=auto-hard-reset.d.ts.map
import type { DebugLoggingOptions } from "@/shared/types";
export type { DebugLoggingOptions } from "@/shared/types";
export declare const configureDebugLogging: (options: DebugLoggingOptions) => void;
export declare const resetDebugCounters: () => void;
export declare const isDebugLoggingEnabled: () => boolean;
export declare const debugLog: (category: string, ...payload: unknown[]) => void;
export declare const formatCommentPreview: (text: string, maxLength?: number) => string;
export declare const dumpRendererState: (label: string, snapshot: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    epochId: number;
    totalComments: number;
    activeComments: number;
    reservedLanes: number;
    finalPhaseActive: boolean;
    playbackHasBegun: boolean;
    isStalled: boolean;
}) => void;
export declare const logEpochChange: (previousEpochId: number, newEpochId: number, reason: string) => void;
//# sourceMappingURL=debug.d.ts.map
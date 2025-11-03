export interface DebugLoggingOptions {
    readonly enabled: boolean;
    readonly maxLogsPerCategory?: number;
}
export declare const configureDebugLogging: (options: DebugLoggingOptions) => void;
export declare const resetDebugCounters: () => void;
export declare const isDebugLoggingEnabled: () => boolean;
export declare const debugLog: (category: string, ...payload: unknown[]) => void;
export declare const formatCommentPreview: (text: string, maxLength?: number) => string;
//# sourceMappingURL=debug.d.ts.map
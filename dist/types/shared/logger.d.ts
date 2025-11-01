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
export declare const createLogger: (namespace: string, options?: LoggerOptions) => Logger;
//# sourceMappingURL=logger.d.ts.map
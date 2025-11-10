import type { LogLevel, Logger, LoggerOptions } from "@/shared/types";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const fallbackEmitter = (level: LogLevel, namespace: string, args: unknown[]): void => {
  const prefix = `[${namespace}]`;
  const consoleArgs: unknown[] = [prefix, ...args];
  switch (level) {
    case "debug":
      console.debug(...consoleArgs);
      break;
    case "info":
      console.info(...consoleArgs);
      break;
    case "warn":
      console.warn(...consoleArgs);
      break;
    case "error":
      console.error(...consoleArgs);
      break;
    default:
      console.log(...consoleArgs);
  }
};

export const createLogger = (namespace: string, options: LoggerOptions = {}): Logger => {
  const { level = "info", emitter = fallbackEmitter } = options;
  const threshold = LEVEL_PRIORITY[level];

  const emit = (logLevel: LogLevel, args: unknown[]): void => {
    if (LEVEL_PRIORITY[logLevel] < threshold) {
      return;
    }
    emitter(logLevel, namespace, args);
  };

  return {
    debug: (...messages: unknown[]) => emit("debug", messages),
    info: (...messages: unknown[]) => emit("info", messages),
    warn: (...messages: unknown[]) => emit("warn", messages),
    error: (...messages: unknown[]) => emit("error", messages),
  };
};

export type { LogLevel, Logger, LoggerOptions } from "@/shared/types";

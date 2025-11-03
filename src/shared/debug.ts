const DEFAULT_MAX_LOGS_PER_CATEGORY = 5;

export interface DebugLoggingOptions {
  readonly enabled: boolean;
  readonly maxLogsPerCategory?: number;
}

type DebugState = {
  enabled: boolean;
  maxLogsPerCategory: number;
};

const state: DebugState = {
  enabled: false,
  maxLogsPerCategory: DEFAULT_MAX_LOGS_PER_CATEGORY,
};

const categoryCounters = new Map<string, number>();

const normalizeLimit = (limit: number | undefined): number => {
  if (limit === undefined) {
    return DEFAULT_MAX_LOGS_PER_CATEGORY;
  }
  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_LOGS_PER_CATEGORY;
  }
  const rounded = Math.max(1, Math.floor(limit));
  return Math.min(10_000, rounded);
};

export const configureDebugLogging = (options: DebugLoggingOptions): void => {
  state.enabled = Boolean(options.enabled);
  state.maxLogsPerCategory = normalizeLimit(options.maxLogsPerCategory);
  if (!state.enabled) {
    categoryCounters.clear();
  }
};

export const resetDebugCounters = (): void => {
  categoryCounters.clear();
};

export const isDebugLoggingEnabled = (): boolean => state.enabled;

const shouldEmitLog = (category: string): boolean => {
  const currentCount = categoryCounters.get(category) ?? 0;
  if (currentCount >= state.maxLogsPerCategory) {
    if (currentCount === state.maxLogsPerCategory) {
      console.debug(`[CommentOverlay][${category}]`, "Further logs suppressed.");
      categoryCounters.set(category, currentCount + 1);
    }
    return false;
  }
  categoryCounters.set(category, currentCount + 1);
  return true;
};

export const debugLog = (category: string, ...payload: unknown[]): void => {
  if (!state.enabled) {
    return;
  }
  if (!shouldEmitLog(category)) {
    return;
  }
  console.debug(`[CommentOverlay][${category}]`, ...payload);
};

export const formatCommentPreview = (text: string, maxLength = 32): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}…`;
};

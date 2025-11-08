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

// ゴーストコメント可視化
export const visualizeGhostComments = (
  ghosts: Array<{
    text: string;
    vposMs: number;
    epochId: number;
    reason: string;
  }>,
): void => {
  if (!state.enabled) {
    return;
  }
  if (ghosts.length === 0) {
    return;
  }
  console.group(`[CommentOverlay][ghost-detection] Detected ${ghosts.length} ghost comment(s)`);
  ghosts.forEach((ghost, index) => {
    console.log(
      `#${index + 1}:`,
      `"${formatCommentPreview(ghost.text)}"`,
      `vpos=${ghost.vposMs}ms`,
      `epoch=${ghost.epochId}`,
      `reason=${ghost.reason}`,
    );
  });
  console.groupEnd();
};

// 内部状態ダンプ
export const dumpRendererState = (
  label: string,
  snapshot: {
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
  },
): void => {
  if (!state.enabled) {
    return;
  }
  console.group(`[CommentOverlay][state-dump] ${label}`);
  console.table({
    "Current Time": `${snapshot.currentTime.toFixed(2)}ms`,
    Duration: `${snapshot.duration.toFixed(2)}ms`,
    "Is Playing": snapshot.isPlaying,
    "Epoch ID": snapshot.epochId,
    "Total Comments": snapshot.totalComments,
    "Active Comments": snapshot.activeComments,
    "Reserved Lanes": snapshot.reservedLanes,
    "Final Phase": snapshot.finalPhaseActive,
    "Playback Begun": snapshot.playbackHasBegun,
    "Is Stalled": snapshot.isStalled,
  });
  console.groupEnd();
};

// エポック変更のログ
export const logEpochChange = (
  previousEpochId: number,
  newEpochId: number,
  reason: string,
): void => {
  if (!state.enabled) {
    return;
  }
  debugLog("epoch-change", `Epoch changed: ${previousEpochId} → ${newEpochId} (reason: ${reason})`);
};

export type CommentMeta = {
  no?: number;
  fork?: string;
  source?: string;
  threadId?: string;
  date?: number;
  userIdHash?: string;
};

export type CommentEntry = {
  text: string;
  vposMs: number;
  commands: string[];
  meta: CommentMeta | null;
};

type RawCommentEntry = {
  text?: unknown;
  body?: unknown;
  vposMs?: unknown;
  commands?: unknown;
  no?: unknown;
  fork?: unknown;
  forkLabel?: unknown;
  source?: unknown;
  threadId?: unknown;
  thread?: unknown;
  date?: unknown;
  userId?: unknown;
  userIdHash?: unknown;
};

type RawThread = {
  id?: unknown;
  fork?: unknown;
  comments?: unknown;
};

type DebugLogFn = (category: string, payload: unknown) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const numberMeta = (value: unknown): number | undefined => {
  const candidate = Number(value);
  return Number.isFinite(candidate) ? candidate : undefined;
};

const stringMeta = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
};

const formatPreview = (text: string): string =>
  text.length <= 40 ? text : `${text.slice(0, 40)}…`;

const preferDisplayThread = (entries: RawCommentEntry[]): RawCommentEntry[] => {
  const trunkEntries = entries.filter((entry) => entry.source === "trunk");
  return trunkEntries.length > 0 ? trunkEntries : entries;
};

const toRawCommentEntry = (entry: unknown, thread?: RawThread): RawCommentEntry | null => {
  if (!isRecord(entry)) {
    return null;
  }
  const candidate = entry as RawCommentEntry;
  return {
    ...candidate,
    fork: candidate.fork ?? thread?.fork,
    threadId: candidate.threadId ?? candidate.thread ?? thread?.id,
  };
};

const extractThreadEntries = (payload: Record<string, unknown>): RawCommentEntry[] | null => {
  if (!isRecord(payload.data) || !Array.isArray(payload.data.threads)) {
    return null;
  }

  const threads = payload.data.threads.filter(isRecord) as RawThread[];
  const mainThreads = threads.filter((thread) => thread.fork === "main");
  const displayThreads = mainThreads.length > 0 ? mainThreads : threads;
  const entries = displayThreads.flatMap((thread) => {
    if (!Array.isArray(thread.comments)) {
      return [];
    }
    return thread.comments
      .map((entry) => toRawCommentEntry(entry, thread))
      .filter((entry): entry is RawCommentEntry => entry !== null);
  });

  return preferDisplayThread(entries);
};

export const extractCommentEntries = (payload: unknown): RawCommentEntry[] => {
  if (Array.isArray(payload)) {
    return preferDisplayThread(
      payload
        .map((entry) => toRawCommentEntry(entry))
        .filter((entry): entry is RawCommentEntry => entry !== null),
    );
  }
  if (!isRecord(payload)) {
    return [];
  }

  const threadEntries = extractThreadEntries(payload);
  if (threadEntries !== null) {
    return threadEntries;
  }

  const entries = Array.isArray(payload.comments) ? payload.comments : [];
  return preferDisplayThread(
    entries
      .map((entry) => toRawCommentEntry(entry))
      .filter((entry): entry is RawCommentEntry => entry !== null),
  );
};

export const sanitizeCommentEntry = (
  entry: unknown,
  debugLog?: DebugLogFn,
): CommentEntry | null => {
  if (!isRecord(entry)) {
    debugLog?.("overlay-sanitize-skip", { reason: "not-object" });
    return null;
  }
  const candidate = entry as RawCommentEntry;
  const text =
    typeof candidate.text === "string"
      ? candidate.text
      : typeof candidate.body === "string"
        ? candidate.body
        : "";
  const vposMs = Number(candidate.vposMs);
  if (text.length === 0 || !Number.isFinite(vposMs) || vposMs < 0) {
    debugLog?.("overlay-sanitize-skip", {
      reason: "invalid-values",
      preview: formatPreview(text),
      vposMs: Number.isFinite(vposMs) ? vposMs : String(candidate.vposMs),
    });
    return null;
  }
  const commands = Array.isArray(candidate.commands)
    ? candidate.commands.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : [];
  const meta: CommentMeta = {
    no: numberMeta(candidate.no),
    fork: stringMeta(candidate.forkLabel) ?? stringMeta(candidate.fork),
    source: stringMeta(candidate.source),
    threadId: stringMeta(candidate.threadId) ?? stringMeta(candidate.thread),
    date: numberMeta(candidate.date),
    userIdHash: stringMeta(candidate.userIdHash) ?? stringMeta(candidate.userId),
  };
  const hasMeta = Object.values(meta).some((value) => value !== undefined);
  return { text, vposMs, commands, meta: hasMeta ? meta : null };
};

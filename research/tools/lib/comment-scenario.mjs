import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ALLOWED_FORKS = new Set(["owner", "main", "easy"]);

const assertRecord = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
};

const normalizeComment = (comment, index) => {
  assertRecord(comment, `comments[${index}]`);
  if (typeof comment.body !== "string" || comment.body.length === 0) {
    throw new Error(`comments[${index}].body must be a non-empty string.`);
  }
  if (!Number.isFinite(comment.vposMs) || comment.vposMs < 0) {
    throw new Error(`comments[${index}].vposMs must be a non-negative number.`);
  }
  if (
    comment.commands !== undefined &&
    (!Array.isArray(comment.commands) ||
      comment.commands.some((command) => typeof command !== "string"))
  ) {
    throw new Error(`comments[${index}].commands must be an array of strings.`);
  }
  const no = comment.no ?? 900_001 + index;
  if (!Number.isSafeInteger(no) || no < 0) {
    throw new Error(`comments[${index}].no must be a non-negative safe integer.`);
  }

  return {
    id: comment.id ?? `research-comment-${no}`,
    no,
    vposMs: comment.vposMs,
    body: comment.body,
    commands: [...(comment.commands ?? ["184"])],
    userId: comment.userId ?? "comment-overlay-research",
    isPremium: comment.isPremium ?? false,
    score: comment.score ?? 0,
    postedAt: comment.postedAt ?? "2026-07-17T00:00:00+09:00",
    nicoruCount: comment.nicoruCount ?? 0,
    nicoruId: comment.nicoruId ?? null,
    source: comment.source ?? "trunk",
    isMyPost: comment.isMyPost ?? false,
  };
};

export const normalizeCommentScenario = (rawScenario) => {
  assertRecord(rawScenario, "scenario");
  if (rawScenario.formatVersion !== 1) {
    throw new Error("scenario.formatVersion must be 1.");
  }
  if (!Array.isArray(rawScenario.comments) || rawScenario.comments.length === 0) {
    throw new Error("scenario.comments must contain at least one comment.");
  }
  const targetFork = rawScenario.targetFork ?? "main";
  if (!ALLOWED_FORKS.has(targetFork)) {
    throw new Error("scenario.targetFork must be owner, main, or easy.");
  }
  return {
    formatVersion: 1,
    name:
      typeof rawScenario.name === "string" && rawScenario.name.length > 0
        ? rawScenario.name
        : "unnamed-scenario",
    targetFork,
    comments: rawScenario.comments.map(normalizeComment),
  };
};

export const loadCommentScenario = async (scenarioPath) => {
  const absolutePath = resolve(scenarioPath);
  const rawScenario = JSON.parse(await readFile(absolutePath, "utf8"));
  return { scenario: normalizeCommentScenario(rawScenario), absolutePath };
};

export const applyScenarioToNvCommentResponse = (rawResponse, scenario) => {
  assertRecord(rawResponse, "nvComment response");
  if (!Array.isArray(rawResponse.data?.threads)) {
    throw new Error("nvComment response does not contain data.threads.");
  }
  const response = structuredClone(rawResponse);
  if (Array.isArray(response.data.globalComments)) response.data.globalComments = [];
  let injected = false;
  const threadSummary = response.data.threads.map((thread) => {
    const shouldInject = !injected && thread.fork === scenario.targetFork;
    thread.comments = shouldInject ? structuredClone(scenario.comments) : [];
    thread.commentCount = thread.comments.length;
    if (shouldInject) injected = true;
    return {
      id: String(thread.id),
      fork: String(thread.fork),
      commentsLen: thread.comments.length,
    };
  });
  if (!injected) {
    throw new Error(`nvComment response does not contain target fork ${scenario.targetFork}.`);
  }
  return { response, threadSummary };
};

export const isNvCommentThreadsRequest = (method, rawUrl) => {
  if (method !== "POST") return false;
  const url = new URL(rawUrl);
  return (
    (url.hostname === "nvcomment.nicovideo.jp" ||
      url.hostname.endsWith(".nvcomment.nicovideo.jp")) &&
    url.pathname === "/v1/threads"
  );
};

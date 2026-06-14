#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const parseArgs = (argv) => {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (value && !value.startsWith("--")) {
      args[key] = value;
      index += 1;
    } else {
      args[key] = "true";
    }
  }
  return args;
};

const numberArg = (args, key, fallback) => {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
};

const normalizeEntries = (input) => {
  const comments = Array.isArray(input?.comments) ? input.comments : Array.isArray(input) ? input : [];
  return comments.map((comment) => ({
    text: typeof comment.body === "string" ? comment.body : String(comment.text ?? ""),
    vposMs: Number(comment.vposMs),
    commands: Array.isArray(comment.commands) ? comment.commands : [],
  }));
};

const readJsonl = async (filePath) => {
  const text = await readFile(filePath, "utf8");
  return text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
};

const normalizeTextToken = (value) =>
  String(value)
    .replace(/[\s\u00a0\u2000-\u200f\u202f\u205f\u3000​]+/gu, "")
    .trim();

const collectExpectedTokens = (comments, vposMs) => {
  const tokens = new Map();
  for (const comment of comments) {
    if (comment.vposMs !== vposMs) continue;
    for (const line of comment.text.split(/\r?\n/u)) {
      const token = normalizeTextToken(line);
      if (token.length === 0) continue;
      tokens.set(token, (tokens.get(token) ?? 0) + 1);
    }
  }
  return tokens;
};

const collectTraceTokens = (records, timeMs, timeWindowMs) => {
  const tokens = new Map();
  for (const record of records) {
    if (record.op !== "fillText" && record.op !== "strokeText") continue;
    const recordTime = Number(record.videoCurrentTimeMs ?? record.frameTimeMs);
    if (Number.isFinite(timeMs) && Math.abs(recordTime - timeMs) > timeWindowMs) continue;
    const token = normalizeTextToken(record.text);
    if (token.length === 0) continue;
    tokens.set(token, (tokens.get(token) ?? 0) + 1);
  }
  return tokens;
};

const scoreTokenOverlap = (expected, actual) => {
  let expectedTotal = 0;
  let actualTotal = 0;
  let intersection = 0;
  for (const count of expected.values()) expectedTotal += count;
  for (const count of actual.values()) actualTotal += count;
  for (const [token, expectedCount] of expected) {
    intersection += Math.min(expectedCount, actual.get(token) ?? 0);
  }
  return {
    expectedTotal,
    actualTotal,
    intersection,
    recall: expectedTotal > 0 ? intersection / expectedTotal : 0,
    precision: actualTotal > 0 ? intersection / actualTotal : 0,
  };
};

const topTokens = (tokens, limit) =>
  [...tokens.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([text, count]) => ({ text, count }));

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const commentsPath = args.comments;
  const tracePath = args.trace;
  if (!commentsPath || !tracePath) {
    throw new Error(
      "Usage: node scripts/nico-trace-validate.mjs --comments comments.json --trace trace.jsonl --vpos-ms 345130 --time-ms 345697",
    );
  }
  const vposMs = numberArg(args, "vpos-ms", 345130);
  const timeMs = numberArg(args, "time-ms", Number.NaN);
  const timeWindowMs = numberArg(args, "time-window-ms", 1_000);
  const minRecall = numberArg(args, "min-recall", 0.2);
  const comments = normalizeEntries(JSON.parse(await readFile(commentsPath, "utf8")));
  const records = await readJsonl(tracePath);
  const expected = collectExpectedTokens(comments, vposMs);
  const actual = collectTraceTokens(records, timeMs, timeWindowMs);
  const score = scoreTokenOverlap(expected, actual);
  const valid = score.recall >= minRecall;
  const report = {
    valid,
    vposMs,
    timeMs: Number.isFinite(timeMs) ? timeMs : null,
    timeWindowMs,
    minRecall,
    score,
    expectedTop: topTokens(expected, 20),
    actualTop: topTokens(actual, 20),
  };
  console.log(JSON.stringify(report, null, 2));
  if (!valid) {
    process.exitCode = 2;
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { readFile } from "node:fs/promises";

const parseArgs = (argv) => {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
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

const normalizeEntries = (input) => {
  const comments = Array.isArray(input?.comments) ? input.comments : Array.isArray(input) ? input : [];
  return comments
    .map((comment, index) => ({
      index,
      text: typeof comment.body === "string" ? comment.body : String(comment.text ?? ""),
      vposMs: Number(comment.vposMs),
    }))
    .filter((comment) => comment.text.length > 0 && Number.isFinite(comment.vposMs));
};

const tokenCountsForText = (text) => {
  const counts = new Map();
  for (const line of String(text).split(/\r?\n/u)) {
    const token = normalizeTextToken(line);
    if (token.length > 0) counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
};

const tokenOverlap = (left, right) => {
  let intersection = 0;
  let leftTotal = 0;
  let rightTotal = 0;
  for (const count of left.values()) leftTotal += count;
  for (const count of right.values()) rightTotal += count;
  for (const [token, count] of left) {
    intersection += Math.min(count, right.get(token) ?? 0);
  }
  return leftTotal > 0 && rightTotal > 0 && intersection > 0
    ? (2 * intersection) / (leftTotal + rightTotal)
    : 0;
};

const getDrawImageArgs = (record) => {
  if (Array.isArray(record.args) && record.args.length >= 8) {
    return {
      x: Number(record.args[4]) || 0,
      y: Number(record.args[5]) || 0,
      width: Number(record.args[6]) || Number(record.sourceWidth) || 0,
      height: Number(record.args[7]) || Number(record.sourceHeight) || 0,
    };
  }
  return {
    x: Number(record.x) || 0,
    y: Number(record.y) || 0,
    width: Number(record.width) || Number(record.sourceWidth) || 0,
    height: Number(record.height) || Number(record.sourceHeight) || 0,
  };
};

const transformPoint = (transform, x, y) => {
  const matrix = Array.isArray(transform) && transform.length >= 6 ? transform : [1, 0, 0, 1, 0, 0];
  return {
    x: matrix[0] * x + matrix[2] * y + matrix[4],
    y: matrix[1] * x + matrix[3] * y + matrix[5],
  };
};

const transformScale = (transform) => {
  const matrix = Array.isArray(transform) && transform.length >= 6 ? transform : [1, 0, 0, 1, 0, 0];
  return Math.hypot(matrix[0], matrix[1]) || 1;
};

const parseFontSize = (font) => {
  const match = /(\d+(?:\.\d+)?)px/u.exec(String(font));
  return match ? Number(match[1]) : null;
};

const nearestFrameTime = (records, timeMs) => {
  const times = [
    ...new Set(
      records
        .map((record) => Number(record.videoCurrentTimeMs ?? record.frameTimeMs))
        .filter(Number.isFinite),
    ),
  ];
  if (times.length === 0) return null;
  return times.reduce((best, time) =>
    Math.abs(time - timeMs) < Math.abs(best - timeMs) ? time : best,
  );
};

const collectCanvasTokens = (records) => {
  const map = new Map();
  for (const record of records) {
    if (record.op !== "fillText") continue;
    const canvasId = record.canvasId;
    if (canvasId === undefined || canvasId === null) continue;
    const token = normalizeTextToken(record.text);
    if (token.length === 0) continue;
    const counts = map.get(canvasId) ?? new Map();
    counts.set(token, (counts.get(token) ?? 0) + 1);
    map.set(canvasId, counts);
  }
  return map;
};

const bestCommentMatch = (canvasTokens, comments) => {
  let best = null;
  for (const comment of comments) {
    const score = tokenOverlap(canvasTokens, comment.tokens);
    if (!best || score > best.score) best = { comment, score };
  }
  return best;
};

const normalizeTextRecord = (record) => {
  const point = transformPoint(record.transform, Number(record.x) || 0, Number(record.y) || 0);
  const scale = transformScale(record.transform);
  const fontSize = parseFontSize(record.font);
  return {
    text: String(record.text ?? ""),
    token: normalizeTextToken(record.text),
    x: point.x,
    y: point.y,
    fontSize: fontSize === null ? null : fontSize * scale,
  };
};

const visibleFillRecords = (records) => {
  const batches = [];
  let current = [];
  let currentKey = null;
  for (const record of records.filter((entry) => entry.op === "fillText")) {
    const normalized = normalizeTextRecord(record);
    const key = `${normalized.fontSize ?? "unknown"}:${normalized.x}`;
    if (currentKey !== null && key !== currentKey) {
      batches.push(current);
      current = [];
    }
    currentKey = key;
    current.push(normalized);
  }
  if (current.length > 0) batches.push(current);
  const finalVisibleBatch =
    [...batches].reverse().find((batch) => batch.some((record) => record.token.length > 0)) ?? [];
  return finalVisibleBatch.filter((record) => record.token.length > 0);
};

const summarize = (matches) => {
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
  const centers = matches.flatMap((match) => match.lineMatches.map((line) => Math.hypot(line.dx, line.dy)));
  const fontErrors = matches.flatMap((match) =>
    match.lineMatches
      .filter((line) => line.fontError !== null)
      .map((line) => Math.abs(line.fontError)),
  );
  const missingLineRatio = mean(
    matches.map((match) => match.missingLines / Math.max(match.teacherLines, 1)),
  );
  const meanDistance = mean(centers);
  return {
    matchedLayers: matches.length,
    comparedLines: centers.length,
    meanLineDistancePx: meanDistance,
    meanFontSizeErrorPx: fontErrors.length > 0 ? mean(fontErrors) : null,
    missingLineRatio,
    internalLayoutScore: Math.max(0, 1 - meanDistance / 900 - missingLineRatio),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.comments || !args.teacher || !args.candidate) {
    throw new Error(
      "Usage: node scripts/nico-internal-score.mjs --comments comments.json --teacher nico.jsonl --candidate overlay.jsonl --vpos-ms 345130 --time-ms 345806",
    );
  }

  const vposMs = numberArg(args, "vpos-ms", 345130);
  const timeMs = numberArg(args, "time-ms", 345806);
  const minF1 = numberArg(args, "min-f1", 0.2);
  const comments = normalizeEntries(JSON.parse(await readFile(args.comments, "utf8")))
    .filter((comment) => comment.vposMs === vposMs)
    .map((comment) => ({ ...comment, tokens: tokenCountsForText(comment.text) }));
  const teacherRecords = await readJsonl(args.teacher);
  const candidateRecords = await readJsonl(args.candidate);

  const teacherTime = nearestFrameTime(
    teacherRecords.filter((record) => record.op === "drawImage"),
    timeMs,
  );
  const candidateTime = nearestFrameTime(
    candidateRecords.filter((record) => record.op === "drawImage"),
    timeMs,
  );
  const teacherCanvasTokens = collectCanvasTokens(teacherRecords);

  const teacherDraws = teacherRecords
    .filter((record) => record.op === "drawImage")
    .filter((record) => Number(record.videoCurrentTimeMs ?? record.frameTimeMs) === teacherTime)
    .map((record) => {
      const match = bestCommentMatch(teacherCanvasTokens.get(record.sourceCanvasId) ?? new Map(), comments);
      return { record, match };
    })
    .filter(({ match }) => match && match.score >= minF1);

  const candidateByText = new Map();
  for (const record of candidateRecords) {
    if (record.op !== "drawImage") continue;
    if (record.comment?.vposMs !== vposMs) continue;
    if (Number(record.videoCurrentTimeMs ?? record.frameTimeMs) !== candidateTime) continue;
    const key = `${record.comment.text}`;
    if (!candidateByText.has(key)) candidateByText.set(key, record.comment.creationIndex);
  }

  const matches = [];
  const usedComments = new Set();
  for (const { record: draw, match } of teacherDraws) {
    const comment = match.comment;
    if (usedComments.has(comment.index)) continue;
    usedComments.add(comment.index);
    const candidateCreationIndex = candidateByText.get(comment.text);
    if (candidateCreationIndex === undefined) continue;

    const teacherLines = visibleFillRecords(
      teacherRecords.filter((record) => record.canvasId === draw.sourceCanvasId),
    );
    const candidateLines = visibleFillRecords(
      candidateRecords.filter((record) => record.comment?.creationIndex === candidateCreationIndex),
    );
    const pairCount = Math.min(teacherLines.length, candidateLines.length);
    const lineMatches = [];
    for (let index = 0; index < pairCount; index += 1) {
      const teacher = teacherLines[index];
      const candidate = candidateLines[index];
      lineMatches.push({
        index,
        tokenMatch: teacher.token === candidate.token,
        dx: candidate.x - teacher.x,
        dy: candidate.y - teacher.y,
        fontError:
          teacher.fontSize === null || candidate.fontSize === null
            ? null
            : candidate.fontSize - teacher.fontSize,
      });
    }
    const argsForDraw = getDrawImageArgs(draw);
    matches.push({
      commentIndex: comment.index,
      candidateCreationIndex,
      sourceCanvasId: draw.sourceCanvasId,
      sourceWidth: Number(draw.sourceWidth) || argsForDraw.width,
      sourceHeight: Number(draw.sourceHeight) || argsForDraw.height,
      textPreview: comment.text.split(/\r?\n/u).find((line) => normalizeTextToken(line))?.slice(0, 32) ?? "",
      teacherLines: teacherLines.length,
      candidateLines: candidateLines.length,
      missingLines: Math.abs(teacherLines.length - candidateLines.length),
      mismatchedTokens: lineMatches.filter((line) => !line.tokenMatch).length,
      lineMatches,
    });
  }

  const report = {
    valid: matches.length > 0,
    vposMs,
    requestedTimeMs: timeMs,
    teacherFrameTimeMs: teacherTime,
    candidateFrameTimeMs: candidateTime,
    summary: summarize(matches),
    worstLayers: [...matches]
      .sort((a, b) => {
        const maxDistance = (match) =>
          Math.max(0, ...match.lineMatches.map((line) => Math.hypot(line.dx, line.dy)));
        return maxDistance(b) - maxDistance(a);
      })
      .slice(0, 12),
  };
  console.log(JSON.stringify(report, null, 2));
};

main();

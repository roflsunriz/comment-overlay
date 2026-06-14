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
      commands: Array.isArray(comment.commands) ? comment.commands : [],
    }))
    .filter((comment) => comment.text.length > 0 && Number.isFinite(comment.vposMs));
};

const tokenCountsForText = (text) => {
  const counts = new Map();
  for (const line of String(text).split(/\r?\n/u)) {
    const token = normalizeTextToken(line);
    if (token.length > 0) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
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
  return {
    intersection,
    leftTotal,
    rightTotal,
    recall: leftTotal > 0 ? intersection / leftTotal : 0,
    precision: rightTotal > 0 ? intersection / rightTotal : 0,
    f1:
      leftTotal > 0 && rightTotal > 0 && intersection > 0
        ? (2 * intersection) / (leftTotal + rightTotal)
        : 0,
  };
};

const getDrawImageArgs = (record) => {
  if (Array.isArray(record.args) && record.args.length >= 8) {
    return {
      sourceWidth: Number(record.args[2]) || Number(record.sourceWidth) || 0,
      sourceHeight: Number(record.args[3]) || Number(record.sourceHeight) || 0,
      x: Number(record.args[4]) || 0,
      y: Number(record.args[5]) || 0,
      width: Number(record.args[6]) || Number(record.sourceWidth) || 0,
      height: Number(record.args[7]) || Number(record.sourceHeight) || 0,
    };
  }
  if (Array.isArray(record.args) && record.args.length >= 4) {
    return {
      sourceWidth: Number(record.sourceWidth) || Number(record.args[2]) || 0,
      sourceHeight: Number(record.sourceHeight) || Number(record.args[3]) || 0,
      x: Number(record.args[0]) || 0,
      y: Number(record.args[1]) || 0,
      width: Number(record.args[2]) || Number(record.sourceWidth) || 0,
      height: Number(record.args[3]) || Number(record.sourceHeight) || 0,
    };
  }
  return {
    sourceWidth: Number(record.sourceWidth) || Number(record.width) || 0,
    sourceHeight: Number(record.sourceHeight) || Number(record.height) || 0,
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

const normalizeDraw = (record) => {
  const args = getDrawImageArgs(record);
  const topLeft = transformPoint(record.transform, args.x, args.y);
  const bottomRight = transformPoint(record.transform, args.x + args.width, args.y + args.height);
  return {
    record,
    sequence: record.sequence ?? record.frameIndex ?? 0,
    timeMs: Number(record.videoCurrentTimeMs ?? record.frameTimeMs),
    sourceCanvasId: record.sourceCanvasId ?? null,
    sourceWidth: args.sourceWidth,
    sourceHeight: args.sourceHeight,
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
    color: record.comment?.color ?? null,
    creationIndex: record.comment?.creationIndex ?? null,
    commentText: record.comment?.text ?? null,
    commentVposMs: record.comment?.vposMs ?? null,
  };
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

const collectTeacherCanvasTokens = (records) => {
  const map = new Map();
  for (const record of records) {
    if (record.op !== "fillText" && record.op !== "strokeText") continue;
    if (record.canvasId === undefined || record.canvasId === null) continue;
    const token = normalizeTextToken(record.text);
    if (token.length === 0) continue;
    const counts = map.get(record.canvasId) ?? new Map();
    counts.set(token, (counts.get(token) ?? 0) + 1);
    map.set(record.canvasId, counts);
  }
  return map;
};

const bestCommentMatch = (canvasTokens, comments) => {
  let best = null;
  for (const comment of comments) {
    const overlap = tokenOverlap(canvasTokens, comment.tokens);
    const score = overlap.f1;
    if (!best || score > best.score) {
      best = { comment, overlap, score };
    }
  }
  return best;
};

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const keepLatestBy = (items, keyForItem) => {
  const map = new Map();
  for (const item of items) {
    const key = keyForItem(item);
    const previous = map.get(key);
    if (!previous || item.sequence > previous.sequence) {
      map.set(key, item);
    }
  }
  return [...map.values()].sort((a, b) => a.sequence - b.sequence);
};

const summarizeErrors = (matches, canvasWidth, canvasHeight) => {
  const errors = matches.map((match) => match.error);
  const maxAxis = Math.max(canvasWidth, canvasHeight, 1);
  const mean = (key) => errors.reduce((sum, error) => sum + Math.abs(error[key]), 0) / errors.length;
  const p50 = (key) => median(errors.map((error) => Math.abs(error[key])));
  const centerDistances = errors.map((error) => Math.hypot(error.cx, error.cy));
  const meanCenterDistance =
    centerDistances.reduce((sum, value) => sum + value, 0) / Math.max(centerDistances.length, 1);
  const score = Math.max(0, 1 - meanCenterDistance / maxAxis);
  return {
    matched: matches.length,
    meanAbs: {
      x: mean("x"),
      y: mean("y"),
      width: mean("width"),
      height: mean("height"),
      center: meanCenterDistance,
    },
    p50Abs: {
      x: p50("x"),
      y: p50("y"),
      width: p50("width"),
      height: p50("height"),
      center: median(centerDistances),
    },
    outerLayerPositionScore: score,
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const commentsPath = args.comments;
  const teacherPath = args.teacher;
  const candidatePath = args.candidate;
  if (!commentsPath || !teacherPath || !candidatePath) {
    throw new Error(
      "Usage: node scripts/nico-strict-score.mjs --comments comments.json --teacher nico.jsonl --candidate overlay.jsonl --vpos-ms 345130 --time-ms 345806",
    );
  }
  const vposMs = numberArg(args, "vpos-ms", 345130);
  const timeMs = numberArg(args, "time-ms", 345806);
  const canvasWidth = numberArg(args, "width", 1182);
  const canvasHeight = numberArg(args, "height", 665);
  const minF1 = numberArg(args, "min-f1", 0.2);

  const comments = normalizeEntries(JSON.parse(await readFile(commentsPath, "utf8")))
    .filter((comment) => comment.vposMs === vposMs)
    .map((comment) => ({ ...comment, tokens: tokenCountsForText(comment.text) }));
  const teacherRecords = await readJsonl(teacherPath);
  const candidateRecords = await readJsonl(candidatePath);

  const teacherCanvasTokens = collectTeacherCanvasTokens(teacherRecords);
  const teacherTime = nearestFrameTime(
    teacherRecords.filter((record) => record.op === "drawImage"),
    timeMs,
  );
  const candidateTime = nearestFrameTime(
    candidateRecords.filter((record) => record.op === "drawImage"),
    timeMs,
  );

  const teacherDraws = teacherRecords
    .filter((record) => record.op === "drawImage")
    .filter((record) => Number(record.videoCurrentTimeMs ?? record.frameTimeMs) === teacherTime)
    .map(normalizeDraw)
    .map((draw) => {
      const tokens = teacherCanvasTokens.get(draw.sourceCanvasId);
      const match = tokens ? bestCommentMatch(tokens, comments) : null;
      return { ...draw, commentMatch: match };
    })
    .filter((draw) => draw.commentMatch && draw.commentMatch.score >= minF1);
  const teacherLayers = keepLatestBy(
    teacherDraws,
    (draw) => `${draw.sourceCanvasId}:${draw.commentMatch.comment.index}`,
  );

  const candidateDraws = candidateRecords
    .filter((record) => record.op === "drawImage")
    .filter((record) => record.comment?.vposMs === vposMs)
    .filter((record) => Number(record.videoCurrentTimeMs ?? record.frameTimeMs) === candidateTime)
    .map(normalizeDraw)
    .map((draw) => {
      const comment = comments.find((entry) => entry.text === draw.commentText);
      return comment ? { ...draw, commentMatch: { comment, score: 1 } } : null;
    })
    .filter(Boolean);

  const usedCandidate = new Set();
  const layerMatches = [];
  for (const teacher of teacherLayers) {
    const commentIndex = teacher.commentMatch.comment.index;
    const candidates = candidateDraws
      .map((candidate, index) => ({ candidate, index }))
      .filter(
        ({ candidate, index }) =>
          !usedCandidate.has(index) && candidate.commentMatch.comment.index === commentIndex,
      );
    if (candidates.length === 0) continue;
    const selected = candidates[0];
    usedCandidate.add(selected.index);
    const candidate = selected.candidate;
    const error = {
      x: candidate.x - teacher.x,
      y: candidate.y - teacher.y,
      width: candidate.width - teacher.width,
      height: candidate.height - teacher.height,
      cx: candidate.x + candidate.width / 2 - (teacher.x + teacher.width / 2),
      cy: candidate.y + candidate.height / 2 - (teacher.y + teacher.height / 2),
    };
    layerMatches.push({
      commentIndex,
      creationIndex: candidate.creationIndex,
      textPreview: teacher.commentMatch.comment.text.split(/\r?\n/u).find((line) => normalizeTextToken(line))?.slice(0, 32) ?? "",
      teacher: {
        sourceCanvasId: teacher.sourceCanvasId,
        x: teacher.x,
        y: teacher.y,
        width: teacher.width,
        height: teacher.height,
        sourceWidth: teacher.sourceWidth,
        sourceHeight: teacher.sourceHeight,
      },
      candidate: {
        x: candidate.x,
        y: candidate.y,
        width: candidate.width,
        height: candidate.height,
        sourceWidth: candidate.sourceWidth,
        sourceHeight: candidate.sourceHeight,
        color: candidate.color,
      },
      error,
      textMatchScore: teacher.commentMatch.score,
    });
  }

  const report = {
    valid: layerMatches.length > 0,
    vposMs,
    requestedTimeMs: timeMs,
    teacherFrameTimeMs: teacherTime,
    candidateFrameTimeMs: candidateTime,
    commentsAtVpos: comments.length,
    teacherLayers: teacherLayers.length,
    candidateLayers: candidateDraws.length,
    unmatchedTeacherLayers: Math.max(0, teacherLayers.length - layerMatches.length),
    unmatchedCandidateLayers: Math.max(0, candidateDraws.length - layerMatches.length),
    summary: layerMatches.length > 0 ? summarizeErrors(layerMatches, canvasWidth, canvasHeight) : null,
    worstLayers: [...layerMatches]
      .sort((a, b) => Math.hypot(b.error.cx, b.error.cy) - Math.hypot(a.error.cx, a.error.cy))
      .slice(0, 12),
  };
  console.log(JSON.stringify(report, null, 2));
};

main();

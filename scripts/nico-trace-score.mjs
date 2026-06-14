#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

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

const readJsonl = async (filePath) => {
  const text = await readFile(filePath, "utf8");
  return text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
};

const normalizeEntries = (input) => {
  const comments = Array.isArray(input?.comments) ? input.comments : Array.isArray(input) ? input : [];
  return comments.map((comment) => ({
    text: typeof comment.body === "string" ? comment.body : String(comment.text ?? ""),
    vposMs: Number(comment.vposMs),
  }));
};

const normalizeTextToken = (value) =>
  String(value)
    .replace(/[\s\u00a0\u2000-\u200f\u202f\u205f\u3000​]+/gu, "")
    .trim();

const collectExpectedTokens = (comments, vposMs) => {
  const tokens = new Set();
  for (const comment of comments) {
    if (comment.vposMs !== vposMs) continue;
    for (const line of comment.text.split(/\r?\n/u)) {
      const token = normalizeTextToken(line);
      if (token.length > 0) {
        tokens.add(token);
      }
    }
  }
  return tokens;
};

const collectMatchedCanvasIds = (records, expectedTokens) => {
  const matches = new Map();
  for (const record of records) {
    if (record.op !== "fillText" && record.op !== "strokeText") continue;
    if (record.canvasId === undefined || record.canvasId === null) continue;
    const token = normalizeTextToken(record.text);
    if (!expectedTokens.has(token)) continue;
    const entry = matches.get(record.canvasId) ?? { canvasId: record.canvasId, count: 0 };
    entry.count += 1;
    matches.set(record.canvasId, entry);
  }
  return matches;
};

const collectTextTokens = (records, timeCenterMs, timeWindowMs) => {
  const tokens = new Map();
  for (const record of records) {
    if (record.op !== "fillText" && record.op !== "strokeText") continue;
    const recordTime = Number(record.videoCurrentTimeMs ?? record.frameTimeMs);
    if (
      Number.isFinite(timeCenterMs) &&
      Math.abs(recordTime - timeCenterMs) > timeWindowMs
    ) {
      continue;
    }
    const token = normalizeTextToken(record.text);
    if (token.length === 0) continue;
    tokens.set(token, (tokens.get(token) ?? 0) + 1);
  }
  return tokens;
};

const scoreTokenOverlap = (teacher, candidate) => {
  let teacherTotal = 0;
  let candidateTotal = 0;
  let intersection = 0;
  for (const count of teacher.values()) teacherTotal += count;
  for (const count of candidate.values()) candidateTotal += count;
  for (const [token, teacherCount] of teacher) {
    intersection += Math.min(teacherCount, candidate.get(token) ?? 0);
  }
  return {
    teacherTotal,
    candidateTotal,
    intersection,
    recall: teacherTotal > 0 ? intersection / teacherTotal : 0,
    precision: candidateTotal > 0 ? intersection / candidateTotal : 0,
  };
};

const getDrawImageArgs = (record) => {
  if (Array.isArray(record.args) && record.args.length >= 8) {
    return {
      sourceX: Number(record.args[0]) || 0,
      sourceY: Number(record.args[1]) || 0,
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
      sourceX: 0,
      sourceY: 0,
      sourceWidth: Number(record.sourceWidth) || Number(record.args[2]) || 0,
      sourceHeight: Number(record.sourceHeight) || Number(record.args[3]) || 0,
      x: Number(record.args[0]) || 0,
      y: Number(record.args[1]) || 0,
      width: Number(record.args[2]) || Number(record.sourceWidth) || 0,
      height: Number(record.args[3]) || Number(record.sourceHeight) || 0,
    };
  }
  return {
    sourceX: 0,
    sourceY: 0,
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
  const bottomRight = transformPoint(
    record.transform,
    args.x + args.width,
    args.y + args.height,
  );
  return {
    source: record.source,
    sequence: record.sequence ?? record.frameIndex ?? 0,
    op: record.op,
    videoCurrentTimeMs: record.videoCurrentTimeMs ?? record.frameTimeMs ?? null,
    sourceWidth: args.sourceWidth,
    sourceHeight: args.sourceHeight,
    sourceAspect: args.sourceHeight > 0 ? args.sourceWidth / args.sourceHeight : 0,
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
    commentVposMs: record.comment?.vposMs ?? null,
    color: record.comment?.color ?? null,
    lineCount:
      typeof record.comment?.text === "string" ? record.comment.text.split(/\r?\n/u).length : null,
    creationIndex: record.comment?.creationIndex ?? null,
  };
};

const quantile = (values, q) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * q)));
  return sorted[index];
};

const summarize = (draws) => {
  if (draws.length === 0) {
    return {
      count: 0,
      sourceWidth: { min: null, p50: null, max: null },
      sourceHeight: { min: null, p50: null, max: null },
      bbox: { x: null, y: null, width: null, height: null },
      totalDrawArea: 0,
    };
  }
  const widths = draws.map((draw) => draw.sourceWidth);
  const heights = draws.map((draw) => draw.sourceHeight);
  const xs = draws.map((draw) => draw.x);
  const ys = draws.map((draw) => draw.y);
  const right = draws.map((draw) => draw.x + draw.width);
  const bottom = draws.map((draw) => draw.y + draw.height);
  const area = draws.reduce((sum, draw) => sum + Math.abs(draw.width * draw.height), 0);
  return {
    count: draws.length,
    sourceWidth: {
      min: Math.min(...widths),
      p50: quantile(widths, 0.5),
      max: Math.max(...widths),
    },
    sourceHeight: {
      min: Math.min(...heights),
      p50: quantile(heights, 0.5),
      max: Math.max(...heights),
    },
    bbox: {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...right) - Math.min(...xs),
      height: Math.max(...bottom) - Math.min(...ys),
    },
    totalDrawArea: area,
  };
};

const groupBySize = (draws) => {
  const map = new Map();
  for (const draw of draws) {
    const key = `${Math.round(draw.sourceWidth)}x${Math.round(draw.sourceHeight)}`;
    const value = map.get(key) ?? { key, count: 0, xs: [], ys: [], colors: new Map() };
    value.count += 1;
    value.xs.push(draw.x);
    value.ys.push(draw.y);
    if (draw.color) value.colors.set(draw.color, (value.colors.get(draw.color) ?? 0) + 1);
    map.set(key, value);
  }
  return [...map.values()]
    .map((group) => ({
      size: group.key,
      count: group.count,
      xP50: quantile(group.xs, 0.5),
      yP50: quantile(group.ys, 0.5),
      colors: Object.fromEntries(group.colors),
    }))
    .sort((a, b) => b.count - a.count || a.size.localeCompare(b.size));
};

const compareSummaries = (teacher, candidate) => ({
  countDelta: candidate.count - teacher.count,
  sourceWidthP50Ratio:
    teacher.sourceWidth.p50 !== null ? candidate.sourceWidth.p50 / teacher.sourceWidth.p50 : null,
  sourceHeightP50Ratio:
    teacher.sourceHeight.p50 !== null
      ? candidate.sourceHeight.p50 / teacher.sourceHeight.p50
      : null,
  bboxDelta: {
    x: teacher.bbox.x !== null ? candidate.bbox.x - teacher.bbox.x : null,
    y: teacher.bbox.y !== null ? candidate.bbox.y - teacher.bbox.y : null,
    width: teacher.bbox.width !== null ? candidate.bbox.width - teacher.bbox.width : null,
    height: teacher.bbox.height !== null ? candidate.bbox.height - teacher.bbox.height : null,
  },
  totalDrawAreaRatio:
    teacher.totalDrawArea > 0 ? candidate.totalDrawArea / teacher.totalDrawArea : null,
});

const recordTimeMs = (record) => Number(record.videoCurrentTimeMs ?? record.frameTimeMs);

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const teacherPath = args.teacher;
  const candidatePath = args.candidate;
  if (!teacherPath || !candidatePath) {
    throw new Error(
      "Usage: node scripts/nico-trace-score.mjs --teacher nico-trace.jsonl --candidate co-trace.jsonl",
    );
  }
  const vposMs = numberArg(args, "vpos-ms", 345130);
  const timeCenterMs = numberArg(args, "time-ms", Number.NaN);
  const timeWindowMs = numberArg(args, "time-window-ms", 1_000);
  const topN = numberArg(args, "top", 20);
  const minTextRecall = numberArg(args, "min-text-recall", 0.2);

  const teacherRecords = await readJsonl(teacherPath);
  const candidateRecords = await readJsonl(candidatePath);
  const commentsPath = args.comments;
  const comments = commentsPath
    ? normalizeEntries(JSON.parse(await readFile(commentsPath, "utf8")))
    : null;
  const expectedTokens = comments ? collectExpectedTokens(comments, vposMs) : null;
  const matchedTeacherCanvasIds = expectedTokens
    ? collectMatchedCanvasIds(teacherRecords, expectedTokens)
    : new Map();
  const teacherTextTokens =
    matchedTeacherCanvasIds.size > 0
      ? new Map(
          [...matchedTeacherCanvasIds.values()].map((entry) => [
            `canvas:${entry.canvasId}`,
            entry.count,
          ]),
        )
      : collectTextTokens(teacherRecords, timeCenterMs, timeWindowMs);
  const candidateTextTokens = collectTextTokens(candidateRecords, timeCenterMs, timeWindowMs);
  const textOverlap = scoreTokenOverlap(teacherTextTokens, candidateTextTokens);
  if (matchedTeacherCanvasIds.size === 0 && textOverlap.recall < minTextRecall) {
    console.log(
      JSON.stringify(
        {
          valid: false,
          reason: "teacher/candidate text token overlap is below threshold",
          minTextRecall,
          textOverlap,
        },
        null,
        2,
      ),
    );
    process.exitCode = 2;
    return;
  }
  const teacherDraws = teacherRecords
    .filter((record) => record.op === "drawImage")
    .filter((record) =>
      matchedTeacherCanvasIds.size > 0 ? matchedTeacherCanvasIds.has(record.sourceCanvasId) : true,
    )
    .filter((record) =>
      Number.isFinite(timeCenterMs)
        ? Math.abs(recordTimeMs(record) - timeCenterMs) <= timeWindowMs
        : true,
    )
    .map(normalizeDraw);
  const candidateDraws = candidateRecords
    .filter((record) => record.op === "drawImage")
    .filter((record) => record.comment?.vposMs === vposMs)
    .map(normalizeDraw);

  const teacherSummary = summarize(teacherDraws);
  const candidateSummary = summarize(candidateDraws);
  const report = {
    valid: true,
    textOverlap,
    matchedTeacherCanvasIds: [...matchedTeacherCanvasIds.keys()],
    matchedTeacherCanvasCount: matchedTeacherCanvasIds.size,
    teacher: { path: teacherPath, label: basename(teacherPath), summary: teacherSummary },
    candidate: { path: candidatePath, label: basename(candidatePath), summary: candidateSummary },
    comparison: compareSummaries(teacherSummary, candidateSummary),
    teacherSizeGroups: groupBySize(teacherDraws).slice(0, topN),
    candidateSizeGroups: groupBySize(candidateDraws).slice(0, topN),
  };
  console.log(JSON.stringify(report, null, 2));
};

main();

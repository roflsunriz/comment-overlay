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

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const sourceWidth = (trajectory) => Number(String(trajectory.sourceSize ?? "").split("x")[0]);
const sourceHeight = (trajectory) => Number(String(trajectory.sourceSize ?? "").split("x")[1]);
const laneBasisY = (trajectory) =>
  Number.isFinite(Number(trajectory.laneBasisY))
    ? Number(trajectory.laneBasisY)
    : Number(trajectory.medianContentY ?? trajectory.medianY);

const pickTrajectories = (trajectories, options) =>
  trajectories.filter((trajectory) => {
    const width = sourceWidth(trajectory);
    const height = sourceHeight(trajectory);
    return (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width >= options.minSourceWidth &&
      height >= options.minSourceHeight &&
      height <= options.maxSourceHeight &&
      trajectory.lastTimeMs >= options.startMs &&
      trajectory.firstTimeMs <= options.endMs
    );
  });

const countByLane = (trajectories) => {
  const map = new Map();
  for (const trajectory of trajectories) {
    map.set(trajectory.inferredLane, (map.get(trajectory.inferredLane) ?? 0) + 1);
  }
  return map;
};

const sourceSizeBucket = (trajectory) => {
  const width = sourceWidth(trajectory);
  const height = sourceHeight(trajectory);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return "unknown";
  }
  const widthBucket = Math.round(width / 100) * 100;
  const heightBucket = Math.round(height / 20) * 20;
  return `${widthBucket}x${heightBucket}`;
};

const countBySourceSize = (trajectories) => {
  const map = new Map();
  for (const trajectory of trajectories) {
    const bucket = sourceSizeBucket(trajectory);
    map.set(bucket, (map.get(bucket) ?? 0) + 1);
  }
  return map;
};

const histogramScore = (left, right) => {
  const keys = new Set([...left.keys(), ...right.keys()]);
  let diff = 0;
  let total = 0;
  for (const key of keys) {
    const leftValue = left.get(key) ?? 0;
    const rightValue = right.get(key) ?? 0;
    diff += Math.abs(leftValue - rightValue);
    total += Math.max(leftValue, rightValue);
  }
  return total > 0 ? 1 - diff / (2 * total) : 1;
};

const countScore = (left, right) =>
  Math.max(0, 1 - Math.abs(left.length - right.length) / Math.max(left.length, right.length, 1));

const pairedScore = (left, right, scorer) => {
  const count = Math.min(left.length, right.length);
  if (count === 0) return 0;
  let total = 0;
  for (let index = 0; index < count; index += 1) {
    total += scorer(left[index], right[index]);
  }
  return (total / count) * countScore(left, right);
};

const normalizedColor = (trajectory) =>
  String(trajectory.textFillStyle ?? "").trim().toLowerCase();

const styleMismatchPenalty = (left, right) => {
  let penalty = 0;
  if (sourceSizeBucket(left) !== sourceSizeBucket(right)) penalty += 1;
  if (normalizedColor(left) !== normalizedColor(right)) penalty += 0.75;
  const leftFont = Number(left.textFontSize);
  const rightFont = Number(right.textFontSize);
  if (Number.isFinite(leftFont) && Number.isFinite(rightFont)) {
    penalty += Math.min(1, Math.abs(leftFont - rightFont) / 12);
  }
  const leftText = String(left.text ?? "");
  const rightText = String(right.text ?? "");
  if (leftText.length > 0 && rightText.length > 0 && leftText !== rightText) {
    penalty += leftText.includes(rightText) || rightText.includes(leftText) ? 1 : 5;
  }
  return penalty;
};

const pairByMetadataAndTime = (teacherSamples, candidateSamples, options) => {
  const unused = new Set(candidateSamples.map((_, index) => index));
  const pairs = [];
  const missedTeacher = [];
  for (const teacher of teacherSamples) {
    let bestIndex = -1;
    let bestCost = Number.POSITIVE_INFINITY;
    for (const index of unused) {
      const candidate = candidateSamples[index];
      const timeCost = Math.abs(teacher.firstTimeMs - candidate.firstTimeMs) / 1600;
      const cost = styleMismatchPenalty(teacher, candidate) * 2 + timeCost;
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }
    if (bestIndex >= 0 && bestCost <= options.maxPairCost) {
      unused.delete(bestIndex);
      pairs.push([teacher, candidateSamples[bestIndex], bestCost]);
    } else {
      missedTeacher.push(teacher);
    }
  }
  return {
    pairs,
    missedTeacher,
    extraCandidate: [...unused].map((index) => candidateSamples[index]),
  };
};

const matchedPairScore = (pairs, teacherSamples, candidateSamples, scorer) => {
  if (pairs.length === 0) return 0;
  const total = pairs.reduce((sum, [left, right]) => sum + scorer(left, right), 0);
  return (total / pairs.length) * countScore(teacherSamples, candidateSamples);
};

const roundScore = (value) => Math.round(value * 1000) / 1000;

const scoreLaneReports = (teacher, candidate, options) => {
  const teacherSamples = pickTrajectories(teacher.trajectorySamples ?? [], options);
  const candidateSamples = pickTrajectories(candidate.trajectorySamples ?? [], options);
  const matched = pairByMetadataAndTime(teacherSamples, candidateSamples, options);
  const scores = {
    count: countScore(teacherSamples, candidateSamples),
    laneHist: histogramScore(countByLane(teacherSamples), countByLane(candidateSamples)),
    sequence: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(left.inferredLane - right.inferredLane) / 8),
    ),
    y: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(laneBasisY(left) - laneBasisY(right)) / options.yTolerancePx),
    ),
    sourceSize: histogramScore(countBySourceSize(teacherSamples), countBySourceSize(candidateSamples)),
    speed: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(
        0,
        1 -
          Math.abs(Math.abs(left.velocityPxPerSec) - Math.abs(right.velocityPxPerSec)) /
            options.speedTolerancePxPerSec,
      ),
    ),
  };
  const matchedScores = {
    count: countScore(teacherSamples, candidateSamples),
    lane: matchedPairScore(matched.pairs, teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(left.inferredLane - right.inferredLane) / 8),
    ),
    y: matchedPairScore(matched.pairs, teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(laneBasisY(left) - laneBasisY(right)) / options.yTolerancePx),
    ),
    sourceSize: histogramScore(countBySourceSize(teacherSamples), countBySourceSize(candidateSamples)),
    style: matchedPairScore(matched.pairs, teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - styleMismatchPenalty(left, right) / 3),
    ),
    time: matchedPairScore(matched.pairs, teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(left.firstTimeMs - right.firstTimeMs) / options.timeToleranceMs),
    ),
    speed: matchedPairScore(matched.pairs, teacherSamples, candidateSamples, (left, right) =>
      Math.max(
        0,
        1 -
          Math.abs(Math.abs(left.velocityPxPerSec) - Math.abs(right.velocityPxPerSec)) /
            options.speedTolerancePxPerSec,
      ),
    ),
  };
  const progress =
    scores.count * 0.15 +
    scores.laneHist * 0.25 +
    scores.sequence * 0.25 +
    scores.y * 0.15 +
    scores.sourceSize * 0.1 +
    scores.speed * 0.1;
  const matchedProgress =
    matchedScores.count * 0.1 +
    matchedScores.lane * 0.25 +
    matchedScores.y * 0.15 +
    matchedScores.sourceSize * 0.1 +
    matchedScores.style * 0.15 +
    matchedScores.time * 0.15 +
    matchedScores.speed * 0.1;

  return {
    filters: options,
    teacherCount: teacherSamples.length,
    candidateCount: candidateSamples.length,
    teacherSeq: teacherSamples.map((trajectory) => trajectory.inferredLane),
    candidateSeq: candidateSamples.map((trajectory) => trajectory.inferredLane),
    teacherY: teacherSamples.map((trajectory) => Math.round(laneBasisY(trajectory))),
    candidateY: candidateSamples.map((trajectory) => Math.round(laneBasisY(trajectory))),
    teacherSpeed: teacherSamples.map((trajectory) => Math.round(Math.abs(trajectory.velocityPxPerSec))),
    candidateSpeed: candidateSamples.map((trajectory) =>
      Math.round(Math.abs(trajectory.velocityPxPerSec)),
    ),
    teacherSourceSize: teacherSamples.map((trajectory) => trajectory.sourceSize),
    candidateSourceSize: candidateSamples.map((trajectory) => trajectory.sourceSize),
    scores: Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, roundScore(value)]),
    ),
    matchedScores: Object.fromEntries(
      Object.entries(matchedScores).map(([key, value]) => [key, roundScore(value)]),
    ),
    matchedPairs: matched.pairs.map(([left, right, cost]) => ({
      teacher: {
        time: Math.round(left.firstTimeMs),
        lane: left.inferredLane,
        y: Math.round(laneBasisY(left)),
        sourceSize: left.sourceSize,
        color: left.textFillStyle,
        fontSize: left.textFontSize,
        text: left.text,
      },
      candidate: {
        time: Math.round(right.firstTimeMs),
        lane: right.inferredLane,
        y: Math.round(laneBasisY(right)),
        sourceSize: right.sourceSize,
        color: right.textFillStyle,
        fontSize: right.textFontSize,
        text: right.text,
        vposMs: right.commentVposMs,
        creationIndex: right.commentCreationIndex,
      },
      cost: roundScore(cost),
    })),
    missedTeacherCount: matched.missedTeacher.length,
    extraCandidateCount: matched.extraCandidate.length,
    progressPercent: Math.round(progress * 1000) / 10,
    matchedProgressPercent: Math.round(matchedProgress * 1000) / 10,
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.teacher || !args.candidate) {
    throw new Error(
      "Usage: node scripts/nico-lane-score.mjs --teacher teacher.json --candidate candidate.json [--start-ms 566000 --end-ms 571300 --min-source-width 380]",
    );
  }
  const teacher = await loadJson(args.teacher);
  const candidate = await loadJson(args.candidate);
  const options = {
    startMs: numberArg(args, "start-ms", 566000),
    endMs: numberArg(args, "end-ms", 571300),
    minSourceWidth: numberArg(args, "min-source-width", 380),
    minSourceHeight: numberArg(args, "min-source-height", 100),
    maxSourceHeight: numberArg(args, "max-source-height", 190),
    yTolerancePx: numberArg(args, "y-tolerance-px", 520),
    speedTolerancePxPerSec: numberArg(args, "speed-tolerance", 500),
    timeToleranceMs: numberArg(args, "time-tolerance-ms", 2500),
    maxPairCost: numberArg(args, "max-pair-cost", 8),
  };
  const result = scoreLaneReports(teacher, candidate, options);
  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

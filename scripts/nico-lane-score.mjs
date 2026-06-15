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

const pickTrajectories = (trajectories, options) =>
  trajectories.filter((trajectory) => {
    const width = sourceWidth(trajectory);
    return (
      /^(?:\d+)x120$/u.test(String(trajectory.sourceSize ?? "")) &&
      width >= options.minSourceWidth &&
      trajectory.firstTimeMs >= options.startMs &&
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

const roundScore = (value) => Math.round(value * 1000) / 1000;

const scoreLaneReports = (teacher, candidate, options) => {
  const teacherSamples = pickTrajectories(teacher.trajectorySamples ?? [], options);
  const candidateSamples = pickTrajectories(candidate.trajectorySamples ?? [], options);
  const scores = {
    count: countScore(teacherSamples, candidateSamples),
    laneHist: histogramScore(countByLane(teacherSamples), countByLane(candidateSamples)),
    sequence: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(left.inferredLane - right.inferredLane) / 8),
    ),
    y: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(left.medianY - right.medianY) / options.yTolerancePx),
    ),
    speed: pairedScore(teacherSamples, candidateSamples, (left, right) =>
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
    scores.laneHist * 0.3 +
    scores.sequence * 0.25 +
    scores.y * 0.2 +
    scores.speed * 0.1;

  return {
    filters: options,
    teacherCount: teacherSamples.length,
    candidateCount: candidateSamples.length,
    teacherSeq: teacherSamples.map((trajectory) => trajectory.inferredLane),
    candidateSeq: candidateSamples.map((trajectory) => trajectory.inferredLane),
    teacherY: teacherSamples.map((trajectory) => Math.round(trajectory.medianY)),
    candidateY: candidateSamples.map((trajectory) => Math.round(trajectory.medianY)),
    teacherSpeed: teacherSamples.map((trajectory) => Math.round(Math.abs(trajectory.velocityPxPerSec))),
    candidateSpeed: candidateSamples.map((trajectory) =>
      Math.round(Math.abs(trajectory.velocityPxPerSec)),
    ),
    scores: Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, roundScore(value)]),
    ),
    progressPercent: Math.round(progress * 1000) / 10,
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
  const result = scoreLaneReports(teacher, candidate, {
    startMs: numberArg(args, "start-ms", 566000),
    endMs: numberArg(args, "end-ms", 571300),
    minSourceWidth: numberArg(args, "min-source-width", 380),
    yTolerancePx: numberArg(args, "y-tolerance-px", 520),
    speedTolerancePxPerSec: numberArg(args, "speed-tolerance", 500),
  });
  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

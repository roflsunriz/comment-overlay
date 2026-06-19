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

const normalizeCommentText = (value) => String(value ?? "");

const normalizeCommentEntries = (input) => {
  const comments = Array.isArray(input?.comments) ? input.comments : Array.isArray(input) ? input : [];
  return comments
    .map((comment) => ({
      text: typeof comment.body === "string" ? comment.body : String(comment.text ?? ""),
      vposMs: Number(comment.vposMs),
      no: Number(comment.no),
      fork:
        typeof comment.forkLabel === "string"
          ? comment.forkLabel
          : typeof comment.fork === "string"
            ? comment.fork
            : Number.isFinite(Number(comment.fork))
              ? String(comment.fork)
              : null,
      source: typeof comment.source === "string" ? comment.source : null,
      threadId:
        typeof comment.threadId === "string"
          ? comment.threadId
          : Number.isFinite(Number(comment.thread))
            ? String(comment.thread)
            : null,
      date: Number.isFinite(Number(comment.date)) ? Number(comment.date) : null,
      userIdHash:
        typeof comment.userIdHash === "string"
          ? comment.userIdHash
          : typeof comment.userId === "string"
            ? comment.userId
            : null,
    }))
    .filter((comment) => comment.text.length > 0 && Number.isFinite(comment.vposMs));
};

const buildCommentsByText = (comments) => {
  const byText = new Map();
  for (const comment of comments) {
    const key = normalizeCommentText(comment.text);
    const bucket = byText.get(key) ?? [];
    bucket.push(comment);
    byText.set(key, bucket);
  }
  for (const bucket of byText.values()) {
    bucket.sort((a, b) => a.vposMs - b.vposMs || a.no - b.no);
  }
  return byText;
};

const annotateSampleIdentity = (sample, commentsByText, options) => {
  if (sampleIdentityKey(sample)) return sample;
  const text = normalizeCommentText(sample.text);
  if (text.length === 0) return sample;
  const bucket = commentsByText.get(text) ?? [];
  if (bucket.length === 0) return sample;
  const directVpos = Number(sample.commentVposMs);
  const targetVposMs = Number.isFinite(directVpos) && directVpos > 0
    ? directVpos
    : Number(sample.firstTimeMs) - options.identityVposLeadMs;
  if (!Number.isFinite(targetVposMs)) return sample;
  let best = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const comment of bucket) {
    const delta = Math.abs(comment.vposMs - targetVposMs);
    if (delta < bestDelta) {
      best = comment;
      bestDelta = delta;
    }
  }
  if (!best || bestDelta > options.identityWindowMs) return sample;
  return {
    ...sample,
    commentVposMs: Number.isFinite(Number(sample.commentVposMs))
      ? sample.commentVposMs
      : best.vposMs,
    commentNo: Number.isFinite(best.no) ? best.no : sample.commentNo,
    commentFork: best.fork ?? sample.commentFork ?? null,
    commentSource: best.source ?? sample.commentSource ?? null,
    commentThreadId: best.threadId ?? sample.commentThreadId ?? null,
    commentDate: best.date ?? sample.commentDate ?? null,
    commentUserIdHash: best.userIdHash ?? sample.commentUserIdHash ?? null,
    identityAnnotationDeltaMs: Math.round(bestDelta),
  };
};

const annotateReportIdentities = (report, comments, options) => {
  if (!comments || comments.length === 0) return report;
  const commentsByText = buildCommentsByText(comments);
  return {
    ...report,
    trajectorySamples: (report.trajectorySamples ?? []).map((sample) =>
      annotateSampleIdentity(sample, commentsByText, options),
    ),
  };
};

const sourceWidth = (trajectory) => Number(String(trajectory.sourceSize ?? "").split("x")[0]);
const sourceHeight = (trajectory) => Number(String(trajectory.sourceSize ?? "").split("x")[1]);
const laneBasisY = (trajectory) =>
  Number.isFinite(Number(trajectory.laneBasisY))
    ? Number(trajectory.laneBasisY)
    : Number(trajectory.medianContentY ?? trajectory.medianY);

const effectiveLane = (trajectory, role = "teacher") => {
  const commentLane =
    trajectory.commentLane === null || trajectory.commentLane === undefined
      ? null
      : Number(trajectory.commentLane);
  if (role === "candidate" && Number.isFinite(commentLane) && commentLane >= 0) {
    return commentLane;
  }
  return Number(trajectory.inferredLane);
};

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

const countByLane = (trajectories, role = "teacher") => {
  const map = new Map();
  for (const trajectory of trajectories) {
    const lane = effectiveLane(trajectory, role);
    map.set(lane, (map.get(lane) ?? 0) + 1);
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

const sampleIdentityKey = (sample) => {
  const rawNo = sample.commentNo ?? sample.no;
  if (rawNo === null || rawNo === undefined) return null;
  const no = Number(rawNo);
  if (!Number.isFinite(no) || no <= 0) return null;
  return [
    "no",
    String(sample.commentSource ?? sample.source ?? ""),
    String(sample.commentFork ?? sample.fork ?? ""),
    String(sample.commentThreadId ?? sample.threadId ?? ""),
    String(no),
  ].join(":");
};

const indexCandidateIdentities = (candidateSamples, unused) => {
  const byIdentity = new Map();
  for (const index of unused) {
    const key = sampleIdentityKey(candidateSamples[index]);
    if (!key) continue;
    const bucket = byIdentity.get(key) ?? [];
    bucket.push(index);
    byIdentity.set(key, bucket);
  }
  return byIdentity;
};

const pairByHeuristic = (teacherSamples, candidateSamples, unused, options) => {
  const pairs = [];
  const missedTeacher = [];
  for (const teacher of teacherSamples) {
    let bestIndex = -1;
    let bestCost = Number.POSITIVE_INFINITY;
    for (const index of unused) {
      const candidate = candidateSamples[index];
      const timeCost = Math.abs(teacher.firstTimeMs - candidate.firstTimeMs) / 1600;
      const yCost = Math.abs(laneBasisY(teacher) - laneBasisY(candidate)) / 160;
      const laneCost = Math.abs(effectiveLane(teacher, "teacher") - effectiveLane(candidate, "candidate")) / 4;
      const cost = styleMismatchPenalty(teacher, candidate) * 2 + timeCost + yCost + laneCost;
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }
    if (bestIndex >= 0 && bestCost <= options.maxPairCost) {
      unused.delete(bestIndex);
      pairs.push([teacher, candidateSamples[bestIndex], bestCost, "heuristic"]);
    } else {
      missedTeacher.push(teacher);
    }
  }
  return { pairs, missedTeacher };
};

const pairByMetadataAndTime = (teacherSamples, candidateSamples, options) => {
  const unused = new Set(candidateSamples.map((_, index) => index));
  const pairs = [];
  const identityCandidateIndex = indexCandidateIdentities(candidateSamples, unused);
  const heuristicTeachers = [];
  const identityMatchedTeacherKeys = new Set();

  for (const teacher of teacherSamples) {
    const key = sampleIdentityKey(teacher);
    const bucket = key ? identityCandidateIndex.get(key) ?? [] : [];
    while (bucket.length > 0 && !unused.has(bucket[0])) bucket.shift();
    if (!key || bucket.length === 0) {
      heuristicTeachers.push(teacher);
      continue;
    }
    let bestBucketOffset = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    for (let offset = 0; offset < bucket.length; offset += 1) {
      const candidate = candidateSamples[bucket[offset]];
      const timeCost = Math.abs(teacher.firstTimeMs - candidate.firstTimeMs) / 1600;
      const yCost = Math.abs(laneBasisY(teacher) - laneBasisY(candidate)) / 160;
      const laneCost = Math.abs(effectiveLane(teacher, "teacher") - effectiveLane(candidate, "candidate")) / 4;
      const cost = styleMismatchPenalty(teacher, candidate) * 0.5 + timeCost + yCost + laneCost;
      if (cost < bestCost) {
        bestCost = cost;
        bestBucketOffset = offset;
      }
    }
    const [bestIndex] = bucket.splice(bestBucketOffset, 1);
    unused.delete(bestIndex);
    identityMatchedTeacherKeys.add(key);
    pairs.push([teacher, candidateSamples[bestIndex], bestCost, "identity"]);
  }

  const heuristic = pairByHeuristic(heuristicTeachers, candidateSamples, unused, options);
  pairs.push(...heuristic.pairs);
  return {
    pairs,
    missedTeacher: heuristic.missedTeacher,
    extraCandidate: [...unused].map((index) => candidateSamples[index]),
    inputSet: summarizeInputSet(teacherSamples, candidateSamples, pairs, heuristic.missedTeacher, unused, {
      identityMatchedTeacherKeys,
    }),
  };
};

const summarizeInputSet = (
  teacherSamples,
  candidateSamples,
  pairs,
  missedTeacher,
  unusedCandidateIndices,
  context,
) => {
  const teacherIdentityKeys = teacherSamples.map(sampleIdentityKey).filter(Boolean);
  const candidateIdentityKeys = candidateSamples.map(sampleIdentityKey).filter(Boolean);
  const teacherIdentitySet = new Set(teacherIdentityKeys);
  const candidateIdentitySet = new Set(candidateIdentityKeys);
  const sharedIdentityKeys = [...teacherIdentitySet].filter((key) => candidateIdentitySet.has(key));
  const matchedByIdentity = pairs.filter((pair) => pair[3] === "identity").length;
  const matchedByHeuristic = pairs.filter((pair) => pair[3] === "heuristic").length;
  const unmatchedTeacherByIdentity = missedTeacher
    .map(sampleIdentityKey)
    .filter((key) => key && !context.identityMatchedTeacherKeys.has(key));
  const unmatchedCandidateByIdentity = [...unusedCandidateIndices]
    .map((index) => sampleIdentityKey(candidateSamples[index]))
    .filter(Boolean);
  return {
    teacherCount: teacherSamples.length,
    candidateCount: candidateSamples.length,
    teacherWithIdentity: teacherIdentityKeys.length,
    candidateWithIdentity: candidateIdentityKeys.length,
    sharedIdentityKeys: sharedIdentityKeys.length,
    matchedByIdentity,
    matchedByHeuristic,
    unmatchedTeacher: missedTeacher.length,
    unmatchedCandidate: unusedCandidateIndices.size,
    unmatchedTeacherWithIdentity: unmatchedTeacherByIdentity.length,
    unmatchedCandidateWithIdentity: unmatchedCandidateByIdentity.length,
  };
};

const matchedPairScore = (pairs, teacherSamples, candidateSamples, scorer) => {
  if (pairs.length === 0) return 0;
  const total = pairs.reduce((sum, [left, right]) => sum + scorer(left, right), 0);
  return (total / pairs.length) * countScore(teacherSamples, candidateSamples);
};

const matchedPairAverage = (pairs, scorer) => {
  if (pairs.length === 0) return 0;
  return pairs.reduce((sum, [left, right]) => sum + scorer(left, right), 0) / pairs.length;
};

const roundScore = (value) => Math.round(value * 1000) / 1000;

const matchedCompositeScore = (scores) =>
  scores.count * 0.1 +
  scores.lane * 0.25 +
  scores.y * 0.15 +
  scores.sourceSize * 0.1 +
  scores.style * 0.15 +
  scores.time * 0.15 +
  scores.speed * 0.1;

const percentScore = (value) => Math.round(value * 1000) / 10;

const pairMetricScore = (pairs, teacherSamples, candidateSamples, oracle, scorer) =>
  oracle.commentSet
    ? matchedPairAverage(pairs, scorer)
    : matchedPairScore(pairs, teacherSamples, candidateSamples, scorer);

const scoreMatchedPairs = (pairs, teacherSamples, candidateSamples, options, oracle = {}) => ({
  count: oracle.commentSet ? 1 : countScore(teacherSamples, candidateSamples),
  lane: oracle.lane
    ? 1
    : pairMetricScore(
        pairs,
        teacherSamples,
        candidateSamples,
        oracle,
        (left, right) =>
          Math.max(0, 1 - Math.abs(effectiveLane(left, "teacher") - effectiveLane(right, "candidate")) / 8),
      ),
  y: oracle.y
    ? 1
    : pairMetricScore(
        pairs,
        teacherSamples,
        candidateSamples,
        oracle,
        (left, right) =>
          Math.max(0, 1 - Math.abs(laneBasisY(left) - laneBasisY(right)) / options.yTolerancePx),
      ),
  sourceSize: oracle.sourceSize
    ? 1
    : (oracle.commentSet
        ? matchedPairAverage(pairs, (left, right) =>
            sourceSizeBucket(left) === sourceSizeBucket(right) ? 1 : 0,
          )
        : histogramScore(countBySourceSize(teacherSamples), countBySourceSize(candidateSamples))),
  style: oracle.style
    ? 1
    : pairMetricScore(
        pairs,
        teacherSamples,
        candidateSamples,
        oracle,
        (left, right) => Math.max(0, 1 - styleMismatchPenalty(left, right) / 3),
      ),
  time: oracle.time
    ? 1
    : pairMetricScore(
        pairs,
        teacherSamples,
        candidateSamples,
        oracle,
        (left, right) =>
          Math.max(0, 1 - Math.abs(left.firstTimeMs - right.firstTimeMs) / options.timeToleranceMs),
      ),
  speed: oracle.speed
    ? 1
    : pairMetricScore(
        pairs,
        teacherSamples,
        candidateSamples,
        oracle,
        (left, right) =>
          Math.max(
            0,
            1 -
              Math.abs(Math.abs(left.velocityPxPerSec) - Math.abs(right.velocityPxPerSec)) /
                options.speedTolerancePxPerSec,
          ),
      ),
});

const roundedScores = (scores) =>
  Object.fromEntries(Object.entries(scores).map(([key, value]) => [key, roundScore(value)]));

const buildOracleScores = (pairs, teacherSamples, candidateSamples, options) => {
  const normal = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options);
  const commentSet = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options, {
    commentSet: true,
  });
  const lane = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options, { lane: true });
  const y = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options, { y: true });
  const laneY = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options, {
    lane: true,
    y: true,
  });
  const laneYTime = scoreMatchedPairs(pairs, teacherSamples, candidateSamples, options, {
    lane: true,
    y: true,
    time: true,
  });
  return {
    normal: {
      scores: roundedScores(normal),
      progressPercent: percentScore(matchedCompositeScore(normal)),
    },
    commentSet: {
      scores: roundedScores(commentSet),
      progressPercent: percentScore(matchedCompositeScore(commentSet)),
    },
    lane: {
      scores: roundedScores(lane),
      progressPercent: percentScore(matchedCompositeScore(lane)),
    },
    y: {
      scores: roundedScores(y),
      progressPercent: percentScore(matchedCompositeScore(y)),
    },
    laneY: {
      scores: roundedScores(laneY),
      progressPercent: percentScore(matchedCompositeScore(laneY)),
    },
    laneYTime: {
      scores: roundedScores(laneYTime),
      progressPercent: percentScore(matchedCompositeScore(laneYTime)),
    },
  };
};

const scoreLaneReports = (teacher, candidate, options) => {
  const teacherSamples = pickTrajectories(teacher.trajectorySamples ?? [], options);
  const candidateSamples = pickTrajectories(candidate.trajectorySamples ?? [], options);
  const matched = pairByMetadataAndTime(teacherSamples, candidateSamples, options);
  const scores = {
    count: countScore(teacherSamples, candidateSamples),
    laneHist: histogramScore(countByLane(teacherSamples, "teacher"), countByLane(candidateSamples, "candidate")),
    sequence: pairedScore(teacherSamples, candidateSamples, (left, right) =>
      Math.max(0, 1 - Math.abs(effectiveLane(left, "teacher") - effectiveLane(right, "candidate")) / 8),
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
  const matchedScores = scoreMatchedPairs(matched.pairs, teacherSamples, candidateSamples, options);
  const oracleScores = buildOracleScores(
    matched.pairs,
    teacherSamples,
    candidateSamples,
    options,
  );
  const progress =
    scores.count * 0.15 +
    scores.laneHist * 0.25 +
    scores.sequence * 0.25 +
    scores.y * 0.15 +
    scores.sourceSize * 0.1 +
    scores.speed * 0.1;
  const matchedProgress = matchedCompositeScore(matchedScores);

  return {
    filters: options,
    teacherCount: teacherSamples.length,
    candidateCount: candidateSamples.length,
    teacherSeq: teacherSamples.map((trajectory) => effectiveLane(trajectory, "teacher")),
    candidateSeq: candidateSamples.map((trajectory) => effectiveLane(trajectory, "candidate")),
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
    oracleScores,
    inputSet: matched.inputSet,
    matchedPairs: matched.pairs.map(([left, right, cost, matchMethod]) => ({
      teacher: {
        time: Math.round(left.firstTimeMs),
        lane: effectiveLane(left, "teacher"),
        inferredLane: left.inferredLane,
        commentLane: left.commentLane ?? null,
        y: Math.round(laneBasisY(left)),
        sourceSize: left.sourceSize,
        color: left.textFillStyle,
        fontSize: left.textFontSize,
        text: left.text,
        vposMs: left.commentVposMs,
        creationIndex: left.commentCreationIndex,
        no: left.commentNo,
        fork: left.commentFork,
        source: left.commentSource,
        threadId: left.commentThreadId,
      },
      candidate: {
        time: Math.round(right.firstTimeMs),
        lane: effectiveLane(right, "candidate"),
        inferredLane: right.inferredLane,
        commentLane: right.commentLane ?? null,
        y: Math.round(laneBasisY(right)),
        sourceSize: right.sourceSize,
        color: right.textFillStyle,
        fontSize: right.textFontSize,
        text: right.text,
        vposMs: right.commentVposMs,
        creationIndex: right.commentCreationIndex,
        no: right.commentNo,
        fork: right.commentFork,
        source: right.commentSource,
        threadId: right.commentThreadId,
      },
      cost: roundScore(cost),
      matchMethod,
    })),
    missedTeacherCount: matched.missedTeacher.length,
    extraCandidateCount: matched.extraCandidate.length,
    progressPercent: percentScore(progress),
    matchedProgressPercent: percentScore(matchedProgress),
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
    identityVposLeadMs: numberArg(args, "identity-vpos-lead-ms", 1800),
    identityWindowMs: numberArg(args, "identity-window-ms", 3500),
  };
  const comments = args.comments ? normalizeCommentEntries(await loadJson(args.comments)) : null;
  const result = scoreLaneReports(
    annotateReportIdentities(teacher, comments, options),
    annotateReportIdentities(candidate, comments, options),
    options,
  );
  console.log(JSON.stringify(result, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

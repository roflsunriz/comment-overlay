#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

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

const percentile = (values, ratio) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
};

const average = (values) => {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
};

const getDrawArgs = (record) => {
  const args = Array.isArray(record.args) ? record.args : [];
  if (args.length === 2) {
    return {
      dx: Number(args[0]),
      dy: Number(args[1]),
      dw: Number(record.sourceWidth),
      dh: Number(record.sourceHeight),
    };
  }
  if (args.length === 4) {
    return {
      dx: Number(args[0]),
      dy: Number(args[1]),
      dw: Number(args[2]),
      dh: Number(args[3]),
    };
  }
  if (args.length >= 8) {
    return {
      dx: Number(args[4]),
      dy: Number(args[5]),
      dw: Number(args[6]),
      dh: Number(args[7]),
    };
  }
  return null;
};

const getCanvasScale = (record) => {
  const transform = Array.isArray(record.transform) ? record.transform : null;
  const scaleX = transform && Number.isFinite(transform[0]) ? Math.abs(transform[0]) : 1;
  const scaleY = transform && Number.isFinite(transform[3]) ? Math.abs(transform[3]) : 1;
  return {
    scaleX: scaleX > 0 ? scaleX : 1,
    scaleY: scaleY > 0 ? scaleY : 1,
  };
};

const applyTransform = (record, x, y) => {
  const transform = Array.isArray(record.transform) ? record.transform : null;
  if (!transform || transform.length < 6) {
    return { x, y };
  }
  const [a, b, c, d, e, f] = transform.map(Number);
  if (![a, b, c, d, e, f].every(Number.isFinite)) {
    return { x, y };
  }
  return {
    x: a * x + c * y + e,
    y: b * x + d * y + f,
  };
};

const normalizeDrawImage = (record, source) => {
  const draw =
    Number.isFinite(Number(record.x)) &&
    Number.isFinite(Number(record.y)) &&
    Number.isFinite(Number(record.width)) &&
    Number.isFinite(Number(record.height))
      ? {
          dx: Number(record.x),
          dy: Number(record.y),
          dw: Number(record.width),
          dh: Number(record.height),
        }
      : getDrawArgs(record);
  if (!draw) return null;
  const { scaleX, scaleY } = getCanvasScale(record);
  const videoRect = record.videoRect ?? null;
  const canvasWidth = Number(record.canvasWidth);
  const canvasHeight = Number(record.canvasHeight);
  const videoWidth = Number(videoRect?.width);
  const videoHeight = Number(videoRect?.height);
  const videoTimeMs = Number(record.videoCurrentTimeMs ?? record.frameTimeMs);
  const timestampMs = Number(record.timestampMs);
  const frameTimeMs = Number(record.frameTimeMs);
  const motionTimeMs =
    source === "niconico-player" && Number.isFinite(timestampMs)
      ? timestampMs
      : Number.isFinite(frameTimeMs)
        ? frameTimeMs
        : Number.isFinite(videoTimeMs)
          ? videoTimeMs
          : timestampMs;
  const transformedOrigin = applyTransform(record, draw.dx, draw.dy);
  const videoLeft = Number(videoRect?.left ?? videoRect?.x);
  const videoTop = Number(videoRect?.top ?? videoRect?.y);
  const dx =
    transformedOrigin.x / scaleX -
    (Number.isFinite(videoLeft) && source === "niconico-player" ? videoLeft : 0);
  const dy =
    transformedOrigin.y / scaleY -
    (Number.isFinite(videoTop) && source === "niconico-player" ? videoTop : 0);
  const dw = draw.dw / scaleX;
  const dh = draw.dh / scaleY;
  return {
    source,
    raw: record,
    sequence: Number(record.sequence ?? record.comment?.creationIndex ?? 0),
    timeMs: videoTimeMs,
    motionTimeMs,
    timestampMs,
    canvasId: record.canvasId ?? null,
    sourceCanvasId: record.sourceCanvasId ?? record.comment?.creationIndex ?? null,
    sourceKind: record.sourceKind ?? null,
    sourceWidth: Number(record.sourceWidth),
    sourceHeight: Number(record.sourceHeight),
    canvasWidth: Number.isFinite(canvasWidth) ? canvasWidth : null,
    canvasHeight: Number.isFinite(canvasHeight) ? canvasHeight : null,
    videoWidth: Number.isFinite(videoWidth) ? videoWidth : null,
    videoHeight: Number.isFinite(videoHeight) ? videoHeight : null,
    x: dx,
    y: dy,
    contentX: dx + (Number(record.meta?.paddingX) || 0),
    contentY: dy + (Number(record.meta?.paddingY) || 0),
    width: dw,
    height: dh,
    right: dx + dw,
    bottom: dy + dh,
  };
};

const isOrdinaryMovingCandidate = (record, options) => {
  if (record.sourceKind && !String(record.sourceKind).includes("Canvas")) return false;
  if (!Number.isFinite(record.motionTimeMs) || !Number.isFinite(record.x) || !Number.isFinite(record.y)) {
    return false;
  }
  if (!Number.isFinite(record.sourceWidth) || !Number.isFinite(record.sourceHeight)) {
    return false;
  }
  if (record.sourceWidth <= 0 || record.sourceHeight <= 0) return false;
  if (record.sourceWidth > options.maxSourceWidth) return false;
  if (record.sourceHeight > options.maxSourceHeight) return false;
  if (record.sourceHeight < options.minSourceHeight) return false;
  if (record.width < options.minDrawWidth || record.height < options.minDrawHeight) return false;
  if (record.height > options.maxDrawHeight) return false;
  if (record.y < options.minY) return false;
  if (options.finalCanvasOnly) {
    const visibleWidth = record.videoWidth ?? record.canvasWidth ?? 0;
    const visibleHeight = record.videoHeight ?? record.canvasHeight ?? 0;
    if (visibleWidth <= 0 || visibleHeight <= 0) return false;
    if (!Number.isFinite(record.canvasWidth) || !Number.isFinite(record.canvasHeight)) return false;
    if (record.canvasWidth < visibleWidth * options.finalCanvasMinRatio) return false;
    if (record.canvasHeight < visibleHeight * options.finalCanvasMinRatio) return false;
  }
  const visibleWidth = record.videoWidth ?? record.canvasWidth ?? 0;
  if (visibleWidth > 0 && record.x < -visibleWidth * 1.4) return false;
  if (visibleWidth > 0 && record.x > visibleWidth * 1.8) return false;
  return true;
};

const makeTrajectorySeed = (record) => ({
  id: `${record.sourceCanvasId ?? record.canvasId ?? "canvas"}:${record.sequence}`,
  samples: [record],
  last: record,
});

const canLinkTrajectory = (trajectory, record, options) => {
  const last = trajectory.last;
  const dt = record.motionTimeMs - last.motionTimeMs;
  if (dt <= 0 || dt > options.maxLinkGapMs) return false;
  const dy = Math.abs(record.y - last.y);
  if (dy > options.maxLinkYDistance) return false;
  const dw = Math.abs(record.width - last.width);
  const dh = Math.abs(record.height - last.height);
  if (dw > options.maxLinkSizeDistance || dh > options.maxLinkSizeDistance) return false;
  const vx = (record.x - last.x) / dt;
  if (vx > options.maxLinkVelocityPxPerMs) return false;
  if (vx < -options.maxLinkVelocityPxPerMs) return false;
  if (Math.abs(record.sourceHeight - last.sourceHeight) > options.maxLinkSizeDistance) return false;
  return true;
};

const groupTrajectories = (records, options) => {
  const sorted = records
    .slice()
    .sort((a, b) => a.motionTimeMs - b.motionTimeMs || a.y - b.y || a.x - b.x || a.sequence - b.sequence);
  const active = [];
  const finished = [];
  for (const record of sorted) {
    let bestIndex = -1;
    let bestScore = Infinity;
    for (let index = 0; index < active.length; index += 1) {
      const trajectory = active[index];
      if (!canLinkTrajectory(trajectory, record, options)) continue;
      const last = trajectory.last;
      const score =
        Math.abs(record.y - last.y) * 6 +
        Math.abs(record.height - last.height) * 2 +
        Math.abs(record.width - last.width) * 0.25 +
        Math.abs(record.x - last.x);
      if (score < bestScore) {
        bestIndex = index;
        bestScore = score;
      }
    }
    if (bestIndex >= 0) {
      const trajectory = active[bestIndex];
      trajectory.samples.push(record);
      trajectory.last = record;
    } else {
      active.push(makeTrajectorySeed(record));
    }
    for (let index = active.length - 1; index >= 0; index -= 1) {
      if (record.motionTimeMs - active[index].last.motionTimeMs > options.maxLinkGapMs) {
        finished.push(active.splice(index, 1)[0]);
      }
    }
  }
  finished.push(...active);
  return finished
    .map(({ id, samples }) => {
      const sorted = samples
        .filter((sample) => Number.isFinite(sample.motionTimeMs) && Number.isFinite(sample.x))
        .sort((a, b) => a.motionTimeMs - b.motionTimeMs || a.sequence - b.sequence);
      if (sorted.length === 0) return null;
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const durationMs = last.motionTimeMs - first.motionTimeMs;
      const velocityPxPerSec =
        durationMs > 0 ? ((last.x - first.x) / durationMs) * 1000 : 0;
      return {
        id,
        samples: sorted,
        sampleCount: sorted.length,
        firstTimeMs: first.timeMs,
        lastTimeMs: last.timeMs,
        firstMotionTimeMs: first.motionTimeMs,
        lastMotionTimeMs: last.motionTimeMs,
        durationMs,
        firstX: first.x,
        lastX: last.x,
        velocityPxPerSec,
        avgY: average(sorted.map((sample) => sample.y)),
        medianY: percentile(sorted.map((sample) => sample.y), 0.5),
        sourceWidth: first.sourceWidth,
        sourceHeight: first.sourceHeight,
        drawWidth: average(sorted.map((sample) => sample.width)),
        drawHeight: average(sorted.map((sample) => sample.height)),
      };
    })
    .filter(Boolean);
};

const buildTrajectoryFromSamples = (id, samples) => {
  const sorted = samples
    .filter((sample) => Number.isFinite(sample.motionTimeMs) && Number.isFinite(sample.x))
    .sort((a, b) => a.motionTimeMs - b.motionTimeMs || a.sequence - b.sequence);
  if (sorted.length === 0) return null;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const durationMs = last.motionTimeMs - first.motionTimeMs;
  const velocityPxPerSec =
    durationMs > 0 ? ((last.x - first.x) / durationMs) * 1000 : 0;
  return {
    id,
    samples: sorted,
    sampleCount: sorted.length,
    firstTimeMs: first.timeMs,
    lastTimeMs: last.timeMs,
    firstMotionTimeMs: first.motionTimeMs,
    lastMotionTimeMs: last.motionTimeMs,
    durationMs,
    firstX: first.x,
    lastX: last.x,
    velocityPxPerSec,
    avgY: average(sorted.map((sample) => sample.y)),
    medianY: percentile(sorted.map((sample) => sample.y), 0.5),
    sourceWidth: first.sourceWidth,
    sourceHeight: first.sourceHeight,
    drawWidth: average(sorted.map((sample) => sample.width)),
    drawHeight: average(sorted.map((sample) => sample.height)),
  };
};

const groupTrajectoriesBySourceCanvas = (records, options) => {
  const grouped = new Map();
  const withoutSourceCanvas = [];
  for (const record of records) {
    if (record.sourceCanvasId == null) {
      withoutSourceCanvas.push(record);
      continue;
    }
    const key = String(record.sourceCanvasId);
    const list = grouped.get(key) ?? [];
    list.push(record);
    grouped.set(key, list);
  }
  const trajectories = [];
  for (const [key, samples] of grouped.entries()) {
    const sorted = samples
      .slice()
      .sort((a, b) => a.motionTimeMs - b.motionTimeMs || a.sequence - b.sequence);
    let chunk = [];
    let chunkIndex = 0;
    for (const sample of sorted) {
      const previous = chunk[chunk.length - 1];
      if (
        previous &&
        sample.motionTimeMs - previous.motionTimeMs > options.maxSourceCanvasGapMs
      ) {
        const trajectory = buildTrajectoryFromSamples(`${key}:${chunkIndex}`, chunk);
        if (trajectory) trajectories.push(trajectory);
        chunk = [];
        chunkIndex += 1;
      }
      chunk.push(sample);
    }
    const trajectory = buildTrajectoryFromSamples(`${key}:${chunkIndex}`, chunk);
    if (trajectory) trajectories.push(trajectory);
  }
  trajectories.push(...groupTrajectories(withoutSourceCanvas, options));
  return trajectories;
};

const filterMovingTrajectories = (trajectories, minVelocityPxPerSec, minSamples) =>
  trajectories.filter(
    (trajectory) =>
      trajectory.sampleCount >= minSamples &&
      Math.abs(trajectory.velocityPxPerSec) >= minVelocityPxPerSec,
  );

const inferLanePitch = (laneYs) => {
  const rounded = [...new Set(laneYs.map((value) => Math.round(value)).filter(Number.isFinite))]
    .sort((a, b) => a - b);
  const gaps = [];
  for (let index = 1; index < rounded.length; index += 1) {
    const gap = rounded[index] - rounded[index - 1];
    if (gap > 2) gaps.push(gap);
  }
  const likelyGaps = gaps.filter((gap) => gap >= 6 && gap <= 80);
  return {
    uniqueYCount: rounded.length,
    yMin: rounded[0] ?? null,
    yMax: rounded[rounded.length - 1] ?? null,
    gapP50: percentile(likelyGaps, 0.5),
    gapP05: percentile(likelyGaps, 0.05),
    gapP95: percentile(likelyGaps, 0.95),
    frequentGaps: summarizeBuckets(likelyGaps, 1, 12),
  };
};

const summarizeBuckets = (values, bucketSize, limit = 20) => {
  const buckets = new Map();
  for (const value of values) {
    if (!Number.isFinite(value)) continue;
    const bucket = Math.round(value / bucketSize) * bucketSize;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }
  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
};

const assignLaneIndices = (trajectories, pitchFallback) => {
  const ys = trajectories.map((trajectory) => trajectory.laneBasisY).filter(Number.isFinite);
  const y0 = percentile(ys, 0.02) ?? 0;
  const pitch = pitchFallback ?? inferLanePitch(ys).gapP50 ?? 1;
  return trajectories.map((trajectory) => ({
    ...trajectory,
    inferredLane: Math.max(0, Math.round((trajectory.laneBasisY - y0) / Math.max(1, pitch))),
    laneY0: y0,
    lanePitch: pitch,
  }));
};

const summarizeLaneUsage = (trajectories) => {
  const buckets = new Map();
  for (const trajectory of trajectories) {
    const lane = trajectory.inferredLane;
    const list = buckets.get(lane) ?? [];
    list.push(trajectory);
    buckets.set(lane, list);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([lane, list]) => ({
      lane,
      count: list.length,
      avgY: average(list.map((item) => item.medianY)),
      firstTimeMs: Math.min(...list.map((item) => item.firstTimeMs)),
      lastTimeMs: Math.max(...list.map((item) => item.firstTimeMs)),
      firstMotionTimeMs: Math.min(...list.map((item) => item.firstMotionTimeMs)),
      lastMotionTimeMs: Math.max(...list.map((item) => item.firstMotionTimeMs)),
      avgVelocityPxPerSec: average(list.map((item) => Math.abs(item.velocityPxPerSec))),
    }));
};

const summarizeLanePriorityTransitions = (trajectories) => {
  const ordered = trajectories
    .slice()
    .sort((a, b) => a.firstMotionTimeMs - b.firstMotionTimeMs || a.inferredLane - b.inferredLane);
  const transitions = [];
  for (let index = 1; index < ordered.length; index += 1) {
    transitions.push({
      from: ordered[index - 1].inferredLane,
      to: ordered[index].inferredLane,
      dtMs: ordered[index].firstMotionTimeMs - ordered[index - 1].firstMotionTimeMs,
    });
  }
  const pairBuckets = new Map();
  for (const transition of transitions) {
    if (transition.dtMs > 1200) continue;
    const key = `${transition.from}->${transition.to}`;
    pairBuckets.set(key, (pairBuckets.get(key) ?? 0) + 1);
  }
  return [...pairBuckets.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 24)
    .map(([pair, count]) => ({ pair, count }));
};

const buildReport = (records, options) => {
  const drawImages = records
    .filter((record) => record.op === "drawImage")
    .map((record) => normalizeDrawImage(record, options.source))
    .filter(Boolean);
  const candidates = drawImages.filter((record) => isOrdinaryMovingCandidate(record, options));
  const allTrajectories =
    options.groupBySourceCanvas
      ? groupTrajectoriesBySourceCanvas(candidates, options)
      : groupTrajectories(candidates, options);
  const movingTrajectories = filterMovingTrajectories(
    allTrajectories,
    options.minVelocityPxPerSec,
    options.minSamples,
  ).map((trajectory) => {
    const medianContentY = percentile(
      trajectory.samples.map((sample) => sample.contentY),
      0.5,
    );
    const laneBasisY = options.basis === "content" && Number.isFinite(medianContentY)
      ? medianContentY
      : trajectory.medianY;
    return {
      ...trajectory,
      medianContentY,
      laneBasisY,
    };
  });
  const lanePitchSummary = inferLanePitch(
    movingTrajectories.map((trajectory) => trajectory.laneBasisY),
  );
  const lanePitch = options.lanePitch > 0 ? options.lanePitch : lanePitchSummary.gapP50;
  const lanes = assignLaneIndices(movingTrajectories, lanePitch);
  return {
    input: {
      trace: options.tracePath,
      source: options.source,
    },
    filters: {
      maxSourceWidth: options.maxSourceWidth,
      maxSourceHeight: options.maxSourceHeight,
      minSourceHeight: options.minSourceHeight,
      maxDrawHeight: options.maxDrawHeight,
      minY: options.minY,
      finalCanvasOnly: options.finalCanvasOnly,
      groupBySourceCanvas: options.groupBySourceCanvas,
      basis: options.basis,
      minVelocityPxPerSec: options.minVelocityPxPerSec,
      minSamples: options.minSamples,
      maxSourceCanvasGapMs: options.maxSourceCanvasGapMs,
    },
    counts: {
      records: records.length,
      drawImages: drawImages.length,
      candidates: candidates.length,
      trajectories: allTrajectories.length,
      movingTrajectories: movingTrajectories.length,
    },
    lanePitch: lanePitchSummary,
    laneUsage: summarizeLaneUsage(lanes),
    lanePriorityTransitions: summarizeLanePriorityTransitions(lanes),
    yBuckets: summarizeBuckets(
      movingTrajectories.map((trajectory) => trajectory.medianY),
      options.yBucketSize,
      40,
    ),
    trajectorySamples: lanes
      .slice()
      .sort((a, b) => a.firstMotionTimeMs - b.firstMotionTimeMs || a.inferredLane - b.inferredLane)
      .slice(0, options.sampleLimit)
      .map((trajectory) => ({
        id: trajectory.id,
        firstTimeMs: Math.round(trajectory.firstTimeMs),
        lastTimeMs: Math.round(trajectory.lastTimeMs),
        firstMotionTimeMs: Math.round(trajectory.firstMotionTimeMs),
        lastMotionTimeMs: Math.round(trajectory.lastMotionTimeMs),
        inferredLane: trajectory.inferredLane,
        medianY: Number(trajectory.medianY?.toFixed(3)),
        medianContentY: Number(trajectory.medianContentY?.toFixed(3)),
        laneBasisY: Number(trajectory.laneBasisY?.toFixed(3)),
        sourceSize: `${Math.round(trajectory.sourceWidth)}x${Math.round(trajectory.sourceHeight)}`,
        drawSize: `${Math.round(trajectory.drawWidth ?? 0)}x${Math.round(trajectory.drawHeight ?? 0)}`,
        velocityPxPerSec: Number(trajectory.velocityPxPerSec.toFixed(3)),
        sampleCount: trajectory.sampleCount,
      })),
    inferredAlgorithmNotes: [
      "moving small drawImage trajectories are treated as ordinary naka comment candidates",
      "lane index is inferred from median drawImage.y using the observed p50 y-gap as lane pitch",
      "frequent short-interval lane transitions are a proxy for the player lane priority order",
      "compare this report with overlay trace to decide whether CO should prefer lowest-index free lane, earliest reusable lane, or another priority order",
    ],
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.trace) {
    throw new Error("Usage: node scripts/nico-lane-reverse.mjs --trace trace.jsonl --out report.json");
  }
  const options = {
    tracePath: resolve(args.trace),
    source: args.source || "niconico-player",
    maxSourceWidth: numberArg(args, "max-source-width", 900),
    maxSourceHeight: numberArg(args, "max-source-height", 90),
    minSourceHeight: numberArg(args, "min-source-height", 12),
    maxDrawHeight: numberArg(args, "max-draw-height", 180),
    minDrawWidth: numberArg(args, "min-draw-width", 4),
    minDrawHeight: numberArg(args, "min-draw-height", 4),
    minY: numberArg(args, "min-y", -4),
    finalCanvasOnly: args["final-canvas-only"] !== "false",
    finalCanvasMinRatio: numberArg(args, "final-canvas-min-ratio", 0.8),
    groupBySourceCanvas: args["group-by-source-canvas"] !== "false",
    maxSourceCanvasGapMs: numberArg(args, "max-source-canvas-gap-ms", 1200),
    basis: args.basis === "draw" ? "draw" : "content",
    minVelocityPxPerSec: numberArg(args, "min-velocity", 20),
    minSamples: numberArg(args, "min-samples", 2),
    maxLinkGapMs: numberArg(args, "max-link-gap-ms", 180),
    maxLinkYDistance: numberArg(args, "max-link-y-distance", 4),
    maxLinkSizeDistance: numberArg(args, "max-link-size-distance", 12),
    maxLinkVelocityPxPerMs: numberArg(args, "max-link-velocity-px-per-ms", 2),
    lanePitch: numberArg(args, "lane-pitch", 0),
    yBucketSize: numberArg(args, "y-bucket-size", 2),
    sampleLimit: numberArg(args, "sample-limit", 80),
  };
  const records = await readJsonl(options.tracePath);
  const report = buildReport(records, options);
  const output = JSON.stringify(report, null, 2);
  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output);
  }
  console.log(output);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

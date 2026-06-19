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

const readJsonl = async (path) => {
  const text = await readFile(path, "utf8");
  return text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
};

const median = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

const average = (values) => {
  const finite = values.filter(Number.isFinite);
  return finite.length > 0 ? finite.reduce((sum, value) => sum + value, 0) / finite.length : null;
};

const drawDest = (record) => {
  const args = Array.isArray(record.args) ? record.args.map(Number) : [];
  if (args.length === 2) return { x: args[0], y: args[1], width: record.sourceWidth, height: record.sourceHeight };
  if (args.length === 4) return { x: args[0], y: args[1], width: args[2], height: args[3] };
  if (args.length >= 8) return { x: args[4], y: args[5], width: args[6], height: args[7] };
  return null;
};

const probeTextInfo = (text) => {
  const match = /^LANE_PROBE_(dt-\d+)_([A-Z])(?:$|_)/u.exec(String(text ?? ""));
  if (!match) return null;
  return {
    caseId: match[1],
    role: match[2],
    dtMs: Number(match[1].slice(3)),
  };
};

const normalizeDraw = (record) => {
  if (record.op !== "drawImage") return null;
  const info = probeTextInfo(record.sourceCanvasText?.text);
  if (!info) return null;
  const dest = drawDest(record);
  const transform = Array.isArray(record.transform) ? record.transform.map(Number) : [];
  if (!dest || transform.length < 6) return null;
  const [a, b, c, d, e, f] = transform;
  return {
    ...info,
    text: record.sourceCanvasText.text,
    probeCaseId: record.probeCaseId ?? info.caseId,
    probeDtMs: Number(record.probeDtMs ?? info.dtMs),
    sequence: Number(record.sequence),
    timestampMs: Number(record.timestampMs),
    videoCurrentTimeMs: Number(record.videoCurrentTimeMs),
    sourceCanvasId: record.sourceCanvasId,
    sourceWidth: Number(record.sourceWidth),
    sourceHeight: Number(record.sourceHeight),
    drawWidth: Number(dest.width),
    drawHeight: Number(dest.height),
    transformX: e,
    transformY: f,
    layerX: a * Number(dest.x) + c * Number(dest.y) + e,
    layerY: b * Number(dest.x) + d * Number(dest.y) + f,
    destX: Number(dest.x),
    destY: Number(dest.y),
    fontSize: Number(record.sourceCanvasText?.fontSize),
    canvasText: record.sourceCanvasText,
  };
};

const summarizeTrajectory = (samples) => {
  const sorted = samples
    .slice()
    .sort((a, b) => a.timestampMs - b.timestampMs || a.sequence - b.sequence);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const durationMs = last.timestampMs - first.timestampMs;
  const videoDurationMs = last.videoCurrentTimeMs - first.videoCurrentTimeMs;
  return {
    caseId: first.caseId,
    role: first.role,
    dtMs: first.probeDtMs,
    text: first.text,
    sampleCount: sorted.length,
    firstVideoCurrentTimeMs: first.videoCurrentTimeMs,
    lastVideoCurrentTimeMs: last.videoCurrentTimeMs,
    firstTimestampMs: first.timestampMs,
    lastTimestampMs: last.timestampMs,
    medianLaneY: median(sorted.map((sample) => sample.transformY)),
    medianLayerY: median(sorted.map((sample) => sample.layerY)),
    medianDestY: median(sorted.map((sample) => sample.destY)),
    medianX: median(sorted.map((sample) => sample.transformX)),
    sourceWidth: first.sourceWidth,
    sourceHeight: first.sourceHeight,
    drawWidth: average(sorted.map((sample) => sample.drawWidth)),
    drawHeight: average(sorted.map((sample) => sample.drawHeight)),
    fontSize: first.fontSize,
    velocityPxPerSec:
      durationMs > 0 ? ((last.transformX - first.transformX) / durationMs) * 1000 : null,
    velocityPxPerVideoSec:
      videoDurationMs > 0
        ? ((last.transformX - first.transformX) / videoDurationMs) * 1000
        : null,
  };
};

const assignCaseLanes = (trajectories, laneMergePx) => {
  const byCase = new Map();
  for (const trajectory of trajectories) {
    const list = byCase.get(trajectory.caseId) ?? [];
    list.push(trajectory);
    byCase.set(trajectory.caseId, list);
  }
  const cases = [];
  for (const [caseId, list] of byCase.entries()) {
    const laneCenters = [];
    const withLanes = list
      .slice()
      .sort((a, b) => a.medianLaneY - b.medianLaneY || a.role.localeCompare(b.role))
      .map((trajectory) => {
        let lane = laneCenters.findIndex((center) => Math.abs(center - trajectory.medianLaneY) <= laneMergePx);
        if (lane < 0) {
          lane = laneCenters.length;
          laneCenters.push(trajectory.medianLaneY);
        }
        return { ...trajectory, inferredLane: lane };
      })
      .sort((a, b) => a.role.localeCompare(b.role));
    const byRole = Object.fromEntries(withLanes.map((trajectory) => [trajectory.role, trajectory]));
    cases.push({
      caseId,
      dtMs: Number(withLanes[0]?.dtMs ?? caseId.slice(3)),
      sameLane: byRole.A && byRole.B ? byRole.A.inferredLane === byRole.B.inferredLane : null,
      laneSequence: withLanes.map((trajectory) => ({
        role: trajectory.role,
        lane: trajectory.inferredLane,
        medianLaneY: Number(trajectory.medianLaneY.toFixed(3)),
        sourceSize: `${Math.round(trajectory.sourceWidth)}x${Math.round(trajectory.sourceHeight)}`,
        velocityPxPerSec: Number(trajectory.velocityPxPerSec?.toFixed(3)),
        velocityPxPerVideoSec: Number(trajectory.velocityPxPerVideoSec?.toFixed(3)),
      })),
      trajectories: withLanes,
    });
  }
  return cases.sort((a, b) => a.dtMs - b.dtMs);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.trace) {
    throw new Error("Usage: node scripts/nico-blackbox-lane-extract.mjs --trace trace.jsonl --out report.json");
  }
  const tracePath = resolve(args.trace);
  const laneMergePx = numberArg(args, "lane-merge-px", 12);
  const records = await readJsonl(tracePath);
  const draws = records.map(normalizeDraw).filter(Boolean);
  const grouped = new Map();
  for (const draw of draws) {
    const key = `${draw.caseId}:${draw.role}:${draw.sourceCanvasId}`;
    const list = grouped.get(key) ?? [];
    list.push(draw);
    grouped.set(key, list);
  }
  const trajectories = [...grouped.values()]
    .map(summarizeTrajectory)
    .filter((trajectory) => trajectory.sampleCount > 0 && Number.isFinite(trajectory.medianLaneY));
  const report = {
    input: { trace: tracePath },
    counts: {
      records: records.length,
      probeDraws: draws.length,
      trajectories: trajectories.length,
      cases: new Set(trajectories.map((trajectory) => trajectory.caseId)).size,
    },
    laneBasis: {
      field: "transform[5]",
      note: "For CDP blackbox probes, transform[5] is the official layer lane anchor; destY is texture padding.",
      laneMergePx,
    },
    cases: assignCaseLanes(trajectories, laneMergePx),
  };
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

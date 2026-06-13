#!/usr/bin/env bun
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const parseArgs = (argv) => {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const equalsIndex = token.indexOf("=");
    if (equalsIndex >= 0) {
      result[token.slice(2, equalsIndex)] = token.slice(equalsIndex + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      result[key] = next;
      index += 1;
    } else {
      result[key] = "true";
    }
  }
  return result;
};

const readJsonl = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSONL at ${filePath}:${index + 1}: ${error.message}`);
      }
    });
};

const summarizeByOp = (records) => {
  const summary = new Map();
  for (const record of records) {
    const op = record.op || "unknown";
    summary.set(op, (summary.get(op) || 0) + 1);
  }
  return Array.from(summary.entries()).sort((a, b) => a[0].localeCompare(b[0]));
};

const normalizeTextRecord = (record, index) => ({
  index,
  op: record.op,
  text: String(record.text || ""),
  x: Number(record.x),
  y: Number(record.y),
  font: record.font || "",
  fillStyle: record.fillStyle || "",
  strokeStyle: record.strokeStyle || "",
  lineWidth: Number(record.lineWidth),
  canvasWidth: Number(record.canvasWidth),
  canvasHeight: Number(record.canvasHeight),
  globalAlpha: Number(record.globalAlpha ?? 1),
  raw: record,
});

const getComparableTextRecords = (records) =>
  records
    .map(normalizeTextRecord)
    .filter(
      (record) =>
        (record.op === "fillText" || record.op === "strokeText") &&
        record.text.length > 0 &&
        Number.isFinite(record.x) &&
        Number.isFinite(record.y),
    );

const getTextRecordMatchScore = (real, overlay) => {
  const dx = overlay.x - real.x;
  const dy = overlay.y - real.y;
  let score = Math.hypot(dx, dy);
  if (real.op !== overlay.op) {
    score += 500;
  }
  if (real.font !== overlay.font) {
    score += 180;
  }
  if (real.fillStyle !== overlay.fillStyle) {
    score += 120;
  }
  if (real.strokeStyle !== overlay.strokeStyle) {
    score += 90;
  }
  if (
    Number.isFinite(real.canvasWidth) &&
    Number.isFinite(overlay.canvasWidth) &&
    real.canvasWidth !== overlay.canvasWidth
  ) {
    score += 90;
  }
  if (
    Number.isFinite(real.canvasHeight) &&
    Number.isFinite(overlay.canvasHeight) &&
    real.canvasHeight !== overlay.canvasHeight
  ) {
    score += 90;
  }
  return score;
};

const getTextBucketKey = (record) => `${record.op}\u0000${record.text}`;

const matchTextRecords = (realRecords, overlayRecords) => {
  const overlayBuckets = new Map();
  for (const record of overlayRecords) {
    const key = getTextBucketKey(record);
    const bucket = overlayBuckets.get(key) || [];
    bucket.push(record);
    overlayBuckets.set(key, bucket);
  }

  const matches = [];
  const unmatchedReal = [];

  for (const real of realRecords) {
    const bucket = overlayBuckets.get(getTextBucketKey(real)) || [];
    if (bucket.length === 0) {
      unmatchedReal.push(real);
      continue;
    }
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = 0; index < bucket.length; index += 1) {
      const candidate = bucket[index];
      const score = getTextRecordMatchScore(real, candidate);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
    const [overlay] = bucket.splice(bestIndex, 1);
    const dx = overlay.x - real.x;
    const dy = overlay.y - real.y;
    matches.push({
      text: real.text,
      real,
      overlay,
      dx,
      dy,
      distance: Math.hypot(dx, dy),
      fontEqual: real.font === overlay.font,
      fillEqual: real.fillStyle === overlay.fillStyle,
      strokeEqual: real.strokeStyle === overlay.strokeStyle,
      lineWidthEqual:
        !Number.isFinite(real.lineWidth) ||
        !Number.isFinite(overlay.lineWidth) ||
        Math.abs(real.lineWidth - overlay.lineWidth) < 0.01,
    });
  }

  const unmatchedOverlay = Array.from(overlayBuckets.values()).flat();
  return { matches, unmatchedReal, unmatchedOverlay };
};

const average = (values) => {
  if (values.length === 0) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const percentile = (values, ratio) => {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
};

const formatNumber = (value) => (value === null ? "n/a" : value.toFixed(3));

const normalizeDrawImageRecord = (record, index) => {
  if (record.op !== "drawImage") {
    return null;
  }

  const toVideoLocal = (x, y) => {
    const rect = record.videoRect;
    if (
      rect &&
      Number.isFinite(Number(rect.left)) &&
      Number.isFinite(Number(rect.top)) &&
      record.source === "niconico-player"
    ) {
      return {
        x: x - Number(rect.left),
        y: y - Number(rect.top),
      };
    }
    return { x, y };
  };

  if (
    Number.isFinite(Number(record.x)) &&
    Number.isFinite(Number(record.y)) &&
    Number.isFinite(Number(record.width)) &&
    Number.isFinite(Number(record.height))
  ) {
    const local = toVideoLocal(Number(record.x), Number(record.y));
    const paddingX = Number(record.meta?.paddingX ?? 0);
    const paddingY = Number(record.meta?.paddingY ?? 0);
    return {
      index,
      x: local.x,
      y: local.y,
      contentX: local.x + (Number.isFinite(paddingX) ? paddingX : 0),
      contentY: local.y + (Number.isFinite(paddingY) ? paddingY : 0),
      width: Number(record.width),
      height: Number(record.height),
      timeMs: Number(record.videoCurrentTimeMs ?? record.frameTimeMs ?? record.timestampMs),
      sourceWidth: Number(record.sourceWidth ?? record.width),
      sourceHeight: Number(record.sourceHeight ?? record.height),
      canvasWidth: Number(record.canvasWidth),
      canvasHeight: Number(record.canvasHeight),
      raw: record,
    };
  }

  const args = Array.isArray(record.args) ? record.args.map(Number) : [];
  let dx;
  let dy;
  let width;
  let height;
  if (args.length >= 8) {
    dx = args[args.length - 4];
    dy = args[args.length - 3];
    width = args[args.length - 2];
    height = args[args.length - 1];
  } else if (args.length >= 4) {
    dx = args[1];
    dy = args[2];
    width = args[3];
    height = args[4];
  }

  if (
    !Number.isFinite(dx) ||
    !Number.isFinite(dy) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }

  const transform = Array.isArray(record.transform) ? record.transform.map(Number) : [];
  const scaleX = Number.isFinite(transform[0]) ? transform[0] : 1;
  const scaleY = Number.isFinite(transform[3]) ? transform[3] : 1;
  const translateX = Number.isFinite(transform[4]) ? transform[4] : 0;
  const translateY = Number.isFinite(transform[5]) ? transform[5] : 0;

  const local = toVideoLocal(dx * scaleX + translateX, dy * scaleY + translateY);

  const paddingX = Number(record.meta?.paddingX ?? 0);
  const paddingY = Number(record.meta?.paddingY ?? 0);
  return {
    index,
    x: local.x,
    y: local.y,
    contentX: local.x + (Number.isFinite(paddingX) ? paddingX : 0),
    contentY: local.y + (Number.isFinite(paddingY) ? paddingY : 0),
    width: width * scaleX,
    height: height * scaleY,
    timeMs: Number(record.videoCurrentTimeMs ?? record.frameTimeMs ?? record.timestampMs),
    sourceWidth: Number(record.sourceWidth ?? width),
    sourceHeight: Number(record.sourceHeight ?? height),
    canvasWidth: Number(record.canvasWidth),
    canvasHeight: Number(record.canvasHeight),
    raw: record,
  };
};

const getComparableDrawImageRecords = (records) =>
  records.map(normalizeDrawImageRecord).filter(Boolean);

const dimensionKey = (record) => `${Math.round(record.sourceWidth)}x${Math.round(record.sourceHeight)}`;

const isSingleLineText = (value) => typeof value === "string" && value.length > 0 && !value.includes("\n");

const isOverlayOrdinaryDrawImage = (record) => {
  const comment = record.raw.comment;
  if (!comment || !isSingleLineText(comment.text)) {
    return false;
  }
  if (record.sourceWidth > 900 || record.sourceHeight > 220) {
    return false;
  }
  return comment.layout === "naka" || comment.layout === "ue" || comment.layout === "shita";
};

const isRealSmallDrawImage = (record) =>
  record.raw.source === "niconico-player" &&
  record.sourceWidth >= 40 &&
  record.sourceWidth <= 900 &&
  record.sourceHeight >= 60 &&
  record.sourceHeight <= 220;

const summarizeTopDimensions = (records, limit = 30) => {
  const buckets = new Map();
  for (const record of records) {
    const key = dimensionKey(record);
    const bucket = buckets.get(key) || {
      key,
      count: 0,
      avgX: 0,
      avgY: 0,
      avgWidth: 0,
      avgHeight: 0,
    };
    bucket.count += 1;
    bucket.avgX += record.x;
    bucket.avgY += record.y;
    bucket.avgWidth += record.width;
    bucket.avgHeight += record.height;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      avgX: bucket.avgX / bucket.count,
      avgY: bucket.avgY / bucket.count,
      avgWidth: bucket.avgWidth / bucket.count,
      avgHeight: bucket.avgHeight / bucket.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const summarizeDrawImagePopulation = (records, source) => {
  const trajectories = fitDrawImageTrajectories(records, source);
  const trajectoryVelocities = trajectories.map((trajectory) =>
    Math.abs(trajectory.velocityPxPerSec),
  );
  const contentXValues = records.map((record) => record.contentX ?? record.x);
  const contentYValues = records.map((record) => record.contentY ?? record.y);
  return {
    count: records.length,
    avgSourceWidth: average(records.map((record) => record.sourceWidth)),
    avgSourceHeight: average(records.map((record) => record.sourceHeight)),
    p50SourceWidth: percentile(records.map((record) => record.sourceWidth), 0.5),
    p95SourceWidth: percentile(records.map((record) => record.sourceWidth), 0.95),
    avgDrawWidth: average(records.map((record) => record.width)),
    avgDrawHeight: average(records.map((record) => record.height)),
    avgX: average(contentXValues),
    avgY: average(contentYValues),
    p05Y: percentile(contentYValues, 0.05),
    p95Y: percentile(contentYValues, 0.95),
    trajectoryCount: trajectories.length,
    avgVelocityPxPerSec: average(trajectoryVelocities),
    p95VelocityPxPerSec: percentile(trajectoryVelocities, 0.95),
  };
};

const matchDrawImageRecords = (realRecords, overlayRecords) => {
  const overlayBuckets = new Map();
  for (const record of overlayRecords.filter((item) => Number.isFinite(item.timeMs))) {
    const bucket = overlayBuckets.get(dimensionKey(record)) || [];
    bucket.push(record);
    overlayBuckets.set(dimensionKey(record), bucket);
  }
  for (const bucket of overlayBuckets.values()) {
    bucket.sort((a, b) => a.timeMs - b.timeMs);
  }

  const matches = [];
  let unmatchedReal = 0;
  for (const real of realRecords.filter((item) => Number.isFinite(item.timeMs))) {
    const bucket = overlayBuckets.get(dimensionKey(real)) || [];
    if (bucket.length === 0) {
      unmatchedReal += 1;
      continue;
    }
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let index = 0; index < bucket.length; index += 1) {
      const overlay = bucket[index];
      const dt = Math.abs(overlay.timeMs - real.timeMs);
      if (dt > 150) {
        continue;
      }
      const dx = overlay.x - real.x;
      const dy = overlay.y - real.y;
      const score = dt * 0.5 + Math.hypot(dx, dy);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
    if (bestIndex < 0) {
      unmatchedReal += 1;
      continue;
    }
    const [overlay] = bucket.splice(bestIndex, 1);
    matches.push({
      key: dimensionKey(real),
      real,
      overlay,
      dt: overlay.timeMs - real.timeMs,
      dx: overlay.x - real.x,
      dy: overlay.y - real.y,
      distance: Math.hypot(overlay.x - real.x, overlay.y - real.y),
    });
  }

  const unmatchedOverlay = Array.from(overlayBuckets.values()).reduce(
    (sum, bucket) => sum + bucket.length,
    0,
  );
  return { matches, unmatchedReal, unmatchedOverlay };
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const renderSummaryTable = (title, rows) => `
  <section>
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr><th>op</th><th>count</th></tr></thead>
      <tbody>
        ${rows
          .map(([op, count]) => `<tr><td>${escapeHtml(op)}</td><td>${count}</td></tr>`)
          .join("\n")}
      </tbody>
    </table>
  </section>
`;

const renderTopDeltas = (matches) => {
  const rows = [...matches]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 100)
    .map(
      (match) => `
        <tr>
          <td><code>${escapeHtml(match.text.slice(0, 80))}</code></td>
          <td>${formatNumber(match.dx)}</td>
          <td>${formatNumber(match.dy)}</td>
          <td>${formatNumber(match.distance)}</td>
          <td>${escapeHtml(match.real.font)}</td>
          <td>${escapeHtml(match.overlay.font)}</td>
        </tr>`,
    )
    .join("\n");

  return `
    <section>
      <h2>Largest text-coordinate deltas</h2>
      <table>
        <thead>
          <tr><th>text</th><th>dx</th><th>dy</th><th>distance</th><th>real font</th><th>overlay font</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
};

const renderDrawImageDimensionComparison = (realDrawImages, overlayDrawImages) => {
  const realBuckets = summarizeTopDimensions(realDrawImages);
  const overlayBuckets = summarizeTopDimensions(overlayDrawImages);
  const overlayByKey = new Map(overlayBuckets.map((bucket) => [bucket.key, bucket]));
  const rows = realBuckets
    .map((real) => {
      const overlay = overlayByKey.get(real.key);
      return `
        <tr>
          <td><code>${escapeHtml(real.key)}</code></td>
          <td>${real.count}</td>
          <td>${overlay?.count ?? 0}</td>
          <td>${formatNumber(real.avgX)}</td>
          <td>${formatNumber(overlay ? overlay.avgX : null)}</td>
          <td>${formatNumber(real.avgY)}</td>
          <td>${formatNumber(overlay ? overlay.avgY : null)}</td>
          <td>${formatNumber(real.avgWidth)}</td>
          <td>${formatNumber(overlay ? overlay.avgWidth : null)}</td>
          <td>${formatNumber(real.avgHeight)}</td>
          <td>${formatNumber(overlay ? overlay.avgHeight : null)}</td>
        </tr>`;
    })
    .join("\n");

  return `
    <section>
      <h2>Top drawImage source dimensions</h2>
      <table>
        <thead>
          <tr>
            <th>source size</th>
            <th>real count</th>
            <th>overlay count</th>
            <th>real avg x</th>
            <th>overlay avg x</th>
            <th>real avg y</th>
            <th>overlay avg y</th>
            <th>real avg width</th>
            <th>overlay avg width</th>
            <th>real avg height</th>
            <th>overlay avg height</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
};

const renderDrawImageMatchSummary = (matchResult) => {
  const distances = matchResult.matches.map((match) => match.distance);
  const dxValues = matchResult.matches.map((match) => Math.abs(match.dx));
  const dyValues = matchResult.matches.map((match) => Math.abs(match.dy));
  const dtValues = matchResult.matches.map((match) => Math.abs(match.dt));
  const rows = [...matchResult.matches]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 80)
    .map(
      (match) => `
        <tr>
          <td><code>${escapeHtml(match.key)}</code></td>
          <td>${formatNumber(match.dt)}</td>
          <td>${formatNumber(match.dx)}</td>
          <td>${formatNumber(match.dy)}</td>
          <td>${formatNumber(match.distance)}</td>
          <td>${formatNumber(match.real.timeMs)}</td>
          <td>${formatNumber(match.overlay.timeMs)}</td>
        </tr>`,
    )
    .join("\n");

  return `
    <section>
      <h2>drawImage time/position match</h2>
      <section class="metric">
        <div><strong>matched drawImage</strong><br>${matchResult.matches.length}</div>
        <div><strong>unmatched real drawImage</strong><br>${matchResult.unmatchedReal}</div>
        <div><strong>unmatched overlay drawImage</strong><br>${matchResult.unmatchedOverlay}</div>
        <div><strong>avg |dt|</strong><br>${formatNumber(average(dtValues))}</div>
        <div><strong>avg |dx|</strong><br>${formatNumber(average(dxValues))}</div>
        <div><strong>avg |dy|</strong><br>${formatNumber(average(dyValues))}</div>
        <div><strong>p95 distance</strong><br>${formatNumber(percentile(distances, 0.95))}</div>
      </section>
      <table>
        <thead>
          <tr><th>source size</th><th>dt</th><th>dx</th><th>dy</th><th>distance</th><th>real time</th><th>overlay time</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
};

const getDrawImageTrajectoryId = (record, source) => {
  const sourceSize = dimensionKey(record);
  if (source === "real") {
    return `${record.raw.sourceCanvasId ?? record.index}|${sourceSize}`;
  }
  return `${record.raw.comment?.creationIndex ?? record.index}|${sourceSize}`;
};

const fitDrawImageTrajectories = (records, source) => {
  const buckets = new Map();
  for (const record of records.filter((item) => Number.isFinite(item.timeMs))) {
    const id = getDrawImageTrajectoryId(record, source);
    const bucket = buckets.get(id) || [];
    bucket.push(record);
    buckets.set(id, bucket);
  }

  return Array.from(buckets.entries())
    .map(([id, bucket]) => {
      bucket.sort((a, b) => a.timeMs - b.timeMs);
      const count = bucket.length;
      const startTimeMs = bucket[0].timeMs;
      let sumT = 0;
      let sumX = 0;
      let sumTT = 0;
      let sumTX = 0;
      let sumY = 0;
      for (const record of bucket) {
        const t = (record.timeMs - startTimeMs) / 1000;
        sumT += t;
        sumX += record.x;
        sumTT += t * t;
        sumTX += t * record.x;
        sumY += record.y;
      }
      const denominator = count * sumTT - sumT * sumT;
      const velocityPxPerSec =
        Math.abs(denominator) > Number.EPSILON
          ? (count * sumTX - sumT * sumX) / denominator
          : 0;
      return {
        id,
        key: id.split("|").slice(1).join("|"),
        count,
        startTimeMs,
        endTimeMs: bucket[bucket.length - 1].timeMs,
        startX: bucket[0].x,
        endX: bucket[bucket.length - 1].x,
        avgY: sumY / count,
        velocityPxPerSec,
      };
    })
    .filter((trajectory) => trajectory.count >= 40);
};

const summarizeTrajectoryBuckets = (trajectories) => {
  const buckets = new Map();
  for (const trajectory of trajectories) {
    const bucket = buckets.get(trajectory.key) || {
      key: trajectory.key,
      count: 0,
      avgStartTimeMs: 0,
      avgEndTimeMs: 0,
      avgStartX: 0,
      avgEndX: 0,
      avgY: 0,
      avgVelocityPxPerSec: 0,
    };
    bucket.count += 1;
    bucket.avgStartTimeMs += trajectory.startTimeMs;
    bucket.avgEndTimeMs += trajectory.endTimeMs;
    bucket.avgStartX += trajectory.startX;
    bucket.avgEndX += trajectory.endX;
    bucket.avgY += trajectory.avgY;
    bucket.avgVelocityPxPerSec += trajectory.velocityPxPerSec;
    buckets.set(trajectory.key, bucket);
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      avgStartTimeMs: bucket.avgStartTimeMs / bucket.count,
      avgEndTimeMs: bucket.avgEndTimeMs / bucket.count,
      avgStartX: bucket.avgStartX / bucket.count,
      avgEndX: bucket.avgEndX / bucket.count,
      avgY: bucket.avgY / bucket.count,
      avgVelocityPxPerSec: bucket.avgVelocityPxPerSec / bucket.count,
    }))
    .sort((a, b) => b.count - a.count);
};

const renderDrawImageTrajectoryComparison = (realDrawImages, overlayDrawImages) => {
  const realBuckets = summarizeTrajectoryBuckets(fitDrawImageTrajectories(realDrawImages, "real"));
  const overlayBuckets = summarizeTrajectoryBuckets(
    fitDrawImageTrajectories(overlayDrawImages, "overlay"),
  );
  const overlayByKey = new Map(overlayBuckets.map((bucket) => [bucket.key, bucket]));
  const rows = realBuckets
    .slice(0, 30)
    .map((real) => {
      const overlay = overlayByKey.get(real.key);
      const velocityRatio =
        overlay && Math.abs(overlay.avgVelocityPxPerSec) > Number.EPSILON
          ? Math.abs(real.avgVelocityPxPerSec / overlay.avgVelocityPxPerSec)
          : null;
      return `
        <tr>
          <td><code>${escapeHtml(real.key)}</code></td>
          <td>${real.count}</td>
          <td>${overlay?.count ?? 0}</td>
          <td>${formatNumber(real.avgVelocityPxPerSec)}</td>
          <td>${formatNumber(overlay ? overlay.avgVelocityPxPerSec : null)}</td>
          <td>${formatNumber(velocityRatio)}</td>
          <td>${formatNumber(real.avgY)}</td>
          <td>${formatNumber(overlay ? overlay.avgY : null)}</td>
          <td>${formatNumber(real.avgStartX)}</td>
          <td>${formatNumber(overlay ? overlay.avgStartX : null)}</td>
          <td>${formatNumber(real.avgEndX)}</td>
          <td>${formatNumber(overlay ? overlay.avgEndX : null)}</td>
        </tr>`;
    })
    .join("\n");

  return `
    <section>
      <h2>drawImage trajectory fit</h2>
      <table>
        <thead>
          <tr>
            <th>source size</th>
            <th>real trajectories</th>
            <th>overlay trajectories</th>
            <th>real velocity</th>
            <th>overlay velocity</th>
            <th>velocity ratio</th>
            <th>real avg y</th>
            <th>overlay avg y</th>
            <th>real start x</th>
            <th>overlay start x</th>
            <th>real end x</th>
            <th>overlay end x</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
};

const summarizeTopContentDimensions = (records, limit = 12) => {
  const buckets = new Map();
  for (const record of records) {
    const key = dimensionKey(record);
    const bucket = buckets.get(key) || {
      key,
      count: 0,
      avgX: 0,
      avgY: 0,
      avgWidth: 0,
      avgHeight: 0,
    };
    bucket.count += 1;
    bucket.avgX += record.contentX ?? record.x;
    bucket.avgY += record.contentY ?? record.y;
    bucket.avgWidth += record.width;
    bucket.avgHeight += record.height;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.values())
    .map((bucket) => ({
      ...bucket,
      avgX: bucket.avgX / bucket.count,
      avgY: bucket.avgY / bucket.count,
      avgWidth: bucket.avgWidth / bucket.count,
      avgHeight: bucket.avgHeight / bucket.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

const renderContentDimensionBucketRows = (records, limit = 12) =>
  summarizeTopContentDimensions(records, limit)
    .map(
      (bucket) => `
        <tr>
          <td><code>${escapeHtml(bucket.key)}</code></td>
          <td>${bucket.count}</td>
          <td>${formatNumber(bucket.avgX)}</td>
          <td>${formatNumber(bucket.avgY)}</td>
          <td>${formatNumber(bucket.avgWidth)}</td>
          <td>${formatNumber(bucket.avgHeight)}</td>
        </tr>`,
    )
    .join("\n");

const renderPopulationSummaryRow = (label, summary) => `
  <tr>
    <td>${escapeHtml(label)}</td>
    <td>${summary.count}</td>
    <td>${formatNumber(summary.avgSourceWidth)}</td>
    <td>${formatNumber(summary.avgSourceHeight)}</td>
    <td>${formatNumber(summary.p50SourceWidth)}</td>
    <td>${formatNumber(summary.p95SourceWidth)}</td>
    <td>${formatNumber(summary.avgDrawWidth)}</td>
    <td>${formatNumber(summary.avgDrawHeight)}</td>
    <td>${formatNumber(summary.avgX)}</td>
    <td>${formatNumber(summary.avgY)}</td>
    <td>${formatNumber(summary.p05Y)}</td>
    <td>${formatNumber(summary.p95Y)}</td>
    <td>${summary.trajectoryCount}</td>
    <td>${formatNumber(summary.avgVelocityPxPerSec)}</td>
    <td>${formatNumber(summary.p95VelocityPxPerSec)}</td>
  </tr>`;

const renderOrdinaryCommentCalibrationSection = (realDrawImages, overlayDrawImages) => {
  const realSmallDrawImages = realDrawImages.filter(isRealSmallDrawImage);
  const realMovingTrajectoryIds = new Set(
    fitDrawImageTrajectories(realSmallDrawImages, "real")
      .filter((trajectory) => Math.abs(trajectory.velocityPxPerSec) >= 20)
      .map((trajectory) => trajectory.id),
  );
  const realOrdinaryLike = realSmallDrawImages.filter((record) =>
    realMovingTrajectoryIds.has(getDrawImageTrajectoryId(record, "real")),
  );
  const overlayOrdinary = overlayDrawImages.filter(isOverlayOrdinaryDrawImage);
  const overlayOrdinaryScroll = overlayOrdinary.filter((record) => record.raw.comment?.layout === "naka");
  const overlayOrdinaryStatic = overlayOrdinary.filter((record) => record.raw.comment?.layout !== "naka");

  const populationRows = [
    renderPopulationSummaryRow(
      "real ordinary-like small drawImage",
      summarizeDrawImagePopulation(realOrdinaryLike, "real"),
    ),
    renderPopulationSummaryRow(
      "overlay ordinary naka",
      summarizeDrawImagePopulation(overlayOrdinaryScroll, "overlay"),
    ),
    renderPopulationSummaryRow(
      "overlay ordinary ue/shita",
      summarizeDrawImagePopulation(overlayOrdinaryStatic, "overlay"),
    ),
  ].join("\n");

  return `
    <section>
      <h2>ordinary comment calibration</h2>
      <p>
        This section keeps normal comments separate from large comment-art textures. The real-player
        group is inferred from moving small <code>drawImage</code> source canvases because the
        official player trace does not always expose the comment object for each draw call. Fixed
        small layers are excluded so game/video layers are not accidentally treated as comments.
      </p>
      <p>
        real small drawImage candidates: ${realSmallDrawImages.length}, moving candidates:
        ${realOrdinaryLike.length}
      </p>
      <table>
        <thead>
          <tr>
            <th>population</th>
            <th>records</th>
            <th>avg source w</th>
            <th>avg source h</th>
            <th>p50 source w</th>
            <th>p95 source w</th>
            <th>avg draw w</th>
            <th>avg draw h</th>
            <th>avg content x</th>
            <th>avg content y</th>
            <th>p05 content y</th>
            <th>p95 content y</th>
            <th>trajectories</th>
            <th>avg |velocity|</th>
            <th>p95 |velocity|</th>
          </tr>
        </thead>
        <tbody>${populationRows}</tbody>
      </table>

      <h3>real ordinary-like source buckets</h3>
      <table>
        <thead><tr><th>source size</th><th>count</th><th>avg content x</th><th>avg content y</th><th>avg width</th><th>avg height</th></tr></thead>
        <tbody>${renderContentDimensionBucketRows(realOrdinaryLike)}</tbody>
      </table>

      <h3>overlay ordinary naka source buckets</h3>
      <table>
        <thead><tr><th>source size</th><th>count</th><th>avg content x</th><th>avg content y</th><th>avg width</th><th>avg height</th></tr></thead>
        <tbody>${renderContentDimensionBucketRows(overlayOrdinaryScroll)}</tbody>
      </table>

      <h3>overlay ordinary ue/shita source buckets</h3>
      <table>
        <thead><tr><th>source size</th><th>count</th><th>avg content x</th><th>avg content y</th><th>avg width</th><th>avg height</th></tr></thead>
        <tbody>${renderContentDimensionBucketRows(overlayOrdinaryStatic)}</tbody>
      </table>
    </section>
  `;
};

const renderImageDiffSection = ({ realImageDataUrl, overlayImageDataUrl }) => {
  if (!realImageDataUrl || !overlayImageDataUrl) {
    return `
      <section>
        <h2>Image diff</h2>
        <p>Pass <code>--real-image</code> and <code>--overlay-image</code> to enable browser-side PNG diff.</p>
      </section>
    `;
  }

  return `
    <section>
      <h2>Image diff</h2>
      <div class="image-grid">
        <div><h3>real</h3><img id="realImage" src="${realImageDataUrl}" alt="real image"></div>
        <div><h3>overlay</h3><img id="overlayImage" src="${overlayImageDataUrl}" alt="overlay image"></div>
        <div><h3>diff</h3><canvas id="diffCanvas"></canvas></div>
      </div>
      <pre id="imageDiffMetrics">calculating...</pre>
    </section>
    <script>
      (() => {
        const realImage = document.getElementById("realImage");
        const overlayImage = document.getElementById("overlayImage");
        const diffCanvas = document.getElementById("diffCanvas");
        const metrics = document.getElementById("imageDiffMetrics");
        const waitImage = (image) => new Promise((resolve, reject) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", reject, { once: true });
        });
        Promise.all([waitImage(realImage), waitImage(overlayImage)]).then(() => {
          const width = Math.min(realImage.naturalWidth, overlayImage.naturalWidth);
          const height = Math.min(realImage.naturalHeight, overlayImage.naturalHeight);
          diffCanvas.width = width;
          diffCanvas.height = height;
          const realCanvas = document.createElement("canvas");
          const overlayCanvas = document.createElement("canvas");
          realCanvas.width = overlayCanvas.width = width;
          realCanvas.height = overlayCanvas.height = height;
          const realCtx = realCanvas.getContext("2d");
          const overlayCtx = overlayCanvas.getContext("2d");
          const diffCtx = diffCanvas.getContext("2d");
          realCtx.drawImage(realImage, 0, 0, width, height);
          overlayCtx.drawImage(overlayImage, 0, 0, width, height);
          const realData = realCtx.getImageData(0, 0, width, height);
          const overlayData = overlayCtx.getImageData(0, 0, width, height);
          const diffData = diffCtx.createImageData(width, height);
          let changed = 0;
          let totalDelta = 0;
          for (let index = 0; index < realData.data.length; index += 4) {
            const dr = Math.abs(realData.data[index] - overlayData.data[index]);
            const dg = Math.abs(realData.data[index + 1] - overlayData.data[index + 1]);
            const db = Math.abs(realData.data[index + 2] - overlayData.data[index + 2]);
            const da = Math.abs(realData.data[index + 3] - overlayData.data[index + 3]);
            const delta = dr + dg + db + da;
            totalDelta += delta;
            if (delta > 32) changed += 1;
            diffData.data[index] = delta > 32 ? 255 : 0;
            diffData.data[index + 1] = delta > 32 ? 32 : 0;
            diffData.data[index + 2] = 0;
            diffData.data[index + 3] = delta > 32 ? 255 : 40;
          }
          diffCtx.putImageData(diffData, 0, 0);
          const pixels = width * height;
          metrics.textContent = JSON.stringify({
            width,
            height,
            changedPixels: changed,
            changedRatio: pixels > 0 ? changed / pixels : 0,
            averageChannelDelta: pixels > 0 ? totalDelta / (pixels * 4) : 0,
          }, null, 2);
        }).catch((error) => {
          metrics.textContent = String(error);
        });
      })();
    </script>
  `;
};

const imageDataUrl = async (filePath) => {
  if (!filePath) {
    return null;
  }
  const image = await readFile(resolve(filePath));
  return `data:image/png;base64,${image.toString("base64")}`;
};

const renderHtml = ({
  realPath,
  overlayPath,
  realRecords,
  overlayRecords,
  matchResult,
  realImageDataUrl,
  overlayImageDataUrl,
}) => {
  const distances = matchResult.matches.map((match) => match.distance);
  const dxValues = matchResult.matches.map((match) => Math.abs(match.dx));
  const dyValues = matchResult.matches.map((match) => Math.abs(match.dy));
  const fontMatches = matchResult.matches.filter((match) => match.fontEqual).length;
  const fillMatches = matchResult.matches.filter((match) => match.fillEqual).length;
  const strokeMatches = matchResult.matches.filter((match) => match.strokeEqual).length;
  const lineWidthMatches = matchResult.matches.filter((match) => match.lineWidthEqual).length;
  const realDrawImages = getComparableDrawImageRecords(realRecords);
  const overlayDrawImages = getComparableDrawImageRecords(overlayRecords);
  const drawImageMatchResult = matchDrawImageRecords(realDrawImages, overlayDrawImages);

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>Nico calibration report</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 24px; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0 24px; }
    th, td { border: 1px solid #d0d7de; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #f6f8fa; }
    img, canvas { max-width: 100%; border: 1px solid #d0d7de; background: #111; }
    .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    code { white-space: pre-wrap; }
    .metric { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
    .metric div { border: 1px solid #d0d7de; border-radius: 6px; padding: 12px; background: #f6f8fa; }
  </style>
</head>
<body>
  <h1>Nico calibration report</h1>
  <p>real: <code>${escapeHtml(realPath)}</code></p>
  <p>overlay: <code>${escapeHtml(overlayPath)}</code></p>
  <section class="metric">
    <div><strong>matched text ops</strong><br>${matchResult.matches.length}</div>
    <div><strong>unmatched real</strong><br>${matchResult.unmatchedReal.length}</div>
    <div><strong>unmatched overlay</strong><br>${matchResult.unmatchedOverlay.length}</div>
    <div><strong>avg distance</strong><br>${formatNumber(average(distances))}</div>
    <div><strong>p95 distance</strong><br>${formatNumber(percentile(distances, 0.95))}</div>
    <div><strong>avg |dx|</strong><br>${formatNumber(average(dxValues))}</div>
    <div><strong>avg |dy|</strong><br>${formatNumber(average(dyValues))}</div>
    <div><strong>font match ratio</strong><br>${formatNumber(matchResult.matches.length > 0 ? fontMatches / matchResult.matches.length : null)}</div>
    <div><strong>fill match ratio</strong><br>${formatNumber(matchResult.matches.length > 0 ? fillMatches / matchResult.matches.length : null)}</div>
    <div><strong>stroke match ratio</strong><br>${formatNumber(matchResult.matches.length > 0 ? strokeMatches / matchResult.matches.length : null)}</div>
    <div><strong>lineWidth match ratio</strong><br>${formatNumber(matchResult.matches.length > 0 ? lineWidthMatches / matchResult.matches.length : null)}</div>
  </section>
  ${renderSummaryTable("Real op summary", summarizeByOp(realRecords))}
  ${renderSummaryTable("Overlay op summary", summarizeByOp(overlayRecords))}
  ${renderDrawImageDimensionComparison(realDrawImages, overlayDrawImages)}
  ${renderOrdinaryCommentCalibrationSection(realDrawImages, overlayDrawImages)}
  ${renderDrawImageMatchSummary(drawImageMatchResult)}
  ${renderDrawImageTrajectoryComparison(realDrawImages, overlayDrawImages)}
  ${renderTopDeltas(matchResult.matches)}
  ${renderImageDiffSection({ realImageDataUrl, overlayImageDataUrl })}
</body>
</html>`;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.real || !args.overlay) {
    throw new Error("Usage: bun scripts/nico-report.mjs --real real-trace.jsonl --overlay overlay-trace.jsonl [--out report.html]");
  }

  const realPath = resolve(args.real);
  const overlayPath = resolve(args.overlay);
  const outPath = resolve(args.out || ".calibration/nico/report.html");
  const realRecords = await readJsonl(realPath);
  const overlayRecords = await readJsonl(overlayPath);
  const realImageDataUrl = await imageDataUrl(args["real-image"]);
  const overlayImageDataUrl = await imageDataUrl(args["overlay-image"]);
  const matchResult = matchTextRecords(
    getComparableTextRecords(realRecords),
    getComparableTextRecords(overlayRecords),
  );
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(
    outPath,
    renderHtml({
      realPath,
      overlayPath,
      realRecords,
      overlayRecords,
      matchResult,
      realImageDataUrl,
      overlayImageDataUrl,
    }),
  );
  console.log(`nico report written to ${outPath}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

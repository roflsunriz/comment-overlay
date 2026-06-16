#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
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

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const readJsonl = async (path) => {
  const text = await readFile(path, "utf8");
  return text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
};

const average = (values) => {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
};

const parseNumberList = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => Number(part.trim()))
    .filter(Number.isFinite);

const parseBlockedBy = (value) =>
  String(value ?? "")
    .split(",")
    .map((part) => {
      const [laneText, blockerText] = part.split(":");
      const lane = Number(laneText);
      if (!Number.isFinite(lane)) return null;
      if (!blockerText || blockerText === "-") {
        return { lane, blocked: false, blocker: null };
      }
      const [creationIndexText, vposText] = blockerText.split("@");
      return {
        lane,
        blocked: true,
        blocker: {
          creationIndex: Number(creationIndexText),
          vposMs: Number(vposText),
        },
      };
    })
    .filter(Boolean);

const tracePathFromLaneReport = (report) => {
  const trace = report?.input?.trace;
  return typeof trace === "string" && trace.length > 0 ? trace : null;
};

const normalizeText = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();

const buildLaneDecisionIndex = async (tracePath) => {
  if (!tracePath || !(await fileExists(tracePath))) {
    return { byCreationIndex: new Map(), byVposText: new Map(), tracePath, available: false };
  }
  const records = await readJsonl(tracePath);
  const decisions = records
    .filter((record) => record.op === "laneDecision")
    .map((record) => {
      const meta = record.meta ?? {};
      const comment = record.comment ?? {};
      const creationIndex = Number(comment.creationIndex);
      const vposMs = Number(comment.vposMs);
      const text = normalizeText(comment.text);
      return {
        frameTimeMs: Number(record.frameTimeMs),
        currentTimeMs: Number(meta.currentTimeMs),
        creationIndex: Number.isFinite(creationIndex) ? creationIndex : null,
        vposMs: Number.isFinite(vposMs) ? vposMs : null,
        text,
        selectedLane: Number(meta.selectedLane),
        usedFallback: meta.usedFallback === true || meta.usedFallback === "true",
        candidateLanes: parseNumberList(meta.candidateLanes),
        availableLanes: parseNumberList(meta.availableLanes),
        nextAvailableTimes: parseNumberList(meta.nextAvailableTimes),
        blockedBy: parseBlockedBy(meta.blockedBy),
        reservationStartTimeMs: Number(meta.reservationStartTimeMs),
        reservationEndTimeMs: Number(meta.reservationEndTimeMs),
        reservationTotalEndTimeMs: Number(meta.reservationTotalEndTimeMs),
        reservationWidth: Number(meta.reservationWidth),
      };
    });
  const byCreationIndex = new Map();
  const byVposText = new Map();
  for (const decision of decisions) {
    if (decision.creationIndex !== null) {
      byCreationIndex.set(decision.creationIndex, decision);
    }
    if (decision.vposMs !== null && decision.text.length > 0) {
      byVposText.set(`${decision.vposMs}:${decision.text}`, decision);
    }
  }
  return { byCreationIndex, byVposText, tracePath, available: true, count: decisions.length };
};

const findDecision = (index, candidate) => {
  const creationIndex = Number(candidate.creationIndex);
  if (Number.isFinite(creationIndex) && index.byCreationIndex.has(creationIndex)) {
    return index.byCreationIndex.get(creationIndex);
  }
  const vposMs = Number(candidate.vposMs);
  const text = normalizeText(candidate.text);
  if (Number.isFinite(vposMs) && text.length > 0) {
    return index.byVposText.get(`${vposMs}:${text}`) ?? null;
  }
  return null;
};

const textRelation = (left, right) => {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);
  if (leftText.length === 0 || rightText.length === 0) return "unknown";
  if (leftText === rightText) return "exact";
  if (leftText.includes(rightText) || rightText.includes(leftText)) return "substring";
  return "mismatch";
};

const classifyPair = (pair, decision, options = {}) => {
  const teacher = pair.teacher;
  const candidate = pair.candidate;
  const teacherLane = Number(teacher.lane);
  const candidateLane = Number(candidate.lane);
  const laneDelta = candidateLane - teacherLane;
  const timeDeltaMs = Number(candidate.time) - Number(teacher.time);
  const yDeltaPx = Number(candidate.y) - Number(teacher.y);
  const startMs = Number(options.startMs);
  const candidateTime = Number(candidate.time);
  const candidateVposMs = Number(candidate.vposMs);
  const relation = textRelation(teacher.text, candidate.text);
  const result = {
    laneDelta,
    timeDeltaMs,
    yDeltaPx,
    absLaneDelta: Math.abs(laneDelta),
    absTimeDeltaMs: Math.abs(timeDeltaMs),
    absYDeltaPx: Math.abs(yDeltaPx),
    textRelation: relation,
    categories: [],
  };
  if (relation === "mismatch") {
    result.categories.push("pairedTextMismatch");
  } else if (relation === "substring") {
    result.categories.push("pairedTextSubstring");
  }
  if (!decision) {
    if (
      Number.isFinite(startMs) &&
      ((Number.isFinite(candidateTime) && candidateTime <= startMs + 250) ||
        (Number.isFinite(candidateVposMs) && candidateVposMs < startMs))
    ) {
      result.categories.push("preexistingAtTraceStart");
    } else {
      result.categories.push("missingCandidateLaneDecision");
    }
    return result;
  }
  const maxCandidateLane =
    decision.candidateLanes.length > 0 ? Math.max(...decision.candidateLanes) : null;
  const teacherLaneDecision = decision.blockedBy.find((entry) => entry.lane === teacherLane);
  const teacherLaneAvailable = decision.availableLanes.includes(teacherLane);
  if (maxCandidateLane !== null && teacherLane > maxCandidateLane) {
    result.categories.push("teacherLaneOutOfCandidateRange");
  } else if (teacherLaneDecision?.blocked) {
    result.categories.push("teacherLaneBlockedByCandidateModel");
  } else if (teacherLaneAvailable && candidateLane !== teacherLane) {
    result.categories.push("teacherLaneAvailableButSkipped");
  } else if (!teacherLaneAvailable && candidateLane !== teacherLane) {
    result.categories.push("teacherLaneUnavailableWithoutBlocker");
  }
  if (decision.usedFallback) {
    result.categories.push("candidateUsedFallbackLane");
  }
  if (laneDelta < 0) {
    result.categories.push("candidateAboveTeacher");
  } else if (laneDelta > 0) {
    result.categories.push("candidateBelowTeacher");
  } else {
    result.categories.push("sameLane");
  }
  if (Math.abs(timeDeltaMs) >= 1000) {
    result.categories.push(timeDeltaMs > 0 ? "candidateLateBy1s" : "candidateEarlyBy1s");
  }
  return result;
};

const summarizeCategories = (classifiedPairs) => {
  const counts = new Map();
  for (const pair of classifiedPairs) {
    for (const category of pair.classification.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
};

const summarizeProbe = async (probe) => {
  const teacherReportPath = resolve(probe.teacherReport);
  const candidateReportPath = resolve(probe.candidateReport);
  if (!(await fileExists(teacherReportPath)) || !(await fileExists(candidateReportPath))) {
    return {
      id: probe.id,
      status: "missing",
      missingFiles: [teacherReportPath, candidateReportPath],
    };
  }
  const teacherReport = await loadJson(teacherReportPath);
  const candidateReport = await loadJson(candidateReportPath);
  const candidateTracePath = tracePathFromLaneReport(candidateReport);
  const decisionIndex = await buildLaneDecisionIndex(candidateTracePath);
  const pairs = Array.isArray(probe.result?.matchedPairs) ? probe.result.matchedPairs : [];
  const classifiedPairs = pairs.map((pair) => {
    const decision = findDecision(decisionIndex, pair.candidate);
    const classification = classifyPair(pair, decision, {
      startMs: Number(probe.options?.["start-ms"]),
      endMs: Number(probe.options?.["end-ms"]),
    });
    return {
      teacher: pair.teacher,
      candidate: pair.candidate,
      decision,
      classification,
      cost: pair.cost,
    };
  });
  const laneDeltas = classifiedPairs.map((pair) => pair.classification.laneDelta);
  const timeDeltas = classifiedPairs.map((pair) => pair.classification.timeDeltaMs);
  const yDeltas = classifiedPairs.map((pair) => pair.classification.yDeltaPx);
  return {
    id: probe.id,
    label: probe.label,
    videoId: probe.videoId,
    status: "ok",
    score: probe.score,
    unstableInput: Boolean(probe.unstableInput),
    trace: {
      teacher: tracePathFromLaneReport(teacherReport),
      candidate: candidateTracePath,
      candidateLaneDecisionCount: decisionIndex.count ?? 0,
    },
    counts: {
      teacher: probe.result?.teacherCount ?? null,
      candidate: probe.result?.candidateCount ?? null,
      matchedPairs: classifiedPairs.length,
      missedTeacher: probe.result?.missedTeacherCount ?? null,
      extraCandidate: probe.result?.extraCandidateCount ?? null,
    },
    averages: {
      laneDelta: average(laneDeltas),
      absLaneDelta: average(laneDeltas.map(Math.abs)),
      timeDeltaMs: average(timeDeltas),
      absTimeDeltaMs: average(timeDeltas.map(Math.abs)),
      yDeltaPx: average(yDeltas),
      absYDeltaPx: average(yDeltas.map(Math.abs)),
    },
    categories: summarizeCategories(classifiedPairs),
    worstPairs: classifiedPairs
      .slice()
      .sort(
        (a, b) =>
          b.classification.absLaneDelta - a.classification.absLaneDelta ||
          b.classification.absTimeDeltaMs - a.classification.absTimeDeltaMs,
      )
      .slice(0, 12),
  };
};

const buildMarkdown = (report) => {
  const lines = [];
  lines.push("# ニコニコレーン選択診断");
  lines.push("");
  lines.push(`作成日時: ${report.createdAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- 対象プローブ: ${report.summary.total}`);
  lines.push(`- OK: ${report.summary.ok}`);
  lines.push(`- レーンプローブ平均スコア: ${report.summary.meanScore ?? "n/a"}`);
  lines.push(`- 平均レーン差: ${report.summary.averageLaneDelta?.toFixed(2) ?? "n/a"}`);
  lines.push(`- 平均絶対レーン差: ${report.summary.averageAbsLaneDelta?.toFixed(2) ?? "n/a"}`);
  lines.push("");
  lines.push("## Probe Diagnostics");
  for (const probe of report.probes) {
    lines.push("");
    lines.push(`### ${probe.id}`);
    lines.push("");
    if (probe.status !== "ok") {
      lines.push(`- status: ${probe.status}`);
      continue;
    }
    lines.push(`- score: ${probe.score}`);
    lines.push(`- count: teacher ${probe.counts.teacher} / candidate ${probe.counts.candidate} / matched ${probe.counts.matchedPairs}`);
    lines.push(`- lane delta avg: ${probe.averages.laneDelta?.toFixed(2) ?? "n/a"} / abs ${probe.averages.absLaneDelta?.toFixed(2) ?? "n/a"}`);
    lines.push(`- time delta avg: ${probe.averages.timeDeltaMs?.toFixed(0) ?? "n/a"}ms / abs ${probe.averages.absTimeDeltaMs?.toFixed(0) ?? "n/a"}ms`);
    lines.push("- categories:");
    for (const [category, count] of Object.entries(probe.categories)) {
      lines.push(`  - ${category}: ${count}`);
    }
    if (probe.worstPairs.length > 0) {
      lines.push("- worst pairs:");
      for (const pair of probe.worstPairs.slice(0, 5)) {
        lines.push(
          `  - ${pair.teacher.time}ms "${String(pair.teacher.text ?? "").slice(0, 24)}": teacher lane ${pair.teacher.lane}, candidate lane ${pair.candidate.lane}, delta ${pair.classification.laneDelta}, categories ${pair.classification.categories.join("/")}`,
        );
      }
    }
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const summarizeReport = (probes) => {
  const ok = probes.filter((probe) => probe.status === "ok");
  const scores = ok.map((probe) => Number(probe.score)).filter(Number.isFinite);
  const laneDeltas = ok.map((probe) => probe.averages.laneDelta).filter(Number.isFinite);
  const absLaneDeltas = ok.map((probe) => probe.averages.absLaneDelta).filter(Number.isFinite);
  return {
    total: probes.length,
    ok: ok.length,
    meanScore: average(scores),
    averageLaneDelta: average(laneDeltas),
    averageAbsLaneDelta: average(absLaneDeltas),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const scorePath = resolve(args.score || ".calibration/nico/probe-score-current.json");
  const scoreReport = await loadJson(scorePath);
  const configPath = resolve(args.config || scoreReport.config || ".calibration/nico/probes.json");
  const config = await loadJson(configPath);
  const definitionsById = new Map((config.probes ?? []).map((probe) => [probe.id, probe]));
  const probes = [];
  for (const probe of scoreReport.probes ?? []) {
    if (probe.type !== "lane" || probe.status !== "ok" || probe.excludeFromComposite === true) continue;
    probes.push(await summarizeProbe({ ...(definitionsById.get(probe.id) ?? {}), ...probe }));
  }
  const report = {
    createdAt: new Date().toISOString(),
    score: scorePath,
    config: configPath,
    summary: summarizeReport(probes),
    probes,
  };
  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, JSON.stringify(report, null, 2));
  }
  if (args.markdown) {
    const markdownPath = resolve(args.markdown);
    await mkdir(dirname(markdownPath), { recursive: true });
    await writeFile(markdownPath, buildMarkdown(report));
  }
  console.log(JSON.stringify(report, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

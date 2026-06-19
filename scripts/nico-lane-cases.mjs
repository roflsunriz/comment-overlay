#!/usr/bin/env node
import { createHash } from "node:crypto";
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

const loadJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const readJsonl = async (path) => {
  const text = await readFile(path, "utf8");
  return text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
};

const round = (value, digits = 3) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const scale = 10 ** digits;
  return Math.round(number * scale) / scale;
};

const normalizeText = (value) => String(value ?? "").replace(/\s+/gu, " ").trim();

const textHash = (value) => createHash("sha1").update(normalizeText(value)).digest("hex").slice(0, 12);

const identityKey = (value) => {
  const rawNo = value?.no ?? value?.commentNo;
  if (rawNo === null || rawNo === undefined) return null;
  const no = Number(rawNo);
  if (!Number.isFinite(no) || no <= 0) return null;
  return [
    "no",
    String(value?.source ?? value?.commentSource ?? ""),
    String(value?.fork ?? value?.commentFork ?? ""),
    String(value?.threadId ?? value?.commentThreadId ?? ""),
    String(no),
  ].join(":");
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

const buildLaneDecisionIndex = async (tracePath) => {
  if (!tracePath || !(await fileExists(tracePath))) {
    return {
      byIdentity: new Map(),
      byCreationIndex: new Map(),
      byVposText: new Map(),
      tracePath,
      available: false,
    };
  }
  const records = await readJsonl(tracePath);
  const decisions = records
    .filter((record) => record.op === "laneDecision")
    .map((record) => {
      const meta = record.meta ?? {};
      const comment = record.comment ?? {};
      const creationIndex = Number(comment.creationIndex);
      const vposMs = Number(comment.vposMs);
      return {
        frameTimeMs: round(record.frameTimeMs),
        currentTimeMs: round(meta.currentTimeMs),
        creationIndex: Number.isFinite(creationIndex) ? creationIndex : null,
        vposMs: Number.isFinite(vposMs) ? vposMs : null,
        no: Number.isFinite(Number(comment.no)) ? Number(comment.no) : null,
        fork: comment.fork ?? null,
        source: comment.source ?? null,
        threadId: comment.threadId ?? null,
        text: normalizeText(comment.text),
        selectedLane: Number.isFinite(Number(meta.selectedLane)) ? Number(meta.selectedLane) : null,
        usedFallback: meta.usedFallback === true || meta.usedFallback === "true",
        candidateLanes: parseNumberList(meta.candidateLanes),
        availableLanes: parseNumberList(meta.availableLanes),
        nextAvailableTimes: parseNumberList(meta.nextAvailableTimes),
        blockedBy: parseBlockedBy(meta.blockedBy),
        reservationStartTimeMs: round(meta.reservationStartTimeMs),
        reservationEndTimeMs: round(meta.reservationEndTimeMs),
        reservationTotalEndTimeMs: round(meta.reservationTotalEndTimeMs),
        reservationWidth: round(meta.reservationWidth),
      };
    });
  const byCreationIndex = new Map();
  const byVposText = new Map();
  const byIdentity = new Map();
  for (const decision of decisions) {
    const key = identityKey(decision);
    if (key) byIdentity.set(key, decision);
    if (decision.creationIndex !== null) byCreationIndex.set(decision.creationIndex, decision);
    if (decision.vposMs !== null && decision.text.length > 0) {
      byVposText.set(`${decision.vposMs}:${decision.text}`, decision);
    }
  }
  return { byIdentity, byCreationIndex, byVposText, tracePath, available: true, count: decisions.length };
};

const findDecision = (index, candidate) => {
  const key = identityKey(candidate);
  if (key && index.byIdentity.has(key)) return index.byIdentity.get(key);
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

const compactOracleScores = (oracleScores) => {
  if (!oracleScores || typeof oracleScores !== "object") return null;
  return Object.fromEntries(
    Object.entries(oracleScores).map(([key, value]) => [key, value?.progressPercent ?? null]),
  );
};

const classifyCase = ({ pair, teacher, candidate, teacherIdentity, candidateIdentity, relation, decision }) => {
  const categories = [];
  const matchMethod = pair.matchMethod ?? "unknown";
  const teacherLane = Number(teacher.lane);
  const candidateLane = Number(candidate.lane);
  const laneDelta = candidateLane - teacherLane;
  const teacherTimeMs = Number(teacher.time);
  const candidateTimeMs = Number(candidate.time);
  const timeDeltaMs = candidateTimeMs - teacherTimeMs;

  categories.push(matchMethod === "identity" ? "identityMatched" : "heuristicMatched");

  if (teacherIdentity && candidateIdentity) {
    categories.push(teacherIdentity === candidateIdentity ? "identityAgrees" : "identityDisagrees");
  } else if (!teacherIdentity && !candidateIdentity) {
    categories.push("identityMissingBoth");
  } else if (!teacherIdentity) {
    categories.push("teacherIdentityMissing");
  } else {
    categories.push("candidateIdentityMissing");
  }

  if (relation === "mismatch") {
    categories.push("pairedTextMismatch");
  } else if (relation === "substring") {
    categories.push("pairedTextSubstring");
  } else if (relation === "exact") {
    categories.push("pairedTextExact");
  }

  if (laneDelta === 0) {
    categories.push("laneExact", "sameLane");
  } else if (Math.abs(laneDelta) === 1) {
    categories.push("laneOffBy1");
  } else {
    categories.push("laneOffBy2Plus");
  }
  if (laneDelta < 0) {
    categories.push("candidateAboveTeacher");
  } else if (laneDelta > 0) {
    categories.push("candidateBelowTeacher");
  }

  if (Number.isFinite(timeDeltaMs) && Math.abs(timeDeltaMs) >= 1000) {
    categories.push(timeDeltaMs > 0 ? "candidateLateBy1s" : "candidateEarlyBy1s");
  }

  if (!decision) {
    categories.push("missingCandidateLaneDecision");
  } else {
    if (
      Number.isFinite(candidateLane) &&
      Number.isFinite(Number(decision.selectedLane)) &&
      candidateLane !== Number(decision.selectedLane)
    ) {
      categories.push("candidateLaneDecisionMismatch");
    }
    const teacherLaneDecision = decision.blockedBy.find((entry) => entry.lane === teacherLane);
    const teacherLaneAvailable = decision.availableLanes.includes(teacherLane);
    const maxCandidateLane =
      decision.candidateLanes.length > 0 ? Math.max(...decision.candidateLanes) : null;
    if (maxCandidateLane !== null && teacherLane > maxCandidateLane) {
      categories.push("teacherLaneOutOfCandidateRange");
    } else if (teacherLaneDecision?.blocked) {
      categories.push("teacherLaneBlockedByCandidateModel");
    } else if (teacherLaneAvailable && candidateLane !== teacherLane) {
      categories.push("teacherLaneAvailableButSkipped");
    } else if (!teacherLaneAvailable && candidateLane !== teacherLane) {
      categories.push("teacherLaneUnavailableWithoutBlocker");
    }
    if (decision.usedFallback) {
      categories.push("candidateUsedFallbackLane");
    }
  }

  return categories;
};

const buildCase = ({ probe, definition, pair, index, decision }) => {
  const teacher = pair.teacher ?? {};
  const candidate = pair.candidate ?? {};
  const teacherLane = Number(teacher.lane);
  const candidateLane = Number(candidate.lane);
  const teacherTimeMs = Number(teacher.time);
  const candidateTimeMs = Number(candidate.time);
  const teacherY = Number(teacher.y);
  const candidateY = Number(candidate.y);
  const teacherIdentity = identityKey(teacher);
  const candidateIdentity = identityKey(candidate);
  const relation = textRelation(teacher.text, candidate.text);
  const laneDelta = candidateLane - teacherLane;
  const timeDeltaMs = candidateTimeMs - teacherTimeMs;
  const yDeltaPx = candidateY - teacherY;
  const categories = classifyCase({
    pair,
    teacher,
    candidate,
    teacherIdentity,
    candidateIdentity,
    relation,
    decision,
  });
  const inputSet = probe.result?.inputSet ?? {};
  const oracle = compactOracleScores(probe.result?.oracleScores);
  const teacherLaneDecision = decision?.blockedBy?.find((entry) => entry.lane === teacherLane) ?? null;
  return {
    probeId: probe.id,
    videoId: probe.videoId ?? definition?.videoId ?? null,
    label: probe.label ?? definition?.label ?? null,
    unstableInput: Boolean(probe.unstableInput ?? definition?.unstableInput),
    score: probe.score ?? probe.result?.progressPercent ?? null,
    pairIndex: index,
    matchMethod: pair.matchMethod ?? null,
    cost: round(pair.cost),
    commentNo: teacher.no ?? candidate.no ?? null,
    teacherNo: teacher.no ?? null,
    candidateNo: candidate.no ?? null,
    fork: teacher.fork ?? candidate.fork ?? null,
    source: teacher.source ?? candidate.source ?? null,
    threadId: teacher.threadId ?? candidate.threadId ?? null,
    teacherIdentity,
    candidateIdentity,
    identitySame: Boolean(teacherIdentity && candidateIdentity && teacherIdentity === candidateIdentity),
    text: normalizeText(teacher.text || candidate.text),
    teacherText: normalizeText(teacher.text),
    candidateText: normalizeText(candidate.text),
    textHash: textHash(teacher.text || candidate.text),
    textRelation: relation,
    teacherTimeMs: round(teacherTimeMs, 0),
    candidateTimeMs: round(candidateTimeMs, 0),
    timeDeltaMs: round(timeDeltaMs, 0),
    absTimeDeltaMs: round(Math.abs(timeDeltaMs), 0),
    teacherVposMs: round(teacher.vposMs, 0),
    candidateVposMs: round(candidate.vposMs, 0),
    teacherLane: Number.isFinite(teacherLane) ? teacherLane : null,
    candidateLane: Number.isFinite(candidateLane) ? candidateLane : null,
    laneDelta: Number.isFinite(laneDelta) ? laneDelta : null,
    absLaneDelta: Number.isFinite(laneDelta) ? Math.abs(laneDelta) : null,
    laneExact: laneDelta === 0,
    laneWithin1: Number.isFinite(laneDelta) && Math.abs(laneDelta) <= 1,
    teacherY: round(teacherY),
    candidateY: round(candidateY),
    yDeltaPx: round(yDeltaPx),
    absYDeltaPx: round(Math.abs(yDeltaPx)),
    teacherSourceSize: teacher.sourceSize ?? null,
    candidateSourceSize: candidate.sourceSize ?? null,
    teacherFontSize: teacher.fontSize ?? null,
    candidateFontSize: candidate.fontSize ?? null,
    teacherColor: teacher.color ?? null,
    candidateColor: candidate.color ?? null,
    laneDecision: decision
      ? {
          traceAvailable: true,
          selectedLane: decision.selectedLane,
          usedFallback: decision.usedFallback,
          candidateLanes: decision.candidateLanes,
          availableLanes: decision.availableLanes,
          nextAvailableTimes: decision.nextAvailableTimes,
          blockedBy: decision.blockedBy,
          teacherLaneWasCandidateAvailable: decision.availableLanes.includes(teacherLane),
          teacherLaneBlocker: teacherLaneDecision?.blocked ? teacherLaneDecision.blocker : null,
          reservationStartTimeMs: decision.reservationStartTimeMs,
          reservationEndTimeMs: decision.reservationEndTimeMs,
          reservationTotalEndTimeMs: decision.reservationTotalEndTimeMs,
          reservationWidth: decision.reservationWidth,
        }
      : {
          traceAvailable: false,
          selectedLane: null,
          usedFallback: null,
          candidateLanes: [],
          availableLanes: [],
          nextAvailableTimes: [],
          blockedBy: [],
          teacherLaneWasCandidateAvailable: null,
          teacherLaneBlocker: null,
          reservationStartTimeMs: null,
          reservationEndTimeMs: null,
          reservationTotalEndTimeMs: null,
          reservationWidth: null,
        },
    inputSet: {
      matchedByIdentity: inputSet.matchedByIdentity ?? null,
      matchedByHeuristic: inputSet.matchedByHeuristic ?? null,
      sharedIdentityKeys: inputSet.sharedIdentityKeys ?? null,
      unmatchedTeacher: inputSet.unmatchedTeacher ?? null,
      unmatchedCandidate: inputSet.unmatchedCandidate ?? null,
    },
    oracle,
    categories,
  };
};

const average = (values) => {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
};

const increment = (map, key, amount = 1) => {
  map.set(key, (map.get(key) ?? 0) + amount);
};

const sortedCounts = (map) =>
  Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));

const summarizeCases = ({ scoreReport, cases }) => {
  const categoryCounts = new Map();
  const matchMethodCounts = new Map();
  const byProbe = new Map();
  for (const item of cases) {
    increment(matchMethodCounts, item.matchMethod ?? "unknown");
    for (const category of item.categories) {
      increment(categoryCounts, category);
    }
    const bucket = byProbe.get(item.probeId) ?? {
      probeId: item.probeId,
      videoId: item.videoId,
      label: item.label,
      unstableInput: item.unstableInput,
      score: item.score,
      count: 0,
      laneExact: 0,
      laneWithin1: 0,
      absLaneDeltas: [],
      absTimeDeltas: [],
      absYDeltas: [],
      inputSet: item.inputSet,
      oracle: item.oracle,
    };
    bucket.count += 1;
    if (item.laneExact) bucket.laneExact += 1;
    if (item.laneWithin1) bucket.laneWithin1 += 1;
    if (Number.isFinite(item.absLaneDelta)) bucket.absLaneDeltas.push(item.absLaneDelta);
    if (Number.isFinite(item.absTimeDeltaMs)) bucket.absTimeDeltas.push(item.absTimeDeltaMs);
    if (Number.isFinite(item.absYDeltaPx)) bucket.absYDeltas.push(item.absYDeltaPx);
    byProbe.set(item.probeId, bucket);
  }

  const probeSummaries = [...byProbe.values()].map((probe) => ({
    probeId: probe.probeId,
    videoId: probe.videoId,
    label: probe.label,
    unstableInput: probe.unstableInput,
    score: probe.score,
    count: probe.count,
    laneExactRate: round(probe.laneExact / probe.count),
    laneWithin1Rate: round(probe.laneWithin1 / probe.count),
    averageAbsLaneDelta: round(average(probe.absLaneDeltas)),
    averageAbsTimeDeltaMs: round(average(probe.absTimeDeltas), 0),
    averageAbsYDeltaPx: round(average(probe.absYDeltas)),
    inputSet: probe.inputSet,
    oracle: probe.oracle,
  }));

  return {
    createdAt: new Date().toISOString(),
    scoreSummary: scoreReport.summary ?? null,
    totals: {
      cases: cases.length,
      probes: byProbe.size,
      laneExact: cases.filter((item) => item.laneExact).length,
      laneWithin1: cases.filter((item) => item.laneWithin1).length,
      identityMatched: cases.filter((item) => item.matchMethod === "identity").length,
      heuristicMatched: cases.filter((item) => item.matchMethod !== "identity").length,
    },
    matchMethods: sortedCounts(matchMethodCounts),
    categories: sortedCounts(categoryCounts),
    byProbe: probeSummaries.sort((a, b) => String(a.probeId).localeCompare(String(b.probeId))),
    worstLaneCases: cases
      .slice()
      .sort(
        (a, b) =>
          (b.absLaneDelta ?? -1) - (a.absLaneDelta ?? -1) ||
          (b.absTimeDeltaMs ?? -1) - (a.absTimeDeltaMs ?? -1),
      )
      .slice(0, 30),
    worstTimeCases: cases
      .slice()
      .sort(
        (a, b) =>
          (b.absTimeDeltaMs ?? -1) - (a.absTimeDeltaMs ?? -1) ||
          (b.absLaneDelta ?? -1) - (a.absLaneDelta ?? -1),
      )
      .slice(0, 30),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const scorePath = resolve(args.score || ".calibration/nico/probe-score-current.json");
  const scoreReport = await loadJson(scorePath);
  const configPath = resolve(args.config || scoreReport.config || ".calibration/nico/probes.json");
  const config = await loadJson(configPath);
  const definitionsById = new Map((config.probes ?? []).map((probe) => [probe.id, probe]));
  const cases = [];
  for (const probe of scoreReport.probes ?? []) {
    if (probe.type !== "lane" || probe.status !== "ok" || probe.excludeFromComposite === true) continue;
    const definition = definitionsById.get(probe.id);
    let decisionIndex = null;
    const candidateReportPath = definition?.candidateReport ?? probe.candidateReport;
    if (candidateReportPath) {
      const candidateReport = await loadJson(resolve(candidateReportPath));
      decisionIndex = await buildLaneDecisionIndex(tracePathFromLaneReport(candidateReport));
    }
    const pairs = Array.isArray(probe.result?.matchedPairs) ? probe.result.matchedPairs : [];
    pairs.forEach((pair, index) => {
      const decision = decisionIndex ? findDecision(decisionIndex, pair.candidate ?? {}) : null;
      cases.push(buildCase({ probe, definition, pair, index, decision }));
    });
  }

  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${cases.map((item) => JSON.stringify(item)).join("\n")}\n`);
  }

  const summary = summarizeCases({ scoreReport, cases });
  if (args.buckets) {
    const bucketsPath = resolve(args.buckets);
    await mkdir(dirname(bucketsPath), { recursive: true });
    await writeFile(bucketsPath, JSON.stringify(summary, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

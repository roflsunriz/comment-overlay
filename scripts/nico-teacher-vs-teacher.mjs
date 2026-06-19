#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

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

const runJsonCommand = (command, args) =>
  new Promise((resolveRun) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        resolveRun({ ok: false, code, stderr: stderr.trim(), stdout: stdout.trim() });
        return;
      }
      try {
        resolveRun({ ok: true, json: JSON.parse(stdout) });
      } catch (error) {
        resolveRun({
          ok: false,
          code,
          stderr: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
          stdout: stdout.trim(),
        });
      }
    });
  });

const appendOption = (args, key, value) => {
  if (value === undefined || value === null) return;
  args.push(`--${key}`, String(value));
};

const resolveCommentsPathForProbe = async (probe) => {
  if (probe.comments) return probe.comments;
  const videoId = probe.videoId;
  if (typeof videoId !== "string" || videoId.length === 0) return null;
  const officialAllCommentsPath = `.calibration/nico/${videoId}/input-current/nvcomment-current-all-comments.json`;
  const officialMainCommentsPath = `.calibration/nico/${videoId}/input-current/nvcomment-current-main-comments.json`;
  const fixtureCommentsPath = `overlay-tests/fixtures/${videoId}-comments.json`;
  if ((probe.officialComments ?? "main") === "all" && (await fileExists(resolve(officialAllCommentsPath)))) {
    return officialAllCommentsPath;
  }
  if ((probe.officialComments ?? "main") !== "fixture" && (await fileExists(resolve(officialMainCommentsPath)))) {
    return officialMainCommentsPath;
  }
  return (await fileExists(resolve(fixtureCommentsPath))) ? fixtureCommentsPath : null;
};

const candidateTeacherReportPath = (probe) =>
  probe.teacherReportB ?? probe.teacherReport2 ?? probe.candidateTeacherReport ?? null;

const capturePlanForProbe = (probe) => {
  const startMs = Number(probe.options?.["start-ms"]);
  const endMs = Number(probe.options?.["end-ms"]);
  const durationMs = Number.isFinite(startMs) && Number.isFinite(endMs) ? Math.max(1000, endMs - startMs) : null;
  const caseName = `${probe.id}-teacher-b`;
  const outDir = `.calibration/nico/${probe.videoId}/${caseName}`;
  return {
    id: probe.id,
    videoId: probe.videoId,
    label: probe.label ?? probe.id,
    startMs: Number.isFinite(startMs) ? startMs : null,
    endMs: Number.isFinite(endMs) ? endMs : null,
    durationMs,
    outDir,
    tracePath: `${outDir}/trace.jsonl`,
    reportPath: `${outDir}/lane-reverse-content-pitch68-sourcecanvas-full.json`,
    cdpTraceCommand:
      durationMs === null
        ? null
        : [
            "bun",
            "scripts/nico-trace.mjs",
            "--case",
            caseName,
            "--out",
            ".calibration/nico",
            "--video-id",
            String(probe.videoId),
            "--url",
            `https://www.nicovideo.jp/watch/${probe.videoId}`,
            "--start-ms",
            String(startMs),
            "--duration-ms",
            String(durationMs),
          ].join(" "),
    reverseCommand: [
      "node",
      "scripts/nico-lane-reverse.mjs",
      "--trace",
      `${outDir}/trace.jsonl`,
      "--source",
      "niconico-player",
      "--max-source-width",
      "1300",
      "--max-source-height",
      String(probe.options?.["max-source-height"] ?? 220),
      "--min-source-height",
      String(probe.options?.["min-source-height"] ?? 12),
      "--min-y",
      "-5",
      "--lane-pitch",
      "68",
      "--basis",
      "content",
      "--out",
      `${outDir}/lane-reverse-content-pitch68-sourcecanvas-full.json`,
    ].join(" "),
  };
};

const scoreTeacherPair = async (probe) => {
  const teacherReportA = probe.teacherReport;
  const capturePlan = capturePlanForProbe(probe);
  const teacherReportB = candidateTeacherReportPath(probe) ?? capturePlan.reportPath;
  const missingFiles = [];
  if (!teacherReportA || !(await fileExists(resolve(teacherReportA)))) missingFiles.push(teacherReportA);
  if (!teacherReportB || !(await fileExists(resolve(teacherReportB)))) missingFiles.push(teacherReportB);
  if (missingFiles.length > 0) {
    return {
      id: probe.id,
      type: "teacher-vs-teacher",
      videoId: probe.videoId ?? null,
      label: probe.label ?? probe.id,
      status: "missing",
      teacherReportA: teacherReportA ?? null,
      teacherReportB: teacherReportB ?? null,
      missingFiles,
      capturePlan,
    };
  }

  const args = [
    "scripts/nico-lane-score.mjs",
    "--teacher",
    teacherReportA,
    "--candidate",
    teacherReportB,
  ];
  appendOption(args, "comments", await resolveCommentsPathForProbe(probe));
  for (const [key, value] of Object.entries(probe.options ?? {})) {
    appendOption(args, key, value);
  }
  const result = await runJsonCommand("node", args);
  if (!result.ok) {
    return {
      id: probe.id,
      type: "teacher-vs-teacher",
      videoId: probe.videoId ?? null,
      label: probe.label ?? probe.id,
      status: "error",
      teacherReportA,
      teacherReportB,
      error: result.stderr || result.stdout || `exit ${result.code}`,
      capturePlan,
    };
  }
  const score = Number(result.json.matchedProgressPercent ?? result.json.progressPercent);
  const matchedPairs = Array.isArray(result.json.matchedPairs) ? result.json.matchedPairs.length : 0;
  const positionStats = Array.isArray(result.json.matchedPairs)
    ? positionLaneStats(result.json.matchedPairs)
    : { offsetPx: null, exact: 0, rate: null };
  const laneIndexExact = Array.isArray(result.json.matchedPairs)
    ? result.json.matchedPairs.filter((pair) => pair.teacher?.lane === pair.candidate?.lane).length
    : 0;
  return {
    id: probe.id,
    type: "teacher-vs-teacher",
    videoId: probe.videoId ?? null,
    label: probe.label ?? probe.id,
    status: "ok",
    teacherReportA,
    teacherReportB,
    score: Number.isFinite(score) ? Math.round(score * 10) / 10 : null,
    laneExactRate: positionStats.rate,
    laneYOffsetPx: positionStats.offsetPx,
    laneIndexExactRate: matchedPairs > 0 ? Math.round((laneIndexExact / matchedPairs) * 1000) / 1000 : null,
    matchedPairs,
    teacherCount: result.json.teacherCount ?? null,
    candidateCount: result.json.candidateCount ?? null,
    inputSet: result.json.inputSet ?? null,
    oracleScores: result.json.oracleScores ?? null,
    result: result.json,
  };
};

const percentile = (values, ratio) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
};

const mean = (values) => {
  const finite = values.filter(Number.isFinite);
  if (finite.length === 0) return null;
  return Math.round((finite.reduce((sum, value) => sum + value, 0) / finite.length) * 10) / 10;
};

const finiteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const positionLaneStats = (pairs, tolerancePx = 8) => {
  const yDeltas = pairs
    .map((pair) => {
      const teacherY = finiteNumber(pair.teacher?.y);
      const candidateY = finiteNumber(pair.candidate?.y);
      return teacherY !== null && candidateY !== null ? candidateY - teacherY : null;
    })
    .filter(Number.isFinite);
  const offsetPx = percentile(yDeltas, 0.5) ?? 0;
  const exact = pairs.filter((pair) => {
    const teacherY = finiteNumber(pair.teacher?.y);
    const candidateY = finiteNumber(pair.candidate?.y);
    if (teacherY !== null && candidateY !== null) {
      return Math.abs(candidateY - teacherY - offsetPx) <= tolerancePx;
    }
    return pair.teacher?.lane === pair.candidate?.lane;
  }).length;
  return {
    offsetPx,
    exact,
    rate: pairs.length > 0 ? Math.round((exact / pairs.length) * 1000) / 1000 : null,
  };
};

const oracleSummary = (ok, key) => {
  const values = ok
    .map((probe) => Number(probe.oracleScores?.[key]?.progressPercent))
    .filter(Number.isFinite);
  return {
    mean: mean(values),
    min: values.length > 0 ? Math.min(...values) : null,
    p50: percentile(values, 0.5),
  };
};

const summarize = (probes, thresholds) => {
  const ok = probes.filter((probe) => probe.status === "ok");
  const scores = ok.map((probe) => Number(probe.score)).filter(Number.isFinite);
  const laneExactRates = ok.map((probe) => Number(probe.laneExactRate)).filter(Number.isFinite);
  const laneIndexExactRates = ok.map((probe) => Number(probe.laneIndexExactRate)).filter(Number.isFinite);
  const missing = probes.filter((probe) => probe.status === "missing");
  const errors = probes.filter((probe) => probe.status === "error");
  const complete = probes.length === 9 && ok.length === 9;
  const gates = {
    completeNineProbeTeacherSet: complete,
    scoreMeanAtLeastThreshold: complete && mean(scores) !== null && mean(scores) >= thresholds.scoreMean,
    scoreMinAtLeastThreshold: complete && scores.length > 0 && Math.min(...scores) >= thresholds.scoreMin,
    laneExactMeanAtLeastThreshold:
      complete && mean(laneExactRates) !== null && mean(laneExactRates) >= thresholds.laneExactMean,
  };
  return {
    total: probes.length,
    ok: ok.length,
    missing: missing.length,
    error: errors.length,
    complete,
    score: {
      mean: mean(scores),
      min: scores.length > 0 ? Math.min(...scores) : null,
      p50: percentile(scores, 0.5),
    },
    laneExactRate: {
      mean: mean(laneExactRates),
      min: laneExactRates.length > 0 ? Math.min(...laneExactRates) : null,
      p50: percentile(laneExactRates, 0.5),
    },
    laneIndexExactRate: {
      mean: mean(laneIndexExactRates),
      min: laneIndexExactRates.length > 0 ? Math.min(...laneIndexExactRates) : null,
      p50: percentile(laneIndexExactRates, 0.5),
    },
    oracleScores: {
      normal: oracleSummary(ok, "normal"),
      commentSet: oracleSummary(ok, "commentSet"),
      lane: oracleSummary(ok, "lane"),
      y: oracleSummary(ok, "y"),
      laneY: oracleSummary(ok, "laneY"),
      laneYTime: oracleSummary(ok, "laneYTime"),
    },
    thresholds,
    gates,
    passed: Object.values(gates).every(Boolean),
    missingProbeIds: missing.map((probe) => probe.id),
    errorProbeIds: errors.map((probe) => probe.id),
  };
};

const buildMarkdown = (report) => {
  const lines = [];
  lines.push("# Teacher-vs-Teacher 9 Probe Gate");
  lines.push("");
  lines.push(`作成日時: ${report.createdAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- passed: ${report.summary.passed}`);
  lines.push(`- complete: ${report.summary.complete}`);
  lines.push(`- ok/missing/error: ${report.summary.ok}/${report.summary.missing}/${report.summary.error}`);
  lines.push(`- score mean/min: ${report.summary.score.mean ?? "n/a"} / ${report.summary.score.min ?? "n/a"}`);
  lines.push(`- lane exact by normalized y mean/min: ${report.summary.laneExactRate.mean ?? "n/a"} / ${report.summary.laneExactRate.min ?? "n/a"}`);
  lines.push(`- lane index exact mean/min: ${report.summary.laneIndexExactRate.mean ?? "n/a"} / ${report.summary.laneIndexExactRate.min ?? "n/a"}`);
  if (report.summary.oracleScores) {
    lines.push(`- oracle commentSet mean/min: ${report.summary.oracleScores.commentSet.mean ?? "n/a"} / ${report.summary.oracleScores.commentSet.min ?? "n/a"}`);
    lines.push(`- oracle laneYTime mean/min: ${report.summary.oracleScores.laneYTime.mean ?? "n/a"} / ${report.summary.oracleScores.laneYTime.min ?? "n/a"}`);
  }
  lines.push("");
  lines.push("## Probes");
  for (const probe of report.probes) {
    lines.push("");
    lines.push(`### ${probe.id}`);
    lines.push("");
    lines.push(`- status: ${probe.status}`);
    if (probe.status === "ok") {
      lines.push(`- score: ${probe.score}`);
      lines.push(`- lane exact by normalized y rate: ${probe.laneExactRate}`);
      lines.push(`- lane y offset px: ${probe.laneYOffsetPx ?? "n/a"}`);
      lines.push(`- lane index exact rate: ${probe.laneIndexExactRate}`);
      lines.push(`- count: teacher ${probe.teacherCount} / candidate ${probe.candidateCount} / matched ${probe.matchedPairs}`);
      if (probe.inputSet) {
        lines.push(`- input set: identity ${probe.inputSet.matchedByIdentity} / heuristic ${probe.inputSet.matchedByHeuristic} / shared ${probe.inputSet.sharedIdentityKeys}`);
      }
    } else if (probe.capturePlan) {
      lines.push(`- required report: ${probe.capturePlan.reportPath}`);
      lines.push(`- cdp trace: ${probe.capturePlan.cdpTraceCommand ?? "n/a"}`);
      lines.push(`- reverse: ${probe.capturePlan.reverseCommand}`);
    }
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const configPath = resolve(args.config || ".calibration/nico/teacher-vs-teacher-probes.json");
  const fallbackConfigPath = resolve(".calibration/nico/probes.json");
  const config = (await fileExists(configPath)) ? await loadJson(configPath) : await loadJson(fallbackConfigPath);
  const probes = (Array.isArray(config.probes) ? config.probes : []).filter((probe) => probe.type === "lane");
  const results = [];
  for (const probe of probes) {
    results.push(await scoreTeacherPair(probe));
  }
  const report = {
    createdAt: new Date().toISOString(),
    config: (await fileExists(configPath)) ? configPath : fallbackConfigPath,
    summary: summarize(results, {
      scoreMean: Number(args["score-mean-threshold"] ?? 95),
      scoreMin: Number(args["score-min-threshold"] ?? 90),
      laneExactMean: Number(args["lane-exact-mean-threshold"] ?? 0.95),
    }),
    probes: results,
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

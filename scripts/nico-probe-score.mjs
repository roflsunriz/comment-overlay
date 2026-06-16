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
        resolveRun({
          ok: false,
          code,
          stderr: stderr.trim(),
          stdout: stdout.trim(),
        });
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

const scoreLaneProbe = async (probe) => {
  const args = [
    "scripts/nico-lane-score.mjs",
    "--teacher",
    probe.teacherReport,
    "--candidate",
    probe.candidateReport,
  ];
  for (const [key, value] of Object.entries(probe.options ?? {})) {
    appendOption(args, key, value);
  }
  const result = await runJsonCommand("node", args);
  if (!result.ok) return result;
  return {
    ok: true,
    json: result.json,
    score: Number(result.json.matchedProgressPercent ?? result.json.progressPercent),
    secondaryScore: Number(result.json.progressPercent),
  };
};

const scoreStrictProbe = async (probe, scriptName) => {
  const args = [
    `scripts/${scriptName}`,
    "--comments",
    probe.comments,
    "--teacher",
    probe.teacherTrace,
    "--candidate",
    probe.candidateTrace,
  ];
  for (const [key, value] of Object.entries(probe.options ?? {})) {
    appendOption(args, key, value);
  }
  const result = await runJsonCommand("node", args);
  if (!result.ok) return result;
  const summary = result.json.summary ?? {};
  const score =
    scriptName === "nico-internal-score.mjs"
      ? Number(summary.internalLayoutScore) * 100
      : Number(summary.outerLayerPositionScore) * 100;
  return {
    ok: true,
    json: result.json,
    score,
    secondaryScore: null,
  };
};

const requiredFilesForProbe = (probe) => {
  if (probe.type === "lane") {
    return [probe.teacherReport, probe.candidateReport];
  }
  if (probe.type === "strict" || probe.type === "internal") {
    return [probe.comments, probe.teacherTrace, probe.candidateTrace];
  }
  return [];
};

const scoreProbe = async (probe) => {
  const missingFiles = [];
  for (const file of requiredFilesForProbe(probe)) {
    if (!file || !(await fileExists(resolve(file)))) {
      missingFiles.push(file);
    }
  }
  if (missingFiles.length > 0) {
    return {
      id: probe.id,
      type: probe.type,
      videoId: probe.videoId ?? null,
      label: probe.label ?? probe.id,
      status: "missing",
      missingFiles,
      unstableInput: Boolean(probe.unstableInput),
      excludeFromComposite: probe.excludeFromComposite === true,
      excludeReason: probe.excludeReason ?? null,
    };
  }

  const result =
    probe.type === "lane"
      ? await scoreLaneProbe(probe)
      : probe.type === "strict"
        ? await scoreStrictProbe(probe, "nico-strict-score.mjs")
        : probe.type === "internal"
          ? await scoreStrictProbe(probe, "nico-internal-score.mjs")
          : { ok: false, stderr: `Unknown probe type: ${probe.type}` };

  if (!result.ok) {
    return {
      id: probe.id,
      type: probe.type,
      videoId: probe.videoId ?? null,
      label: probe.label ?? probe.id,
      status: "error",
      error: result.stderr || result.stdout || `exit ${result.code}`,
      unstableInput: Boolean(probe.unstableInput),
      excludeFromComposite: probe.excludeFromComposite === true,
      excludeReason: probe.excludeReason ?? null,
    };
  }

  return {
    id: probe.id,
    type: probe.type,
    videoId: probe.videoId ?? null,
    label: probe.label ?? probe.id,
    status: "ok",
    unstableInput: Boolean(probe.unstableInput),
    excludeFromComposite: probe.excludeFromComposite === true,
    excludeReason: probe.excludeReason ?? null,
    score: Number.isFinite(result.score) ? Math.round(result.score * 10) / 10 : null,
    secondaryScore: Number.isFinite(result.secondaryScore)
      ? Math.round(result.secondaryScore * 10) / 10
      : null,
    result: result.json,
  };
};

const percentile = (values, ratio) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
};

const summarize = (probeResults) => {
  const scored = probeResults.filter(
    (probe) => probe.status === "ok" && Number.isFinite(Number(probe.score)),
  );
  const compositeEligible = scored.filter((probe) => probe.excludeFromComposite !== true);
  const stable = compositeEligible.filter((probe) => !probe.unstableInput);
  const scores = scored.map((probe) => Number(probe.score));
  const compositeScores = compositeEligible.map((probe) => Number(probe.score));
  const stableScores = stable.map((probe) => Number(probe.score));
  return {
    total: probeResults.length,
    expectedTotal: probeResults.length,
    compositeTotal: compositeEligible.length,
    excludedFromComposite: probeResults.filter((probe) => probe.excludeFromComposite === true).length,
    isCompleteNineProbeSet: probeResults.length === 9,
    ok: scored.length,
    missing: probeResults.filter((probe) => probe.status === "missing").length,
    error: probeResults.filter((probe) => probe.status === "error").length,
    unstableInput: probeResults.filter((probe) => probe.unstableInput).length,
    all: {
      mean:
        scores.length > 0
          ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10
          : null,
      min: scores.length > 0 ? Math.min(...scores) : null,
      p10: percentile(scores, 0.1),
      p50: percentile(scores, 0.5),
    },
    stableOnly: {
      count: stableScores.length,
      mean:
        stableScores.length > 0
          ? Math.round(
              (stableScores.reduce((sum, value) => sum + value, 0) / stableScores.length) * 10,
            ) / 10
          : null,
      min: stableScores.length > 0 ? Math.min(...stableScores) : null,
      p10: percentile(stableScores, 0.1),
      p50: percentile(stableScores, 0.5),
    },
    composite: {
      score:
        compositeEligible.length > 0 && compositeEligible.length + (probeResults.length - compositeEligible.length) === probeResults.length
          ? Math.round(
              (compositeScores.reduce((sum, value) => sum + value, 0) / compositeScores.length) *
                10,
            ) /
            10
          : null,
      complete:
        compositeEligible.length > 0 &&
        compositeEligible.every((probe) => probe.status === "ok") &&
        probeResults.filter((probe) => probe.excludeFromComposite !== true).length ===
          compositeEligible.length,
      note:
        compositeEligible.length > 0
          ? "Composite score is the mean of probes not marked excludeFromComposite."
          : "Composite score is null until at least one probe is eligible.",
    },
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const configPath = resolve(args.config || ".calibration/nico/probes.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const probes = Array.isArray(config.probes) ? config.probes : [];
  const results = [];
  for (const probe of probes) {
    results.push(await scoreProbe(probe));
  }
  const report = {
    createdAt: new Date().toISOString(),
    config: configPath,
    summary: summarize(results),
    probes: results,
  };
  if (args.out) {
    const outPath = resolve(args.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

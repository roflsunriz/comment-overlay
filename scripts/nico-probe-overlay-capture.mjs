#!/usr/bin/env node
import { access, mkdir, readFile } from "node:fs/promises";
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

const runCommand = (command, args) =>
  new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      rejectRun(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });

const numberOption = (options, key, fallback) => {
  const value = Number(options?.[key]);
  return Number.isFinite(value) ? value : fallback;
};

const reportDirectoryFromCandidatePath = (path) => dirname(resolve(path));

const traceDirectoryFromReportDirectory = (path) => path;

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const configPath = resolve(args.config || ".calibration/nico/probes.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const probes = (Array.isArray(config.probes) ? config.probes : []).filter(
    (probe) => probe.type === "lane",
  );
  const only = args.only ? new Set(String(args.only).split(",").map((item) => item.trim())) : null;
  const overwrite = args.overwrite === "true";
  const width = Number(args.width ?? 1182);
  const height = Number(args.height ?? 665);
  const fps = Number(args.fps ?? 15);
  const dpr = Number(args.dpr ?? 1);
  const officialComments = args["official-comments"] || "main";
  const commentSource = args["comment-source"] || null;
  const prerollMs = Number(args["preroll-ms"] ?? 3000);

  for (const probe of probes) {
    if (only && !only.has(probe.id)) continue;
    const candidateReport = resolve(probe.candidateReport);
    if (!overwrite && (await fileExists(candidateReport))) {
      console.log(`[skip] ${probe.id}: candidate report already exists`);
      continue;
    }

    const startMs = numberOption(probe.options, "start-ms", 0);
    const endMs = numberOption(probe.options, "end-ms", startMs + 12_000);
    const durationMs = Math.max(1_000, endMs - startMs);
    const outDir = traceDirectoryFromReportDirectory(reportDirectoryFromCandidatePath(candidateReport));
    const officialAllCommentsPath = resolve(
      `.calibration/nico/${probe.videoId}/input-current/nvcomment-current-all-comments.json`,
    );
    const officialMainCommentsPath = resolve(
      `.calibration/nico/${probe.videoId}/input-current/nvcomment-current-main-comments.json`,
    );
    const fixtureCommentsPath = resolve(`overlay-tests/fixtures/${probe.videoId}-comments.json`);
    const probeOfficialComments = probe.officialComments || officialComments;
    const commentsPath =
      probeOfficialComments === "all" && (await fileExists(officialAllCommentsPath))
        ? officialAllCommentsPath
        : probeOfficialComments !== "fixture" && (await fileExists(officialMainCommentsPath))
          ? officialMainCommentsPath
          : fixtureCommentsPath;

    await mkdir(outDir, { recursive: true });
    console.log(`[overlay] ${probe.id}: ${startMs}-${endMs}ms -> ${outDir}`);
    console.log(`[overlay] comments: ${commentsPath}`);
    await runCommand("bun", [
      "scripts/nico-overlay-trace.mjs",
      "--comments",
      commentsPath,
      "--comment-source",
      commentSource || probe.commentSource || "auto",
      "--out",
      outDir,
      "--width",
      String(width),
      "--height",
      String(height),
      "--start-ms",
      String(startMs),
      "--duration-ms",
      String(durationMs),
      "--preroll-ms",
      String(prerollMs),
      "--fps",
      String(fps),
      "--dpr",
      String(dpr),
    ]);

    const reverseArgs = [
      "scripts/nico-lane-reverse.mjs",
      "--trace",
      resolve(outDir, "trace.jsonl"),
      "--source",
      "comment-overlay",
      "--max-source-width",
      String(args["max-source-width"] ?? 1300),
      "--max-source-height",
      String(probe.options?.["max-source-height"] ?? args["max-source-height"] ?? 260),
      "--min-source-height",
      String(probe.options?.["min-source-height"] ?? args["min-source-height"] ?? 12),
      "--min-y",
      String(args["min-y"] ?? -5),
      "--lane-pitch",
      String(args["lane-pitch"] ?? 68),
      "--basis",
      String(args.basis ?? "content"),
      "--out",
      candidateReport,
      "--sample-limit",
      String(args["sample-limit"] ?? 10),
    ];
    await runCommand("node", reverseArgs);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

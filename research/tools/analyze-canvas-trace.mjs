#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import {
  analyzeScenarioCanvasTrace,
  canvasAnalysisMarkdown,
} from "./lib/canvas-trace-analysis.mjs";
import { booleanArg, parseArgs } from "./lib/cli.mjs";
import { loadCommentScenario } from "./lib/comment-scenario.mjs";

const HELP = `
合成コメントシナリオとCanvas JSONLを対応付け、処理順とレーン幾何を集計します。

Usage:
  node research/tools/analyze-canvas-trace.mjs --trace <canvas-trace.jsonl> --scenario <json> [--out <dir>]
`;

const ensureResearchPath = (path) => {
  const researchRoot = resolve("research");
  const absolute = resolve(path);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Research path must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (booleanArg(args, "help")) {
    console.log(HELP.trim());
    return;
  }
  if (!args.trace || !args.scenario) throw new Error("--trace and --scenario are required.");
  const tracePath = ensureResearchPath(args.trace);
  const scenarioPath = ensureResearchPath(args.scenario);
  const outDirectory = ensureResearchPath(args.out ?? dirname(tracePath));
  const { scenario } = await loadCommentScenario(scenarioPath);
  const records = (await readFile(tracePath, "utf8"))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const analysis = analyzeScenarioCanvasTrace(records, scenario);
  await mkdir(outDirectory, { recursive: true });
  const jsonPath = resolve(outDirectory, "canvas-analysis.json");
  const markdownPath = resolve(outDirectory, "canvas-analysis.md");
  await writeFile(jsonPath, `${JSON.stringify(analysis, null, 2)}\n`, "utf8");
  await writeFile(markdownPath, canvasAnalysisMarkdown(analysis), "utf8");
  console.log(`analysis: ${relative(process.cwd(), jsonPath)}`);
  console.log(JSON.stringify(analysis.summary));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

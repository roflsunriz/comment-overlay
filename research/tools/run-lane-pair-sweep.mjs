#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import {
  analyzeScenarioCanvasTrace,
  canvasAnalysisMarkdown,
} from "./lib/canvas-trace-analysis.mjs";
import { booleanArg, numberArg, parseArgs, sleep } from "./lib/cli.mjs";
import { normalizeCommentScenario } from "./lib/comment-scenario.mjs";
import { runReplay } from "./replay-session.mjs";

const HELP = `
2コメントを独立したオフライン再生へ投入し、指定した時刻差で同一レーンを再利用するか測ります。

Usage:
  node research/tools/run-lane-pair-sweep.mjs --archive <manifest.json> [options]

Options:
  --dt-ms <ms>             時刻差（既定: 0）
  --first-body <text>      先行コメント本文
  --second-body <text>     後続コメント本文
  --line-count <n>         自動生成本文の行数（既定: 1）
  --first-line-count <n>   先行コメントの行数（--line-countを上書き）
  --second-line-count <n>  後続コメントの行数（--line-countを上書き）
  --body-prefix <text>     自動生成本文のprefix（既定: CO_PAIR_<時刻差>）
  --size <name>            medium / small / big（既定: medium）
  --first-size <name>      先行コメントのsize（--sizeを上書き）
  --second-size <name>     後続コメントのsize（--sizeを上書き）
  --position <name>        naka / ue / shita（既定: naka）
  --color <name>           色コマンド（既定: white）
  --source <name>          trunk / leaf（既定: trunk）
  --premium                isPremiumをtrueにする
  --seek-ms <ms>           各ケースの観測時刻（既定: 30000）
  --settle-ms <ms>         seek後の観測時間（既定: 1000）
  --handler-wait-ms <ms>   終了前の通信処理待機上限（既定: 5000）
  --retries <n>            ケースごとの再試行回数（既定: 2）
  --out <dir>              集計先（既定: research/runs/lane-pair-probe）
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

const parseDtList = (value) => {
  const values = String(value)
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item >= 0);
  const unique = [...new Set(values)].sort((left, right) => left - right);
  if (unique.length !== 1) throw new Error("--dt-ms must contain exactly one valid value.");
  return unique;
};

const makeCase = (
  dtMs,
  seekMs,
  index,
  requestedFirstBody,
  requestedSecondBody,
  firstSize,
  secondSize,
  position,
  color,
  source,
  isPremium,
  firstLineCount,
  secondLineCount,
  requestedBodyPrefix,
) => {
  const marker = String(Math.round(dtMs)).padStart(5, "0");
  const bodyPrefix = requestedBodyPrefix ?? `CO_PAIR_${marker}`;
  const makeBody = (suffix, lineCount) =>
    Array.from(
      { length: lineCount },
      (_, lineIndex) => `${bodyPrefix}_${suffix}_L${lineIndex + 1}`,
    ).join("\n");
  const firstBody = requestedFirstBody ?? makeBody("A", firstLineCount);
  const secondBody = requestedSecondBody ?? makeBody("B", secondLineCount);
  if (firstBody === secondBody) {
    throw new Error("--first-body and --second-body must differ for unambiguous trace matching.");
  }
  const scenario = normalizeCommentScenario({
    formatVersion: 1,
    name: `lane-pair-dt-${marker}`,
    targetFork: "main",
    comments: [
      {
        no: 920001 + index * 2,
        vposMs: seekMs - dtMs,
        body: firstBody,
        commands: ["184", position, color, firstSize],
        source,
        isPremium,
      },
      {
        no: 920002 + index * 2,
        vposMs: seekMs,
        body: secondBody,
        commands: ["184", position, color, secondSize],
        source,
        isPremium,
      },
    ],
  });
  return { dtMs, seekMs, marker, firstBody, secondBody, scenario };
};

const firstDrawCall = (analysis, body) =>
  analysis.comments.find((comment) => comment.body === body)?.drawCalls[0] ?? null;

const makeCaseResult = (analysis, probeCase, attempts) => {
  const first = firstDrawCall(analysis, probeCase.firstBody);
  const second = firstDrawCall(analysis, probeCase.secondBody);
  const firstY = first?.geometry?.translationY ?? null;
  const secondY = second?.geometry?.translationY ?? null;
  return {
    dtMs: probeCase.dtMs,
    seekMs: probeCase.seekMs,
    firstBody: probeCase.firstBody,
    secondBody: probeCase.secondBody,
    attempts,
    ok: Boolean(first && second),
    first: first
      ? {
          translationX: first.geometry.translationX,
          translationY: firstY,
          sourceWidth: first.sourceWidth,
          sourceHeight: first.sourceHeight,
          measuredTextWidth: first.measuredTextWidth,
          renderedTextWidth: first.renderedTextWidth,
        }
      : null,
    second: second
      ? {
          translationX: second.geometry.translationX,
          translationY: secondY,
          sourceWidth: second.sourceWidth,
          sourceHeight: second.sourceHeight,
          measuredTextWidth: second.measuredTextWidth,
          renderedTextWidth: second.renderedTextWidth,
        }
      : null,
    sameLane:
      Number.isFinite(firstY) && Number.isFinite(secondY)
        ? Math.abs(firstY - secondY) < 0.01
        : null,
    laneDelta: Number.isFinite(firstY) && Number.isFinite(secondY) ? secondY - firstY : null,
  };
};

const failedCaseResult = (probeCase, attempts) => ({
  dtMs: probeCase.dtMs,
  seekMs: probeCase.seekMs,
  firstBody: probeCase.firstBody,
  secondBody: probeCase.secondBody,
  attempts,
  ok: false,
  first: null,
  second: null,
  sameLane: null,
  laneDelta: null,
});

const aggregateMarkdown = (aggregate) => `# Lane pair probe

- replay count: ${aggregate.summary.replayCount}
- first same-lane dt: ${aggregate.summary.firstSameLaneDtMs ?? "not observed"} ms
- monotonic after first reuse: ${aggregate.summary.monotonicAfterFirstReuse}

| dt (ms) | ok | attempts | same lane | lane delta | width A | width B |
| ---: | :---: | ---: | :---: | ---: | ---: | ---: |
${aggregate.cases
  .map(
    (result) =>
      `| ${result.dtMs} | ${result.ok} | ${result.attempts} | ${result.sameLane ?? "-"} | ${result.laneDelta ?? "-"} | ${result.first?.sourceWidth ?? "-"} | ${result.second?.sourceWidth ?? "-"} |`,
  )
  .join("\n")}
`;

const runCase = async ({
  archivePath,
  outDirectory,
  probeCase,
  settleMs,
  handlerWaitMs,
  retries,
}) => {
  const caseDirectory = resolve(outDirectory, "cases", `dt-${probeCase.marker}`);
  await mkdir(caseDirectory, { recursive: true });
  const scenarioPath = resolve(caseDirectory, "scenario.json");
  await writeFile(scenarioPath, `${JSON.stringify(probeCase.scenario, null, 2)}\n`, "utf8");

  const attemptLogs = [];
  let replay = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await runReplay({
        archive: archivePath,
        scenario: scenarioPath,
        "seek-ms": String(probeCase.seekMs),
        "settle-ms": String(settleMs),
        "handler-wait-ms": String(handlerWaitMs),
        out: caseDirectory,
        "allow-misses": "true",
      });
      replay = { exitCode: result.exitCode, output: `${JSON.stringify(result.audit.summary)}\n` };
    } catch (error) {
      replay = { exitCode: 1, output: error.stack ?? error.message };
    }
    attemptLogs.push(`=== attempt ${attempt + 1}, exit ${replay.exitCode} ===\n${replay.output}`);
    if (replay.exitCode === 0) break;
    await sleep(1000 * (attempt + 1));
  }
  await writeFile(resolve(caseDirectory, "replay.log"), attemptLogs.join("\n"), "utf8");
  if (replay.exitCode !== 0) return failedCaseResult(probeCase, attemptLogs.length);

  const tracePath = resolve(caseDirectory, "canvas-trace.jsonl");
  const records = (await readFile(tracePath, "utf8"))
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const analysis = analyzeScenarioCanvasTrace(records, probeCase.scenario);
  await writeFile(
    resolve(caseDirectory, "canvas-analysis.json"),
    `${JSON.stringify(analysis, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    resolve(caseDirectory, "canvas-analysis.md"),
    canvasAnalysisMarkdown(analysis),
    "utf8",
  );
  return makeCaseResult(analysis, probeCase, attemptLogs.length);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (booleanArg(args, "help")) {
    console.log(HELP.trim());
    return;
  }
  if (!args.archive) throw new Error("--archive is required.");
  const archivePath = ensureResearchPath(args.archive);
  const outDirectory = ensureResearchPath(args.out ?? "research/runs/lane-pair-probe");
  const dtValues = parseDtList(args["dt-ms"] ?? "0");
  const seekMs = numberArg(args, "seek-ms", 30_000, { minimum: 0 });
  const settleMs = numberArg(args, "settle-ms", 1000, { minimum: 0 });
  const handlerWaitMs = numberArg(args, "handler-wait-ms", 5000, { minimum: 0 });
  const retries = Math.max(0, Math.floor(numberArg(args, "retries", 2, { minimum: 0 })));
  const requestedFirstBody = args["first-body"];
  const requestedSecondBody = args["second-body"];
  const requestedBodyPrefix = args["body-prefix"];
  if (requestedBodyPrefix !== undefined && requestedBodyPrefix.length === 0) {
    throw new Error("--body-prefix must be non-empty when provided.");
  }
  const lineCount = Math.floor(numberArg(args, "line-count", 1, { minimum: 1 }));
  const firstLineCount = Math.floor(numberArg(args, "first-line-count", lineCount, { minimum: 1 }));
  const secondLineCount = Math.floor(
    numberArg(args, "second-line-count", lineCount, { minimum: 1 }),
  );
  if (Math.max(lineCount, firstLineCount, secondLineCount) > 100) {
    throw new Error("Comment line counts must be at most 100.");
  }
  const size = args.size ?? "medium";
  const firstSize = args["first-size"] ?? size;
  const secondSize = args["second-size"] ?? size;
  if ([size, firstSize, secondSize].some((value) => !["medium", "small", "big"].includes(value))) {
    throw new Error("Comment sizes must be medium, small, or big.");
  }
  const position = args.position ?? "naka";
  if (!["naka", "ue", "shita"].includes(position)) {
    throw new Error("--position must be naka, ue, or shita.");
  }
  const color = args.color ?? "white";
  if (typeof color !== "string" || color.length === 0) {
    throw new Error("--color must be a non-empty command.");
  }
  const source = args.source ?? "trunk";
  if (!["trunk", "leaf"].includes(source)) {
    throw new Error("--source must be trunk or leaf.");
  }
  const isPremium = booleanArg(args, "premium");
  if (Math.max(...dtValues) > seekMs) throw new Error("Every dt value must be <= seek-ms.");
  await mkdir(outDirectory, { recursive: true });

  const results = [];
  for (const [index, dtMs] of dtValues.entries()) {
    const probeCase = makeCase(
      dtMs,
      seekMs,
      index,
      requestedFirstBody,
      requestedSecondBody,
      firstSize,
      secondSize,
      position,
      color,
      source,
      isPremium,
      firstLineCount,
      secondLineCount,
      requestedBodyPrefix,
    );
    results.push(
      await runCase({
        archivePath,
        outDirectory,
        probeCase,
        settleMs,
        handlerWaitMs,
        retries,
      }),
    );
  }

  const firstSameLaneIndex = results.findIndex((result) => result.sameLane === true);
  const failedCaseCount = results.filter((result) => !result.ok).length;
  const aggregate = {
    formatVersion: 5,
    createdAt: new Date().toISOString(),
    archive: relative(process.cwd(), archivePath),
    seekMs,
    settleMs,
    handlerWaitMs,
    size,
    sizes: { first: firstSize, second: secondSize },
    position,
    color,
    source,
    isPremium,
    lineCount,
    lineCounts: { first: firstLineCount, second: secondLineCount },
    bodyPrefix: requestedBodyPrefix ?? null,
    bodies: {
      first: results[0]?.firstBody ?? requestedFirstBody ?? null,
      second: results[0]?.secondBody ?? requestedSecondBody ?? null,
    },
    dtValues,
    summary: {
      replayCount: results.reduce((total, result) => total + result.attempts, 0),
      successfulCaseCount: results.length - failedCaseCount,
      failedCaseCount,
      firstSameLaneDtMs: firstSameLaneIndex >= 0 ? results[firstSameLaneIndex].dtMs : null,
      monotonicAfterFirstReuse:
        failedCaseCount === 0 &&
        (firstSameLaneIndex < 0 ||
          results.slice(firstSameLaneIndex).every((result) => result.sameLane === true)),
    },
    cases: results,
  };
  await writeFile(
    resolve(outDirectory, "aggregate.json"),
    `${JSON.stringify(aggregate, null, 2)}\n`,
    "utf8",
  );
  await writeFile(resolve(outDirectory, "aggregate.md"), aggregateMarkdown(aggregate), "utf8");
  console.log(`aggregate: ${relative(process.cwd(), resolve(outDirectory, "aggregate.json"))}`);
  console.log(JSON.stringify(aggregate.summary));
  if (failedCaseCount > 0) process.exitCode = 1;
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

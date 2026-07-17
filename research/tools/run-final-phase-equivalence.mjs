#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs } from "./lib/cli.mjs";
import { buildCases } from "./run-fixed-comment-matrix.mjs";

const ensureResearchPath = (candidate) => {
  const researchRoot = resolve("research");
  const absolute = resolve(candidate);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Final-phase output must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const runProcess = (args) =>
  new Promise((resolveRun) => {
    const child = spawn(process.execPath, args, { stdio: "inherit" });
    child.once("exit", (code) => resolveRun(code ?? 1));
    child.once("error", () => resolveRun(1));
  });

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const outRoot = ensureResearchPath(
    args.out ?? "research/runs/comment-matrix-final-phase-equivalence",
  );
  const casesRoot = resolve(outRoot, "cases");
  await mkdir(casesRoot, { recursive: true });
  const matrixScript = fileURLToPath(new URL("./run-fixed-comment-matrix.mjs", import.meta.url));
  const cases = buildCases("final-phase-equivalence");
  const results = [];

  for (const [index, testCase] of cases.entries()) {
    const caseRoot = resolve(casesRoot, testCase.id);
    const matrixPath = resolve(caseRoot, "matrix-results.json");
    let result = null;
    try {
      result = JSON.parse(await readFile(matrixPath, "utf8")).results?.[0] ?? null;
    } catch {
      // A missing or incomplete case is rerun below.
    }
    for (let attempt = 1; !result && attempt <= 3; attempt += 1) {
      console.log(`[${index + 1}/${cases.length}] ${testCase.id} attempt ${attempt}/3`);
      const exitCode = await runProcess([
        matrixScript,
        "--profile",
        "final-phase-equivalence",
        "--case",
        testCase.id,
        "--out",
        caseRoot,
      ]);
      if (exitCode !== 0) continue;
      try {
        result = JSON.parse(await readFile(matrixPath, "utf8")).results?.[0] ?? null;
      } catch {
        result = null;
      }
    }
    if (!result) {
      throw new Error(`${testCase.id}: failed after 3 attempts`);
    }
    results.push(result);
  }

  const outputPath = resolve(outRoot, "matrix-results.json");
  await writeFile(
    outputPath,
    `${JSON.stringify(
      { formatVersion: 1, profile: "final-phase-equivalence", caseCount: results.length, results },
      null,
      2,
    )}\n`,
    "utf8",
  );
  console.log(`matrix: ${outputPath}`);
};

const isDirectInvocation =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectInvocation) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

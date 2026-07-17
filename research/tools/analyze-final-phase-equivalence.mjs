#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { booleanArg, parseArgs } from "./lib/cli.mjs";

const ensureResearchPath = (candidate) => {
  const researchRoot = resolve("research");
  const absolute = resolve(candidate);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Final-phase analysis path must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const finiteDifference = (first, second) =>
  Number.isFinite(first) && Number.isFinite(second) ? Math.abs(first - second) : null;

const compareDraw = (control, end) => {
  const controlActive = control.drawCallCount > 0;
  const endActive = end.drawCallCount > 0;
  const xDifference = finiteDifference(control.translationX, end.translationX);
  const yDifference = finiteDifference(control.translationY, end.translationY);
  const widthDifference = finiteDifference(control.transformedWidth, end.transformedWidth);
  const heightDifference = finiteDifference(control.transformedHeight, end.transformedHeight);
  const equivalent =
    controlActive === endActive &&
    control.sourceFont === end.sourceFont &&
    control.sourceWidth === end.sourceWidth &&
    control.sourceHeight === end.sourceHeight &&
    (xDifference === null || xDifference <= 0.25) &&
    (yDifference === null || yDifference <= 0.25) &&
    (widthDifference === null || widthDifference <= 0.25) &&
    (heightDifference === null || heightDifference <= 0.25);
  return {
    no: control.no,
    controlActive,
    endActive,
    xDifference,
    yDifference,
    widthDifference,
    heightDifference,
    equivalent,
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    throw new Error("--input <matrix-results.json> is required");
  }
  const inputPath = ensureResearchPath(args.input);
  const outputPath = ensureResearchPath(
    args.out ?? "research/runs/final-phase-equivalence-analysis.json",
  );
  const matrix = JSON.parse(await readFile(inputPath, "utf8"));
  const byId = new Map(matrix.results.map((result) => [result.id, result]));
  const controlResults = matrix.results.filter((result) =>
    result.id.startsWith("final-phase-control-"),
  );
  const comparisons = controlResults.map((control) => {
    const endId = control.id.replace("final-phase-control-", "final-phase-end-");
    const end = byId.get(endId);
    if (!end) {
      return { controlId: control.id, endId, equivalent: false, reason: "missing-end-case" };
    }
    const draws = control.draws.map((draw, index) => compareDraw(draw, end.draws[index]));
    return {
      controlId: control.id,
      endId,
      matchedCountEqual: control.matchedCommentCount === end.matchedCommentCount,
      draws,
      equivalent:
        control.matchedCommentCount === end.matchedCommentCount &&
        draws.every((draw) => draw.equivalent),
    };
  });
  const report = {
    formatVersion: 1,
    input: inputPath,
    comparisonCount: comparisons.length,
    equivalentCount: comparisons.filter((entry) => entry.equivalent).length,
    mismatchCount: comparisons.filter((entry) => !entry.equivalent).length,
    comparisons,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(
    JSON.stringify({
      comparisonCount: report.comparisonCount,
      equivalentCount: report.equivalentCount,
      mismatchCount: report.mismatchCount,
      output: outputPath,
    }),
  );
  if (booleanArg(args, "require-equivalence") && report.mismatchCount > 0) {
    process.exitCode = 1;
  }
};

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  await main();
}

#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { analyzeScenarioCanvasTrace } from "./lib/canvas-trace-analysis.mjs";
import { parseArgs } from "./lib/cli.mjs";
import { normalizeCommentScenario } from "./lib/comment-scenario.mjs";
import { runReplay } from "./replay-session.mjs";

const BASE_VPOS_MS = 10_000;
const DEFAULT_ARCHIVE = "research/captures/sm6240144-baseline-20260717/manifest.json";
const DEFAULT_OUT = "research/runs/fixed-comment-matrix";
const TIME_DELTAS_MS = [0, 1, 10, 33, 100, 250, 500, 1000, 2000, 2999, 3000, 3001, 5000];
const LINE_COUNTS = {
  small: [1, 6, 7, 16, 30],
  medium: [1, 4, 5, 16, 30],
  big: [1, 2, 3, 16, 30],
};

const ensureResearchPath = (candidate) => {
  const researchRoot = resolve("research");
  const absolute = resolve(candidate);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Research path must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const markerBody = (lineCount, marker) => {
  const lines = Array.from({ length: Math.max(1, lineCount) }, () => "　 ");
  lines[Math.max(0, lines.length - 2)] = marker;
  return lines.join("\n");
};

const commandsFor = ({ position, size, full = false, font = "defont", ender = false, color }) => [
  position,
  color,
  size,
  ...(full ? ["full"] : []),
  font,
  ...(ender ? ["ender"] : []),
];

const makePairCase = ({
  id,
  deltaMs = 0,
  position = "ue",
  size = "big",
  lineCount = 16,
  full = true,
  font = "mincho",
  ender = false,
  window = null,
}) => ({
  id,
  seekMs: BASE_VPOS_MS + deltaMs,
  expectedMatchedCommentCount: deltaMs < 3000 ? 2 : 1,
  window,
  scenario: {
    formatVersion: 1,
    name: id,
    targetFork: "main",
    comments: [
      {
        no: 910001,
        vposMs: BASE_VPOS_MS,
        body: markerBody(lineCount, "＿▉￣▉＿▉￣"),
        commands: commandsFor({ position, size, full, font, ender, color: "white" }),
      },
      {
        no: 910002,
        vposMs: BASE_VPOS_MS + deltaMs,
        body: markerBody(lineCount, "試￣続▁自￣の"),
        commands: commandsFor({ position, size, full, font, ender, color: "black" }),
      },
    ],
  },
});

const buildTemporalCases = () =>
  TIME_DELTAS_MS.flatMap((deltaMs) =>
    ["ue", "shita"].map((position) =>
      makePairCase({ id: `temporal-${position}-${deltaMs}ms`, deltaMs, position }),
    ),
  );

const buildGeometryCases = () =>
  ["ue", "shita"].flatMap((position) =>
    Object.entries(LINE_COUNTS).flatMap(([size, lineCounts]) =>
      lineCounts.map((lineCount) =>
        makePairCase({
          id: `geometry-${position}-${size}-${lineCount}lines`,
          position,
          size,
          lineCount,
        }),
      ),
    ),
  );

const buildFeatureCases = () =>
  ["ue", "shita"].flatMap((position) =>
    [false, true].flatMap((full) =>
      ["defont", "gothic", "mincho"].flatMap((font) =>
        [false, true].map((ender) =>
          makePairCase({
            id: `feature-${position}-${full ? "full" : "plain"}-${font}-${ender ? "ender" : "normal"}`,
            position,
            full,
            font,
            ender,
          }),
        ),
      ),
    ),
  );

const buildViewportCases = () =>
  [
    [1280, 720],
    [1600, 900],
    [960, 540],
    [720, 1280],
  ].flatMap(([width, height]) =>
    ["ue", "shita"].map((position) =>
      makePairCase({
        id: `viewport-${position}-${width}x${height}`,
        position,
        window: { width, height },
      }),
    ),
  );

const buildBoundaryCases = () => {
  const boundaryLineCounts = {
    small: [18, 19, 37, 38],
    medium: [12, 13, 25, 26],
    big: [7, 8, 15, 16],
  };
  return ["ue", "shita"].flatMap((position) =>
    Object.entries(boundaryLineCounts).flatMap(([size, lineCounts]) =>
      lineCounts.map((lineCount) =>
        makePairCase({
          id: `boundary-${position}-${size}-${lineCount}lines`,
          position,
          size,
          lineCount,
        }),
      ),
    ),
  );
};

const buildRepeatCases = () => {
  const seeds = [
    ["small", 30],
    ["medium", 16],
    ["big", 16],
    ["big", 30],
  ];
  return [1, 2, 3].flatMap((repeat) =>
    ["ue", "shita"].flatMap((position) =>
      seeds.map(([size, lineCount]) =>
        makePairCase({
          id: `repeat-r${repeat}-${position}-${size}-${lineCount}lines`,
          position,
          size,
          lineCount,
        }),
      ),
    ),
  );
};

const buildWidthCases = () => {
  const bodies = [
    ["short", "幅", "狭"],
    ["medium", "幅".repeat(10), "狭".repeat(10)],
    ["long", "幅".repeat(30), "狭".repeat(30)],
    ["very-long", "幅".repeat(60), "狭".repeat(60)],
    ["extreme", "幅".repeat(120), "狭".repeat(120)],
    ["tabs", `${"\t".repeat(12)}幅`, `${"\t".repeat(12)}狭`],
  ];
  return ["ue", "shita"].flatMap((position) =>
    bodies.map(([label, firstBody, secondBody]) => {
      const testCase = makePairCase({
        id: `width-${position}-${label}`,
        position,
        size: "big",
        lineCount: 1,
        full: false,
        font: "mincho",
      });
      testCase.scenario.comments[0].body = firstBody;
      testCase.scenario.comments[1].body = secondBody;
      return testCase;
    }),
  );
};

const buildWidthBoundaryCases = () => {
  const characterCounts = [1, 10, 15, 20, 25, 30, 40, 60, 90, 120];
  return ["small", "medium", "big"].flatMap((size) =>
    characterCounts.map((characterCount) => {
      const testCase = makePairCase({
        id: `width-boundary-${size}-${characterCount}chars`,
        position: "ue",
        size,
        lineCount: 1,
        full: false,
        font: "mincho",
      });
      testCase.scenario.comments[0].body = "幅".repeat(characterCount);
      testCase.scenario.comments[1].body = "狭".repeat(characterCount);
      return testCase;
    }),
  );
};

const layeredComment = ({ no, position = "ue", color, marker, arrayIndex }) => ({
  no,
  vposMs: BASE_VPOS_MS,
  body: markerBody(16, marker ?? `LAYER_${arrayIndex}`),
  commands: commandsFor({ position, size: "big", full: true, font: "mincho", color }),
});

const buildOrderCases = () => {
  const ascending = [
    layeredComment({ no: 920001, color: "white", marker: "ORDER_A", arrayIndex: 0 }),
    layeredComment({ no: 920002, color: "red", marker: "ORDER_B", arrayIndex: 1 }),
    layeredComment({ no: 920003, color: "black", marker: "ORDER_C", arrayIndex: 2 }),
  ];
  const variants = [
    ["ascending", ascending],
    ["reverse-array", [...ascending].reverse()],
    ["reverse-no", ascending.map((comment, index) => ({ ...comment, no: 920003 - index }))],
  ];
  return variants.map(([label, comments]) => ({
    id: `order-${label}`,
    seekMs: BASE_VPOS_MS,
    expectedMatchedCommentCount: 3,
    window: null,
    scenario: {
      formatVersion: 1,
      name: `order-${label}`,
      targetFork: "main",
      comments,
    },
  }));
};

const buildInteractionCases = () => {
  const makeCase = (id, comments) => ({
    id,
    seekMs: BASE_VPOS_MS,
    expectedMatchedCommentCount: comments.length,
    window: null,
    scenario: { formatVersion: 1, name: id, targetFork: "main", comments },
  });
  return [
    makeCase("interaction-ue-shita-oversized", [
      layeredComment({ no: 930001, position: "ue", color: "white", marker: "TOP", arrayIndex: 0 }),
      layeredComment({
        no: 930002,
        position: "shita",
        color: "black",
        marker: "BOTTOM",
        arrayIndex: 1,
      }),
    ]),
    makeCase("interaction-ue-shita-single", [
      {
        no: 930011,
        vposMs: BASE_VPOS_MS,
        body: "TOP_SINGLE",
        commands: ["ue", "white", "medium"],
      },
      {
        no: 930012,
        vposMs: BASE_VPOS_MS,
        body: "BOTTOM_SINGLE",
        commands: ["shita", "black", "medium"],
      },
    ]),
    makeCase("interaction-ue-naka-single", [
      {
        no: 930021,
        vposMs: BASE_VPOS_MS,
        body: "TOP_SINGLE",
        commands: ["ue", "white", "medium"],
      },
      {
        no: 930022,
        vposMs: BASE_VPOS_MS,
        body: "SCROLL_SINGLE",
        commands: ["naka", "red", "medium"],
      },
    ]),
    makeCase("interaction-shita-naka-single", [
      {
        no: 930031,
        vposMs: BASE_VPOS_MS,
        body: "BOTTOM_SINGLE",
        commands: ["shita", "white", "medium"],
      },
      {
        no: 930032,
        vposMs: BASE_VPOS_MS,
        body: "SCROLL_SINGLE",
        commands: ["naka", "red", "medium"],
      },
    ]),
  ];
};

const customFixedComment = ({
  no,
  marker,
  position = "ue",
  size = "medium",
  lineCount = 1,
  vposMs = BASE_VPOS_MS,
  font = "mincho",
  full = false,
  ender = false,
}) => ({
  no,
  vposMs,
  body: markerBody(lineCount, marker),
  commands: commandsFor({ position, size, full, font, ender, color: "white" }),
});

const customCase = (id, comments, { seekMs = BASE_VPOS_MS } = {}) => ({
  id,
  seekMs,
  expectedMatchedCommentCount: comments.length,
  window: null,
  scenario: { formatVersion: 1, name: id, targetFork: "main", comments },
});

const buildSeekCases = () =>
  ["ue", "shita"].map((position) => {
    const testCase = customCase(
      `seek-${position}-expiry-rebuild`,
      [
        customFixedComment({
          no: 950001,
          marker: "SEEK_EXPIRES",
          position,
          size: "medium",
          vposMs: 7000,
        }),
        customFixedComment({
          no: 950002,
          marker: "SEEK_SURVIVES",
          position,
          size: "big",
          vposMs: 8000,
        }),
        customFixedComment({
          no: 950003,
          marker: "SEEK_NEW",
          position,
          size: "small",
          vposMs: 10000,
        }),
      ],
      { seekMs: 10000 },
    );
    testCase.seekSequenceMs = [8000, 10000];
    return testCase;
  });

const buildIdentityCases = () =>
  [
    ["normal", { size: "medium", lineCount: 1 }],
    ["fallback", { size: "small", lineCount: 19 }],
    ["oversized", { size: "big", lineCount: 16, full: true }],
  ].flatMap(([label, options]) =>
    ["same", "different"].flatMap((identity) =>
      ["ue", "shita"].map((position) => {
        const testCase = makePairCase({
          id: `identity-${label}-${identity}-${position}`,
          position,
          font: "mincho",
          ...options,
        });
        testCase.scenario.comments[0].userId = "identity-a";
        testCase.scenario.comments[1].userId = identity === "same" ? "identity-a" : "identity-b";
        return testCase;
      }),
    ),
  );

const buildForkCases = () =>
  ["owner", "main", "easy"].flatMap((targetFork) =>
    ["ue", "shita"].map((position) => {
      const testCase = makePairCase({
        id: `fork-${targetFork}-${position}`,
        position,
        size: "medium",
        lineCount: 1,
        full: false,
        font: "defont",
      });
      testCase.scenario.targetFork = targetFork;
      return testCase;
    }),
  );

const buildGlyphWidthCases = () => {
  const bodies = [
    ["ascii-wide", "W".repeat(60), "M".repeat(60)],
    ["ascii-narrow", "i".repeat(120), "l".repeat(120)],
    ["emoji", "🙂".repeat(40), "😀".repeat(40)],
    ["combining", "e\u0301".repeat(60), "a\u0308".repeat(60)],
    ["mixed", "W幅🙂".repeat(30), "M狭😀".repeat(30)],
    ["spaces", `${"\u3000".repeat(60)}幅`, `${"\u2003".repeat(60)}狭`],
  ];
  return bodies.map(([label, firstBody, secondBody]) => {
    const testCase = makePairCase({
      id: `glyph-width-${label}`,
      position: "ue",
      size: "big",
      lineCount: 1,
      full: false,
      font: "mincho",
    });
    testCase.scenario.comments[0].body = firstBody;
    testCase.scenario.comments[1].body = secondBody;
    return testCase;
  });
};

const buildDistributionCases = () =>
  Array.from({ length: 20 }, (_, index) =>
    makePairCase({
      id: `distribution-ue-small-19lines-r${index + 1}`,
      position: "ue",
      size: "small",
      lineCount: 19,
      full: false,
      font: "mincho",
    }),
  );

const buildSearchCases = () => {
  const variable = (position, reverse = false) => {
    const specs = [
      ["small", 1, "VAR_A"],
      ["big", 1, "VAR_B"],
      ["medium", 1, "VAR_C"],
      ["small", 1, "VAR_D"],
    ];
    const comments = specs.map(([size, lineCount, marker], index) =>
      customFixedComment({
        no: 940001 + (reverse ? specs.length - 1 - index : index),
        marker,
        position,
        size,
        lineCount,
      }),
    );
    return customCase(
      `search-${position}-variable-${reverse ? "reverse-no" : "ascending"}`,
      comments,
    );
  };
  const overflow = (position, repeat) =>
    customCase(`search-${position}-fallback-r${repeat}`, [
      customFixedComment({
        no: 941001,
        marker: "FALLBACK_A",
        position,
        size: "small",
        lineCount: 19,
      }),
      customFixedComment({
        no: 941002,
        marker: "FALLBACK_B",
        position,
        size: "small",
        lineCount: 19,
      }),
      customFixedComment({
        no: 941003,
        marker: "FALLBACK_C",
        position,
        size: "small",
        lineCount: 1,
      }),
      customFixedComment({
        no: 941004,
        marker: "FALLBACK_D",
        position,
        size: "small",
        lineCount: 1,
      }),
    ]);
  return [
    variable("ue"),
    variable("ue", true),
    variable("shita"),
    variable("shita", true),
    ...[1, 2, 3, 4, 5].flatMap((repeat) => [overflow("ue", repeat), overflow("shita", repeat)]),
  ];
};

const buildWidthMultilineCases = () => {
  const lineCounts = { small: [7, 16], medium: [5, 16], big: [3, 16] };
  return Object.entries(lineCounts).flatMap(([size, counts]) =>
    counts.flatMap((lineCount) =>
      [10, 30, 60].map((characterCount) => {
        const testCase = makePairCase({
          id: `width-multiline-${size}-${lineCount}lines-${characterCount}chars`,
          position: "ue",
          size,
          lineCount,
          full: false,
          font: "mincho",
        });
        const body = (glyph) =>
          [glyph.repeat(characterCount), ...Array.from({ length: lineCount - 1 }, () => "　")].join(
            "\n",
          );
        testCase.scenario.comments[0].body = body("幅");
        testCase.scenario.comments[1].body = body("狭");
        return testCase;
      }),
    ),
  );
};

const buildWidthMultilineBoundaryCases = () => {
  const specs = {
    small: { lineCount: 7, characterCounts: [40, 45, 50, 55] },
    medium: { lineCount: 5, characterCounts: [35, 40, 45, 50] },
    big: { lineCount: 3, characterCounts: [15, 20, 22, 24, 25, 26, 27] },
  };
  return Object.entries(specs).flatMap(([size, { lineCount, characterCounts }]) =>
    characterCounts.map((characterCount) => {
      const testCase = makePairCase({
        id: `width-multiline-boundary-${size}-${lineCount}lines-${characterCount}chars`,
        position: "ue",
        size,
        lineCount,
        full: false,
        font: "mincho",
      });
      const body = (glyph) =>
        [glyph.repeat(characterCount), ...Array.from({ length: lineCount - 1 }, () => "　")].join(
          "\n",
        );
      testCase.scenario.comments[0].body = body("幅");
      testCase.scenario.comments[1].body = body("狭");
      return testCase;
    }),
  );
};

const buildWidthFeatureCases = () =>
  [
    { lineCount: 1, characterCounts: [30], fonts: ["defont", "gothic", "mincho"] },
    { lineCount: 16, characterCounts: [30, 60], fonts: ["mincho"] },
  ].flatMap(({ lineCount, characterCounts, fonts }) =>
    characterCounts.flatMap((characterCount) =>
      fonts.flatMap((font) =>
        [false, true].flatMap((full) =>
          [false, true].map((ender) => {
            const testCase = makePairCase({
              id: `width-feature-${lineCount}lines-${characterCount}chars-${font}-${full ? "full" : "plain"}-${ender ? "ender" : "normal"}`,
              position: "ue",
              size: "big",
              lineCount,
              full,
              font,
              ender,
            });
            const body = (glyph) =>
              [
                glyph.repeat(characterCount),
                ...Array.from({ length: lineCount - 1 }, () => "　"),
              ].join("\n");
            testCase.scenario.comments[0].body = body("幅");
            testCase.scenario.comments[1].body = body("狭");
            return testCase;
          }),
        ),
      ),
    ),
  );

const buildWidthExtremeFeatureCases = () => {
  const singleLine = [60, 90, 120].map((characterCount) => {
    const testCase = makePairCase({
      id: `width-extreme-single-${characterCount}chars-full`,
      position: "ue",
      size: "big",
      lineCount: 1,
      full: true,
      font: "mincho",
    });
    testCase.scenario.comments[0].body = "幅".repeat(characterCount);
    testCase.scenario.comments[1].body = "狭".repeat(characterCount);
    return testCase;
  });
  const multiline = [90, 120].flatMap((characterCount) =>
    [false, true].flatMap((full) =>
      [false, true].map((ender) => {
        const testCase = makePairCase({
          id: `width-extreme-16lines-${characterCount}chars-${full ? "full" : "plain"}-${ender ? "ender" : "normal"}`,
          position: "ue",
          size: "big",
          lineCount: 16,
          full,
          font: "mincho",
          ender,
        });
        const body = (glyph) =>
          [glyph.repeat(characterCount), ...Array.from({ length: 15 }, () => "　")].join("\n");
        testCase.scenario.comments[0].body = body("幅");
        testCase.scenario.comments[1].body = body("狭");
        return testCase;
      }),
    ),
  );
  return [...singleLine, ...multiline];
};

const buildDurationFeatureCases = () =>
  [
    ["plain-small", { size: "small", lineCount: 1, full: false, font: "defont" }],
    ["full-big", { size: "big", lineCount: 16, full: true, font: "mincho" }],
    ["ender-big", { size: "big", lineCount: 16, full: false, font: "gothic", ender: true }],
  ].flatMap(([label, options]) =>
    [2999, 3000].flatMap((deltaMs) =>
      ["ue", "shita"].map((position) =>
        makePairCase({
          id: `duration-${label}-${position}-${deltaMs}ms`,
          deltaMs,
          position,
          ...options,
        }),
      ),
    ),
  );

export const buildCases = (profile) => {
  if (profile === "temporal") return buildTemporalCases();
  if (profile === "geometry") return buildGeometryCases();
  if (profile === "features") return buildFeatureCases();
  if (profile === "viewport") return buildViewportCases();
  if (profile === "boundary") return buildBoundaryCases();
  if (profile === "repeat") return buildRepeatCases();
  if (profile === "width") return buildWidthCases();
  if (profile === "width-boundary") return buildWidthBoundaryCases();
  if (profile === "order") return buildOrderCases();
  if (profile === "interaction") return buildInteractionCases();
  if (profile === "search") return buildSearchCases();
  if (profile === "width-multiline") return buildWidthMultilineCases();
  if (profile === "width-multiline-boundary") return buildWidthMultilineBoundaryCases();
  if (profile === "width-features") return buildWidthFeatureCases();
  if (profile === "width-extreme-features") return buildWidthExtremeFeatureCases();
  if (profile === "duration-features") return buildDurationFeatureCases();
  if (profile === "seek") return buildSeekCases();
  if (profile === "identity") return buildIdentityCases();
  if (profile === "fork") return buildForkCases();
  if (profile === "glyph-width") return buildGlyphWidthCases();
  if (profile === "distribution") return buildDistributionCases();
  if (profile === "all") {
    return [
      ...buildTemporalCases(),
      ...buildGeometryCases(),
      ...buildFeatureCases(),
      ...buildViewportCases(),
      ...buildBoundaryCases(),
      ...buildRepeatCases(),
      ...buildWidthCases(),
      ...buildWidthBoundaryCases(),
      ...buildOrderCases(),
      ...buildInteractionCases(),
      ...buildSearchCases(),
      ...buildWidthMultilineCases(),
      ...buildWidthMultilineBoundaryCases(),
      ...buildWidthFeatureCases(),
      ...buildWidthExtremeFeatureCases(),
      ...buildDurationFeatureCases(),
      ...buildSeekCases(),
      ...buildIdentityCases(),
      ...buildForkCases(),
      ...buildGlyphWidthCases(),
      ...buildDistributionCases(),
    ];
  }
  throw new Error(`Unknown profile: ${profile}`);
};

const firstDraw = (comment) => comment?.drawCalls?.[0] ?? null;

const summarizeAnalysis = (testCase, analysis) => {
  const draws = analysis.comments.map((comment) => {
    const draw = firstDraw(comment);
    return {
      no: comment.no,
      drawCallCount: comment.drawCallCount,
      sequence: draw?.sequence ?? null,
      videoCurrentTimeMs: draw?.videoCurrentTimeMs ?? null,
      sourceWidth: draw?.sourceWidth ?? null,
      sourceHeight: draw?.sourceHeight ?? null,
      translationX: draw?.geometry?.translationX ?? null,
      translationY: draw?.geometry?.translationY ?? null,
    };
  });
  const ys = draws.map((draw) => draw.translationY).filter(Number.isFinite);
  const ySpread = ys.length > 1 ? Math.max(...ys) - Math.min(...ys) : null;
  return {
    id: testCase.id,
    seekMs: testCase.seekMs,
    window: testCase.window,
    matchedCommentCount: analysis.summary.matchedCommentCount,
    unmatchedCommentCount: analysis.summary.unmatchedCommentCount,
    draws,
    ySpread,
    overlaps: ySpread !== null ? Math.abs(ySpread) <= 0.01 : null,
  };
};

const renderMarkdown = (profile, results) => {
  const lines = [
    `# Fixed comment matrix: ${profile}`,
    "",
    "| case | matched | Y1 | Y2 | ΔY | overlap | source heights |",
    "| --- | ---: | ---: | ---: | ---: | :---: | --- |",
  ];
  for (const result of results) {
    const [first, second] = result.draws;
    lines.push(
      `| ${result.id} | ${result.matchedCommentCount} | ${first?.translationY?.toFixed(3) ?? "-"} | ${second?.translationY?.toFixed(3) ?? "-"} | ${result.ySpread?.toFixed(3) ?? "-"} | ${result.overlaps === null ? "-" : result.overlaps ? "yes" : "no"} | ${result.draws.map((draw) => draw.sourceHeight ?? "-").join(", ")} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const profile = args.profile ?? "temporal";
  const archive = ensureResearchPath(args.archive ?? DEFAULT_ARCHIVE);
  const outRoot = ensureResearchPath(args.out ?? `${DEFAULT_OUT}-${profile}`);
  const allCases = buildCases(profile);
  const caseFilter = args.case ?? null;
  const cases = caseFilter ? allCases.filter((testCase) => testCase.id === caseFilter) : allCases;
  if (caseFilter && cases.length === 0) {
    throw new Error(`Unknown case for ${profile}: ${caseFilter}`);
  }
  const results = [];
  await mkdir(outRoot, { recursive: true });

  for (const [index, testCase] of cases.entries()) {
    const caseDirectory = resolve(outRoot, testCase.id);
    const scenarioPath = resolve(caseDirectory, "scenario.json");
    await mkdir(caseDirectory, { recursive: true });
    await writeFile(scenarioPath, `${JSON.stringify(testCase.scenario, null, 2)}\n`, "utf8");
    process.stdout.write(`[${index + 1}/${cases.length}] ${testCase.id}\n`);
    const scenario = normalizeCommentScenario(testCase.scenario);
    const settleAttempts = args["settle-ms"] ? [args["settle-ms"]] : ["250", "1000", "2500"];
    let analysis = null;
    for (const [attemptIndex, settleMs] of settleAttempts.entries()) {
      const replay = await runReplay({
        archive,
        scenario: scenarioPath,
        out: caseDirectory,
        "seek-ms": String(testCase.seekMs),
        ...(testCase.seekSequenceMs
          ? { "seek-sequence-ms": testCase.seekSequenceMs.join(",") }
          : {}),
        "settle-ms": settleMs,
        "seek-wait-ms": args["seek-wait-ms"] ?? "5000",
        "handler-wait-ms": args["handler-wait-ms"] ?? "1000",
        "allow-misses": "true",
        ...(testCase.window
          ? {
              "window-width": String(testCase.window.width),
              "window-height": String(testCase.window.height),
            }
          : {}),
      });
      if (replay.exitCode !== 0) throw new Error(`${testCase.id}: replay failed`);
      const tracePath = resolve(caseDirectory, "canvas-trace.jsonl");
      const records = (await readFile(tracePath, "utf8"))
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      analysis = analyzeScenarioCanvasTrace(records, scenario);
      if (analysis.summary.matchedCommentCount >= testCase.expectedMatchedCommentCount) break;
      if (attemptIndex < settleAttempts.length - 1) {
        process.stdout.write(
          `  retry: matched ${analysis.summary.matchedCommentCount}/${testCase.expectedMatchedCommentCount}, settle ${settleAttempts[attemptIndex + 1]}ms\n`,
        );
      }
    }
    if (!analysis) throw new Error(`${testCase.id}: analysis unavailable`);
    results.push(summarizeAnalysis(testCase, analysis));
  }

  const jsonPath = resolve(outRoot, "matrix-results.json");
  const markdownPath = resolve(outRoot, "matrix-results.md");
  await writeFile(
    jsonPath,
    `${JSON.stringify({ formatVersion: 1, profile, caseCount: results.length, results }, null, 2)}\n`,
    "utf8",
  );
  await writeFile(markdownPath, renderMarkdown(profile, results), "utf8");
  console.log(`matrix: ${relative(process.cwd(), jsonPath)}`);
};

const isDirectInvocation =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectInvocation) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

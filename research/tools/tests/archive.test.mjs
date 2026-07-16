import assert from "node:assert/strict";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  ARCHIVE_FORMAT_VERSION,
  indexArchiveExchanges,
  loadArchive,
  requestFingerprint,
  sanitizeRequestHeaders,
  sanitizeResponseHeaders,
  sha256,
} from "../lib/archive.mjs";
import { buildCanvasObserverScript } from "../lib/canvas-observer.mjs";
import { analyzeScenarioCanvasTrace, destinationGeometry } from "../lib/canvas-trace-analysis.mjs";
import { settleOrTimeout } from "../lib/cli.mjs";
import {
  applyScenarioToNvCommentResponse,
  isNvCommentThreadsRequest,
  normalizeCommentScenario,
} from "../lib/comment-scenario.mjs";
import { isLocalInjectionRequest } from "../lib/request-policy.mjs";

test("機密性の高いヘッダーをアーカイブ対象から除外する", () => {
  assert.deepEqual(
    sanitizeRequestHeaders({
      Accept: "application/json",
      Cookie: "session=secret",
      Authorization: "Bearer secret",
      "Content-Type": "application/json",
    }),
    { Accept: "application/json", "Content-Type": "application/json" },
  );
  assert.deepEqual(
    sanitizeResponseHeaders({
      "content-type": "text/plain",
      "set-cookie": "session=secret",
      "content-encoding": "br",
    }),
    [{ name: "content-type", value: "text/plain" }],
  );
});

test("リクエスト本文ハッシュを含む完全一致で交換を検索する", () => {
  const exchange = {
    request: {
      method: "POST",
      url: "https://example.invalid/api",
      postDataSha256: sha256(Buffer.from("{}")),
    },
  };
  const index = indexArchiveExchanges({ exchanges: [exchange] });
  assert.equal(index.exact.get(requestFingerprint(exchange.request)), exchange);
});

test("本文の改ざんを読み込み時に検出する", async () => {
  const temporaryDirectory = resolve(
    "research/.tmp",
    `archive-test-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(join(temporaryDirectory, "bodies"), { recursive: true });
  const body = Buffer.from("captured response");
  const bodyHash = sha256(body);
  await writeFile(join(temporaryDirectory, "bodies/body.bin"), "tampered response");
  await writeFile(
    join(temporaryDirectory, "manifest.json"),
    JSON.stringify({
      formatVersion: ARCHIVE_FORMAT_VERSION,
      entryUrl: "https://www.nicovideo.jp/watch/sm9",
      exchanges: [
        {
          request: { method: "GET", url: "https://example.invalid", postDataSha256: null },
          body: { file: "bodies/body.bin", sha256: bodyHash },
        },
      ],
    }),
  );
  try {
    await assert.rejects(loadArchive(join(temporaryDirectory, "manifest.json")), /hash mismatch/);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("イベントが先に完了した場合は待機タイマーを残さない", async () => {
  const result = await settleOrTimeout(Promise.resolve("loaded"), 10_000);
  assert.deepEqual(result, { timedOut: false, value: "loaded" });
});

test("合成コメントの空白とコマンドを保持して正規化する", () => {
  const scenario = normalizeCommentScenario({
    formatVersion: 1,
    comments: [{ vposMs: 0, body: "　 AA  ", commands: ["ue", "red"] }],
  });
  assert.equal(scenario.comments[0].body, "　 AA  ");
  assert.deepEqual(scenario.comments[0].commands, ["ue", "red"]);
  assert.equal(scenario.comments[0].no, 900001);
});

test("指定forkだけへ合成コメントを注入し他forkを空にする", () => {
  const scenario = normalizeCommentScenario({
    formatVersion: 1,
    targetFork: "main",
    comments: [{ vposMs: 1000, body: "probe" }],
  });
  const original = {
    data: {
      globalComments: [{ id: "global" }],
      threads: [
        { id: "1", fork: "owner", commentCount: 1, comments: [{ body: "owner" }] },
        { id: "1", fork: "main", commentCount: 2, comments: [{ body: "a" }, { body: "b" }] },
        { id: "1", fork: "easy", commentCount: 1, comments: [{ body: "easy" }] },
      ],
    },
  };
  const transformed = applyScenarioToNvCommentResponse(original, scenario);
  assert.equal(transformed.response.data.threads[1].comments[0].body, "probe");
  assert.equal(transformed.response.data.threads[1].commentCount, 1);
  assert.deepEqual(transformed.response.data.threads[0].comments, []);
  assert.deepEqual(transformed.response.data.threads[2].comments, []);
  assert.deepEqual(transformed.response.data.globalComments, []);
  assert.equal(original.data.threads[1].comments.length, 2);
});

test("nvComment threads POSTだけを置換対象として認識する", () => {
  assert.equal(
    isNvCommentThreadsRequest(
      "POST",
      "https://public.nvcomment.nicovideo.jp/v1/threads?language=ja-jp",
    ),
    true,
  );
  assert.equal(
    isNvCommentThreadsRequest("GET", "https://public.nvcomment.nicovideo.jp/v1/threads"),
    false,
  );
});

test("NicoCache由来のlocal注入資産だけを公式再生から除外する", () => {
  assert.equal(
    isLocalInjectionRequest("https://www.nicovideo.jp/local/features/dist/features.js"),
    true,
  );
  assert.equal(isLocalInjectionRequest("https://www.nicovideo.jp/watch/sm6240144"), false);
  assert.equal(isLocalInjectionRequest("https://example.com/local/features.js"), false);
});

test("Canvas観測スクリプトを事前注入できる形式で生成する", () => {
  const source = buildCanvasObserverScript();
  assert.match(source, /__CO_RESEARCH_CANVAS_SNAPSHOT__/);
  assert.match(source, /fillText/);
  assert.match(source, /drawImage/);
  assert.match(source, /measuredTextWidth/);
});

test("drawImageの変換行列から実座標とレーン間隔を算出する", () => {
  const first = {
    sequence: 1,
    operation: "drawImage",
    sourceCanvasText: { text: "A", measuredTextWidth: 50 },
    args: [0, 0, 100, 20, -10, -5, 100, 20],
    transform: [1, 0, 0, 1, 200, 10],
  };
  const second = {
    ...first,
    sequence: 2,
    sourceCanvasText: { text: "B" },
    transform: [1, 0, 0, 1, 200, 78],
  };
  assert.deepEqual(destinationGeometry(first), {
    destinationX: -10,
    destinationY: -5,
    destinationWidth: 100,
    destinationHeight: 20,
    transformedX: 190,
    transformedY: 5,
    transformedWidth: 100,
    transformedHeight: 20,
    translationX: 200,
    translationY: 10,
  });
  const scenario = normalizeCommentScenario({
    formatVersion: 1,
    comments: [
      { no: 1, vposMs: 0, body: "A" },
      { no: 2, vposMs: 0, body: "B" },
    ],
  });
  const analysis = analyzeScenarioCanvasTrace([first, second], scenario);
  assert.equal(analysis.comments[0].drawCalls[0].measuredTextWidth, 50);
  assert.equal(analysis.summary.medianLanePitch, 68);
  assert.deepEqual(
    analysis.summary.processingOrder.map((entry) => entry.body),
    ["A", "B"],
  );
});

test("canvas trace analysis matches tabs normalized to em spaces", () => {
  const scenario = normalizeCommentScenario({
    formatVersion: 1,
    comments: [{ no: 1, vposMs: 0, body: "\t\t幅", commands: ["ue", "big"] }],
  });
  const analysis = analyzeScenarioCanvasTrace(
    [
      {
        operation: "drawImage",
        sequence: 1,
        args: [0, 0],
        transform: [1, 0, 0, 1, 0, 0],
        sourceCanvasText: { text: "\u2003\u2003\u2003\u2003幅" },
      },
    ],
    scenario,
  );

  assert.equal(analysis.summary.matchedCommentCount, 1);
  assert.equal(analysis.comments[0].drawCallCount, 1);
});

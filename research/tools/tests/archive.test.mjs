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
import { settleOrTimeout } from "../lib/cli.mjs";

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

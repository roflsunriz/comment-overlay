#!/usr/bin/env node
import CDP from "chrome-remote-interface";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";

import { indexArchiveExchanges, loadArchive, requestFingerprint, sha256 } from "./lib/archive.mjs";
import {
  closeChrome,
  createPageClient,
  launchChrome,
  makeTemporaryProfile,
  removeTemporaryProfile,
} from "./lib/browser.mjs";
import { booleanArg, numberArg, parseArgs, settleOrTimeout, sleep } from "./lib/cli.mjs";

const HELP = `
記録済みセッションを、外部通信を遮断したChromeで再生します。

Usage:
  node research/tools/replay-session.mjs --archive <manifest.json> [options]

Options:
  --out <dir>           監査結果の出力先。research/ 配下のみ
  --settle-ms <ms>      ページ遷移後の観測時間（既定: 10000）
  --chrome <path>       Chrome/Chromium 実行ファイル
  --allow-misses        未記録リクエストがあっても終了コードを失敗にしない
`;

const ensureResearchPath = (path) => {
  const researchRoot = resolve("research");
  const absolute = resolve(path);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Research output must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const normalizeRequest = (request) => ({
  method: request.method,
  url: request.url,
  postDataSha256:
    typeof request.postData === "string" ? sha256(Buffer.from(request.postData, "utf8")) : null,
});

const headerValue = (headers, wantedName) => {
  const entry = Object.entries(headers ?? {}).find(
    ([name]) => name.toLowerCase() === wantedName.toLowerCase(),
  );
  return entry?.[1] ? String(entry[1]) : null;
};

const makePreflightHeaders = (request) => [
  {
    name: "access-control-allow-origin",
    value: headerValue(request.headers, "origin") ?? "https://www.nicovideo.jp",
  },
  {
    name: "access-control-allow-methods",
    value: headerValue(request.headers, "access-control-request-method") ?? "GET, POST, OPTIONS",
  },
  {
    name: "access-control-allow-headers",
    value: headerValue(request.headers, "access-control-request-headers") ?? "content-type",
  },
  { name: "access-control-allow-credentials", value: "true" },
  { name: "access-control-max-age", value: "0" },
  { name: "cache-control", value: "no-store" },
  { name: "vary", value: "origin, access-control-request-method, access-control-request-headers" },
];

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (booleanArg(args, "help")) {
    console.log(HELP.trim());
    return;
  }
  if (!args.archive) throw new Error("--archive is required.");

  const archivePath = ensureResearchPath(args.archive);
  const { manifest, bodies } = await loadArchive(archivePath);
  const index = indexArchiveExchanges(manifest);
  const archiveName = basename(resolve(archivePath, ".."));
  const defaultRunName = `${archiveName}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const outDirectory = ensureResearchPath(args.out ?? `research/runs/${defaultRunName}`);
  const settleMs = numberArg(args, "settle-ms", 10_000, { minimum: 0 });
  await mkdir(outDirectory, { recursive: true });

  const profileDirectory = await makeTemporaryProfile("nico-replay");
  const launched = await launchChrome({
    chromePath: args.chrome,
    profileDirectory,
    offline: true,
    extraArguments: ["--disable-extensions", "--disable-breakpad"],
  });
  const browserClient = await CDP({ host: "127.0.0.1", port: launched.port });
  const pageClient = await createPageClient(launched.port);
  const { Fetch, Network, Page, Runtime } = pageClient;
  const served = [];
  const synthesized = [];
  const blocked = [];
  const consoleMessages = [];
  const exceptions = [];
  const webSockets = [];
  const handlerJobs = new Set();

  const track = (promise) => {
    handlerJobs.add(promise);
    promise.then(
      () => handlerJobs.delete(promise),
      () => handlerJobs.delete(promise),
    );
  };

  try {
    await Promise.all([Network.enable(), Page.enable(), Runtime.enable()]);
    await Network.setCacheDisabled({ cacheDisabled: true });
    await Network.setBypassServiceWorker({ bypass: true });

    Runtime.consoleAPICalled((event) => {
      consoleMessages.push({
        type: event.type,
        timestamp: event.timestamp,
        values: event.args.map(
          (argument) => argument.value ?? argument.description ?? argument.type,
        ),
      });
    });
    Runtime.exceptionThrown((event) => {
      exceptions.push({
        timestamp: event.timestamp,
        text: event.exceptionDetails.text,
        description: event.exceptionDetails.exception?.description ?? null,
        url: event.exceptionDetails.url ?? null,
        lineNumber: event.exceptionDetails.lineNumber,
        columnNumber: event.exceptionDetails.columnNumber,
      });
    });
    Network.webSocketCreated((event) => {
      webSockets.push({ requestId: event.requestId, url: event.url });
    });

    await Fetch.enable({ patterns: [{ urlPattern: "*", requestStage: "Request" }] });
    Fetch.requestPaused((event) => {
      const job = (async () => {
        const request = normalizeRequest(event.request);
        const fingerprint = requestFingerprint(request);
        let exchange = index.exact.get(fingerprint);
        if (!exchange && (request.method === "GET" || request.method === "HEAD")) {
          const fallback = requestFingerprint({ ...request, postDataSha256: null });
          exchange = index.withoutPostData.get(fallback);
        }

        if (!exchange && request.method === "OPTIONS") {
          synthesized.push({
            ...request,
            resourceType: event.resourceType,
            kind: "cors-preflight",
          });
          await Fetch.fulfillRequest({
            requestId: event.requestId,
            responseCode: 204,
            responsePhrase: "No Content",
            responseHeaders: makePreflightHeaders(event.request),
          });
          return;
        }

        if (
          !exchange ||
          exchange.omission ||
          (exchange.body?.sha256 && !bodies.has(exchange.body.sha256))
        ) {
          blocked.push({
            ...request,
            resourceType: event.resourceType,
            reason: !exchange ? "not-recorded" : (exchange.omission ?? "body-missing"),
          });
          await Fetch.failRequest({ requestId: event.requestId, errorReason: "BlockedByClient" });
          return;
        }

        const body = exchange.body ? bodies.get(exchange.body.sha256) : null;
        const responseHeaders = exchange.response.headers.filter(
          ({ name }) =>
            !["content-length", "content-encoding", "transfer-encoding"].includes(
              name.toLowerCase(),
            ),
        );
        served.push({
          ...request,
          resourceType: event.resourceType,
          archiveSequence: exchange.sequence,
          status: exchange.response.status,
          bodyBytes: body?.byteLength ?? 0,
        });
        await Fetch.fulfillRequest({
          requestId: event.requestId,
          responseCode: Math.max(200, Math.min(599, Math.round(exchange.response.status))),
          responsePhrase: exchange.response.statusText || undefined,
          responseHeaders,
          body: body ? body.toString("base64") : undefined,
        });
      })().catch(async (error) => {
        blocked.push({
          method: event.request.method,
          url: event.request.url,
          resourceType: event.resourceType,
          reason: `replay-handler-error: ${error.message}`,
        });
        await Fetch.failRequest({
          requestId: event.requestId,
          errorReason: "BlockedByClient",
        }).catch(() => {});
      });
      track(job);
    });

    const loadEvent = new Promise((resolveLoad) => Page.loadEventFired(resolveLoad));
    const navigation = await Page.navigate({ url: manifest.entryUrl });
    if (navigation.errorText) throw new Error(`Replay navigation failed: ${navigation.errorText}`);
    await settleOrTimeout(loadEvent, 45_000);
    await sleep(settleMs);
    await Promise.allSettled([...handlerJobs]);

    const pageState = await Runtime.evaluate({
      expression: `(() => ({
        url: location.href,
        title: document.title,
        readyState: document.readyState,
        bodyTextLength: document.body?.innerText?.length ?? 0,
        canvasCount: document.querySelectorAll('canvas').length,
        videoCount: document.querySelectorAll('video').length
      }))()`,
      returnByValue: true,
    });
    const screenshot = await Page.captureScreenshot({
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(resolve(outDirectory, "replay.png"), Buffer.from(screenshot.data, "base64"));

    const audit = {
      formatVersion: 1,
      createdAt: new Date().toISOString(),
      archive: relative(process.cwd(), archivePath),
      entryUrl: manifest.entryUrl,
      isolation: {
        requestInterception: "all page-target requests",
        unknownRequests: "Fetch.failRequest(BlockedByClient)",
        proxy: "127.0.0.1:9",
        dns: "MAP * ~NOTFOUND",
        quicDisabled: true,
        webRtcPolicy: "disable_non_proxied_udp",
      },
      summary: {
        servedCount: served.length,
        synthesizedCount: synthesized.length,
        blockedCount: blocked.length,
        consoleMessageCount: consoleMessages.length,
        exceptionCount: exceptions.length,
        webSocketAttemptCount: webSockets.length,
      },
      pageState: pageState.result.value ?? null,
      served,
      synthesized,
      blocked,
      webSockets,
      exceptions,
      consoleMessages,
    };
    const auditPath = resolve(outDirectory, "audit.json");
    await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
    console.log(`audit: ${relative(process.cwd(), auditPath)}`);
    console.log(JSON.stringify(audit.summary));
    if (blocked.length > 0 && !booleanArg(args, "allow-misses")) process.exitCode = 2;
  } finally {
    await Fetch.disable().catch(() => {});
    await pageClient.close().catch(() => {});
    await closeChrome({ child: launched.child, browserClient });
    await browserClient.close().catch(() => {});
    await removeTemporaryProfile(profileDirectory);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { indexArchiveExchanges, loadArchive, requestFingerprint, sha256 } from "./lib/archive.mjs";
import { buildCanvasObserverScript } from "./lib/canvas-observer.mjs";
import {
  closeChrome,
  createBrowserClient,
  createPageClient,
  launchChrome,
  makeTemporaryProfile,
  removeTemporaryProfile,
} from "./lib/browser.mjs";
import { booleanArg, numberArg, parseArgs, settleOrTimeout, sleep } from "./lib/cli.mjs";
import {
  applyScenarioToNvCommentResponse,
  isNvCommentThreadsRequest,
  loadCommentScenario,
} from "./lib/comment-scenario.mjs";
import { isLocalInjectionRequest } from "./lib/request-policy.mjs";

const HELP = `
記録済みセッションを、外部通信を遮断したChromeで再生します。

Usage:
  node research/tools/replay-session.mjs --archive <manifest.json> [options]

Options:
  --out <dir>           監査結果の出力先。research/ 配下のみ
  --settle-ms <ms>      ページ遷移後の観測時間（既定: 10000）
  --chrome <path>       Chrome/Chromium 実行ファイル
  --scenario <json>     nvCommentへ注入するresearch/配下の合成コメント
  --seek-ms <ms>        load後にvideo時刻を設定してseekイベントを発火
  --seek-wait-ms <ms>   seek前にvideo要素を待つ時間（既定: 10000）
  --handler-wait-ms <ms> 終了前に通信処理を待つ上限（既定: 5000）
  --cdp-port <port>      ChromeのCDPポートを明示
  --window-width <px>    再生Chromeのウィンドウ幅を上書き
  --window-height <px>   再生Chromeのウィンドウ高さを上書き
  --no-canvas-observer  Canvas APIの事前観測を無効化
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

const replayResponseHeaders = (exchange) =>
  exchange.response.headers.filter(
    ({ name }) =>
      !["content-length", "content-encoding", "transfer-encoding"].includes(name.toLowerCase()),
  );

const seekVideo = async (Runtime, seekMs) => {
  const result = await Runtime.evaluate({
    expression: `(() => {
      const video = document.querySelector('video');
      if (!video) return { ok: false, reason: 'video-not-found' };
      const before = {
        currentTime: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : null,
        paused: video.paused,
        readyState: video.readyState,
        networkState: video.networkState
      };
      try {
        video.dispatchEvent(new Event('seeking'));
        video.currentTime = ${JSON.stringify(seekMs / 1000)};
        video.dispatchEvent(new Event('timeupdate'));
        video.dispatchEvent(new Event('seeked'));
        return {
          ok: true,
          before,
          after: {
            currentTime: video.currentTime,
            duration: Number.isFinite(video.duration) ? video.duration : null,
            paused: video.paused,
            readyState: video.readyState,
            networkState: video.networkState
          }
        };
      } catch (error) {
        return { ok: false, before, reason: String(error?.message ?? error) };
      }
    })()`,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    return { ok: false, reason: result.exceptionDetails.text };
  }
  return result.result.value;
};

const waitForVideoElement = async (Runtime, timeoutMs) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt <= timeoutMs) {
    const result = await Runtime.evaluate({
      expression: "Boolean(document.querySelector('video'))",
      returnByValue: true,
    });
    if (result.result.value === true) {
      return { found: true, waitedMs: Date.now() - startedAt };
    }
    await sleep(100);
  }
  return { found: false, waitedMs: Date.now() - startedAt };
};

export const runReplay = async (args) => {
  if (!args.archive) throw new Error("--archive is required.");

  const archivePath = ensureResearchPath(args.archive);
  const { manifest, bodies } = await loadArchive(archivePath);
  const index = indexArchiveExchanges(manifest);
  const scenarioResult = args.scenario
    ? await loadCommentScenario(ensureResearchPath(args.scenario))
    : null;
  const scenario = scenarioResult?.scenario ?? null;
  const nvCommentTemplate = scenario
    ? manifest.exchanges.find(
        (exchange) =>
          exchange.body &&
          isNvCommentThreadsRequest(exchange.request.method, exchange.request.url) &&
          bodies.has(exchange.body.sha256),
      )
    : null;
  if (scenario && !nvCommentTemplate) {
    throw new Error("The archive does not contain an nvComment response template.");
  }
  const archiveName = basename(resolve(archivePath, ".."));
  const defaultRunName = `${archiveName}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const outDirectory = ensureResearchPath(args.out ?? `research/runs/${defaultRunName}`);
  const settleMs = numberArg(args, "settle-ms", 10_000, { minimum: 0 });
  const seekMs =
    args["seek-ms"] === undefined ? null : numberArg(args, "seek-ms", 0, { minimum: 0 });
  const seekWaitMs = numberArg(args, "seek-wait-ms", 10_000, { minimum: 0 });
  const handlerWaitMs = numberArg(args, "handler-wait-ms", 5000, { minimum: 0 });
  const debuggingPort =
    args["cdp-port"] === undefined ? null : numberArg(args, "cdp-port", null, { minimum: 1 });
  const windowWidth =
    args["window-width"] === undefined
      ? null
      : Math.floor(numberArg(args, "window-width", null, { minimum: 320 }));
  const windowHeight =
    args["window-height"] === undefined
      ? null
      : Math.floor(numberArg(args, "window-height", null, { minimum: 240 }));
  if ((windowWidth === null) !== (windowHeight === null)) {
    throw new Error("--window-width and --window-height must be provided together.");
  }
  await mkdir(outDirectory, { recursive: true });

  const profileDirectory = await makeTemporaryProfile("nico-replay");
  let launched;
  try {
    launched = await launchChrome({
      chromePath: args.chrome,
      profileDirectory,
      offline: true,
      debuggingPort,
      extraArguments: [
        "--disable-extensions",
        "--disable-breakpad",
        ...(windowWidth === null ? [] : [`--window-size=${windowWidth},${windowHeight}`]),
      ],
    });
  } catch (error) {
    await removeTemporaryProfile(profileDirectory).catch((cleanupError) => {
      console.warn(`Temporary profile cleanup failed: ${cleanupError.message}`);
    });
    throw error;
  }
  let browserClient = null;
  let pageClient = null;
  try {
    browserClient = await createBrowserClient(launched.port, launched.child);
    pageClient = await createPageClient(launched.port, launched.child);
  } catch (error) {
    await pageClient?.close().catch(() => {});
    await closeChrome({ child: launched.child, browserClient });
    await browserClient?.close().catch(() => {});
    await removeTemporaryProfile(profileDirectory);
    const chromeDiagnostics = launched.stderr.filter(Boolean).join("\n");
    throw new Error(`${error.message}${chromeDiagnostics ? `\n${chromeDiagnostics}` : ""}`);
  }
  const { Fetch, Network, Page, Runtime } = pageClient;
  const served = [];
  const synthesized = [];
  const disabledLocalInjections = [];
  const overrides = [];
  const blocked = [];
  const consoleMessages = [];
  const exceptions = [];
  const webSockets = [];
  const handlerJobs = new Set();
  const transformedNvCommentBodies = new Map();
  let replayResult = null;

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
    if (!booleanArg(args, "no-canvas-observer")) {
      await Page.addScriptToEvaluateOnNewDocument({ source: buildCanvasObserverScript() });
    }

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

        if (isLocalInjectionRequest(request.url)) {
          disabledLocalInjections.push({
            ...request,
            resourceType: event.resourceType,
            reason: "non-official-local-injection",
          });
          await Fetch.failRequest({ requestId: event.requestId, errorReason: "BlockedByClient" });
          return;
        }

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

        if (scenario && isNvCommentThreadsRequest(request.method, request.url)) {
          const template = exchange?.body ? exchange : nvCommentTemplate;
          let transformed = transformedNvCommentBodies.get(template.body.sha256);
          if (!transformed) {
            const templateBody = bodies.get(template.body.sha256);
            const templateResponse = JSON.parse(templateBody.toString("utf8"));
            const applied = applyScenarioToNvCommentResponse(templateResponse, scenario);
            transformed = {
              body: Buffer.from(`${JSON.stringify(applied.response)}\n`, "utf8"),
              threadSummary: applied.threadSummary,
            };
            transformedNvCommentBodies.set(template.body.sha256, transformed);
          }
          overrides.push({
            ...request,
            resourceType: event.resourceType,
            kind: "nv-comment-scenario",
            scenarioName: scenario.name,
            commentCount: scenario.comments.length,
            threadSummary: transformed.threadSummary,
            archiveSequence: template.sequence,
          });
          await Fetch.fulfillRequest({
            requestId: event.requestId,
            responseCode: 200,
            responsePhrase: "OK",
            responseHeaders: replayResponseHeaders(template),
            body: transformed.body.toString("base64"),
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
        const responseHeaders = replayResponseHeaders(exchange);
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
    const videoWait = seekMs === null ? null : await waitForVideoElement(Runtime, seekWaitMs);
    const clockAction =
      seekMs === null
        ? null
        : {
            requestedSeekMs: seekMs,
            result: videoWait.found
              ? await seekVideo(Runtime, seekMs)
              : { ok: false, reason: "video-not-found-after-wait" },
          };
    await sleep(settleMs);
    const handlerDrain = await settleOrTimeout(Promise.allSettled([...handlerJobs]), handlerWaitMs);
    const pendingHandlerCount = handlerJobs.size;

    const pageState = await Runtime.evaluate({
      expression: `(() => ({
        url: location.href,
        title: document.title,
        readyState: document.readyState,
        bodyTextLength: document.body?.innerText?.length ?? 0,
        devicePixelRatio: window.devicePixelRatio,
        canvasCount: document.querySelectorAll('canvas').length,
        canvasStates: [...document.querySelectorAll('canvas')].map((canvas, index) => {
          const rect = canvas.getBoundingClientRect();
          return {
            index,
            id: canvas.id,
            className: canvas.className,
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          };
        }),
        videoCount: document.querySelectorAll('video').length,
        videoState: (() => {
          const video = document.querySelector('video');
          if (!video) return null;
          const rect = video.getBoundingClientRect();
          return {
            currentTime: video.currentTime,
            duration: Number.isFinite(video.duration) ? video.duration : null,
            paused: video.paused,
            readyState: video.readyState,
            networkState: video.networkState,
            errorCode: video.error?.code ?? null,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            clientWidth: video.clientWidth,
            clientHeight: video.clientHeight,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          };
        })()
      }))()`,
      returnByValue: true,
    });
    const canvasObservation = await Runtime.evaluate({
      expression: `(() => ({
        status: globalThis.__CO_RESEARCH_CANVAS_STATUS__?.() ?? { installed: false },
        records: globalThis.__CO_RESEARCH_CANVAS_SNAPSHOT__?.() ?? []
      }))()`,
      returnByValue: true,
    });
    const canvasResult = canvasObservation.result.value ?? {
      status: { installed: false },
      records: [],
    };
    const canvasRecords = Array.isArray(canvasResult.records) ? canvasResult.records : [];
    const recordTexts = (record) =>
      [record.text, record.sourceCanvasText?.text].filter((value) => typeof value === "string");
    const scenarioTextHits = scenario
      ? scenario.comments.map((comment) => ({
          body: comment.body,
          exactRecordCount: canvasRecords.filter((record) =>
            recordTexts(record).some((text) => text === comment.body),
          ).length,
          containingRecordCount: canvasRecords.filter((record) =>
            recordTexts(record).some((text) => text.includes(comment.body)),
          ).length,
        }))
      : [];
    await writeFile(
      resolve(outDirectory, "canvas-trace.jsonl"),
      canvasRecords.map((record) => JSON.stringify(record)).join("\n") +
        (canvasRecords.length > 0 ? "\n" : ""),
      "utf8",
    );
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
        disabledLocalInjectionCount: disabledLocalInjections.length,
        overrideCount: overrides.length,
        blockedCount: blocked.length,
        consoleMessageCount: consoleMessages.length,
        exceptionCount: exceptions.length,
        webSocketAttemptCount: webSockets.length,
        canvasRecordCount: canvasRecords.length,
        scenarioTextHitCount: scenarioTextHits.filter(
          (result) => result.exactRecordCount > 0 || result.containingRecordCount > 0,
        ).length,
        pendingHandlerCount,
      },
      pageState: pageState.result.value ?? null,
      clockAction: clockAction ? { ...clockAction, videoWait } : null,
      scenario: scenario
        ? {
            path: relative(process.cwd(), scenarioResult.absolutePath),
            name: scenario.name,
            targetFork: scenario.targetFork,
            commentCount: scenario.comments.length,
            textHits: scenarioTextHits,
          }
        : null,
      canvasObserver: canvasResult.status,
      handlerDrain: {
        waitLimitMs: handlerWaitMs,
        timedOut: handlerDrain.timedOut,
        pendingCount: pendingHandlerCount,
      },
      served,
      synthesized,
      disabledLocalInjections,
      overrides,
      blocked,
      webSockets,
      exceptions,
      consoleMessages,
    };
    const auditPath = resolve(outDirectory, "audit.json");
    await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
    console.log(`audit: ${relative(process.cwd(), auditPath)}`);
    console.log(JSON.stringify(audit.summary));
    replayResult = {
      auditPath,
      audit,
      exitCode: blocked.length > 0 && !booleanArg(args, "allow-misses") ? 2 : 0,
    };
  } finally {
    await Fetch.disable().catch(() => {});
    await pageClient?.close().catch(() => {});
    await closeChrome({ child: launched.child, browserClient });
    await browserClient?.close().catch(() => {});
    await removeTemporaryProfile(profileDirectory);
  }
  return replayResult;
};

const isDirectInvocation =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectInvocation) {
  const args = parseArgs(process.argv.slice(2));
  if (booleanArg(args, "help")) {
    console.log(HELP.trim());
  } else {
    runReplay(args)
      .then((result) => {
        process.exitCode = result.exitCode;
      })
      .catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
  }
}

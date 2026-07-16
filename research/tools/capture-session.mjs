#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import {
  ARCHIVE_FORMAT_VERSION,
  sanitizeRequestHeaders,
  sanitizeResponseHeaders,
  sha256,
} from "./lib/archive.mjs";
import {
  closeChrome,
  createBrowserClient,
  createPageClient,
  launchChrome,
  makeTemporaryProfile,
  removeTemporaryProfile,
} from "./lib/browser.mjs";
import { booleanArg, numberArg, parseArgs, settleOrTimeout, sleep } from "./lib/cli.mjs";
import { isLocalInjectionRequest } from "./lib/request-policy.mjs";

const HELP = `
ニコニコ動画の匿名ブラウザーセッションを研究用アーカイブへ記録します。

Usage:
  node research/tools/capture-session.mjs --url <watch URL> [options]

Options:
  --out <dir>             出力先。research/ 配下のみ（既定: research/captures/<video-id>）
  --duration-ms <ms>      load 後の追加記録時間（既定: 10000）
  --max-body-bytes <n>    1レスポンスの保存上限（既定: 26214400）
  --chrome <path>         Chrome/Chromium 実行ファイル
  --overwrite             既存 manifest.json の上書きを許可
`;

const RECORDABLE_TYPES = new Set([
  "Document",
  "Stylesheet",
  "Script",
  "Image",
  "Font",
  "XHR",
  "Fetch",
  "Manifest",
  "Preflight",
  "Other",
]);

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

const ensureSupportedEntryUrl = (rawUrl) => {
  if (!rawUrl) throw new Error("--url is required.");
  const url = new URL(rawUrl);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "www.nicovideo.jp" ||
    !url.pathname.startsWith("/watch/")
  ) {
    throw new Error("--url must be an https://www.nicovideo.jp/watch/... URL.");
  }
  url.hash = "";
  return url.toString();
};

const fileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (booleanArg(args, "help")) {
    console.log(HELP.trim());
    return;
  }

  const entryUrl = ensureSupportedEntryUrl(args.url);
  const videoId = new URL(entryUrl).pathname.split("/").filter(Boolean).at(-1) ?? "watch";
  const outDirectory = ensureResearchPath(args.out ?? `research/captures/${videoId}`);
  const manifestPath = resolve(outDirectory, "manifest.json");
  if ((await fileExists(manifestPath)) && !booleanArg(args, "overwrite")) {
    throw new Error(`${manifestPath} already exists. Pass --overwrite or choose another --out.`);
  }

  const durationMs = numberArg(args, "duration-ms", 10_000, { minimum: 0 });
  const maxBodyBytes = numberArg(args, "max-body-bytes", 25 * 1024 * 1024, { minimum: 1 });
  await mkdir(resolve(outDirectory, "bodies"), { recursive: true });
  const profileDirectory = await makeTemporaryProfile("nico-capture");
  let launched;
  try {
    launched = await launchChrome({
      chromePath: args.chrome,
      profileDirectory,
      extraArguments: ["--disable-extensions", "--disable-breakpad"],
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
    throw error;
  }
  const { Network, Page, Runtime } = pageClient;
  const requests = new Map();
  const responses = new Map();
  const exchanges = [];
  const failures = [];
  const pending = new Set();
  let sequence = 0;

  const track = (promise) => {
    pending.add(promise);
    promise.then(
      () => pending.delete(promise),
      () => pending.delete(promise),
    );
  };

  try {
    await Promise.all([
      Network.enable({ maxTotalBufferSize: 100_000_000 }),
      Page.enable(),
      Runtime.enable(),
    ]);
    await Network.setCacheDisabled({ cacheDisabled: true });
    await Network.setBypassServiceWorker({ bypass: true });

    Network.requestWillBeSent((event) => {
      requests.set(event.requestId, {
        method: event.request.method,
        url: event.request.url,
        postDataSha256:
          typeof event.request.postData === "string"
            ? sha256(Buffer.from(event.request.postData, "utf8"))
            : null,
        headers: sanitizeRequestHeaders(event.request.headers),
      });
    });

    Network.responseReceived((event) => {
      if (!RECORDABLE_TYPES.has(event.type)) return;
      responses.set(event.requestId, {
        type: event.type,
        response: event.response,
      });
    });

    Network.loadingFailed((event) => {
      const request = requests.get(event.requestId);
      if (!request) return;
      failures.push({
        url: request.url,
        method: request.method,
        errorText: event.errorText,
        blockedReason: event.blockedReason ?? null,
        canceled: event.canceled ?? false,
      });
    });

    Network.loadingFinished((event) => {
      const job = (async () => {
        const request = requests.get(event.requestId);
        const captured = responses.get(event.requestId);
        if (!request || !captured) return;
        const { response, type } = captured;
        const exchange = {
          sequence: sequence++,
          request,
          resourceType: type,
          response: {
            status: response.status,
            statusText: response.statusText || "OK",
            mimeType: response.mimeType,
            protocol: response.protocol,
            headers: sanitizeResponseHeaders(response.headers),
          },
          body: null,
          omission: null,
        };

        if (event.encodedDataLength > maxBodyBytes) {
          exchange.omission = `encoded body exceeds ${maxBodyBytes} bytes`;
          exchanges.push(exchange);
          return;
        }

        try {
          const result = await Network.getResponseBody({ requestId: event.requestId });
          const body = Buffer.from(result.body, result.base64Encoded ? "base64" : "utf8");
          if (body.byteLength > maxBodyBytes) {
            exchange.omission = `decoded body exceeds ${maxBodyBytes} bytes`;
          } else {
            const bodyHash = sha256(body);
            const bodyRelativePath = `bodies/${bodyHash}.bin`;
            const bodyPath = resolve(outDirectory, bodyRelativePath);
            if (!(await fileExists(bodyPath))) await writeFile(bodyPath, body);
            exchange.body = {
              sha256: bodyHash,
              bytes: body.byteLength,
              file: bodyRelativePath,
            };
          }
        } catch (error) {
          exchange.omission = `body unavailable: ${error.message}`;
        }
        exchanges.push(exchange);
      })();
      track(job);
    });

    const loadEvent = new Promise((resolveLoad) => Page.loadEventFired(resolveLoad));
    const navigation = await Page.navigate({ url: entryUrl });
    if (navigation.errorText) throw new Error(`Navigation failed: ${navigation.errorText}`);
    await settleOrTimeout(loadEvent, 45_000);
    await sleep(durationMs);
    await Promise.allSettled([...pending]);

    const userAgentResult = await Runtime.evaluate({
      expression: "navigator.userAgent",
      returnByValue: true,
    });
    const screenshot = await Page.captureScreenshot({
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(resolve(outDirectory, "preview.png"), Buffer.from(screenshot.data, "base64"));

    exchanges.sort((left, right) => left.sequence - right.sequence);
    const manifest = {
      formatVersion: ARCHIVE_FORMAT_VERSION,
      createdAt: new Date().toISOString(),
      entryUrl,
      capturePolicy: {
        anonymousTemporaryProfile: true,
        requestBodiesStored: false,
        requestHeadersAllowlisted: true,
        cookiesStored: false,
        mediaBodiesStored: false,
        maxBodyBytes,
        durationMs,
      },
      environment: {
        userAgent: userAgentResult.result.value ?? null,
        chromeExecutable: launched.executable,
      },
      summary: {
        exchangeCount: exchanges.length,
        bodyCount: new Set(
          exchanges.flatMap((exchange) => (exchange.body ? [exchange.body.sha256] : [])),
        ).size,
        omittedBodyCount: exchanges.filter((exchange) => exchange.omission).length,
        failureCount: failures.length,
        localInjectionExchangeCount: exchanges.filter((exchange) =>
          isLocalInjectionRequest(exchange.request.url),
        ).length,
      },
      exchanges,
      failures,
    };
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    console.log(`archive: ${relative(process.cwd(), manifestPath)}`);
    console.log(JSON.stringify(manifest.summary));
    if (manifest.summary.localInjectionExchangeCount > 0) {
      console.warn(
        `Detected ${manifest.summary.localInjectionExchangeCount} non-official /local/ injections; offline replay will disable them.`,
      );
    }
  } finally {
    await pageClient?.close().catch(() => {});
    await closeChrome({ child: launched.child, browserClient });
    await browserClient?.close().catch(() => {});
    await removeTemporaryProfile(profileDirectory);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

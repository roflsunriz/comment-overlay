import { createReadStream } from "node:fs";
import { access, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  closeChrome,
  createBrowserClient,
  createPageClient,
  launchChrome,
  makeTemporaryProfile,
  removeTemporaryProfile,
} from "../research/tools/lib/browser.mjs";

const CAPTURE_CASE_ID = "sm6240144";
const CAPTURE_EXPECTED_COMMENTS = 1000;
const CAPTURE_TIME_SECONDS = 334.2;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 920;

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const overlayRoot = path.join(projectRoot, "overlay-tests");
const outputPath = path.join(projectRoot, "images", "cover.png");

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".wav", "audio/wav"],
]);

const sleep = (milliseconds) =>
  new Promise((resolveSleep) => setTimeout(resolveSleep, milliseconds));

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const createStaticServer = () =>
  createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      const relativePath =
        decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "") || "index.html";
      const filePath = path.resolve(overlayRoot, relativePath);
      const allowedPrefix = `${overlayRoot}${path.sep}`;
      if (filePath !== overlayRoot && !filePath.startsWith(allowedPrefix)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!(await fileExists(filePath)) || !(await stat(filePath)).isFile()) {
        response.writeHead(404).end("Not found");
        return;
      }
      const fileStats = await stat(filePath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": fileStats.size,
        "Content-Type":
          mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500).end(error instanceof Error ? error.message : String(error));
    }
  });

const listen = async (server) =>
  new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        rejectListen(new Error("Cover capture server did not report a TCP port."));
        return;
      }
      resolveListen(address.port);
    });
  });

const closeServer = async (server) =>
  new Promise((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });

const removeProfileWithRetry = async (profileDirectory) => {
  let latestError;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await removeTemporaryProfile(profileDirectory);
      return;
    } catch (error) {
      latestError = error;
      await sleep(250);
    }
  }
  console.warn(
    `Could not remove temporary Chrome profile: ${latestError instanceof Error ? latestError.message : String(latestError)}`,
  );
};

const evaluate = async (Runtime, expression, awaitPromise = false) => {
  const result = await Runtime.evaluate({
    expression,
    awaitPromise,
    returnByValue: true,
    userGesture: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.text ??
        "Chrome Runtime.evaluate failed.",
    );
  }
  return result.result.value;
};

const waitFor = async (readState, predicate, description, timeoutMs = 30_000) => {
  const startedAt = Date.now();
  let latestState;
  while (Date.now() - startedAt <= timeoutMs) {
    latestState = await readState();
    if (predicate(latestState)) {
      return latestState;
    }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${description}: ${JSON.stringify(latestState)}`);
};

const stateExpression = `
(() => {
  const video = document.querySelector("#test-video");
  return {
    href: location.href,
    title: document.title,
    caseId: document.querySelector("#video-case")?.value ?? null,
    status: document.querySelector("#status")?.textContent ?? "",
    comments: window.commentRenderer?.comments?.length ?? -1,
    readyState: video?.readyState ?? -1,
    currentSrc: video?.currentSrc ?? "",
  };
})()
`;

const main = async () => {
  const server = createStaticServer();
  const port = await listen(server);
  const profileDirectory = await makeTemporaryProfile("cover-capture");
  let chrome = null;
  let browserClient = null;
  let pageClient = null;
  try {
    chrome = await launchChrome({
      profileDirectory,
      offline: false,
      extraArguments: [
        `--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
        "--force-device-scale-factor=1",
        "--hide-scrollbars",
      ],
    });
    browserClient = await createBrowserClient(chrome.port, chrome.child);
    pageClient = await createPageClient(chrome.port, chrome.child);
    const { Emulation, Fetch, Network, Page, Runtime } = pageClient;
    await Promise.all([
      Page.enable(),
      Runtime.enable(),
      Network.enable(),
      Fetch.enable({
        patterns: [{ urlPattern: "*", requestStage: "Request" }],
      }),
    ]);
    Fetch.requestPaused(({ requestId, request }) => {
      const requestUrl = new URL(request.url);
      const isLocal = requestUrl.hostname === "127.0.0.1" && requestUrl.port === String(port);
      if (!isLocal) {
        void Fetch.failRequest({ requestId, errorReason: "BlockedByClient" });
        return;
      }
      if (requestUrl.pathname.toLowerCase().endsWith(".mp4")) {
        void Fetch.fulfillRequest({
          requestId,
          responseCode: 404,
          responseHeaders: [
            { name: "Content-Type", value: "text/plain; charset=utf-8" },
            { name: "Cache-Control", value: "no-store" },
          ],
          body: Buffer.from("Video disabled for copyright-safe cover capture", "utf8").toString(
            "base64",
          ),
        });
        return;
      }
      void Fetch.continueRequest({ requestId });
    });
    await Emulation.setDeviceMetricsOverride({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const loaded = Page.loadEventFired();
    await Page.navigate({ url: `http://127.0.0.1:${port}/` });
    await loaded;
    await waitFor(
      () => evaluate(Runtime, stateExpression),
      (state) => state.comments > 0 && state.readyState >= 1,
      "the default overlay fixture",
    );

    await evaluate(
      Runtime,
      `
(() => {
  const select = document.querySelector("#video-case");
  if (!(select instanceof HTMLSelectElement)) throw new Error("video case select was not found");
  select.value = ${JSON.stringify(CAPTURE_CASE_ID)};
  select.dispatchEvent(new Event("change", { bubbles: true }));
  return select.value;
})()
`,
    );
    await waitFor(
      () => evaluate(Runtime, stateExpression),
      (state) =>
        state.caseId === CAPTURE_CASE_ID &&
        state.comments === CAPTURE_EXPECTED_COMMENTS &&
        state.readyState >= 1 &&
        state.currentSrc.startsWith("blob:"),
      `${CAPTURE_CASE_ID} comments-only media`,
    );

    const captureState = await evaluate(
      Runtime,
      `
(async () => {
  const video = document.querySelector("#test-video");
  const wrapper = document.querySelector(".video-wrapper");
  const renderer = window.commentRenderer;
  if (!(video instanceof HTMLVideoElement) || !(wrapper instanceof HTMLElement) || !renderer) {
    throw new Error("overlay capture elements were not initialized");
  }
  video.pause();
  video.style.opacity = "0";
  video.style.background = "#000";
  wrapper.style.background = "#000";
  wrapper.classList.remove("controls-hidden");
  await new Promise((resolveSeek) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolveSeek();
    };
    video.addEventListener("seeked", finish, { once: true });
    video.currentTime = ${CAPTURE_TIME_SECONDS};
    setTimeout(finish, 3000);
  });
  const mediaTimeMs = video.currentTime * 1000;
  renderer.currentTime = mediaTimeMs;
  renderer.performInitialSync?.(mediaTimeMs);
  renderer.updateComments?.(mediaTimeMs);
  renderer.draw();
  await new Promise((resolveFrame) => requestAnimationFrame(() => requestAnimationFrame(resolveFrame)));
  renderer.currentTime = mediaTimeMs;
  renderer.updateComments?.(mediaTimeMs);
  renderer.draw();
  window.scrollTo(0, 0);
  const active = Array.from(renderer.activeComments ?? []);
  const caComments = active.filter(
    (comment) => Array.isArray(comment.commands) && comment.commands.includes("ca"),
  ).length;
  const canvas = renderer.canvas;
  const context = canvas?.getContext("2d");
  let minX = canvas?.width ?? 0;
  let minY = canvas?.height ?? 0;
  let maxX = -1;
  let maxY = -1;
  if (canvas && context) {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        if (pixels[(y * canvas.width + x) * 4 + 3] === 0) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return {
    activeComments: active.length,
    caComments,
    maxLines: Math.max(0, ...active.map((comment) => String(comment.text ?? "").split(/\\r?\\n/).length)),
    inkWidthRatio: canvas && maxX >= minX ? (maxX - minX + 1) / canvas.width : 0,
    inkHeightRatio: canvas && maxY >= minY ? (maxY - minY + 1) / canvas.height : 0,
    currentTime: video.currentTime,
    currentSrc: video.currentSrc,
    videoOpacity: getComputedStyle(video).opacity,
    wrapperBackground: getComputedStyle(wrapper).backgroundColor,
  };
})()
`,
      true,
    );

    if (
      captureState.caComments < 25 ||
      captureState.inkWidthRatio < 0.75 ||
      captureState.inkHeightRatio < 0.65 ||
      captureState.videoOpacity !== "0" ||
      !captureState.currentSrc.startsWith("blob:")
    ) {
      throw new Error(
        `Cover capture state was not safe or representative: ${JSON.stringify(captureState)}`,
      );
    }

    const mainRect = await evaluate(
      Runtime,
      `
(() => {
  const rect = document.querySelector("#test-stage")?.getBoundingClientRect();
  if (!rect) throw new Error("test stage was not found");
  return { x: rect.x, width: rect.width };
})()
`,
    );
    const screenshot = await Page.captureScreenshot({
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
      clip: {
        x: Math.max(0, mainRect.x - 10),
        y: 0,
        width: Math.min(VIEWPORT_WIDTH, mainRect.width + 20),
        height: VIEWPORT_HEIGHT,
        scale: 1,
      },
    });
    await writeFile(outputPath, Buffer.from(screenshot.data, "base64"));
    console.log(`cover captured: ${path.relative(projectRoot, outputPath)}`);
    console.log(`capture state: ${JSON.stringify(captureState)}`);
  } finally {
    if (pageClient) {
      await pageClient.close().catch(() => {});
    }
    if (chrome) {
      await closeChrome({ child: chrome.child, browserClient });
    }
    await closeServer(server);
    await removeProfileWithRetry(profileDirectory);
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

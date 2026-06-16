#!/usr/bin/env bun
import CDP from "chrome-remote-interface";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { once } from "node:events";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 9222;
const DEFAULT_DURATION_MS = 5000;
const DEFAULT_FPS = 30;
const DEFAULT_PREROLL_MS = 4500;
const DEFAULT_AD_WAIT_MS = 30000;

const parseArgs = (argv) => {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const equalsIndex = token.indexOf("=");
    if (equalsIndex >= 0) {
      result[token.slice(2, equalsIndex)] = token.slice(equalsIndex + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      result[key] = next;
      index += 1;
    } else {
      result[key] = "true";
    }
  }
  return result;
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const sanitizeSegment = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";

const jsonLine = (value) => `${JSON.stringify(value)}\n`;

const buildCanvasHookScript = () => String.raw`
(() => {
  const traceHookVersion = 3;
  if (
    globalThis.__NICO_CANVAS_TRACE_INSTALLED__ &&
    globalThis.__NICO_CANVAS_TRACE_VERSION__ === traceHookVersion
  ) {
    return "already-installed";
  }
  globalThis.__NICO_CANVAS_TRACE_INSTALLED__ = true;
  globalThis.__NICO_CANVAS_TRACE_VERSION__ = traceHookVersion;
  const buffer = [];
  const responseBuffer = [];
  const canvasIds = new WeakMap();
  let nextCanvasId = 1;
  let sequence = 0;
  let responseSequence = 0;
  const maxBufferedRecords = 200000;
  const maxBufferedResponses = 500;
  const maxCapturedBodyLength = 5_000_000;
  let cachedVideoInfo = null;
  let cachedVideoInfoAt = -Infinity;

  const now = () => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  };

  const canvasId = (canvas) => {
    if (!canvas || (typeof canvas !== "object" && typeof canvas !== "function")) {
      return null;
    }
    let id = canvasIds.get(canvas);
    if (!id) {
      id = nextCanvasId++;
      canvasIds.set(canvas, id);
    }
    return id;
  };

  const styleValue = (value) => {
    if (typeof value === "string") {
      return value;
    }
    if (value === null || value === undefined) {
      return null;
    }
    return String(value);
  };

  const transformValue = (ctx) => {
    if (!ctx || typeof ctx.getTransform !== "function") {
      return null;
    }
    const t = ctx.getTransform();
    return [t.a, t.b, t.c, t.d, t.e, t.f];
  };

  const sourceInfo = (source) => {
    if (!source) {
      return { sourceKind: null, sourceCanvasId: null };
    }
    const ctorName = source.constructor && source.constructor.name ? source.constructor.name : null;
    const sourceCanvas = typeof source.getContext === "function" ? source : null;
    return {
      sourceKind: ctorName,
      sourceCanvasId: sourceCanvas ? canvasId(sourceCanvas) : null,
      sourceWidth: typeof source.width === "number" ? source.width : null,
      sourceHeight: typeof source.height === "number" ? source.height : null,
    };
  };

  const getPrimaryVideoInfo = () => {
    const currentNow = now();
    if (cachedVideoInfo && currentNow - cachedVideoInfoAt < 50) {
      return cachedVideoInfo;
    }
    const videos = Array.from(document.querySelectorAll("video"));
    const selected = videos
      .map((video, index) => {
        const rect = video.getBoundingClientRect();
        return {
          index,
          currentTime: Number.isFinite(video.currentTime) ? video.currentTime : null,
          paused: video.paused,
          playbackRate: video.playbackRate,
          readyState: video.readyState,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
          },
          area: Math.max(0, rect.width) * Math.max(0, rect.height),
        };
      })
      .sort((a, b) => b.area - a.area)[0];
    cachedVideoInfoAt = currentNow;
    cachedVideoInfo = selected
      ? {
          videoIndex: selected.index,
          videoCurrentTimeMs:
            selected.currentTime === null ? null : Math.round(selected.currentTime * 1000),
          videoPaused: selected.paused,
          videoPlaybackRate: selected.playbackRate,
          videoReadyState: selected.readyState,
          videoRect: selected.rect,
        }
      : {
          videoIndex: null,
          videoCurrentTimeMs: null,
          videoPaused: null,
          videoPlaybackRate: null,
          videoReadyState: null,
          videoRect: null,
        };
    return cachedVideoInfo;
  };

  const snapshot = (ctx, op, extra) => {
    const canvas = ctx && ctx.canvas ? ctx.canvas : null;
    const record = {
      source: "niconico-player",
      sequence: sequence++,
      op,
      timestampMs: now(),
      pageUrl: location.href,
      canvasId: canvasId(canvas),
      canvasWidth: canvas && typeof canvas.width === "number" ? canvas.width : null,
      canvasHeight: canvas && typeof canvas.height === "number" ? canvas.height : null,
      font: ctx && "font" in ctx ? ctx.font : null,
      fillStyle: ctx && "fillStyle" in ctx ? styleValue(ctx.fillStyle) : null,
      strokeStyle: ctx && "strokeStyle" in ctx ? styleValue(ctx.strokeStyle) : null,
      lineWidth: ctx && "lineWidth" in ctx ? ctx.lineWidth : null,
      lineJoin: ctx && "lineJoin" in ctx ? ctx.lineJoin : null,
      globalAlpha: ctx && "globalAlpha" in ctx ? ctx.globalAlpha : null,
      shadowColor: ctx && "shadowColor" in ctx ? ctx.shadowColor : null,
      shadowBlur: ctx && "shadowBlur" in ctx ? ctx.shadowBlur : null,
      shadowOffsetX: ctx && "shadowOffsetX" in ctx ? ctx.shadowOffsetX : null,
      shadowOffsetY: ctx && "shadowOffsetY" in ctx ? ctx.shadowOffsetY : null,
      transform: transformValue(ctx),
      ...getPrimaryVideoInfo(),
      ...extra,
    };
    buffer.push(record);
    if (buffer.length > maxBufferedRecords) {
      buffer.splice(0, buffer.length - maxBufferedRecords);
    }
  };

  const patchMethod = (prototype, name, afterCall) => {
    if (!prototype || typeof prototype[name] !== "function") {
      return;
    }
    const marker = "__nicoTracePatched_v" + traceHookVersion + "_" + name;
    if (prototype[name][marker]) {
      return;
    }
    const original = prototype[name];
    const patched = function patchedCanvasMethod(...args) {
      const result = original.apply(this, args);
      try {
        afterCall(this, args, result);
      } catch (error) {
        buffer.push({
          source: "niconico-player",
          sequence: sequence++,
          op: "traceError",
          timestampMs: now(),
          method: name,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      return result;
    };
    Object.defineProperty(patched, marker, { value: true });
    prototype[name] = patched;
  };

  const patchContext = (ContextCtor) => {
    if (!ContextCtor || !ContextCtor.prototype) {
      return;
    }
    const prototype = ContextCtor.prototype;
    patchMethod(prototype, "fillText", (ctx, args) => {
      snapshot(ctx, "fillText", {
        text: String(args[0] ?? ""),
        x: Number(args[1]),
        y: Number(args[2]),
        maxWidth: typeof args[3] === "number" ? args[3] : null,
      });
    });
    patchMethod(prototype, "strokeText", (ctx, args) => {
      snapshot(ctx, "strokeText", {
        text: String(args[0] ?? ""),
        x: Number(args[1]),
        y: Number(args[2]),
        maxWidth: typeof args[3] === "number" ? args[3] : null,
      });
    });
    patchMethod(prototype, "drawImage", (ctx, args) => {
      snapshot(ctx, "drawImage", {
        ...sourceInfo(args[0]),
        args: args.slice(1).map((value) => (typeof value === "number" ? value : null)),
      });
    });
    for (const method of ["save", "restore", "setTransform", "resetTransform", "transform", "scale", "translate", "rotate"]) {
      patchMethod(prototype, method, (ctx, args) => {
        snapshot(ctx, method, {
          args: args.map((value) => (typeof value === "number" ? value : String(value))),
        });
      });
    }
  };

  const shouldCaptureResponseBody = (url, contentType) => {
    const lowerUrl = String(url || "").toLowerCase();
    const lowerType = String(contentType || "").toLowerCase();
    return (
      lowerUrl.includes("nvcomment") ||
      lowerUrl.includes("comment") ||
      lowerUrl.includes("watch") ||
      lowerType.includes("json")
    );
  };

  const normalizeResponseBody = (body) => {
    if (typeof body !== "string") {
      return { body: null, parsed: null, truncated: false };
    }
    const truncated = body.length > maxCapturedBodyLength;
    const clipped = truncated ? body.slice(0, maxCapturedBodyLength) : body;
    let parsed = null;
    try {
      parsed = JSON.parse(clipped);
    } catch {
      parsed = null;
    }
    return { body: parsed ?? clipped, parsed: parsed !== null, truncated };
  };

  const pushResponseRecord = (record) => {
    responseBuffer.push({
      source: "niconico-player-page",
      sequence: responseSequence++,
      timestampMs: now(),
      pageUrl: location.href,
      ...record,
    });
    if (responseBuffer.length > maxBufferedResponses) {
      responseBuffer.splice(0, responseBuffer.length - maxBufferedResponses);
    }
  };

  const patchFetch = () => {
    if (typeof globalThis.fetch !== "function" || globalThis.fetch.__nicoTracePatchedFetch) {
      return;
    }
    const originalFetch = globalThis.fetch;
    const patchedFetch = async function patchedNicoTraceFetch(input, init) {
      const response = await originalFetch.apply(this, arguments);
      try {
        const url =
          typeof input === "string"
            ? input
            : input && typeof input.url === "string"
              ? input.url
              : response.url;
        const contentType = response.headers && typeof response.headers.get === "function"
          ? response.headers.get("content-type")
          : "";
        if (shouldCaptureResponseBody(url, contentType)) {
          const cloned = response.clone();
          cloned.text().then((bodyText) => {
            const normalized = normalizeResponseBody(bodyText);
            pushResponseRecord({
              transport: "fetch",
              url,
              status: response.status,
              statusText: response.statusText,
              mimeType: contentType,
              body: normalized.body,
              parsedJson: normalized.parsed,
              truncated: normalized.truncated,
            });
          }).catch((error) => {
            pushResponseRecord({
              transport: "fetch",
              url,
              status: response.status,
              statusText: response.statusText,
              mimeType: contentType,
              error: error instanceof Error ? error.message : String(error),
            });
          });
        }
      } catch (error) {
        pushResponseRecord({
          transport: "fetch",
          url: null,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return response;
    };
    Object.defineProperty(patchedFetch, "__nicoTracePatchedFetch", { value: true });
    globalThis.fetch = patchedFetch;
  };

  const patchXhr = () => {
    const XhrCtor = globalThis.XMLHttpRequest;
    if (!XhrCtor || !XhrCtor.prototype || XhrCtor.prototype.__nicoTracePatchedXhr) {
      return;
    }
    const originalOpen = XhrCtor.prototype.open;
    const originalSend = XhrCtor.prototype.send;
    XhrCtor.prototype.open = function patchedNicoTraceOpen(method, url) {
      this.__nicoTraceRequest = {
        method: String(method || ""),
        url: String(url || ""),
      };
      return originalOpen.apply(this, arguments);
    };
    XhrCtor.prototype.send = function patchedNicoTraceSend() {
      try {
        this.addEventListener("loadend", () => {
          try {
            const request = this.__nicoTraceRequest || {};
            const url = request.url || this.responseURL || "";
            const contentType =
              typeof this.getResponseHeader === "function"
                ? this.getResponseHeader("content-type")
                : "";
            if (!shouldCaptureResponseBody(url, contentType)) {
              return;
            }
            const bodyText =
              typeof this.responseText === "string"
                ? this.responseText
                : typeof this.response === "string"
                  ? this.response
                  : "";
            const normalized = normalizeResponseBody(bodyText);
            pushResponseRecord({
              transport: "xhr",
              method: request.method || null,
              url,
              status: this.status,
              statusText: this.statusText,
              mimeType: contentType,
              body: normalized.body,
              parsedJson: normalized.parsed,
              truncated: normalized.truncated,
            });
          } catch (error) {
            pushResponseRecord({
              transport: "xhr",
              url: this.responseURL || null,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        });
      } catch {
        // Ignore pages that prevent adding listeners on XHR instances.
      }
      return originalSend.apply(this, arguments);
    };
    Object.defineProperty(XhrCtor.prototype, "__nicoTracePatchedXhr", { value: true });
  };

  patchContext(globalThis.CanvasRenderingContext2D);
  patchContext(globalThis.OffscreenCanvasRenderingContext2D);
  patchFetch();
  patchXhr();

  globalThis.__NICO_TRACE_DRAIN__ = () => {
    const drained = buffer.splice(0, buffer.length);
    return drained;
  };
  globalThis.__NICO_RESPONSE_DRAIN__ = () => {
    const drained = responseBuffer.splice(0, responseBuffer.length);
    return drained;
  };
  globalThis.__NICO_TRACE_STATUS__ = () => ({
    installed: true,
    buffered: buffer.length,
    bufferedResponses: responseBuffer.length,
    nextCanvasId,
    sequence,
    responseSequence,
  });
  return "installed";
})();
`;

const getVideoStateExpression = () => String.raw`
(() => {
  const videos = Array.from(document.querySelectorAll("video"));
  const visibleButtons = Array.from(document.querySelectorAll("button, [role='button'], a"))
    .map((element, index) => {
      const rect = element.getBoundingClientRect();
      const text = (element.innerText || element.textContent || "").trim();
      return {
        index,
        text,
        tagName: element.tagName,
        visible: rect.width > 0 && rect.height > 0,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        },
      };
    })
    .filter((entry) => entry.visible && entry.text.length > 0)
    .slice(0, 200);
  const candidates = videos
    .map((video, index) => {
      const rect = video.getBoundingClientRect();
      return {
        index,
        currentTime: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : null,
        paused: video.paused,
        playbackRate: video.playbackRate,
        readyState: video.readyState,
        src: video.currentSrc || video.src || null,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
        },
        area: Math.max(0, rect.width) * Math.max(0, rect.height),
      };
    })
    .sort((a, b) => b.area - a.area);
  const selected = candidates[0] || null;
  return {
    href: location.href,
    title: document.title,
    devicePixelRatio: window.devicePixelRatio || 1,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    },
    bodyText: (document.body?.innerText || "").slice(0, 2000),
    visibleButtons,
    selected,
    videos: candidates,
  };
})();
`;

const setVideoTimeExpression = (seconds) => `
(async () => {
  const videos = Array.from(document.querySelectorAll("video"));
  const video = videos
    .map((item) => ({ item, rect: item.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.item;
  if (!video) return { ok: false, reason: "video-not-found" };
  video.pause();
  video.currentTime = ${JSON.stringify(seconds)};
  const deadline = performance.now() + 5000;
  while (performance.now() < deadline) {
    if (Math.abs(video.currentTime - ${JSON.stringify(seconds)}) < 0.25 && video.readyState >= 2) {
      return { ok: true, currentTime: video.currentTime, readyState: video.readyState };
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return { ok: false, reason: "seek-timeout", currentTime: video.currentTime, readyState: video.readyState };
})();
`;

const playVideoExpression = () => String.raw`
(async () => {
  const videos = Array.from(document.querySelectorAll("video"));
  const video = videos
    .map((item) => ({ item, rect: item.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.item;
  if (!video) return { ok: false, reason: "video-not-found" };
  try {
    await video.play();
    return { ok: true, paused: video.paused, currentTime: video.currentTime };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : String(error), paused: video.paused, currentTime: video.currentTime };
  }
})();
`;

const waitForUsableVideo = async (Runtime, timeoutMs = 15000) => {
  const startedAt = Date.now();
  let latestState = null;
  while (Date.now() - startedAt <= timeoutMs) {
    latestState = await evaluate(Runtime, getVideoStateExpression());
    const rect = latestState.selected?.rect;
    if (rect && rect.width > 0 && rect.height > 0) {
      return latestState;
    }
    await sleep(250);
  }
  return latestState;
};

const clickVideoCenter = async (Input, state) => {
  const rect = state?.selected?.rect;
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await Input.dispatchMouseEvent({ type: "mouseMoved", x, y, button: "none" });
  await Input.dispatchMouseEvent({ type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await Input.dispatchMouseEvent({ type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  return true;
};

const clickVisibleElementCenter = async (Input, rect) => {
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return false;
  }
  const x = rect.x + rect.width / 2;
  const y = rect.y + rect.height / 2;
  await Input.dispatchMouseEvent({ type: "mouseMoved", x, y, button: "none" });
  await Input.dispatchMouseEvent({ type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await Input.dispatchMouseEvent({ type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  return true;
};

const findSkipAdButton = (state) => {
  const skipPatterns = [
    /スキップ/,
    /広告をスキップ/,
    /Skip/i,
    /skip ad/i,
    /本編/,
    /動画へ/,
  ];
  return (state?.visibleButtons || []).find((button) =>
    skipPatterns.some((pattern) => pattern.test(button.text)),
  );
};

const looksLikeAdState = (state) => {
  const buttonText = (state?.visibleButtons || []).map((button) => button.text).join("\n");
  const bodyText = state?.bodyText || "";
  return (
    /広告をスキップ|スキップできます|Skip Ad|skip ad/i.test(`${buttonText}\n${bodyText}`) ||
    /あと\s*\d+\s*秒|残り\s*\d+\s*秒/.test(bodyText)
  );
};

const waitForMainContent = async (Runtime, Input, timeoutMs) => {
  const startedAt = Date.now();
  let latestState = await waitForUsableVideo(Runtime, Math.min(timeoutMs, 10000));
  while (Date.now() - startedAt <= timeoutMs) {
    latestState = await evaluate(Runtime, getVideoStateExpression());
    const skipButton = findSkipAdButton(latestState);
    if (skipButton) {
      await clickVisibleElementCenter(Input, skipButton.rect);
      await sleep(1000);
      latestState = await evaluate(Runtime, getVideoStateExpression());
    }
    const selected = latestState.selected;
    const hasMainLikeDuration =
      selected && Number.isFinite(selected.duration) && selected.duration >= 60;
    const adLike = looksLikeAdState(latestState);
    if (hasMainLikeDuration && !adLike) {
      return latestState;
    }
    await sleep(500);
  }
  return latestState;
};

const evaluate = async (Runtime, expression, options = {}) => {
  const response = await Runtime.evaluate({
    expression,
    returnByValue: true,
    awaitPromise: true,
    ...options,
  });
  if (response.exceptionDetails) {
    const details = response.exceptionDetails;
    const exceptionDescription = details.exception?.description || details.exception?.value || "";
    throw new Error(
      `Runtime.evaluate failed: ${details.text || "unknown"} ${exceptionDescription}`.trim(),
    );
  }
  return response.result.value;
};

const findTarget = async ({ host, port, target, url }) => {
  if (target) {
    return target;
  }
  const targets = await CDP.List({ host, port });
  if (url) {
    const existing = targets.find((entry) => entry.type === "page" && entry.url.includes(url));
    if (existing) {
      return existing;
    }
    return CDP.New({ host, port, url });
  }
  const page = targets.find((entry) => entry.type === "page" && !entry.url.startsWith("devtools://"));
  if (!page) {
    throw new Error("CDP page target was not found. Pass --url or --target.");
  }
  return page;
};

const writeScreenshot = async (Page, filePath, clip) => {
  const screenshot = await Page.captureScreenshot({
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
    clip,
  });
  await writeFile(filePath, Buffer.from(screenshot.data, "base64"));
};

const shouldCaptureNetworkBody = (url, mimeType) => {
  const lowerUrl = String(url || "").toLowerCase();
  const lowerMime = String(mimeType || "").toLowerCase();
  return (
    lowerUrl.includes("nvcomment") ||
    lowerUrl.includes("comment") ||
    lowerUrl.includes("watch") ||
    lowerMime.includes("json")
  );
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const host = args.host || DEFAULT_HOST;
  const port = toNumber(args.port, DEFAULT_PORT);
  const durationMs = toNumber(args["duration-ms"], DEFAULT_DURATION_MS);
  const fps = Math.max(1, toNumber(args.fps, DEFAULT_FPS));
  const prerollMs = toNumber(args["preroll-ms"], DEFAULT_PREROLL_MS);
  const adWaitMs = toNumber(args["ad-wait-ms"], DEFAULT_AD_WAIT_MS);
  const videoWaitMs = toNumber(args["video-wait-ms"], 15000);
  const startMs = args["start-ms"] === undefined ? null : Math.max(0, toNumber(args["start-ms"], 0));
  const caseName = sanitizeSegment(args.case || "capture");
  const requestedVideoId = sanitizeSegment(args["video-id"] || "unknown-video");
  const baseOutDir = resolve(args.out || ".calibration/nico");
  const outDir = join(baseOutDir, requestedVideoId, caseName);
  const screenshotDir = join(outDir, "screenshots");
  await mkdir(screenshotDir, { recursive: true });

  const networkRecords = [];
  const pendingNetwork = new Map();
  const traceStream = createWriteStream(join(outDir, "trace.jsonl"), { encoding: "utf8" });
  const target = await findTarget({ host, port, target: args.target, url: args.url });
  const client = await CDP({ host, port, target });
  const { Page, Runtime, Network, Input } = client;

  try {
    await Promise.all([Page.enable(), Runtime.enable(), Network.enable()]);
    await Page.addScriptToEvaluateOnNewDocument({ source: buildCanvasHookScript() });
    await evaluate(Runtime, buildCanvasHookScript());

    Network.responseReceived((event) => {
      const { response, requestId } = event;
      if (shouldCaptureNetworkBody(response.url, response.mimeType)) {
        pendingNetwork.set(requestId, {
          requestId,
          url: response.url,
          status: response.status,
          mimeType: response.mimeType,
          timestamp: event.timestamp,
        });
      }
    });

    Network.loadingFinished(async ({ requestId }) => {
      const item = pendingNetwork.get(requestId);
      if (!item) {
        return;
      }
      pendingNetwork.delete(requestId);
      try {
        const body = await Network.getResponseBody({ requestId });
        let parsed = null;
        if (!body.base64Encoded) {
          try {
            parsed = JSON.parse(body.body);
          } catch {
            parsed = null;
          }
        }
        networkRecords.push({
          ...item,
          base64Encoded: body.base64Encoded,
          body: parsed ?? body.body,
        });
      } catch (error) {
        networkRecords.push({
          ...item,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    const drainPageResponses = async () => {
      const drained = await evaluate(
        Runtime,
        "globalThis.__NICO_RESPONSE_DRAIN__ ? globalThis.__NICO_RESPONSE_DRAIN__() : []",
      );
      for (const record of drained || []) {
        networkRecords.push(record);
      }
    };

    if (args.url && target.url !== args.url) {
      await Page.navigate({ url: args.url });
      await sleep(2500);
      await evaluate(Runtime, buildCanvasHookScript());
      await drainPageResponses();
    } else if (args.reload === "true") {
      await Page.reload({ ignoreCache: true });
      await sleep(2500);
      await evaluate(Runtime, buildCanvasHookScript());
      await drainPageResponses();
    }

    if (startMs !== null) {
      await waitForUsableVideo(Runtime, videoWaitMs);
      const seekSeconds = Math.max(0, (startMs - prerollMs) / 1000);
      const seekState = await evaluate(Runtime, setVideoTimeExpression(seekSeconds));
      if (!seekState?.ok) {
        throw new Error(
          `Failed to seek video to ${seekSeconds}s: ${seekState?.reason || "unknown"} ` +
            `(currentTime=${seekState?.currentTime ?? "unknown"})`,
        );
      }
      await sleep(750);
      await evaluate(
        Runtime,
        "globalThis.__NICO_TRACE_DRAIN__ ? globalThis.__NICO_TRACE_DRAIN__() : []",
      );
    }

    const prePlayState =
      args["wait-main"] === "false"
        ? await waitForUsableVideo(Runtime)
        : await waitForMainContent(Runtime, Input, adWaitMs);
    if (args["click-video"] === "true") {
      await clickVideoCenter(Input, prePlayState);
      await sleep(500);
    }
    await evaluate(Runtime, playVideoExpression());
    if (args["wait-main-after-play"] !== "false") {
      await waitForMainContent(Runtime, Input, adWaitMs);
    }
    if (startMs !== null) {
      await sleep(prerollMs);
    }

    const intervalMs = 1000 / fps;
    const startWallClock = Date.now();
    const metaSamples = [];
    let frameIndex = 0;
    let invalidVideoRectSince = null;

    while (Date.now() - startWallClock <= durationMs) {
      const state = await evaluate(Runtime, getVideoStateExpression());
      metaSamples.push({ sampledAtMs: Date.now(), state });
      const rect = state.selected?.rect;
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        invalidVideoRectSince ??= Date.now();
        if (Date.now() - invalidVideoRectSince > 8000) {
          throw new Error("Largest video element has an invalid rectangle for more than 8 seconds.");
        }
        await drainPageResponses();
        await sleep(intervalMs);
        continue;
      }
      invalidVideoRectSince = null;
      const clip = {
        x: Math.max(0, rect.x),
        y: Math.max(0, rect.y),
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
        scale: 1,
      };
      const frameLabel = String(frameIndex).padStart(5, "0");
      await writeScreenshot(Page, join(screenshotDir, `visible-${frameLabel}.png`), clip);
      const drained = await evaluate(
        Runtime,
        "globalThis.__NICO_TRACE_DRAIN__ ? globalThis.__NICO_TRACE_DRAIN__() : []",
      );
      for (const record of drained || []) {
        traceStream.write(jsonLine(record));
      }
      await drainPageResponses();
      frameIndex += 1;
      await sleep(intervalMs);
    }

    const finalDrain = await evaluate(
      Runtime,
      "globalThis.__NICO_TRACE_DRAIN__ ? globalThis.__NICO_TRACE_DRAIN__() : []",
    );
    for (const record of finalDrain || []) {
      traceStream.write(jsonLine(record));
    }
    await drainPageResponses();

    traceStream.end();
    await once(traceStream, "finish");
    await writeFile(join(outDir, "network-comments.json"), JSON.stringify(networkRecords, null, 2));
    await writeFile(
      join(outDir, "meta.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          host,
          port,
          target,
          url: args.url || null,
          requestedVideoId,
          caseName,
          durationMs,
          fps,
          prerollMs,
          startMs,
          frameCount: frameIndex,
          networkCapture: {
            cdpNetworkRecords: networkRecords.filter(
              (record) => record.source !== "niconico-player-page",
            ).length,
            pageHookRecords: networkRecords.filter(
              (record) => record.source === "niconico-player-page",
            ).length,
            note:
              "network-comments.json contains responses observed after CDP attach and page fetch/XHR hook installation. It does not include data already received before attach.",
          },
          samples: metaSamples,
        },
        null,
        2,
      ),
    );
    console.log(`nico trace written to ${outDir}`);
  } finally {
    traceStream.destroy();
    await client.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

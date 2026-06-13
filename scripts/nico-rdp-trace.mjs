#!/usr/bin/env bun
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import { join, resolve } from "node:path";
import { once } from "node:events";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 6000;
const DEFAULT_DURATION_MS = 5000;
const DEFAULT_FPS = 15;
const DEFAULT_PREROLL_MS = 4500;

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

class FirefoxRdpClient {
  constructor({ host, port }) {
    this.buffer = Buffer.alloc(0);
    this.waiters = [];
    this.socket = net.createConnection({ host, port });
    this.socket.on("data", (chunk) => this.onData(chunk));
  }

  async connect() {
    await once(this.socket, "connect");
    return this.waitFor((message) => message.from === "root" && message.applicationType);
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const colonIndex = this.buffer.indexOf(58);
      if (colonIndex < 0) {
        return;
      }
      const length = Number(this.buffer.subarray(0, colonIndex).toString("ascii"));
      const start = colonIndex + 1;
      if (!Number.isFinite(length) || length < 0) {
        throw new Error("Invalid Firefox RDP packet length.");
      }
      if (this.buffer.length < start + length) {
        return;
      }
      const raw = this.buffer.subarray(start, start + length).toString("utf8");
      this.buffer = this.buffer.subarray(start + length);
      const message = JSON.parse(raw);
      for (let index = 0; index < this.waiters.length; index += 1) {
        const waiter = this.waiters[index];
        if (waiter.predicate(message)) {
          this.waiters.splice(index, 1);
          clearTimeout(waiter.timer);
          waiter.resolve(message);
          break;
        }
      }
    }
  }

  waitFor(predicate, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waiters.findIndex((waiter) => waiter.timer === timer);
        if (index >= 0) {
          this.waiters.splice(index, 1);
        }
        reject(new Error("Timed out waiting for Firefox RDP response."));
      }, timeoutMs);
      this.waiters.push({ predicate, resolve, timer });
    });
  }

  send(packet) {
    const payload = Buffer.from(JSON.stringify(packet));
    const header = Buffer.from(`${payload.length}:`);
    this.socket.write(Buffer.concat([header, payload]));
  }

  close() {
    this.socket.destroy();
  }
}

const buildCanvasHookScript = () => String.raw`
(() => {
  const traceHookVersion = 2;
  if (
    globalThis.__NICO_RDP_CANVAS_TRACE_INSTALLED__ &&
    globalThis.__NICO_RDP_CANVAS_TRACE_VERSION__ === traceHookVersion
  ) {
    return "already-installed";
  }
  globalThis.__NICO_RDP_CANVAS_TRACE_INSTALLED__ = true;
  globalThis.__NICO_RDP_CANVAS_TRACE_VERSION__ = traceHookVersion;
  globalThis.__NICO_RDP_TRACE_ENABLED__ = false;
  const buffer = [];
  const canvasIds = new WeakMap();
  let nextCanvasId = 1;
  let sequence = 0;
  const maxBufferedRecords = 200000;

  const now = () =>
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();

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
    const transform = ctx.getTransform();
    return [transform.a, transform.b, transform.c, transform.d, transform.e, transform.f];
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
    const selected = Array.from(document.querySelectorAll("video"))
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
    return selected
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
  };

  const snapshot = (ctx, op, extra) => {
    if (globalThis.__NICO_RDP_TRACE_ENABLED__ !== true) {
      return;
    }
    const canvas = ctx && ctx.canvas ? ctx.canvas : null;
    buffer.push({
      source: "niconico-player",
      transport: "firefox-rdp",
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
    });
    if (buffer.length > maxBufferedRecords) {
      buffer.splice(0, buffer.length - maxBufferedRecords);
    }
  };

  const patchMethod = (prototype, name, afterCall) => {
    if (!prototype || typeof prototype[name] !== "function") {
      return;
    }
    const marker = "__nicoRdpTracePatched_v" + traceHookVersion + "_" + name;
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
          transport: "firefox-rdp",
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
  };

  patchContext(globalThis.CanvasRenderingContext2D);
  patchContext(globalThis.OffscreenCanvasRenderingContext2D);

  globalThis.__NICO_RDP_TRACE_DRAIN__ = () => buffer.splice(0, buffer.length);
  globalThis.__NICO_RDP_TRACE_SET_ENABLED__ = (enabled) => {
    globalThis.__NICO_RDP_TRACE_ENABLED__ = enabled === true;
    return globalThis.__NICO_RDP_TRACE_ENABLED__;
  };
  globalThis.__NICO_RDP_TRACE_STATUS__ = () => ({
    installed: true,
    enabled: globalThis.__NICO_RDP_TRACE_ENABLED__ === true,
    buffered: buffer.length,
    nextCanvasId,
    sequence,
  });
  return "installed";
})();
`;

const getVideoStateExpression = () => String.raw`
(() => {
  const videos = Array.from(document.querySelectorAll("video"));
  const canvases = Array.from(document.querySelectorAll("canvas"));
  const selected = videos
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
    .sort((a, b) => b.area - a.area)[0] || null;
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
    bodyText: document.body.innerText.slice(0, 1000),
    selected,
    videoCount: videos.length,
    canvasCount: canvases.length,
  };
})();
`;

const setVideoTimeExpression = (seconds) => `
(() => {
  const video = Array.from(document.querySelectorAll("video"))
    .map((item) => ({ item, rect: item.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.item;
  if (!video) return { ok: false, reason: "video-not-found" };
  video.currentTime = ${JSON.stringify(seconds)};
  return { ok: true, currentTime: video.currentTime };
})();
`;

const playVideoExpression = () => String.raw`
(() => {
  const video = Array.from(document.querySelectorAll("video"))
    .map((item) => ({ item, rect: item.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0]?.item;
  if (!video) return { ok: false, reason: "video-not-found" };
  video.play().catch(() => {});
  return { ok: true, paused: video.paused, currentTime: video.currentTime };
})();
`;

const waitForUsableVideo = async (client, consoleActor, timeoutMs = 30000) => {
  const startedAt = Date.now();
  let latestState = null;
  while (Date.now() - startedAt <= timeoutMs) {
    latestState = await evaluateJson(client, consoleActor, getVideoStateExpression());
    const rect = latestState.selected?.rect;
    if (
      rect &&
      rect.width > 0 &&
      rect.height > 0 &&
      latestState.selected.readyState >= 1 &&
      Number.isFinite(latestState.selected.duration)
    ) {
      return latestState;
    }
    await sleep(500);
  }
  return latestState;
};

const seekVideo = async (client, consoleActor, seconds, timeoutMs = 30000) => {
  const startedAt = Date.now();
  let latestResult = null;
  while (Date.now() - startedAt <= timeoutMs) {
    latestResult = await evaluateJson(client, consoleActor, setVideoTimeExpression(seconds));
    await sleep(500);
    const state = await evaluateJson(client, consoleActor, getVideoStateExpression());
    const currentTime = Number(state.selected?.currentTime);
    if (latestResult?.ok && Number.isFinite(currentTime) && Math.abs(currentTime - seconds) < 1.5) {
      return { ok: true, state, result: latestResult };
    }
    await sleep(500);
  }
  return { ok: false, result: latestResult };
};

const canvasSnapshotExpression = () => String.raw`
(() => {
  const canvas = Array.from(document.querySelectorAll("canvas"))
    .map((item, index) => ({ item, index, rect: item.getBoundingClientRect() }))
    .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))[0];
  if (!canvas) {
    return null;
  }
  try {
    return {
      index: canvas.index,
      width: canvas.item.width,
      height: canvas.item.height,
      dataUrl: canvas.item.toDataURL("image/png"),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
})();
`;

const dataUrlToBuffer = (value) => {
  if (typeof value !== "string") {
    return null;
  }
  const match = /^data:image\/png;base64,(.+)$/u.exec(value);
  if (!match) {
    return null;
  }
  return Buffer.from(match[1], "base64");
};

const evaluate = async (client, consoleActor, expression, timeoutMs = 15000) => {
  client.send({ to: consoleActor, type: "evaluateJSAsync", text: expression });
  const ack = await client.waitFor((message) => message.from === consoleActor && message.resultID);
  const result = await client.waitFor(
    (message) => message.from === consoleActor && message.resultID === ack.resultID,
    timeoutMs,
  );
  if (result.hasException) {
    throw new Error(result.exceptionMessage || "Firefox RDP evaluation failed.");
  }
  if (result.result?.type === "longString" && result.result.actor) {
    return readLongString(client, result.result);
  }
  return result.result;
};

const readLongString = async (client, grip) => {
  const chunkSize = 512_000;
  const chunks = [grip.initial || ""];
  let cursor = chunks[0].length;
  while (cursor < grip.length) {
    const end = Math.min(grip.length, cursor + chunkSize);
    client.send({ to: grip.actor, type: "substring", start: cursor, end });
    const response = await client.waitFor((message) => message.from === grip.actor, 15000);
    const chunk = response.substring ?? response.initial ?? "";
    chunks.push(chunk);
    cursor = end;
  }
  client.send({ to: grip.actor, type: "release" });
  return chunks.join("");
};

const evaluateJson = async (client, consoleActor, expression, timeoutMs) => {
  const result = await evaluate(
    client,
    consoleActor,
    `JSON.stringify(eval(${JSON.stringify(expression)}))`,
    timeoutMs,
  );
  return JSON.parse(result);
};

const findTargetTab = (tabs, urlNeedle, videoId) => {
  const needles = [urlNeedle, videoId].filter(Boolean).map(String);
  if (needles.length > 0) {
    const found = tabs.find((tab) => needles.some((needle) => tab.url.includes(needle)));
    if (found) {
      return found;
    }
  }
  return tabs.find((tab) => tab.url.includes("nicovideo.jp/watch/")) || tabs[0];
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const host = args.host || DEFAULT_HOST;
  const port = toNumber(args.port, DEFAULT_PORT);
  const durationMs = toNumber(args["duration-ms"], DEFAULT_DURATION_MS);
  const fps = Math.max(1, toNumber(args.fps, DEFAULT_FPS));
  const prerollMs = toNumber(args["preroll-ms"], DEFAULT_PREROLL_MS);
  const captureScreenshots = args.screenshots === "true";
  const startMs = args["start-ms"] === undefined ? null : Math.max(0, toNumber(args["start-ms"], 0));
  const caseName = sanitizeSegment(args.case || "rdp-capture");
  const requestedVideoId = sanitizeSegment(args["video-id"] || "unknown-video");
  const baseOutDir = resolve(args.out || ".calibration/nico");
  const outDir = join(baseOutDir, requestedVideoId, caseName);
  const screenshotDir = join(outDir, "screenshots");
  await mkdir(screenshotDir, { recursive: true });

  const traceStream = createWriteStream(join(outDir, "trace.jsonl"), { encoding: "utf8" });
  const client = new FirefoxRdpClient({ host, port });
  try {
    await client.connect();
    client.send({ to: "root", type: "listTabs" });
    const tabsResponse = await client.waitFor((message) => message.from === "root" && message.tabs);
    const tab = findTargetTab(tabsResponse.tabs, args.url, args["video-id"]);
    if (!tab) {
      throw new Error("Firefox RDP tab target was not found.");
    }
    client.send({ to: tab.actor, type: "getTarget" });
    const target = await client.waitFor((message) => message.from === tab.actor && message.frame);
    const consoleActor = target.frame.consoleActor;
    if (!consoleActor) {
      throw new Error("Firefox RDP console actor was not found.");
    }

    if (args.reload === "true") {
      await evaluateJson(client, consoleActor, 'location.reload(); "reloading"');
      await sleep(3500);
      client.send({ to: tab.actor, type: "getTarget" });
      const reloadedTarget = await client.waitFor(
        (message) => message.from === tab.actor && message.frame,
      );
      target.frame = reloadedTarget.frame;
    }

    const activeConsoleActor = target.frame.consoleActor;
    await evaluateJson(client, activeConsoleActor, buildCanvasHookScript());
    await waitForUsableVideo(client, activeConsoleActor);

    if (startMs !== null) {
      const seekSeconds = Math.max(0, (startMs - prerollMs) / 1000);
      const seekResult = await seekVideo(client, activeConsoleActor, seekSeconds);
      if (!seekResult.ok) {
        throw new Error(`Firefox RDP seek failed: ${JSON.stringify(seekResult.result)}`);
      }
    }
    await evaluateJson(client, activeConsoleActor, playVideoExpression());
    if (startMs !== null) {
      await sleep(prerollMs);
    }
    await evaluateJson(
      client,
      activeConsoleActor,
      "globalThis.__NICO_RDP_TRACE_DRAIN__ ? globalThis.__NICO_RDP_TRACE_DRAIN__() : []",
      30000,
    );
    await evaluateJson(
      client,
      activeConsoleActor,
      "globalThis.__NICO_RDP_TRACE_SET_ENABLED__ ? globalThis.__NICO_RDP_TRACE_SET_ENABLED__(true) : false",
    );

    const intervalMs = 1000 / fps;
    const startWallClock = Date.now();
    const metaSamples = [];
    let frameIndex = 0;

    while (Date.now() - startWallClock <= durationMs) {
      const state = await evaluateJson(client, activeConsoleActor, getVideoStateExpression());
      metaSamples.push({ sampledAtMs: Date.now(), state });
      const drained = await evaluateJson(
        client,
        activeConsoleActor,
        "globalThis.__NICO_RDP_TRACE_DRAIN__ ? globalThis.__NICO_RDP_TRACE_DRAIN__() : []",
        30000,
      );
      for (const record of drained || []) {
        traceStream.write(jsonLine(record));
      }
      if (captureScreenshots && frameIndex % Math.max(1, Math.round(fps)) === 0) {
        const snapshot = await evaluateJson(client, activeConsoleActor, canvasSnapshotExpression());
        const buffer = dataUrlToBuffer(snapshot?.dataUrl);
        if (buffer) {
          await writeFile(
            join(screenshotDir, `canvas-${String(frameIndex).padStart(5, "0")}.png`),
            buffer,
          );
        }
      }
      frameIndex += 1;
      await sleep(intervalMs);
    }

    const finalDrain = await evaluateJson(
      client,
      activeConsoleActor,
      "globalThis.__NICO_RDP_TRACE_DRAIN__ ? globalThis.__NICO_RDP_TRACE_DRAIN__() : []",
      30000,
    );
    for (const record of finalDrain || []) {
      traceStream.write(jsonLine(record));
    }
    traceStream.end();
    await once(traceStream, "finish");
    await writeFile(
      join(outDir, "meta.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          transport: "firefox-rdp",
          host,
          port,
          tab: {
            actor: tab.actor,
            title: tab.title,
            url: tab.url,
          },
          requestedVideoId,
          caseName,
          durationMs,
          fps,
          prerollMs,
          startMs,
          frameCount: frameIndex,
          samples: metaSamples,
        },
        null,
        2,
      ),
    );
    console.log(`nico rdp trace written to ${outDir}`);
    console.log(`frames: ${frameIndex}`);
  } finally {
    traceStream.destroy();
    client.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

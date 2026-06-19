#!/usr/bin/env node
import CDP from "chrome-remote-interface";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { once } from "node:events";
import { join, resolve } from "node:path";

const parseArgs = (argv) => {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const eq = token.indexOf("=");
    if (eq >= 0) {
      args[token.slice(2, eq)] = token.slice(eq + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = "true";
    }
  }
  return args;
};

const numberArg = (args, key, fallback) => {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
};

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const sanitizeSegment = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";

const parseNumberList = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter(Number.isFinite);

const parseSweep = (value) => {
  const [start, end, step] = String(value ?? "")
    .split(":")
    .map((item) => Number(item.trim()));
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step <= 0) {
    return [];
  }
  const values = [];
  for (let current = start; current <= end; current += step) {
    values.push(current);
  }
  return values;
};

const roleName = (index) => String.fromCharCode("A".charCodeAt(0) + index);

const makeProbeCases = ({ args, defaultDtMs, firstStartMs }) => {
  const dtValues =
    args["dt-sweep"] !== undefined
      ? parseSweep(args["dt-sweep"])
      : args["dt-list"] !== undefined
        ? parseNumberList(args["dt-list"])
        : [defaultDtMs];
  const clusterSpacingMs = numberArg(args, "cluster-spacing-ms", 12_000);
  return dtValues.map((dtMs, index) => ({
    id: `dt-${String(Math.round(dtMs)).padStart(4, "0")}`,
    dtMs,
    startMs: firstStartMs + index * clusterSpacingMs,
  }));
};

const makeSyntheticComments = (probeCases, { suffixA = "", suffixB = "" } = {}) =>
  probeCases.flatMap((probeCase, index) => [
    {
      id: `lane-probe-${probeCase.id}-a`,
      no: 900001 + index * 2,
      vposMs: probeCase.startMs,
      body: `LANE_PROBE_${probeCase.id}_A${suffixA}`,
      commands: ["184"],
      userId: "lane-probe",
      isPremium: false,
      score: 0,
      postedAt: "2026-06-20T00:00:00+09:00",
      nicoruCount: 0,
      nicoruId: null,
      source: "trunk",
      isMyPost: false,
    },
    {
      id: `lane-probe-${probeCase.id}-b`,
      no: 900002 + index * 2,
      vposMs: probeCase.startMs + probeCase.dtMs,
      body: `LANE_PROBE_${probeCase.id}_B${suffixB}`,
      commands: ["184"],
      userId: "lane-probe",
      isPremium: false,
      score: 0,
      postedAt: "2026-06-20T00:00:01+09:00",
      nicoruCount: 0,
      nicoruId: null,
      source: "trunk",
      isMyPost: false,
    },
  ]);

const makeSameVposComments = (
  probeCases,
  { count, reverseArray = false, reverseNo = false, suffixA = "", suffixB = "" } = {},
) =>
  probeCases.flatMap((probeCase, caseIndex) => {
    const roles = Array.from({ length: count }, (_, index) => ({ role: roleName(index), index }));
    const orderedRoles = reverseArray ? roles.slice().reverse() : roles;
    return orderedRoles.map(({ role, index }, arrayIndex) => {
      const suffix = role === "A" ? suffixA : role === "B" ? suffixB : "";
      return {
        id: `lane-probe-${probeCase.id}-${role.toLowerCase()}`,
        no: 900001 + caseIndex * count + (reverseNo ? count - 1 - index : index),
        vposMs: probeCase.startMs,
        body: `LANE_PROBE_${probeCase.id}_${role}${suffix}`,
        commands: ["184"],
        userId: "lane-probe",
        isPremium: false,
        score: 0,
        postedAt: `2026-06-20T00:00:${String(arrayIndex).padStart(2, "0")}+09:00`,
        nicoruCount: 0,
        nicoruId: null,
        source: "trunk",
        isMyPost: false,
      };
    });
  });

const extractTargets = (postData) => {
  try {
    const parsed = JSON.parse(postData || "{}");
    return parsed?.params?.targets ?? parsed?.targets ?? [];
  } catch {
    return [];
  }
};

const buildNvCommentResponse = (comments, targets) => {
  const normalizedTargets =
    Array.isArray(targets) && targets.length > 0
      ? targets
      : [
          { id: "lane-probe", fork: "owner" },
          { id: "lane-probe", fork: "main" },
          { id: "lane-probe", fork: "easy" },
        ];
  const hasMain = normalizedTargets.some((target) => target?.fork === "main");
  const responseTargets = hasMain
    ? normalizedTargets
    : [...normalizedTargets, { id: "lane-probe", fork: "main" }];
  return {
    meta: { status: 200 },
    data: {
      globalComments: [],
      threads: responseTargets.map((target) => ({
        id: String(target?.id ?? "lane-probe"),
        fork: String(target?.fork ?? "main"),
        commentCount: target?.fork === "main" ? comments.length : 0,
        comments: target?.fork === "main" ? comments : [],
      })),
      voltageZone: null,
    },
  };
};

const buildCanvasHookScript = () => String.raw`
(() => {
  const version = 1;
  if (globalThis.__NICO_BLACKBOX_PROBE_TRACE_VERSION__ === version) return "already-installed";
  globalThis.__NICO_BLACKBOX_PROBE_TRACE_VERSION__ = version;
  const buffer = [];
  const canvasIds = new WeakMap();
  const canvasTextMetadata = new Map();
  let nextCanvasId = 1;
  let sequence = 0;
  const now = () => performance.now();
  const canvasId = (canvas) => {
    if (!canvas || (typeof canvas !== "object" && typeof canvas !== "function")) return null;
    let id = canvasIds.get(canvas);
    if (!id) {
      id = nextCanvasId++;
      canvasIds.set(canvas, id);
    }
    return id;
  };
  const transformValue = (ctx) => {
    if (!ctx || typeof ctx.getTransform !== "function") return null;
    const t = ctx.getTransform();
    return [t.a, t.b, t.c, t.d, t.e, t.f];
  };
  const videoInfo = () => {
    const selected = Array.from(document.querySelectorAll("video"))
      .map((video, index) => {
        const rect = video.getBoundingClientRect();
        return { video, index, rect, area: Math.max(0, rect.width) * Math.max(0, rect.height) };
      })
      .sort((a, b) => b.area - a.area)[0];
    if (!selected) return { videoCurrentTimeMs: null, videoRect: null };
    const { video, rect } = selected;
    return {
      videoIndex: selected.index,
      videoCurrentTimeMs: Number.isFinite(video.currentTime) ? Math.round(video.currentTime * 1000) : null,
      videoPaused: video.paused,
      videoReadyState: video.readyState,
      videoRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
    };
  };
  const rememberText = (ctx, text, includeText) => {
    const id = canvasId(ctx?.canvas);
    if (id === null) return;
    const existing = canvasTextMetadata.get(id) ?? { textParts: [] };
    if (includeText && String(text ?? "").length > 0) existing.textParts.push(String(text ?? ""));
    const joined = existing.textParts.join("");
    existing.text = joined.slice(0, 160) || null;
    existing.textLength = joined.length || null;
    existing.fillStyle = "fillStyle" in ctx ? String(ctx.fillStyle) : null;
    existing.strokeStyle = "strokeStyle" in ctx ? String(ctx.strokeStyle) : null;
    existing.font = "font" in ctx ? ctx.font : null;
    existing.fontSize = parseFloat(String(existing.font ?? "").match(/(\d+(?:\.\d+)?)px/)?.[1] ?? "NaN");
    existing.canvasWidth = typeof ctx?.canvas?.width === "number" ? ctx.canvas.width : null;
    existing.canvasHeight = typeof ctx?.canvas?.height === "number" ? ctx.canvas.height : null;
    canvasTextMetadata.set(id, existing);
  };
  const sourceInfo = (source) => {
    const sourceCanvas = source && typeof source.getContext === "function" ? source : null;
    const sourceCanvasId = sourceCanvas ? canvasId(sourceCanvas) : null;
    return {
      sourceKind: source?.constructor?.name ?? null,
      sourceCanvasId,
      sourceWidth: typeof source?.width === "number" ? source.width : null,
      sourceHeight: typeof source?.height === "number" ? source.height : null,
      sourceCanvasText: sourceCanvasId === null ? null : canvasTextMetadata.get(sourceCanvasId) ?? null,
    };
  };
  const snapshot = (ctx, op, extra) => {
    const canvas = ctx?.canvas ?? null;
    buffer.push({
      source: "niconico-player",
      transport: "chrome-cdp-fetch",
      sequence: sequence++,
      op,
      timestampMs: now(),
      pageUrl: location.href,
      canvasId: canvasId(canvas),
      canvasWidth: typeof canvas?.width === "number" ? canvas.width : null,
      canvasHeight: typeof canvas?.height === "number" ? canvas.height : null,
      font: "font" in ctx ? ctx.font : null,
      fillStyle: "fillStyle" in ctx ? String(ctx.fillStyle) : null,
      strokeStyle: "strokeStyle" in ctx ? String(ctx.strokeStyle) : null,
      lineWidth: "lineWidth" in ctx ? ctx.lineWidth : null,
      lineJoin: "lineJoin" in ctx ? ctx.lineJoin : null,
      globalAlpha: "globalAlpha" in ctx ? ctx.globalAlpha : null,
      transform: transformValue(ctx),
      ...videoInfo(),
      ...extra,
    });
    if (buffer.length > 200000) buffer.splice(0, buffer.length - 200000);
  };
  const patch = (prototype, name, after) => {
    if (!prototype || typeof prototype[name] !== "function") return;
    const marker = "__nicoBlackboxProbePatched_" + version + "_" + name;
    if (prototype[name][marker]) return;
    const original = prototype[name];
    const patched = function patchedCanvasMethod(...args) {
      const result = original.apply(this, args);
      try { after(this, args); } catch {}
      return result;
    };
    Object.defineProperty(patched, marker, { value: true });
    prototype[name] = patched;
  };
  const patchContext = (ctor) => {
    const p = ctor?.prototype;
    patch(p, "fillText", (ctx, args) => {
      rememberText(ctx, args[0], true);
      snapshot(ctx, "fillText", { text: String(args[0] ?? ""), x: Number(args[1]), y: Number(args[2]) });
    });
    patch(p, "strokeText", (ctx, args) => {
      rememberText(ctx, args[0], false);
      snapshot(ctx, "strokeText", { text: String(args[0] ?? ""), x: Number(args[1]), y: Number(args[2]) });
    });
    patch(p, "drawImage", (ctx, args) => {
      snapshot(ctx, "drawImage", { ...sourceInfo(args[0]), args: args.slice(1).map((v) => typeof v === "number" ? v : null) });
    });
  };
  patchContext(globalThis.CanvasRenderingContext2D);
  patchContext(globalThis.OffscreenCanvasRenderingContext2D);
  globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__ = () => buffer.splice(0, buffer.length);
  globalThis.__NICO_BLACKBOX_PROBE_TRACE_STATUS__ = () => ({ installed: true, buffered: buffer.length, sequence, nextCanvasId });
  return "installed";
})();
`;

const evaluate = async (Runtime, expression, timeout = 30000) => {
  const response = await Runtime.evaluate({
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout,
  });
  if (response.exceptionDetails) {
    const message = response.exceptionDetails.exception?.description || response.exceptionDetails.text;
    throw new Error(`Runtime.evaluate failed: ${message}`);
  }
  return response.result.value;
};

const waitForVideo = async (Runtime, timeoutMs) => {
  const startedAt = Date.now();
  let latest = null;
  while (Date.now() - startedAt <= timeoutMs) {
    latest = await evaluate(
      Runtime,
      `(() => {
        const video = Array.from(document.querySelectorAll("video"))
          .map((item) => ({ item, rect: item.getBoundingClientRect() }))
          .sort((a, b) => b.rect.width * b.rect.height - a.rect.width * a.rect.height)[0]?.item;
        if (!video) return null;
        const rect = video.getBoundingClientRect();
        return { currentTime: video.currentTime, duration: video.duration, readyState: video.readyState, paused: video.paused, rect: { width: rect.width, height: rect.height } };
      })()`,
      10000,
    );
    if (latest?.rect?.width > 0 && latest?.rect?.height > 0 && latest.readyState >= 1) return latest;
    await sleep(500);
  }
  throw new Error(`Video was not ready. latest=${JSON.stringify(latest)}`);
};

const findTarget = async ({ host, port, urlNeedle }) => {
  const targets = await CDP.List({ host, port });
  const target =
    targets.find((entry) => entry.type === "page" && entry.url.includes(urlNeedle)) ||
    targets.find((entry) => entry.type === "page" && entry.url.includes("nicovideo.jp/watch/")) ||
    targets.find((entry) => entry.type === "page");
  if (!target) throw new Error("CDP page target was not found.");
  return target;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const host = args.host || "127.0.0.1";
  const port = numberArg(args, "port", 9222);
  const videoId = sanitizeSegment(args["video-id"] || "sm6240144");
  const url = args.url || `https://www.nicovideo.jp/watch/${videoId}`;
  const caseName = sanitizeSegment(args.case || `cdp-blackbox-dt-${args.dt ?? "0"}`);
  const dtMs = numberArg(args, "dt", 0);
  const commentStartMs = numberArg(args, "comment-start-ms", 10_000);
  const captureMs = numberArg(args, "duration-ms", 6000);
  const fps = Math.max(1, numberArg(args, "fps", 15));
  const shouldReload = args.reload !== "false";
  const suffixA = String(args["suffix-a"] ?? "");
  const suffixB = String(args["suffix-b"] ?? "");
  const sameVposCount = Math.max(0, numberArg(args, "same-vpos-count", 0));
  const outDir = resolve(args.out || `.calibration/nico/${videoId}/${caseName}`);
  await mkdir(outDir, { recursive: true });

  const probeCases = makeProbeCases({ args, defaultDtMs: dtMs, firstStartMs: commentStartMs });
  const comments =
    sameVposCount > 0
      ? makeSameVposComments(probeCases, {
          count: sameVposCount,
          reverseArray: args["reverse-array"] === "true",
          reverseNo: args["reverse-no"] === "true",
          suffixA,
          suffixB,
        })
      : makeSyntheticComments(probeCases, { suffixA, suffixB });
  const target = await findTarget({ host, port, urlNeedle: videoId });
  const client = await CDP({ host, port, target });
  const { Page, Runtime, Fetch } = client;
  const traceStream = createWriteStream(join(outDir, "trace.jsonl"), { encoding: "utf8" });
  const fulfilledRequests = [];
  let traceRecordCount = 0;

  try {
    await Promise.all([
      Page.enable(),
      Runtime.enable(),
      Fetch.enable({
        patterns: [
          { urlPattern: "*://public.nvcomment.nicovideo.jp/v1/threads*", requestStage: "Request" },
          { urlPattern: "*://*.nvcomment.nicovideo.jp/v1/threads*", requestStage: "Request" },
        ],
      }),
    ]);
    await Page.bringToFront();

    Fetch.requestPaused(async (event) => {
      const postData = event.request.postData || "";
      if (event.request.method === "OPTIONS") {
        const requestHeaders = event.request.headers || {};
        const requestedHeaders =
          requestHeaders["Access-Control-Request-Headers"] ||
          requestHeaders["access-control-request-headers"] ||
          "content-type";
        fulfilledRequests.push({ url: event.request.url, method: event.request.method });
        await Fetch.fulfillRequest({
          requestId: event.requestId,
          responseCode: 204,
          responseHeaders: [
            { name: "access-control-allow-origin", value: "https://www.nicovideo.jp" },
            { name: "access-control-allow-methods", value: "POST, OPTIONS" },
            { name: "access-control-allow-headers", value: String(requestedHeaders) },
            { name: "access-control-allow-credentials", value: "true" },
            { name: "access-control-allow-private-network", value: "true" },
            { name: "access-control-max-age", value: "0" },
          ],
        });
        return;
      }
      const response = buildNvCommentResponse(comments, extractTargets(postData));
      fulfilledRequests.push({
        url: event.request.url,
        method: event.request.method,
        postDataSnippet: postData.slice(0, 2000),
        threadSummary: response.data.threads.map((thread) => ({
          id: thread.id,
          fork: thread.fork,
          commentsLen: thread.comments.length,
        })),
      });
      await Fetch.fulfillRequest({
        requestId: event.requestId,
        responseCode: 200,
        responseHeaders: [
          { name: "content-type", value: "application/json; charset=utf-8" },
          { name: "access-control-allow-origin", value: "https://www.nicovideo.jp" },
          { name: "access-control-allow-credentials", value: "true" },
          { name: "cache-control", value: "no-store" },
        ],
        body: Buffer.from(JSON.stringify(response), "utf8").toString("base64"),
      });
    });

    await Page.addScriptToEvaluateOnNewDocument({ source: buildCanvasHookScript() });
    await evaluate(Runtime, buildCanvasHookScript());

    if (shouldReload) {
      // Intentionally one controlled reload. Rapid reloads can trigger nvComment 403s.
      await Page.navigate({ url });
      await sleep(2500);
      await evaluate(Runtime, buildCanvasHookScript());
    }

    await Page.bringToFront();
    await waitForVideo(Runtime, 60000);
    const samples = [];
    let frameIndex = 0;
    const intervalMs = 1000 / fps;

    for (const probeCase of probeCases) {
      const caseSeekMs = Math.max(0, probeCase.startMs - 2500);
      await evaluate(
        Runtime,
        `(() => {
          const video = document.querySelector("video");
          if (!video) return { ok: false, reason: "video-not-found" };
          video.pause();
          video.muted = true;
          video.currentTime = ${JSON.stringify(caseSeekMs / 1000)};
          return { ok: true, currentTime: video.currentTime };
        })()`,
      );
      await sleep(800);
      await evaluate(
        Runtime,
        `globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__ ? globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__() : []`,
      );
      await evaluate(
        Runtime,
        `(() => {
          const video = document.querySelector("video");
          if (!video) return { ok: false };
          video.muted = true;
          video.play().catch(() => {});
          return { ok: true, currentTime: video.currentTime, paused: video.paused };
        })()`,
      );

      const startedAt = Date.now();
      while (Date.now() - startedAt <= captureMs) {
        const drained = await evaluate(
          Runtime,
          `globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__ ? globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__() : []`,
          30000,
        );
        for (const record of drained || []) {
          traceStream.write(`${JSON.stringify({ ...record, probeCaseId: probeCase.id, probeDtMs: probeCase.dtMs })}\n`);
          traceRecordCount += 1;
        }
        const state = await evaluate(
          Runtime,
          `(() => {
            const video = document.querySelector("video");
            const text = document.body?.innerText ?? "";
            const prefix = ${JSON.stringify(`LANE_PROBE_${probeCase.id}_`)};
            return {
              currentTime: video?.currentTime ?? null,
              paused: video?.paused ?? null,
              hasProbeA: text.includes(prefix + "A"),
              hasProbeB: text.includes(prefix + "B")
            };
          })()`,
        );
        samples.push({ frameIndex, probeCase, state });
        frameIndex += 1;
        await sleep(intervalMs);
      }
    }
    const finalDrain = await evaluate(
      Runtime,
      `globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__ ? globalThis.__NICO_BLACKBOX_PROBE_TRACE_DRAIN__() : []`,
      30000,
    );
    for (const record of finalDrain || []) {
      traceStream.write(`${JSON.stringify(record)}\n`);
      traceRecordCount += 1;
    }
    traceStream.end();
    await once(traceStream, "finish");

    await writeFile(
      join(outDir, "meta.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          transport: "chrome-cdp-fetch",
          url,
          target: { id: target.id, title: target.title, url: target.url },
          videoId,
          caseName,
          dtMs,
          probeCases,
          commentStartMs,
          captureMs,
          fps,
          reload: shouldReload,
          comments,
          fulfilledRequests,
          traceRecordCount,
          samples,
        },
        null,
        2,
      ),
    );
    if (traceRecordCount === 0) {
      throw new Error("No canvas trace records were captured. The player loaded, but comment rendering did not draw through the hooked canvas path.");
    }
    console.log(`cdp blackbox probe written to ${outDir}`);
    console.log(`fulfilled nvComment requests: ${fulfilledRequests.length}`);
  } finally {
    traceStream.destroy();
    await client.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

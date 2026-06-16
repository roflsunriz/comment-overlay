#!/usr/bin/env bun
import CDP from "chrome-remote-interface";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

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

const numberArg = (args, key, fallback) => {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
};

const csvNumberSet = (value) =>
  new Set(
    String(value ?? "")
      .split(",")
      .map((item) => Number(item.trim()))
      .filter(Number.isFinite),
  );

const normalizeCommentEntries = (input, sourceMode, excludeNos, includeNos) => {
  const rawComments = Array.isArray(input?.comments) ? input.comments : Array.isArray(input) ? input : [];
  const trunkComments = rawComments.filter((comment) => comment?.source === "trunk");
  const leafComments = rawComments.filter((comment) => comment?.source === "leaf");
  const baseComments =
    sourceMode === "all"
      ? rawComments
      : sourceMode === "leaf"
        ? leafComments
        : sourceMode === "trunk"
          ? trunkComments
          : trunkComments.length > 0
          ? trunkComments
          : rawComments;
  const includedComments =
    includeNos.size === 0
      ? []
      : rawComments.filter((comment) => includeNos.has(Number(comment.no)));
  const seenNos = new Set();
  const comments = [...baseComments, ...includedComments].filter((comment) => {
    const no = Number(comment.no);
    if (seenNos.has(no)) return false;
    seenNos.add(no);
    return true;
  });
  return comments
    .map((comment) => ({
      no: Number(comment.no),
      text: typeof comment.body === "string" ? comment.body : String(comment.text ?? ""),
      vposMs: Number(comment.vposMs),
      commands: Array.isArray(comment.commands)
        ? comment.commands.filter((command) => typeof command === "string")
        : [],
    }))
    .filter(
      (comment) =>
        comment.text.length > 0 &&
        Number.isFinite(comment.vposMs) &&
        !excludeNos.has(comment.no),
    );
};

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

const startStaticServer = async ({ modulePath }) => {
  const moduleSource = await readFile(modulePath);
  const harnessHtml = Buffer.from(
    '<!doctype html><html><head><meta charset="utf-8"><title>comment-overlay calibration</title></head><body></body></html>',
  );
  const server = createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    if (url.pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(harnessHtml);
      return;
    }
    if (url.pathname === "/dist/comment-overlay.es.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      response.end(moduleSource);
      return;
    }
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("Failed to start local calibration server");
  }
  const origin = `http://127.0.0.1:${address.port}`;
  return {
    origin,
    moduleUrl: `${origin}/dist/comment-overlay.es.js`,
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose();
        });
      }),
  };
};

const browserHarness = async ({
  moduleUrl,
  comments,
  width,
  height,
  durationMs,
  startMs,
  captureDurationMs,
  prerollMs,
  fps,
  dpr,
}) => {
  const mod = await import(moduleUrl);
  const {
    CommentRenderer,
    captureRendererCalibrationFrame,
    cloneDefaultSettings,
  } = mod;

  document.documentElement.style.margin = "0";
  document.body.style.margin = "0";
  document.body.innerHTML = "";

  const container = document.createElement("div");
  container.style.position = "relative";
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.overflow = "hidden";
  document.body.appendChild(container);

  const video = document.createElement("video");
  video.style.width = `${width}px`;
  video.style.height = `${height}px`;
  video.style.display = "block";

  let currentTime = startMs / 1000;
  let playbackRate = 1;
  Object.defineProperty(video, "currentTime", {
    configurable: true,
    get: () => currentTime,
    set: (value) => {
      currentTime = Number(value) || 0;
    },
  });
  Object.defineProperty(video, "duration", {
    configurable: true,
    get: () => durationMs / 1000,
  });
  Object.defineProperty(video, "paused", {
    configurable: true,
    get: () => false,
  });
  Object.defineProperty(video, "playbackRate", {
    configurable: true,
    get: () => playbackRate,
    set: (value) => {
      playbackRate = Number(value) || 1;
    },
  });
  video.getBoundingClientRect = () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON() {
      return this;
    },
  });
  container.appendChild(video);

  const settings = cloneDefaultSettings();
  settings.useContainerResizeObserver = false;
  settings.useDprScaling = dpr !== 1;
  settings.commentOpacity = 1;

  let currentTimeSourceMs = startMs;
  const renderer = new CommentRenderer(settings, {
    timeSource: {
      now: () => currentTimeSourceMs,
    },
    animationFrameProvider: {
      request: () => 0,
      cancel: () => {},
    },
  });

  renderer.initialize({ video, container });
  renderer.stopAnimation();
  renderer.resize(width, height);
  renderer.addComments(comments);

  const records = [];
  const frames = [];
  const frameIntervalMs = 1000 / fps;
  const frameCount = Math.max(1, Math.floor(captureDurationMs / frameIntervalMs));
  const prerollStartMs = Math.max(0, startMs - Math.max(0, prerollMs));

  let prerollFrameIndex = 0;
  for (
    let frameTimeMs = prerollStartMs;
    frameTimeMs < startMs;
    frameTimeMs += frameIntervalMs
  ) {
    currentTimeSourceMs = frameTimeMs;
    currentTime = frameTimeMs / 1000;
    const snapshot = captureRendererCalibrationFrame(renderer, frameTimeMs, {
      collectTrace: true,
      traceOps: ["laneDecision"],
    });
    for (const record of snapshot.records) {
      records.push({
        ...record,
        frameIndex: -1 - prerollFrameIndex,
        frameTimeMs,
        phase: "preroll",
      });
    }
    prerollFrameIndex += 1;
  }

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const frameTimeMs = startMs + frameIndex * frameIntervalMs;
    currentTimeSourceMs = frameTimeMs;
    currentTime = frameTimeMs / 1000;
    const snapshot = captureRendererCalibrationFrame(renderer, frameTimeMs, {
      collectTrace: true,
    });
    frames.push({
      index: frameIndex,
      frameTimeMs,
      activeCommentCount: snapshot.activeComments.length,
      activeComments: snapshot.activeComments,
      canvas: snapshot.canvas,
      recordCount: snapshot.records.length,
    });
    for (const record of snapshot.records) {
      records.push({
        ...record,
        frameIndex,
        frameTimeMs,
        phase: "capture",
      });
    }
  }

  const screenshotDataUrl = renderer.canvas?.toDataURL("image/png") ?? null;
  renderer.destroy();

  return {
    records,
    frames,
    screenshotDataUrl,
    meta: {
      width,
      height,
      durationMs,
      startMs,
      captureDurationMs,
      prerollMs,
      fps,
      dpr,
      commentCount: comments.length,
      recordCount: records.length,
      frameCount,
    },
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const host = args.host || "127.0.0.1";
  const port = numberArg(args, "port", 9222);
  const commentsPath = resolve(args.comments || ".calibration/sm6240144-comments.json");
  const outDir = resolve(args.out || ".calibration/nico/sm6240144/overlay-cat-mario-100s-30s");
  const width = numberArg(args, "width", 1182);
  const height = numberArg(args, "height", 665);
  const startMs = numberArg(args, "start-ms", 100_000);
  const captureDurationMs = numberArg(args, "duration-ms", 30_000);
  const prerollMs = numberArg(args, "preroll-ms", 3_000);
  const durationMs = numberArg(args, "video-duration-ms", 661_394);
  const fps = numberArg(args, "fps", 15);
  const dpr = numberArg(args, "dpr", 1);
  const commentSource = args["comment-source"] || "auto";
  const excludeNos = csvNumberSet(args["exclude-nos"]);
  const includeNos = csvNumberSet(args["include-nos"]);

  const commentsJson = JSON.parse(await readFile(commentsPath, "utf8"));
  const comments = normalizeCommentEntries(commentsJson, commentSource, excludeNos, includeNos);
  const modulePath = resolve("dist/comment-overlay.es.js");

  await mkdir(outDir, { recursive: true });
  await mkdir(resolve(outDir, "screenshots"), { recursive: true });

  const staticServer = await startStaticServer({ modulePath });

  const target = await CDP.New({ host, port, url: "about:blank" });
  const client = await CDP({ host, port, target });

  try {
    const { Page, Runtime } = client;
    await Promise.all([Page.enable(), Runtime.enable()]);
    await Page.navigate({ url: staticServer.origin });
    await Page.loadEventFired();

    const expression = `(${browserHarness.toString()})(${JSON.stringify({
      moduleUrl: staticServer.moduleUrl,
      comments,
      width,
      height,
      durationMs,
      startMs,
      captureDurationMs,
      prerollMs,
      fps,
      dpr,
    })})`;
    const result = await Runtime.evaluate({
      expression,
      awaitPromise: true,
      returnByValue: true,
      timeout: Math.max(30_000, captureDurationMs + 30_000),
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Browser harness failed");
    }
    const value = result.result.value;
    if (!value) {
      throw new Error("Browser harness returned no value");
    }

    const jsonl = value.records.map((record) => JSON.stringify(record)).join("\n");
    await writeFile(resolve(outDir, "trace.jsonl"), jsonl.length > 0 ? `${jsonl}\n` : "");
    await writeFile(resolve(outDir, "frames.json"), JSON.stringify(value.frames, null, 2));
    await writeFile(
      resolve(outDir, "meta.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          commentsPath,
          commentSource,
          excludeNos: [...excludeNos],
          includeNos: [...includeNos],
          moduleUrl: staticServer.moduleUrl,
          prerollMs,
          ...value.meta,
        },
        null,
        2,
      ),
    );

    const screenshot = dataUrlToBuffer(value.screenshotDataUrl);
    if (screenshot) {
      await writeFile(resolve(outDir, "screenshots", "last.png"), screenshot);
    }

    console.log(`overlay trace written to ${outDir}`);
    console.log(`records: ${value.meta.recordCount}, frames: ${value.meta.frameCount}`);
  } finally {
    await client.close();
    await CDP.Close({ host, port, id: target.id });
    await staticServer.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

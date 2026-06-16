#!/usr/bin/env bun
import CDP from "chrome-remote-interface";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 9222;

const parseArgs = (argv) => {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
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

const sanitizeSegment = (value) =>
  String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "unknown";

const buildFetchExpression = (videoId) => String.raw`
(async () => {
  const SMID = ${JSON.stringify(videoId)};
  const WATCH_URL = 'https://www.nicovideo.jp/watch/' + SMID;
  const decodeHtml = (value) => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  };
  const html = await fetch(WATCH_URL, { credentials: 'same-origin', cache: 'no-store' }).then((response) => {
    if (!response.ok) {
      throw new Error('watch fetch failed: ' + response.status);
    }
    return response.text();
  });
  const documentForWatch = new DOMParser().parseFromString(html, 'text/html');
  const meta = documentForWatch.querySelector('meta[name="server-response"]');
  if (!meta) {
    throw new Error('meta[name="server-response"] not found');
  }
  const decoded = decodeHtml(meta.getAttribute('content') || '');
  let serverResponse;
  try {
    serverResponse = JSON.parse(decoded);
  } catch {
    serverResponse = JSON.parse(JSON.parse(decoded));
  }
  const apiData = serverResponse?.data?.response ?? serverResponse?.response ?? serverResponse?.apiData;
  if (!apiData) {
    throw new Error('apiData not found in server-response');
  }
  const nvComment = apiData?.comment?.nvComment;
  if (!nvComment?.server || !nvComment?.params || !nvComment?.threadKey) {
    throw new Error('nvComment.server / params / threadKey is missing');
  }
  const endpoint = nvComment.server.replace(/\/+$/, '') + '/v1/threads';
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'x-client-os-type': 'others',
      'X-Frontend-Id': '6',
      'X-Frontend-Version': '0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: nvComment.params,
      threadKey: nvComment.threadKey
    })
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error('nv-comment fetch failed: ' + response.status + ' ' + text.slice(0, 200));
  }
  const json = await response.json();
  const threads = json?.data?.threads ?? [];
  return {
    fetchedAt: new Date().toISOString(),
    pageUrl: location.href,
    watchUrl: WATCH_URL,
    nvComment: {
      server: nvComment.server,
      params: nvComment.params,
      threadKey: '<REDACTED>'
    },
    threadSummary: threads.map((thread) => ({
      id: thread.id,
      fork: thread.fork,
      commentCount: thread.commentCount,
      commentsLen: Array.isArray(thread.comments) ? thread.comments.length : 0
    })),
    rawResponse: json
  };
})()
`;

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const host = args.host || DEFAULT_HOST;
  const port = toNumber(args.port, DEFAULT_PORT);
  const videoId = sanitizeSegment(args["video-id"] || args.video || "sm6240144");
  const targets = await CDP.List({ host, port });
  const target =
    args.target ??
    targets.find((entry) => entry.type === "page" && entry.url.includes(`/watch/${videoId}`))?.id;
  if (!target) {
    throw new Error(`nicovideo target was not found for ${videoId}. Pass --target explicitly.`);
  }

  const client = await CDP({ host, port, target });
  const { Runtime } = client;
  try {
    await Runtime.enable();
    const response = await Runtime.evaluate({
      expression: buildFetchExpression(videoId),
      awaitPromise: true,
      returnByValue: true,
      timeout: 60_000,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text || "Runtime.evaluate failed");
    }
    const result = response.result.value;
    const outDir = resolve(args.out || `.calibration/nico/${videoId}/input-current`);
    await mkdir(outDir, { recursive: true });
    const rawPath = join(outDir, "nvcomment-current.json");
    await writeFile(rawPath, JSON.stringify(result, null, 2));

    const mainThread = result.rawResponse?.data?.threads?.find((thread) => thread.fork === "main");
    if (mainThread?.comments) {
      await writeFile(
        join(outDir, "nvcomment-current-main-comments.json"),
        JSON.stringify({ comments: mainThread.comments }, null, 2),
      );
    }

    const allComments = (result.rawResponse?.data?.threads ?? [])
      .flatMap((thread) =>
        Array.isArray(thread.comments)
          ? thread.comments.map((comment) => ({
              ...comment,
              fork: thread.fork ?? null,
              source: thread.fork ?? comment.source,
            }))
          : [],
      )
      .sort((left, right) => {
        const vposDiff = Number(left.vposMs) - Number(right.vposMs);
        if (Number.isFinite(vposDiff) && vposDiff !== 0) return vposDiff;
        return Number(left.no) - Number(right.no);
      });
    await writeFile(
      join(outDir, "nvcomment-current-all-comments.json"),
      JSON.stringify({ comments: allComments }, null, 2),
    );

    console.log(rawPath);
    console.log(JSON.stringify(result.threadSummary, null, 2));
  } finally {
    await client.close();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

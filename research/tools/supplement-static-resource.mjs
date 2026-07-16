#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

import { requestFingerprint, sanitizeResponseHeaders, sha256 } from "./lib/archive.mjs";
import { booleanArg, numberArg, parseArgs } from "./lib/cli.mjs";

const HELP = `
オフライン監査で不足が判明した公式静的資産を、既存アーカイブへ1件追補します。

Usage:
  node research/tools/supplement-static-resource.mjs --archive <manifest.json> --url <asset URL>

Options:
  --max-body-bytes <n>  保存上限（既定: 26214400）
`;

const ALLOWED_HOST_SUFFIXES = [".nicovideo.jp", ".nimg.jp"];
const ALLOWED_EXTENSIONS = [".js", ".mjs", ".css", ".wasm", ".json"];

const ensureResearchPath = (path) => {
  const researchRoot = resolve("research");
  const absolute = resolve(path);
  if (
    absolute !== researchRoot &&
    !absolute.startsWith(`${researchRoot}\\`) &&
    !absolute.startsWith(`${researchRoot}/`)
  ) {
    throw new Error(`Research archive must stay under ${researchRoot}: ${absolute}`);
  }
  return absolute;
};

const ensureAllowedStaticUrl = (rawUrl) => {
  if (!rawUrl) throw new Error("--url is required.");
  const url = new URL(rawUrl);
  const allowedHost = ALLOWED_HOST_SUFFIXES.some(
    (suffix) => url.hostname.endsWith(suffix) || url.hostname === suffix.slice(1),
  );
  const allowedExtension = ALLOWED_EXTENSIONS.some((extension) =>
    url.pathname.toLowerCase().endsWith(extension),
  );
  if (url.protocol !== "https:" || !allowedHost || !allowedExtension) {
    throw new Error(
      "Only static .js/.mjs/.css/.wasm/.json assets on nicovideo.jp or nimg.jp may be supplemented.",
    );
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
  if (!args.archive) throw new Error("--archive is required.");
  const manifestPath = ensureResearchPath(args.archive);
  const assetUrl = ensureAllowedStaticUrl(args.url);
  const archiveDirectory = resolve(manifestPath, "..");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const request = { method: "GET", url: assetUrl, postDataSha256: null, headers: {} };
  const fingerprint = requestFingerprint(request);
  const duplicate = manifest.exchanges.some(
    (exchange) => requestFingerprint(exchange.request) === fingerprint && exchange.body,
  );
  if (duplicate) {
    console.log(`already archived: ${assetUrl}`);
    return;
  }

  const maxBodyBytes = numberArg(args, "max-body-bytes", 25 * 1024 * 1024, { minimum: 1 });
  const response = await fetch(assetUrl, {
    headers: { accept: "*/*", "user-agent": "comment-overlay-compatibility-research/1" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`Static resource fetch failed: ${response.status}`);
  ensureAllowedStaticUrl(response.url);
  const body = Buffer.from(await response.arrayBuffer());
  if (body.byteLength > maxBodyBytes) {
    throw new Error(`Static resource exceeds ${maxBodyBytes} bytes.`);
  }

  const bodyHash = sha256(body);
  const bodyRelativePath = `bodies/${bodyHash}.bin`;
  const bodyPath = resolve(archiveDirectory, bodyRelativePath);
  await mkdir(resolve(archiveDirectory, "bodies"), { recursive: true });
  if (!(await fileExists(bodyPath))) await writeFile(bodyPath, body);
  const responseHeaderObject = Object.fromEntries(response.headers.entries());
  const nextSequence =
    Math.max(-1, ...manifest.exchanges.map((exchange) => Number(exchange.sequence) || 0)) + 1;
  manifest.exchanges.push({
    sequence: nextSequence,
    request,
    resourceType: "Other",
    response: {
      status: response.status,
      statusText: response.statusText || "OK",
      mimeType: response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream",
      protocol: "supplemental-fetch",
      headers: sanitizeResponseHeaders(responseHeaderObject),
    },
    body: { sha256: bodyHash, bytes: body.byteLength, file: bodyRelativePath },
    omission: null,
    supplement: { fetchedAt: new Date().toISOString(), finalUrl: response.url },
  });
  manifest.summary.exchangeCount = manifest.exchanges.length;
  manifest.summary.bodyCount = new Set(
    manifest.exchanges.flatMap((exchange) => (exchange.body ? [exchange.body.sha256] : [])),
  ).size;
  manifest.supplementedAt = new Date().toISOString();
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`supplemented: ${assetUrl}`);
  console.log(`archive: ${relative(process.cwd(), manifestPath)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

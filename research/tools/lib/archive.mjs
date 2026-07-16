import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export const ARCHIVE_FORMAT_VERSION = 1;

const OMITTED_RESPONSE_HEADERS = new Set([
  "alt-svc",
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "set-cookie",
  "strict-transport-security",
  "transfer-encoding",
]);

const SAFE_REQUEST_HEADERS = new Set([
  "accept",
  "content-type",
  "origin",
  "referer",
  "x-client-os-type",
  "x-frontend-id",
  "x-frontend-version",
]);

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const requestFingerprint = ({ method, url, postDataSha256 }) =>
  `${String(method).toUpperCase()} ${url} ${postDataSha256 ?? "-"}`;

export const sanitizeRequestHeaders = (headers = {}) =>
  Object.fromEntries(
    Object.entries(headers).filter(([name]) => SAFE_REQUEST_HEADERS.has(name.toLowerCase())),
  );

export const sanitizeResponseHeaders = (headers = {}) =>
  Object.entries(headers)
    .filter(([name]) => !OMITTED_RESPONSE_HEADERS.has(name.toLowerCase()))
    .flatMap(([name, rawValue]) =>
      String(rawValue)
        .split("\n")
        .map((value) => ({ name, value })),
    );

const assertArchiveShape = (manifest) => {
  if (!manifest || typeof manifest !== "object")
    throw new Error("Archive manifest is not an object.");
  if (manifest.formatVersion !== ARCHIVE_FORMAT_VERSION) {
    throw new Error(
      `Unsupported archive format ${manifest.formatVersion}; expected ${ARCHIVE_FORMAT_VERSION}.`,
    );
  }
  if (typeof manifest.entryUrl !== "string" || !Array.isArray(manifest.exchanges)) {
    throw new Error("Archive manifest is missing entryUrl or exchanges.");
  }
};

export const loadArchive = async (manifestPath) => {
  const absoluteManifestPath = resolve(manifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  assertArchiveShape(manifest);
  const archiveDirectory = dirname(absoluteManifestPath);
  const bodies = new Map();
  for (const exchange of manifest.exchanges) {
    if (!exchange.body?.file) continue;
    const bodyPath = resolve(archiveDirectory, exchange.body.file);
    if (
      !bodyPath.startsWith(`${archiveDirectory}\\`) &&
      !bodyPath.startsWith(`${archiveDirectory}/`)
    ) {
      throw new Error(`Body path escapes the archive: ${exchange.body.file}`);
    }
    const body = await readFile(bodyPath);
    const actualHash = sha256(body);
    if (actualHash !== exchange.body.sha256) {
      throw new Error(`Body hash mismatch for ${exchange.body.file}.`);
    }
    bodies.set(exchange.body.sha256, body);
  }
  return { manifest, archiveDirectory, bodies };
};

export const indexArchiveExchanges = (manifest) => {
  const exact = new Map();
  const withoutPostData = new Map();
  for (const exchange of manifest.exchanges) {
    const fingerprint = requestFingerprint(exchange.request);
    if (!exact.has(fingerprint)) exact.set(fingerprint, exchange);
    const fallback = requestFingerprint({ ...exchange.request, postDataSha256: null });
    if (!withoutPostData.has(fallback)) withoutPostData.set(fallback, exchange);
  }
  return { exact, withoutPostData };
};

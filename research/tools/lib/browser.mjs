import CDP from "chrome-remote-interface";
import { spawn } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { delimiter, join, resolve } from "node:path";

import { sleep } from "./cli.mjs";

const WINDOWS_CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const UNIX_CHROME_NAMES = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];

const isReadable = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const findOnPath = async (name) => {
  const suffixes = process.platform === "win32" ? [".exe", ".cmd", ".bat", ""] : [""];
  for (const directory of String(process.env.PATH ?? "").split(delimiter)) {
    if (!directory) continue;
    for (const suffix of suffixes) {
      const candidate = join(directory, `${name}${suffix}`);
      if (await isReadable(candidate)) return candidate;
    }
  }
  return null;
};

export const findChromeExecutable = async (explicitPath) => {
  if (explicitPath) {
    const resolved = resolve(explicitPath);
    if (!(await isReadable(resolved))) {
      throw new Error(`Chrome executable was not found: ${resolved}`);
    }
    return resolved;
  }

  const configured = process.env.CHROME_PATH;
  if (configured && (await isReadable(configured))) return configured;

  if (process.platform === "win32") {
    for (const candidate of WINDOWS_CHROME_PATHS) {
      if (await isReadable(candidate)) return candidate;
    }
  }

  if (process.platform === "darwin") {
    const macPath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    if (await isReadable(macPath)) return macPath;
  }

  for (const name of UNIX_CHROME_NAMES) {
    const candidate = await findOnPath(name);
    if (candidate) return candidate;
  }

  throw new Error("Chrome/Chromium was not found. Pass --chrome <path> or set CHROME_PATH.");
};

export const reservePort = async () =>
  new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else if (port === null) reject(new Error("Could not reserve a CDP port."));
        else resolvePort(port);
      });
    });
  });

const waitForCdp = async (port, child, timeoutMs = 20_000) => {
  const startedAt = Date.now();
  let latestError = null;
  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Chrome exited before CDP became ready (exit ${child.exitCode}).`);
    }
    try {
      await CDP.Version({ host: "127.0.0.1", port });
      return;
    } catch (error) {
      latestError = error;
      await sleep(150);
    }
  }
  throw new Error(`Chrome CDP did not become ready: ${latestError?.message ?? "timeout"}`);
};

export const makeTemporaryProfile = async (purpose) => {
  const root = resolve("research/.tmp");
  await mkdir(root, { recursive: true });
  const directory = join(
    root,
    `${purpose}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(directory, { recursive: false });
  return directory;
};

export const removeTemporaryProfile = async (directory) => {
  const allowedRoot = resolve("research/.tmp");
  const resolvedDirectory = resolve(directory);
  if (
    !resolvedDirectory.startsWith(`${allowedRoot}\\`) &&
    !resolvedDirectory.startsWith(`${allowedRoot}/`)
  ) {
    throw new Error(`Refusing to remove a profile outside ${allowedRoot}: ${resolvedDirectory}`);
  }
  await rm(resolvedDirectory, { recursive: true, force: true });
};

export const launchChrome = async ({
  chromePath,
  profileDirectory,
  offline = false,
  extraArguments = [],
}) => {
  const executable = await findChromeExecutable(chromePath);
  const port = await reservePort();
  const argumentsForChrome = [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDirectory}`,
    "--headless=new",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-default-apps",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-domain-reliability",
    "--disable-sync",
    "--disable-quic",
    "--autoplay-policy=user-gesture-required",
    "--force-webrtc-ip-handling-policy=disable_non_proxied_udp",
    "--window-size=1280,720",
    ...(offline
      ? [
          "--proxy-server=http://127.0.0.1:9",
          "--proxy-bypass-list=<-loopback>",
          "--host-resolver-rules=MAP * ~NOTFOUND",
          "--disable-features=MediaRouter,OptimizationHints,AutofillServerCommunication,CertificateTransparencyComponentUpdater",
        ]
      : []),
    ...extraArguments,
    "about:blank",
  ];
  const child = spawn(executable, argumentsForChrome, {
    stdio: ["ignore", "ignore", "pipe"],
    windowsHide: true,
  });
  const stderr = [];
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => {
    if (stderr.length < 40) stderr.push(String(chunk).trim());
  });

  try {
    await waitForCdp(port, child);
  } catch (error) {
    child.kill();
    throw new Error(`${error.message}\n${stderr.filter(Boolean).join("\n")}`);
  }
  return { child, executable, port };
};

export const closeChrome = async ({ child, browserClient }) => {
  try {
    if (browserClient) await browserClient.Browser.close();
  } catch {
    // The process fallback below is authoritative.
  }
  const startedAt = Date.now();
  while (child.exitCode === null && Date.now() - startedAt < 3000) await sleep(50);
  if (child.exitCode === null) child.kill();
};

export const createPageClient = async (port) => {
  const targets = await CDP.List({ host: "127.0.0.1", port });
  const page = targets.find((target) => target.type === "page");
  if (!page) throw new Error("Chrome page target was not found.");
  return CDP({ host: "127.0.0.1", port, target: page });
};

import CDP from "chrome-remote-interface";
import { spawn } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
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

export const reservePort = async () =>
  new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.unref();
    server.on("error", rejectPort);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) rejectPort(error);
        else if (port === null) rejectPort(new Error("Could not reserve a CDP port."));
        else resolvePort(port);
      });
    });
  });

const waitForChromeAssignedPort = (child, timeoutMs = 20_000) =>
  new Promise((resolvePort, rejectPort) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.stderr.off("data", onData);
      child.off("exit", onExit);
      callback(value);
    };
    const onData = (chunk) => {
      const text = String(chunk);
      const match = text.match(/DevTools listening on ws:\/\/.+:(\d+)\/devtools\//);
      if (match) finish(resolvePort, Number(match[1]));
    };
    const onExit = (exitCode) =>
      finish(
        rejectPort,
        new Error(`Chrome exited before reporting its CDP port (exit ${exitCode}).`),
      );
    const timer = setTimeout(
      () => finish(rejectPort, new Error("Chrome did not report its CDP port before timeout.")),
      timeoutMs,
    );
    child.stderr.on("data", onData);
    child.on("exit", onExit);
  });

const temporaryProfileRoot = () =>
  resolve(process.env.CO_RESEARCH_TEMP_ROOT ?? join(tmpdir(), "comment-overlay-research"));

export const makeTemporaryProfile = async (purpose) => {
  const root = temporaryProfileRoot();
  await mkdir(root, { recursive: true });
  const directory = join(
    root,
    `${purpose}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  await mkdir(directory, { recursive: false });
  return directory;
};

export const removeTemporaryProfile = async (directory) => {
  const allowedRoot = temporaryProfileRoot();
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
  debuggingPort = null,
  extraArguments = [],
}) => {
  const executable = await findChromeExecutable(chromePath);
  const argumentsForChrome = [
    `--remote-debugging-port=${debuggingPort ?? 0}`,
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
          "--disable-gpu",
          "--disable-gpu-sandbox",
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
    if (stderr.length < 80) stderr.push(String(chunk).trim());
  });

  try {
    const port = debuggingPort ?? (await waitForChromeAssignedPort(child));
    await waitForCdp(port, child);
    return { child, executable, port, stderr };
  } catch (error) {
    child.kill();
    throw new Error(`${error.message}\n${stderr.filter(Boolean).join("\n")}`);
  }
};

export const createBrowserClient = async (port, _child, timeoutMs = 5000) => {
  const startedAt = Date.now();
  let latestError = null;
  while (Date.now() - startedAt <= timeoutMs) {
    try {
      const version = await CDP.Version({ host: "127.0.0.1", port });
      if (!version.webSocketDebuggerUrl) {
        throw new Error("Chrome browser websocket URL was not reported.");
      }
      return await CDP({ target: version.webSocketDebuggerUrl });
    } catch (error) {
      latestError = error;
      await sleep(100);
    }
  }
  throw new Error(`Could not connect to the Chrome browser target: ${latestError?.message}`);
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

export const createPageClient = async (port, _child, timeoutMs = 5000) => {
  const startedAt = Date.now();
  let latestError = null;
  while (Date.now() - startedAt <= timeoutMs) {
    try {
      const targets = await CDP.List({ host: "127.0.0.1", port });
      const page = targets.find((target) => target.type === "page");
      if (page) return await CDP({ host: "127.0.0.1", port, target: page });
      latestError = new Error("Chrome page target was not found.");
    } catch (error) {
      latestError = error;
    }
    await sleep(100);
  }
  throw new Error(`Could not connect to the Chrome page target: ${latestError?.message}`);
};

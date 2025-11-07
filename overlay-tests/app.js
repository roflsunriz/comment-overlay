const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
];
const DEFAULT_COMMENT_DATA_SOURCES = ["./so45409498-comments.json"];

let debugLogFn = null;
let isDebugOverlayEnabled = false;

const safeDebugLog = (category, payload) => {
  if (!isDebugOverlayEnabled) {
    return;
  }
  if (typeof debugLogFn !== "function") {
    return;
  }
  debugLogFn(category, payload);
};

const formatPreview = (text) => {
  if (typeof text !== "string") {
    return "";
  }
  const trimmed = text.trim();
  if (trimmed.length <= 40) {
    return trimmed;
  }
  return `${trimmed.slice(0, 40)}…`;
};

const loadOverlayModule = async () => {
  const failures = [];
  for (const candidate of moduleCandidates) {
    try {
      return await import(candidate);
    } catch (error) {
      failures.push({ candidate, error });
    }
  }

  failures.forEach(({ candidate, error }) => {
    console.error(`Failed to import ${candidate}`, error);
  });
  const detail = failures
    .map(
      ({ candidate, error }) =>
        `${candidate}: ${error instanceof Error ? error.message : String(error)}`,
    )
    .join("; ");
  throw new Error(`Unable to load comment overlay module. Attempts: ${detail}`);
};

const statusEl = document.querySelector("#status");
const videoEl = document.querySelector("#test-video");
const containerEl = document.querySelector(".overlay-container");
const toggleEl = document.querySelector("#toggle-visibility");
const reloadButton = document.querySelector("#reload-comments");
const fullscreenButton = document.querySelector("#fullscreen-button");
const stallEmulatorButton = document.querySelector("#stall-emulator");
const settingsStatusEl = document.querySelector("#settings-status");
const directionSelect = document.querySelector("#scroll-direction");
const ngWordsInput = document.querySelector("#ng-words-input");
const ngRegexInput = document.querySelector("#ng-regex-input");
const regexStatusEl = document.querySelector("#ng-regex-status");

const reportStatus = (message) => {
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const sanitizeCommentEntry = (entry) => {
  if (!entry || typeof entry !== "object") {
    safeDebugLog("overlay-sanitize-skip", { reason: "not-object" });
    return null;
  }
  const rawText =
    typeof entry.text === "string"
      ? entry.text
      : typeof entry.body === "string"
        ? entry.body
        : "";
  const text = rawText.trim();
  const vposMs = Number(entry.vposMs);
  if (!text || !Number.isFinite(vposMs) || vposMs < 0) {
    safeDebugLog("overlay-sanitize-skip", {
      reason: "invalid-values",
      preview: formatPreview(text),
      vposMs: Number.isFinite(vposMs) ? vposMs : String(entry.vposMs),
    });
    return null;
  }
  const commands = Array.isArray(entry.commands)
    ? entry.commands.filter((value) => typeof value === "string" && value.length > 0)
    : [];
  return { text, vposMs, commands };
};

const extractCommentEntries = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === "object") {
    const entries = Array.isArray(payload.comments) ? payload.comments : [];
    return entries.map((entry) => {
      if (!entry || typeof entry !== "object") {
        return entry;
      }
      if (typeof entry.text === "string") {
        return entry;
      }
      return {
        ...entry,
        text: typeof entry.body === "string" ? entry.body : "",
      };
    });
  }
  return [];
};

const setup = async () => {
  if (
    !(videoEl instanceof HTMLVideoElement) ||
    !(containerEl instanceof HTMLElement) ||
    !(toggleEl instanceof HTMLInputElement) ||
    !(reloadButton instanceof HTMLButtonElement) ||
    !(fullscreenButton instanceof HTMLButtonElement) ||
    !(stallEmulatorButton instanceof HTMLButtonElement) ||
    !(directionSelect instanceof HTMLSelectElement) ||
    !(ngWordsInput instanceof HTMLTextAreaElement) ||
    !(ngRegexInput instanceof HTMLTextAreaElement)
  ) {
    reportStatus("Initialization failed: required elements are missing.");
    return;
  }

  reportStatus("Bootstrapping overlay module...");

  const {
    CommentRenderer,
    cloneDefaultSettings,
    configureDebugLogging,
    debugLog: exportedDebugLog,
  } = await loadOverlayModule();

  debugLogFn = typeof exportedDebugLog === "function" ? exportedDebugLog : null;

  const query = new URLSearchParams(window.location.search);
  const debugParam = query.get("overlayDebug");
  isDebugOverlayEnabled =
    debugParam === "1" || debugParam === "true" || debugParam === "yes" || debugParam === "on";

  const debugOptions = { enabled: isDebugOverlayEnabled, maxLogsPerCategory: 60 };
  if (typeof configureDebugLogging === "function") {
    configureDebugLogging(debugOptions);
  }
  const renderer = new CommentRenderer(cloneDefaultSettings(), {
    loggerNamespace: "OverlayTest",
    debug: debugOptions,
  });

  renderer.initialize({ video: videoEl, container: containerEl });
  window.commentRenderer = renderer;

  let currentSettings = {
    ...renderer.settings,
    ngWords: [...renderer.settings.ngWords],
    ngRegexps: [...renderer.settings.ngRegexps],
  };

  const describeSettings = () => {
    const visibility = currentSettings.isCommentVisible ? "オン" : "オフ";
    const ngWords = currentSettings.ngWords.length > 0 ? "オン" : "オフ";
    const ngRegex = currentSettings.ngRegexps.length > 0 ? "オン" : "オフ";
    const direction = currentSettings.scrollDirection === "ltr" ? "左→右" : "右→左";
    return `表示: ${visibility} / NGワード: ${ngWords} / NG正規表現: ${ngRegex} / 方向: ${direction}`;
  };

  const updateSettingsStatus = () => {
    if (settingsStatusEl instanceof HTMLElement) {
      settingsStatusEl.textContent = describeSettings();
    }
  };

  const updateRegexStatus = (message, isError = false) => {
    if (!(regexStatusEl instanceof HTMLElement)) {
      return;
    }
    regexStatusEl.textContent = message;
    regexStatusEl.style.color = isError ? "#fca5a5" : "#cbd5f5";
  };

  const pushSettings = (nextSettings) => {
    currentSettings = {
      ...nextSettings,
      ngWords: Array.isArray(nextSettings.ngWords) ? [...nextSettings.ngWords] : [],
      ngRegexps: Array.isArray(nextSettings.ngRegexps) ? [...nextSettings.ngRegexps] : [],
    };
    renderer.updateSettings(currentSettings);
    updateSettingsStatus();
  };

  const parseMultilineInput = (value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line, index, source) => line.length > 0 && source.indexOf(line) === index);

  const areArraysEqual = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => item === b[index]);
  };

  const applyNgWords = (value) => {
    const words = parseMultilineInput(value);
    if (areArraysEqual(words, currentSettings.ngWords)) {
      return;
    }
    pushSettings({ ...currentSettings, ngWords: words });
    reportStatus(words.length > 0 ? `NGワードを${words.length}件設定しました。` : "NGワードを全て解除しました。");
  };

  const applyNgRegexps = (value) => {
    if (!(ngRegexInput instanceof HTMLTextAreaElement)) {
      return;
    }
    const patterns = parseMultilineInput(value);
    for (const pattern of patterns) {
      try {
        new RegExp(pattern);
      } catch (error) {
        ngRegexInput.classList.add("invalid");
        const message =
          error instanceof Error ? error.message : "RegExp syntax error.";
        updateRegexStatus(`正規表現エラー: 「${pattern}」 ${message}`, true);
        reportStatus(`正規表現エラー: ${message}`);
        return;
      }
    }
    ngRegexInput.classList.remove("invalid");
    const statusMessage =
      patterns.length > 0
        ? `正規表現を${patterns.length}件設定しました。`
        : "正規表現フィルタを全て解除しました。";
    updateRegexStatus(statusMessage, false);
    if (areArraysEqual(patterns, currentSettings.ngRegexps)) {
      return;
    }
    pushSettings({ ...currentSettings, ngRegexps: patterns });
    reportStatus(statusMessage);
  };

  updateSettingsStatus();
  directionSelect.value = currentSettings.scrollDirection;
  ngWordsInput.value = currentSettings.ngWords.join("\n");
  ngRegexInput.value = currentSettings.ngRegexps.join("\n");
  updateRegexStatus(
    currentSettings.ngRegexps.length > 0
      ? `正規表現を${currentSettings.ngRegexps.length}件適用中です。`
      : "正規表現フィルタは設定されていません。",
  );

  const waitForEvent = (target, eventName) =>
    new Promise((resolve) => {
      const handler = () => {
        target.removeEventListener(eventName, handler);
        resolve();
      };
      target.addEventListener(eventName, handler);
    });

  const ensureMetadata = async () => {
    if (Number.isFinite(videoEl.duration) && videoEl.readyState >= 1) {
      return;
    }
    await waitForEvent(videoEl, "loadedmetadata");
  };

  const seekVideo = async (timeInSeconds) => {
    await ensureMetadata();
    const needsSeek = Math.abs(videoEl.currentTime - timeInSeconds) > 0.01;
    if (!needsSeek) {
      return;
    }
    const seeked = waitForEvent(videoEl, "seeked");
    videoEl.currentTime = timeInSeconds;
    await seeked.catch(() => undefined);
  };

  const pauseVideo = async () => {
    if (videoEl.paused) {
      return false;
    }
    const paused = waitForEvent(videoEl, "pause");
    videoEl.pause();
    await paused.catch(() => undefined);
    return true;
  };

  const resumeVideo = async () => {
    await videoEl.play().catch(() => undefined);
  };

  const resolveCommentData = async () => {
    const overrideSource = query.get("comments");
    const sourceCandidates =
      typeof overrideSource === "string" && overrideSource.length > 0
        ? [overrideSource]
        : DEFAULT_COMMENT_DATA_SOURCES;
    const failures = [];
    for (const source of sourceCandidates) {
      try {
        const response = await fetch(source, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        return { payload, source };
      } catch (error) {
        failures.push({ source, error });
      }
    }
    const detail = failures
      .map(({ source, error }) => {
        const message = error instanceof Error ? error.message : String(error);
        return `${source}: ${message}`;
      })
      .join("; ");
    const aggregateError = new Error(
      detail.length > 0 ? `コメントデータ取得失敗 (${detail})` : "コメントデータ取得失敗",
    );
    aggregateError.details = failures;
    throw aggregateError;
  };

  const loadComments = async () => {
    reportStatus("Loading comment data...");
    try {
      const { payload, source } = await resolveCommentData();
      const rawEntries = extractCommentEntries(payload);
      const cleaned = rawEntries.map(sanitizeCommentEntry).filter(Boolean);

      safeDebugLog("overlay-load-comments", { total: cleaned.length, source });

      const wasPlaying = await pauseVideo();
      try {
        await seekVideo(0);
        renderer.resetState();
        renderer.clearComments();
        cleaned.forEach(({ text, vposMs, commands }) => {
          safeDebugLog("overlay-ingest", {
            preview: formatPreview(text),
            vposMs,
            commands: commands.length,
            source,
          });
          renderer.addComment(text, vposMs, commands);
        });
      } finally {
        if (wasPlaying) {
          await resumeVideo();
        }
      }

      const displaySource = source.startsWith("./") ? source.slice(2) : source;
      reportStatus(`Loaded ${cleaned.length} comments from ${displaySource}.`);
      updateSettingsStatus();
      return cleaned.length;
    } catch (error) {
      const details =
        error && typeof error === "object" && Array.isArray(error.details)
          ? error.details
          : [];
      if (details.length > 0) {
        details.forEach(({ source, error: itemError }) => {
          console.error("Failed to load comments source", source, itemError);
        });
      }
      console.error("Failed to load comment data", error);
      reportStatus(
        `Failed to load comments. ${error instanceof Error ? error.message : String(error)}`,
      );
      updateSettingsStatus();
      return 0;
    }
  };

  toggleEl.addEventListener("change", () => {
    const isVisible = toggleEl.checked;
    pushSettings({ ...currentSettings, isCommentVisible: isVisible });
    reportStatus(isVisible ? "コメント表示を有効にしました。" : "コメント表示を無効にしました。");
  });

  directionSelect.addEventListener("change", () => {
    const direction = directionSelect.value === "ltr" ? "ltr" : "rtl";
    pushSettings({ ...currentSettings, scrollDirection: direction });
    reportStatus(
      direction === "ltr"
        ? "コメントを左から右へ流します。"
        : "コメントを右から左へ流します。",
    );
  });

  ngWordsInput.addEventListener("input", () => {
    applyNgWords(ngWordsInput.value);
  });

  ngRegexInput.addEventListener("input", () => {
    applyNgRegexps(ngRegexInput.value);
  });

  reloadButton.addEventListener("click", () => {
    renderer.resetState();
    void loadComments();
  });

  fullscreenButton.addEventListener("click", () => {
    if (!(containerEl instanceof HTMLElement)) {
      return;
    }
    if (typeof containerEl.requestFullscreen === "function") {
      containerEl.requestFullscreen().catch((err) => {
        reportStatus(`フルスクリーンへの移行に失敗しました: ${err.message}`);
      });
    }
  });

  /**
   * ストールをエミュレートする関数
   * waiting イベントを発火してコメントをクリアし、
   * 2秒後に canplay イベントを発火して復帰させる
   */
  const emulateStall = () => {
    if (!(videoEl instanceof HTMLVideoElement)) {
      return;
    }

    // waiting イベントをdispatch
    const waitingEvent = new Event("waiting", { bubbles: true, cancelable: false });
    videoEl.dispatchEvent(waitingEvent);
    reportStatus("ストール状態をエミュレート中... (コメントがクリアされます)");

    // 2秒後に canplay イベントをdispatch
    setTimeout(() => {
      const canplayEvent = new Event("canplay", { bubbles: true, cancelable: false });
      videoEl.dispatchEvent(canplayEvent);
      reportStatus("ストール解除をエミュレートしました。(コメントが再表示されます)");
    }, 2000);
  };

  stallEmulatorButton.addEventListener("click", () => {
    emulateStall();
  });

  const videoSources = ["./video.mp4", "./video2.mp4"];
  const resolveInitialIndex = () => {
    const currentSrc = videoEl.getAttribute("src") ?? "";
    const normalizedSrc = currentSrc.startsWith("./") ? currentSrc : `./${currentSrc}`;
    const index = videoSources.findIndex((source) => source === normalizedSrc);
    return index >= 0 ? index : 0;
  };
  let currentSourceIndex = resolveInitialIndex();

  const switchVideoSource = (nextIndex) => {
    const nextSource = videoSources[nextIndex];
    if (!nextSource) {
      return;
    }

    currentSourceIndex = nextIndex;
    videoEl.src = nextSource;
    videoEl.load();
    void videoEl.play().catch(() => {
      reportStatus(`動画の自動再生に失敗しました。手動で再生してください: ${nextSource}`);
    });
    renderer.resetState();
    void loadComments();
    reportStatus(`動画ソースを${nextSource}に切り替えました。`);
  };

  videoEl.addEventListener("ended", () => {
    const hasNext = currentSourceIndex + 1 < videoSources.length;
    if (!hasNext) {
      reportStatus("再生可能な動画が全て終了しました。");
      return;
    }
    switchVideoSource(currentSourceIndex + 1);
  });

  window.addEventListener("beforeunload", () => {
    renderer.destroy();
  });

  await loadComments();
};

void setup();

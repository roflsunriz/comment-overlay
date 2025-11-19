const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
];
const DEFAULT_COMMENT_DATA_SOURCES = ["./so45409498-comments.json"];

let debugLogFn = null;
let isDebugOverlayEnabled = false;

// ==== comment-overlay 専用プロファイラ ==========================
const overlayDebugSamples = [];

const pushOverlaySample = (sample) => {
  overlayDebugSamples.push({
    ts: performance.now(),
    ...sample,
  });
};

window.COOverlayProfiler = {
  clear() {
    overlayDebugSamples.length = 0;
    console.log("[COOverlayProfiler] サンプルをクリアしました。");
  },
  getRaw() {
    return overlayDebugSamples.slice();
  },
  getStats() {
    const frames = overlayDebugSamples.filter((s) => s.kind === "frame");
    const events = overlayDebugSamples.filter((s) => s.kind === "event");
    return {
      total: overlayDebugSamples.length,
      frames: frames.length,
      events: events.length,
      firstTs: overlayDebugSamples[0]?.ts ?? 0,
      lastTs: overlayDebugSamples[overlayDebugSamples.length - 1]?.ts ?? 0,
    };
  },
  downloadRaw() {
    const blob = new Blob(
      [JSON.stringify(overlayDebugSamples, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comment-overlay-debug-raw-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`[COOverlayProfiler] Raw JSON をダウンロードしました (${overlayDebugSamples.length} samples)`);
  },
  downloadCompact() {
    const compact = overlayDebugSamples.map((s) => ({
      k: s.kind,
      t: Math.round(s.ts),
      vt: Math.round(s.videoTimeMs ?? 0),
      rt: Math.round(s.rendererTimeMs ?? 0),
      ac: s.activeCount ?? 0,
      tc: s.totalComments ?? 0,
      ep: s.epochId ?? 0,
      ev: s.event ?? null,
      dw: s.displayWidth ?? 0,
      dh: s.displayHeight ?? 0,
      cw: s.canvasWidth ?? 0,
      ch: s.canvasHeight ?? 0,
      pr: s.playbackRate ?? 1,
      ps: s.isPaused ?? false,
      // activeComments の詳細情報
      acMinVpos: s.acMinVpos !== null && s.acMinVpos !== undefined 
        ? Math.round(s.acMinVpos) 
        : null,
      acMaxVpos: s.acMaxVpos !== null && s.acMaxVpos !== undefined 
        ? Math.round(s.acMaxVpos) 
        : null,
      acMinLane: s.acMinLane ?? null,
      acMaxLane: s.acMaxLane ?? null,
      acHasScroll: s.acHasScrolling ?? false,
    }));
    const blob = new Blob(
      [JSON.stringify(compact)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comment-overlay-debug-compact-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`[COOverlayProfiler] Compact JSON をダウンロードしました (${compact.length} samples)`);
  },
};

console.log("[COOverlayProfiler] 初期化完了。使い方:");
console.log("  COOverlayProfiler.getStats() - 統計情報を表示");
console.log("  COOverlayProfiler.downloadCompact() - コンパクトJSON（分析用、ac/acMinVpos含む）");
console.log("  COOverlayProfiler.downloadRaw() - 詳細JSON（調査用、sampleComments含む）");
console.log("  COOverlayProfiler.clear() - サンプルをクリア");
console.log("");
console.log("📊 新規追加フィールド:");
console.log("  ac: activeComments.size（実値）");
console.log("  acMinVpos/acMaxVpos: アクティブコメントのvpos範囲");
console.log("  acMinLane/acMaxLane: レーン範囲");
console.log("  acHasScroll: スクロール系コメントの有無");

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
const shadowIntensitySelect = document.querySelector("#shadow-intensity");
const ngWordsInput = document.querySelector("#ng-words-input");
const ngRegexInput = document.querySelector("#ng-regex-input");
const regexStatusEl = document.querySelector("#ng-regex-status");
const profilerStatsButton = document.querySelector("#profiler-stats");
const profilerDownloadCompactButton = document.querySelector("#profiler-download-compact");
const profilerDownloadRawButton = document.querySelector("#profiler-download-raw");
const profilerClearButton = document.querySelector("#profiler-clear");

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
    !(shadowIntensitySelect instanceof HTMLSelectElement) ||
    !(ngWordsInput instanceof HTMLTextAreaElement) ||
    !(ngRegexInput instanceof HTMLTextAreaElement) ||
    !(profilerStatsButton instanceof HTMLButtonElement) ||
    !(profilerDownloadCompactButton instanceof HTMLButtonElement) ||
    !(profilerDownloadRawButton instanceof HTMLButtonElement) ||
    !(profilerClearButton instanceof HTMLButtonElement)
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

  // ==== プロファイラーフック: renderer.draw をラップ ====
  const captureRendererState = (options = { includeCommentDetails: false }) => {
    try {
      const canvas = renderer.canvas;
      const baseState = {
        videoTimeMs: videoEl.currentTime * 1000,
        rendererTimeMs: renderer.currentTime ?? 0,
        epochId: renderer.epochId ?? 0,
        totalComments: renderer.comments?.length ?? 0,
        displayWidth: renderer.displayWidth ?? 0,
        displayHeight: renderer.displayHeight ?? 0,
        canvasWidth: canvas?.width ?? 0,
        canvasHeight: canvas?.height ?? 0,
        playbackRate: videoEl.playbackRate,
        isPaused: videoEl.paused,
      };

      // activeComments の詳細情報を取得
      let activeCommentsArray = [];
      if (renderer.activeComments) {
        try {
          activeCommentsArray = Array.from(renderer.activeComments);
        } catch (e) {
          console.warn("[COOverlayProfiler] activeComments変換エラー", e);
        }
      }

      const activeCount = activeCommentsArray.length;
      baseState.activeCount = activeCount;

      if (activeCount > 0) {
        // effectiveVpos の計算（getEffectiveCommentVposがあれば使用）
        const vposes = [];
        const lanes = [];
        let hasScrolling = false;

        for (const comment of activeCommentsArray) {
          try {
            // getEffectiveCommentVpos メソッドがあれば使用
            let vpos = comment.vposMs ?? 0;
            if (typeof renderer.getEffectiveCommentVpos === "function") {
              vpos = renderer.getEffectiveCommentVpos(comment);
            }
            vposes.push(vpos);

            if (typeof comment.lane === "number") {
              lanes.push(comment.lane);
            }
            if (comment.isScrolling === true) {
              hasScrolling = true;
            }
          } catch (e) {
            // 個別エラーはスキップ
          }
        }

        if (vposes.length > 0) {
          baseState.acMinVpos = Math.min(...vposes);
          baseState.acMaxVpos = Math.max(...vposes);
        }
        if (lanes.length > 0) {
          baseState.acMinLane = Math.min(...lanes);
          baseState.acMaxLane = Math.max(...lanes);
        }
        baseState.acHasScrolling = hasScrolling;

        // 詳細情報を含める場合（Raw JSON用）
        if (options.includeCommentDetails) {
          const sampleComments = activeCommentsArray.slice(0, 5).map((c, idx) => {
            try {
              let effectiveVpos = c.vposMs ?? 0;
              if (typeof renderer.getEffectiveCommentVpos === "function") {
                effectiveVpos = renderer.getEffectiveCommentVpos(c);
              }

              return {
                idx,
                text: typeof c.text === "string" 
                  ? c.text.slice(0, 30) + (c.text.length > 30 ? "..." : "")
                  : "",
                vposMs: c.vposMs ?? 0,
                effectiveVpos,
                lane: c.lane ?? null,
                x: c.x ?? null,
                isScrolling: c.isScrolling ?? false,
                hasShown: c.hasShown ?? false,
              };
            } catch (e) {
              return { idx, error: String(e) };
            }
          });
          baseState.sampleComments = sampleComments;
        }
      } else {
        baseState.acMinVpos = null;
        baseState.acMaxVpos = null;
        baseState.acMinLane = null;
        baseState.acMaxLane = null;
        baseState.acHasScrolling = false;
      }

      return baseState;
    } catch (error) {
      console.warn("[COOverlayProfiler] renderer状態取得エラー", error);
      return {
        videoTimeMs: videoEl.currentTime * 1000,
        activeCount: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const originalDraw = renderer.draw.bind(renderer);
  let frameCount = 0;
  renderer.draw = () => {
    frameCount++;
    // フレームサンプリング: 最初の60フレーム + その後は10フレームごと
    const shouldSample = frameCount <= 60 || frameCount % 10 === 0;
    if (shouldSample) {
      pushOverlaySample({
        kind: "frame",
        ...captureRendererState(),
      });
    }
    return originalDraw();
  };

  // ==== プロファイラーフック: video イベント ====
  const captureVideoEvent = (eventName) => {
    pushOverlaySample({
      kind: "event",
      event: eventName,
      ...captureRendererState(),
    });
  };

  videoEl.addEventListener("play", () => captureVideoEvent("play"));
  videoEl.addEventListener("pause", () => captureVideoEvent("pause"));
  videoEl.addEventListener("seeked", () => captureVideoEvent("seeked"));
  videoEl.addEventListener("ratechange", () => captureVideoEvent("ratechange"));
  videoEl.addEventListener("waiting", () => captureVideoEvent("waiting"));
  videoEl.addEventListener("canplay", () => captureVideoEvent("canplay"));

  // resize イベントは window から検出
  let resizeTimeout = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      captureVideoEvent("resize");
    }, 100);
  });

  // ==== プロファイラーフック: hardReset をラップ ====
  if (typeof renderer.hardReset === "function") {
    const originalHardReset = renderer.hardReset.bind(renderer);
    renderer.hardReset = () => {
      // hardReset 前は詳細情報を含める（Raw JSON用）
      pushOverlaySample({
        kind: "event",
        event: "hardReset-before",
        ...captureRendererState({ includeCommentDetails: true }),
      });
      const result = originalHardReset();
      // hardReset 後の状態は次のフレームで確実に取得できるよう、少し遅延させる
      setTimeout(() => {
        pushOverlaySample({
          kind: "event",
          event: "hardReset-after",
          ...captureRendererState({ includeCommentDetails: true }),
        });
      }, 16); // 約1フレーム後
      return result;
    };
  }

  // resetState もフック（loadComments内で使われている）
  if (typeof renderer.resetState === "function") {
    const originalResetState = renderer.resetState.bind(renderer);
    renderer.resetState = () => {
      pushOverlaySample({
        kind: "event",
        event: "resetState",
        ...captureRendererState(),
      });
      return originalResetState();
    };
  }

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
    const shadowLabel = {
      none: "なし",
      light: "弱",
      medium: "中",
      strong: "強",
    }[currentSettings.shadowIntensity] ?? currentSettings.shadowIntensity;
    return `表示: ${visibility} / NGワード: ${ngWords} / NG正規表現: ${ngRegex} / 方向: ${direction} / 影: ${shadowLabel}`;
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
    renderer.settings = currentSettings;
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
  shadowIntensitySelect.value = currentSettings.shadowIntensity || "medium";
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

  shadowIntensitySelect.addEventListener("change", () => {
    const intensity = shadowIntensitySelect.value;
    const validIntensities = ["none", "light", "medium", "strong"];
    if (!validIntensities.includes(intensity)) {
      reportStatus(`不正な影の強さ: ${intensity}`);
      return;
    }
    pushSettings({ ...currentSettings, shadowIntensity: intensity });
    const labels = {
      none: "なし",
      light: "弱",
      medium: "中",
      strong: "強",
    };
    reportStatus(`影の強さを「${labels[intensity]}」に設定しました。`);
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

  // ==== プロファイラーボタンのイベントリスナー ====
  if (profilerStatsButton instanceof HTMLButtonElement) {
    profilerStatsButton.addEventListener("click", () => {
      const stats = window.COOverlayProfiler.getStats();
      const duration = ((stats.lastTs - stats.firstTs) / 1000).toFixed(2);
      const message = `📊 サンプル統計:\n` +
        `  総サンプル数: ${stats.total}\n` +
        `  フレーム: ${stats.frames}\n` +
        `  イベント: ${stats.events}\n` +
        `  記録期間: ${duration}秒`;
      console.log(message);
      reportStatus(`プロファイラー統計: ${stats.total}サンプル (${duration}秒)`);
      alert(message);
    });
  }

  if (profilerDownloadCompactButton instanceof HTMLButtonElement) {
    profilerDownloadCompactButton.addEventListener("click", () => {
      window.COOverlayProfiler.downloadCompact();
      reportStatus("Compact JSON をダウンロードしました。");
    });
  }

  if (profilerDownloadRawButton instanceof HTMLButtonElement) {
    profilerDownloadRawButton.addEventListener("click", () => {
      window.COOverlayProfiler.downloadRaw();
      reportStatus("Raw JSON をダウンロードしました。");
    });
  }

  if (profilerClearButton instanceof HTMLButtonElement) {
    profilerClearButton.addEventListener("click", () => {
      const confirmed = confirm("プロファイラーのサンプルを全てクリアしますか？");
      if (confirmed) {
        window.COOverlayProfiler.clear();
        reportStatus("プロファイラーをクリアしました。");
      }
    });
  }

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

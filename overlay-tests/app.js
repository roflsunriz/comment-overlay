const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
];

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
    return null;
  }
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  const vpos = Number(entry.vpos);
  if (!text || !Number.isFinite(vpos) || vpos < 0) {
    return null;
  }
  const commands = Array.isArray(entry.commands)
    ? entry.commands.filter((value) => typeof value === "string" && value.length > 0)
    : [];
  return { text, vpos, commands };
};

const setup = async () => {
  if (
    !(videoEl instanceof HTMLVideoElement) ||
    !(containerEl instanceof HTMLElement) ||
    !(toggleEl instanceof HTMLInputElement) ||
    !(reloadButton instanceof HTMLButtonElement) ||
    !(directionSelect instanceof HTMLSelectElement) ||
    !(ngWordsInput instanceof HTMLTextAreaElement) ||
    !(ngRegexInput instanceof HTMLTextAreaElement)
  ) {
    reportStatus("Initialization failed: required elements are missing.");
    return;
  }

  reportStatus("Bootstrapping overlay module...");

  const { CommentRenderer, cloneDefaultSettings } = await loadOverlayModule();
  const renderer = new CommentRenderer(cloneDefaultSettings(), {
    loggerNamespace: "OverlayTest",
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
        // eslint-disable-next-line no-new
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

  const loadComments = async () => {
    reportStatus("Loading comment data...");
    try {
      const response = await fetch("./comments.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rawComments = await response.json();
      const cleaned = Array.isArray(rawComments)
        ? rawComments.map(sanitizeCommentEntry).filter(Boolean)
        : [];

      renderer.clearComments();
      cleaned.forEach(({ text, vpos, commands }) => {
        renderer.addComment(text, vpos, commands);
      });

      reportStatus(`Loaded ${cleaned.length} comments.`);
      updateSettingsStatus();
      return cleaned.length;
    } catch (error) {
      console.error("Failed to load comments.json", error);
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

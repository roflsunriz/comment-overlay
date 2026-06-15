import { COMMENT_PRESETS, DEFAULT_COMMENT_DATA_SOURCES, INITIAL_VIDEO_VOLUME, } from "./presets.js";
import { loadOverlayModule } from "./overlay-module.js";
import { installOverlayProfiler, pushOverlaySample } from "./profiler.js";
let debugLogFn = null;
let isDebugOverlayEnabled = false;
installOverlayProfiler();
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
const statusEl = document.querySelector("#status");
const stageEl = document.querySelector("#test-stage");
const videoEl = document.querySelector("#test-video");
const containerEl = document.querySelector(".overlay-container");
const toggleEl = document.querySelector("#toggle-visibility");
const commentPresetSelect = document.querySelector("#comment-preset");
const mediaPlayToggleButton = document.querySelector("#media-play-toggle");
const mediaSeekEl = document.querySelector("#media-seek");
const mediaTimeEl = document.querySelector("#media-time");
const mediaMuteToggleButton = document.querySelector("#media-mute-toggle");
const mediaVolumeEl = document.querySelector("#media-volume");
const mediaFullscreenToggleButton = document.querySelector("#media-fullscreen-toggle");
const reloadButton = document.querySelector("#reload-comments");
const fullscreenButton = document.querySelector("#fullscreen-button");
const stallEmulatorButton = document.querySelector("#stall-emulator");
const settingsStatusEl = document.querySelector("#settings-status");
const viewportStatusEl = document.querySelector("#viewport-status");
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
    const candidate = entry;
    const rawText = typeof candidate.text === "string"
        ? candidate.text
        : typeof candidate.body === "string"
            ? candidate.body
            : "";
    // trim()を使わず、空文字列チェックのみ行う（全角スペースなどを保持するため）
    const text = rawText;
    const vposMs = Number(candidate.vposMs);
    if (text.length === 0 || !Number.isFinite(vposMs) || vposMs < 0) {
        safeDebugLog("overlay-sanitize-skip", {
            reason: "invalid-values",
            preview: formatPreview(text),
            vposMs: Number.isFinite(vposMs) ? vposMs : String(candidate.vposMs),
        });
        return null;
    }
    const commands = Array.isArray(candidate.commands)
        ? candidate.commands.filter((value) => typeof value === "string" && value.length > 0)
        : [];
    return { text, vposMs, commands };
};
const extractCommentEntries = (payload) => {
    const preferDisplayThread = (entries) => {
        const trunkEntries = entries.filter((entry) => entry.source === "trunk");
        return trunkEntries.length > 0 ? trunkEntries : entries;
    };
    if (Array.isArray(payload)) {
        return preferDisplayThread(payload.filter((entry) => Boolean(entry)));
    }
    if (payload && typeof payload === "object") {
        const entries = Array.isArray(payload.comments)
            ? payload.comments
            : [];
        return preferDisplayThread(entries.map((entry) => {
            if (!entry || typeof entry !== "object") {
                return {};
            }
            const candidate = entry;
            if (typeof candidate.text === "string") {
                return candidate;
            }
            return {
                ...candidate,
                text: typeof candidate.body === "string" ? candidate.body : "",
            };
        }));
    }
    return [];
};
const setup = async () => {
    if (!(videoEl instanceof HTMLVideoElement) ||
        !(stageEl instanceof HTMLElement) ||
        !(containerEl instanceof HTMLElement) ||
        !(toggleEl instanceof HTMLInputElement) ||
        !(commentPresetSelect instanceof HTMLSelectElement) ||
        !(mediaPlayToggleButton instanceof HTMLButtonElement) ||
        !(mediaSeekEl instanceof HTMLInputElement) ||
        !(mediaTimeEl instanceof HTMLElement) ||
        !(mediaMuteToggleButton instanceof HTMLButtonElement) ||
        !(mediaVolumeEl instanceof HTMLInputElement) ||
        !(mediaFullscreenToggleButton instanceof HTMLButtonElement) ||
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
        !(profilerClearButton instanceof HTMLButtonElement)) {
        reportStatus("Initialization failed: required elements are missing.");
        return;
    }
    reportStatus("Bootstrapping overlay module...");
    videoEl.volume = INITIAL_VIDEO_VOLUME;
    videoEl.controls = false;
    videoEl.setAttribute("controlsList", "nofullscreen nodownload noremoteplayback");
    videoEl.setAttribute("disablePictureInPicture", "");
    videoEl.setAttribute("playsinline", "");
    const { CommentRenderer, COMMENT_OVERLAY_VERSION, cloneDefaultSettings, configureDebugLogging, debugLog: exportedDebugLog, } = (await loadOverlayModule(reportStatus));
    const loadedOverlayVersion = typeof COMMENT_OVERLAY_VERSION === "string" ? COMMENT_OVERLAY_VERSION : "unknown";
    debugLogFn = typeof exportedDebugLog === "function" ? exportedDebugLog : null;
    const query = new URLSearchParams(window.location.search);
    const presetParam = query.get("preset");
    const initialPreset = presetParam && presetParam in COMMENT_PRESETS ? presetParam : "default";
    let selectedPreset = initialPreset;
    let selectedCommentSource = query.get("comments") || COMMENT_PRESETS[selectedPreset].comments;
    const videoOverride = query.get("video");
    if (typeof videoOverride === "string" && videoOverride.length > 0) {
        videoEl.src = videoOverride;
        videoEl.load();
    }
    else {
        videoEl.src = COMMENT_PRESETS[selectedPreset].video;
        videoEl.load();
    }
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
                }
                catch (e) {
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
                    }
                    catch (e) {
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
                        }
                        catch (e) {
                            return { idx, error: String(e) };
                        }
                    });
                    baseState.sampleComments = sampleComments;
                }
            }
            else {
                baseState.acMinVpos = null;
                baseState.acMaxVpos = null;
                baseState.acMinLane = null;
                baseState.acMaxLane = null;
                baseState.acHasScrolling = false;
            }
            return baseState;
        }
        catch (error) {
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
    videoEl.addEventListener("loadedmetadata", updateMediaControls);
    videoEl.addEventListener("durationchange", updateMediaControls);
    videoEl.addEventListener("timeupdate", updateMediaControls);
    videoEl.addEventListener("play", updateMediaControls);
    videoEl.addEventListener("pause", updateMediaControls);
    mediaPlayToggleButton.addEventListener("click", () => {
        if (videoEl.paused) {
            void resumeVideo();
            return;
        }
        void pauseVideo();
    });
    mediaSeekEl.addEventListener("input", () => {
        const nextTime = Number.parseFloat(mediaSeekEl.value);
        if (Number.isFinite(nextTime)) {
            videoEl.currentTime = nextTime;
            updateMediaControls();
        }
    });
    mediaMuteToggleButton.addEventListener("click", () => {
        videoEl.muted = !videoEl.muted;
        updateMediaControls();
    });
    mediaVolumeEl.addEventListener("input", () => {
        const nextVolume = Number.parseFloat(mediaVolumeEl.value);
        if (Number.isFinite(nextVolume)) {
            videoEl.volume = Math.min(1, Math.max(0, nextVolume));
            videoEl.muted = videoEl.volume === 0;
            updateMediaControls();
        }
    });
    const shouldIgnoreKeyboardShortcut = (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) {
            return true;
        }
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
            return false;
        }
        const tagName = target.tagName.toLowerCase();
        return (target.isContentEditable ||
            tagName === "input" ||
            tagName === "textarea" ||
            tagName === "select");
    };
    const seekBy = (deltaSeconds) => {
        const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
        const upperBound = duration > 0 ? duration : Number.POSITIVE_INFINITY;
        videoEl.currentTime = Math.min(upperBound, Math.max(0, videoEl.currentTime + deltaSeconds));
        updateMediaControls();
    };
    const setVolumeBy = (delta) => {
        videoEl.volume = Math.min(1, Math.max(0, videoEl.volume + delta));
        videoEl.muted = videoEl.volume === 0;
        updateMediaControls();
    };
    document.addEventListener("keydown", (event) => {
        if (shouldIgnoreKeyboardShortcut(event)) {
            return;
        }
        switch (event.key) {
            case " ":
            case "k":
            case "K":
                event.preventDefault();
                if (videoEl.paused) {
                    void resumeVideo();
                }
                else {
                    void pauseVideo();
                }
                break;
            case "ArrowLeft":
                event.preventDefault();
                seekBy(event.shiftKey ? -30 : -5);
                break;
            case "ArrowRight":
                event.preventDefault();
                seekBy(event.shiftKey ? 30 : 5);
                break;
            case "ArrowUp":
                event.preventDefault();
                setVolumeBy(0.05);
                break;
            case "ArrowDown":
                event.preventDefault();
                setVolumeBy(-0.05);
                break;
            case "m":
            case "M":
                event.preventDefault();
                videoEl.muted = !videoEl.muted;
                updateMediaControls();
                break;
            case "f":
            case "F":
                event.preventDefault();
                toggleOverlayFullscreen();
                break;
            case "Home":
                event.preventDefault();
                videoEl.currentTime = 0;
                updateMediaControls();
                break;
            case "End":
                if (Number.isFinite(videoEl.duration)) {
                    event.preventDefault();
                    videoEl.currentTime = videoEl.duration;
                    updateMediaControls();
                }
                break;
            default:
                break;
        }
    });
    // resize イベントは window から検出
    let resizeTimeout = null;
    window.addEventListener("resize", () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            captureVideoEvent("resize");
        }, 100);
    });
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
        const shadowLabels = {
            none: "なし",
            light: "弱",
            medium: "中",
            strong: "強",
        };
        const shadowIntensity = typeof currentSettings.shadowIntensity === "string" &&
            currentSettings.shadowIntensity in shadowLabels
            ? currentSettings.shadowIntensity
            : "medium";
        const shadowLabel = shadowLabels[shadowIntensity];
        return `表示: ${visibility} / NGワード: ${ngWords} / NG正規表現: ${ngRegex} / 方向: ${direction} / 影: ${shadowLabel}`;
    };
    const updateSettingsStatus = () => {
        if (settingsStatusEl instanceof HTMLElement) {
            settingsStatusEl.textContent = describeSettings();
        }
    };
    const getFullscreenElement = () => document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null;
    const updateViewportStatus = () => {
        if (!(viewportStatusEl instanceof HTMLElement)) {
            return;
        }
        const rect = containerEl.getBoundingClientRect();
        const canvas = renderer.canvas;
        const fullscreen = getFullscreenElement() === containerEl ? "オン" : "オフ";
        const activeComments = renderer.activeComments ? Array.from(renderer.activeComments) : [];
        const fullSample = activeComments
            .filter((comment) => comment.isScrolling === true && comment.isFull === true)
            .sort((a, b) => Math.max(b.width ?? 0, b.height ?? 0) - Math.max(a.width ?? 0, a.height ?? 0))[0];
        const fullSampleStatus = fullSample
            ? ` / Full: x=${Math.round(fullSample.x ?? 0)}, y=${Math.round(fullSample.y ?? 0)}, ` +
                `w=${Math.round(fullSample.width ?? 0)}, h=${Math.round(fullSample.height ?? 0)}, ` +
                `色=${fullSample.color ?? "?"}`
            : "";
        viewportStatusEl.textContent =
            `CO: ${loadedOverlayVersion} / ` +
                `表示領域: ${Math.round(rect.width)} x ${Math.round(rect.height)} / ` +
                `Canvas: ${canvas?.width ?? 0} x ${canvas?.height ?? 0} / ` +
                `DPR: ${window.devicePixelRatio.toFixed(2)} / 全画面: ${fullscreen}` +
                fullSampleStatus;
    };
    const refreshViewportSoon = () => {
        requestAnimationFrame(() => {
            const rect = containerEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                renderer.resize(rect.width, rect.height);
            }
            else {
                renderer.resize();
            }
            syncRendererAtVideoTime();
            updateViewportStatus();
            captureVideoEvent("viewport-check");
        });
    };
    const refreshFullscreenOverlaySoon = () => {
        requestAnimationFrame(() => {
            const rect = containerEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                renderer.resize(rect.width, rect.height);
            }
            else {
                renderer.resize();
            }
            renderer.draw();
            updateViewportStatus();
            captureVideoEvent("fullscreen-overlay-refresh");
        });
    };
    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) {
            return "00:00";
        }
        const rounded = Math.floor(seconds);
        const minutes = Math.floor(rounded / 60);
        const remainingSeconds = rounded % 60;
        return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
    }
    function updateMediaControls() {
        const video = videoEl;
        const seek = mediaSeekEl;
        const playToggle = mediaPlayToggleButton;
        const time = mediaTimeEl;
        const muteToggle = mediaMuteToggleButton;
        const volume = mediaVolumeEl;
        const mediaFullscreenToggle = mediaFullscreenToggleButton;
        const duration = Number.isFinite(video.duration) ? video.duration : 0;
        seek.max = String(Math.max(0, duration));
        if (document.activeElement !== seek) {
            seek.value = String(video.currentTime);
        }
        if (document.activeElement !== volume) {
            volume.value = String(video.volume);
        }
        playToggle.textContent = video.paused ? "再生" : "停止";
        muteToggle.textContent = video.muted || video.volume === 0 ? "消音中" : "音量";
        mediaFullscreenToggle.textContent =
            getFullscreenElement() === containerEl ? "全画面解除" : "全画面";
        time.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
    }
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
    const parseMultilineInput = (value) => value
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
            }
            catch (error) {
                ngRegexInput.classList.add("invalid");
                const message = error instanceof Error ? error.message : "RegExp syntax error.";
                updateRegexStatus(`正規表現エラー: 「${pattern}」 ${message}`, true);
                reportStatus(`正規表現エラー: ${message}`);
                return;
            }
        }
        ngRegexInput.classList.remove("invalid");
        const statusMessage = patterns.length > 0
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
    updateViewportStatus();
    commentPresetSelect.value = selectedPreset;
    directionSelect.value = typeof currentSettings.scrollDirection === "string"
        ? currentSettings.scrollDirection
        : "rtl";
    shadowIntensitySelect.value = typeof currentSettings.shadowIntensity === "string"
        ? currentSettings.shadowIntensity
        : "medium";
    ngWordsInput.value = currentSettings.ngWords.join("\n");
    ngRegexInput.value = currentSettings.ngRegexps.join("\n");
    updateRegexStatus(currentSettings.ngRegexps.length > 0
        ? `正規表現を${currentSettings.ngRegexps.length}件適用中です。`
        : "正規表現フィルタは設定されていません。");
    const waitForEvent = (target, eventName) => new Promise((resolve) => {
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
    const syncRendererAtVideoTime = () => {
        const timeMs = videoEl.currentTime * 1000;
        if (typeof renderer.performInitialSync === "function") {
            renderer.performInitialSync(timeMs);
            renderer.draw();
            return;
        }
        if (typeof renderer.processFrame === "function") {
            renderer.processFrame(timeMs);
            return;
        }
        if (typeof renderer.updateComments === "function") {
            renderer.updateComments(timeMs);
        }
        renderer.draw();
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
        const sourceCandidates = typeof selectedCommentSource === "string" && selectedCommentSource.length > 0
            ? [selectedCommentSource]
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
            }
            catch (error) {
                failures.push({ source, error });
            }
        }
        const detail = failures
            .map(({ source, error }) => {
            const message = error instanceof Error ? error.message : String(error);
            return `${source}: ${message}`;
        })
            .join("; ");
        const aggregateError = new Error(detail.length > 0 ? `コメントデータ取得失敗 (${detail})` : "コメントデータ取得失敗");
        aggregateError.details = failures;
        throw aggregateError;
    };
    const loadComments = async () => {
        reportStatus("Loading comment data...");
        try {
            const { payload, source } = await resolveCommentData();
            const rawEntries = extractCommentEntries(payload);
            const cleaned = rawEntries
                .map(sanitizeCommentEntry)
                .filter((entry) => entry !== null);
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
            }
            finally {
                if (wasPlaying) {
                    await resumeVideo();
                }
            }
            const displaySource = source.startsWith("./") ? source.slice(2) : source;
            reportStatus(`Loaded ${cleaned.length} comments from ${displaySource}.`);
            updateSettingsStatus();
            return cleaned.length;
        }
        catch (error) {
            const details = error && typeof error === "object" && Array.isArray(error.details)
                ? error.details ?? []
                : [];
            if (details.length > 0) {
                details.forEach(({ source, error: itemError }) => {
                    console.error("Failed to load comments source", source, itemError);
                });
            }
            console.error("Failed to load comment data", error);
            reportStatus(`Failed to load comments. ${error instanceof Error ? error.message : String(error)}`);
            updateSettingsStatus();
            return 0;
        }
    };
    toggleEl.addEventListener("change", () => {
        const isVisible = toggleEl.checked;
        // v3.0.0+: setCommentVisibility()を使用して即座にキャンバスをクリア/再描画
        renderer.setCommentVisibility(isVisible);
        // UIの状態表示を同期
        currentSettings.isCommentVisible = isVisible;
        updateSettingsStatus();
        reportStatus(isVisible ? "コメント表示を有効にしました。" : "コメント表示を無効にしました。");
    });
    directionSelect.addEventListener("change", () => {
        const direction = directionSelect.value === "ltr" ? "ltr" : "rtl";
        pushSettings({ ...currentSettings, scrollDirection: direction });
        reportStatus(direction === "ltr"
            ? "コメントを左から右へ流します。"
            : "コメントを右から左へ流します。");
    });
    shadowIntensitySelect.addEventListener("change", () => {
        const intensity = shadowIntensitySelect.value;
        const validIntensities = ["none", "light", "medium", "strong"];
        if (!validIntensities.includes(intensity)) {
            reportStatus(`不正な影の強さ: ${intensity}`);
            return;
        }
        const nextIntensity = intensity;
        pushSettings({ ...currentSettings, shadowIntensity: nextIntensity });
        const labels = {
            none: "なし",
            light: "弱",
            medium: "中",
            strong: "強",
        };
        reportStatus(`影の強さを「${labels[nextIntensity]}」に設定しました。`);
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
    const isCommentPresetName = (value) => value in COMMENT_PRESETS;
    const applyCommentPreset = async (presetName) => {
        const resolvedPresetName = isCommentPresetName(presetName)
            ? presetName
            : "default";
        const preset = COMMENT_PRESETS[resolvedPresetName];
        selectedPreset = resolvedPresetName;
        selectedCommentSource = preset.comments;
        commentPresetSelect.value = selectedPreset;
        if (!videoOverride && videoEl.getAttribute("src") !== preset.video) {
            videoEl.src = preset.video;
            videoEl.load();
        }
        renderer.resetState();
        await loadComments();
        if (preset.seekSeconds > 0) {
            await seekVideo(preset.seekSeconds);
            if ("pauseAfterSeek" in preset && preset.pauseAfterSeek) {
                await pauseVideo();
                syncRendererAtVideoTime();
                reportStatus(`${preset.label} を読み込み、${preset.seekSeconds.toFixed(3)}秒で停止しました。`);
            }
            else {
                await resumeVideo();
                reportStatus(`${preset.label} を読み込み、${preset.seekSeconds.toFixed(0)}秒へ移動しました。`);
            }
        }
        refreshViewportSoon();
    };
    commentPresetSelect.addEventListener("change", () => {
        void applyCommentPreset(commentPresetSelect.value);
    });
    document.querySelectorAll("[data-comment-preset]").forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        const presetName = button.dataset.commentPreset;
        if (typeof presetName !== "string" || !isCommentPresetName(presetName)) {
            return;
        }
        button.addEventListener("click", () => {
            void applyCommentPreset(presetName);
        });
    });
    const setStageSize = (size) => {
        const validSizes = ["wide", "theater", "compact", "mobile"];
        const nextSize = validSizes.includes(size)
            ? size
            : "wide";
        stageEl.dataset.stageSize = nextSize;
        document.querySelectorAll(".stage-size-button").forEach((button) => {
            if (!(button instanceof HTMLButtonElement)) {
                return;
            }
            const isActive = button.dataset.stageSize === nextSize;
            button.classList.toggle("button-active", isActive);
            button.classList.toggle("button-secondary", !isActive);
        });
        refreshViewportSoon();
        reportStatus(`表示領域を ${nextSize} に切り替えました。`);
    };
    document.querySelectorAll(".stage-size-button").forEach((button) => {
        if (!(button instanceof HTMLButtonElement)) {
            return;
        }
        button.addEventListener("click", () => {
            setStageSize(button.dataset.stageSize || "wide");
        });
    });
    function toggleOverlayFullscreen() {
        if (!(containerEl instanceof HTMLElement)) {
            return;
        }
        if (getFullscreenElement() === containerEl) {
            document.exitFullscreen().catch((err) => {
                reportStatus(`フルスクリーン解除に失敗しました: ${err.message}`);
            });
            return;
        }
        if (typeof containerEl.requestFullscreen === "function") {
            containerEl.requestFullscreen().catch((err) => {
                reportStatus(`フルスクリーンへの移行に失敗しました: ${err.message}`);
            });
        }
    }
    fullscreenButton.addEventListener("click", toggleOverlayFullscreen);
    mediaFullscreenToggleButton.addEventListener("click", toggleOverlayFullscreen);
    document.addEventListener("fullscreenchange", () => {
        const fullscreenElement = getFullscreenElement();
        const isVideoFullscreen = fullscreenElement === videoEl;
        const isFullscreen = fullscreenElement === containerEl;
        fullscreenButton.textContent = isFullscreen ? "全画面解除" : "全画面";
        mediaFullscreenToggleButton.textContent = isFullscreen ? "全画面解除" : "全画面";
        refreshViewportSoon();
        if (isVideoFullscreen) {
            reportStatus("動画要素単体の全画面ではコメントレイヤーを重ねられません。右側の「全画面」ボタンを使ってください。");
            return;
        }
        refreshFullscreenOverlaySoon();
        reportStatus(isFullscreen ? "フルスクリーン表示に切り替えました。" : "フルスクリーンを解除しました。");
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
    const videoSources = typeof videoOverride === "string" && videoOverride.length > 0
        ? [videoOverride, "./fixtures/video.mp4", "./fixtures/video2.mp4"]
        : [
            COMMENT_PRESETS[selectedPreset].video,
            "./fixtures/video.mp4",
            "./fixtures/video2.mp4",
        ].filter((source, index, sources) => source && sources.indexOf(source) === index);
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
        refreshViewportSoon();
    };
    videoEl.addEventListener("ended", () => {
        const hasNext = currentSourceIndex + 1 < videoSources.length;
        if (!hasNext) {
            reportStatus("再生可能な動画が全て終了しました。");
            return;
        }
        switchVideoSource(currentSourceIndex + 1);
    });
    const viewportObserver = new ResizeObserver(() => {
        updateViewportStatus();
    });
    viewportObserver.observe(containerEl);
    window.addEventListener("beforeunload", () => {
        viewportObserver.disconnect();
        renderer.destroy();
    });
    await loadComments();
    if (selectedPreset !== "default") {
        await seekVideo(COMMENT_PRESETS[selectedPreset].seekSeconds);
        await resumeVideo();
    }
    refreshViewportSoon();
};
void setup();
//# sourceMappingURL=main.js.map
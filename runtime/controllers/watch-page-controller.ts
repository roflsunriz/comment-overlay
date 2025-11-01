import { cloneDefaultSettings } from "../../config/default-settings";
import { SettingsManager } from "../../services/settings-manager";
import type { RendererSettings } from "@/shared/types";
import { NotificationManager } from "../notification-manager";
import { CommentRenderer } from "../comment-renderer";
import { NicoApiFetcher } from "../services/nico-api-fetcher";
import { VideoSwitchHandler } from "../services/video-switch-handler";
import { DebounceExecutor } from "../utils/debounce-executor";
import type { DanimeGlobal } from "../globals";
import { DANIME_SELECTORS } from "@/shared/constants/d-anime";

const INITIALIZATION_RETRY_MS = 100;
const SWITCH_DEBOUNCE_MS = 1000;
const SWITCH_COOLDOWN_MS = 3000;

export class WatchPageController {
  private initialized = false;
  private readonly switchDebounce = new DebounceExecutor(SWITCH_DEBOUNCE_MS);
  private switchCallback: (() => void) | null = null;
  private lastSwitchTimestamp = 0;
  private currentVideoElement: HTMLVideoElement | null = null;
  private videoMutationObserver: MutationObserver | null = null;
  private domMutationObserver: MutationObserver | null = null;
  private videoEndedListener: (() => void) | null = null;

  constructor(private readonly global: DanimeGlobal) {}

  async initialize(): Promise<void> {
    await this.ensureDocumentReady();
    this.waitForVideoElement();
  }

  private async ensureDocumentReady(): Promise<void> {
    if (document.readyState === "complete") {
      return;
    }

    await new Promise<void>((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    });
  }

  private waitForVideoElement(): void {
    if (this.initialized) {
      return;
    }

    const videoElement = document.querySelector<HTMLVideoElement>(
      DANIME_SELECTORS.watchVideoElement,
    );
    if (!videoElement) {
      window.setTimeout(
        () => this.waitForVideoElement(),
        INITIALIZATION_RETRY_MS,
      );
      return;
    }

    if (videoElement.readyState === 0) {
      videoElement.addEventListener(
        "loadedmetadata",
        () => {
          void this.initializeWithVideo(videoElement);
        },
        { once: true },
      );
      return;
    }

    void this.initializeWithVideo(videoElement);
  }

  private async initializeWithVideo(
    videoElement: HTMLVideoElement,
  ): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    try {
      NotificationManager.show("コメントローダーを初期化中...");

      const notifier = NotificationManager.getInstance();
      const settingsManager =
        this.global.settingsManager ?? new SettingsManager(notifier);
      this.global.settingsManager = settingsManager;
      this.global.instances.settingsManager = settingsManager;

      const videoData = settingsManager.loadVideoData();
      if (!videoData?.videoId) {
        throw new Error(
          "動画データが見つかりません。マイページで設定してください。",
        );
      }

      const fetcher = new NicoApiFetcher();
      this.global.instances.fetcher = fetcher;

      await fetcher.fetchApiData(videoData.videoId);
      const comments = await fetcher.fetchComments();

      const settings = this.mergeSettings(settingsManager.loadSettings());
      const renderer = new CommentRenderer(settings);
      renderer.initialize(videoElement);
      this.global.instances.renderer = renderer;
      this.currentVideoElement = videoElement;

      settingsManager.addObserver((newSettings) => {
        renderer.settings = this.mergeSettings(newSettings);
      });

      comments.forEach((comment) => {
        renderer.addComment(comment.text, comment.vpos, comment.commands);
      });

      const switchHandler = new VideoSwitchHandler(
        renderer,
        fetcher,
        settingsManager,
      );
      switchHandler.startMonitoring();
      this.global.instances.switchHandler = switchHandler;

      this.setupSwitchHandling(videoElement, switchHandler);
      this.observeVideoElement();

      NotificationManager.show(
        `コメントの読み込みが完了しました（${comments.length}件）`,
        "success",
      );
    } catch (error) {
      this.initialized = false;
      NotificationManager.show(
        `初期化エラー: ${(error as Error).message}`,
        "error",
      );
      throw error;
    }
  }

  private mergeSettings(settings: RendererSettings): RendererSettings {
    const defaults = cloneDefaultSettings();
    return {
      ...defaults,
      ...settings,
      ngWords: [...(settings.ngWords ?? defaults.ngWords)],
      ngRegexps: [...(settings.ngRegexps ?? defaults.ngRegexps)],
    };
  }

  private setupSwitchHandling(
    videoElement: HTMLVideoElement,
    switchHandler: VideoSwitchHandler,
  ): void {
    this.currentVideoElement = videoElement;

    this.switchCallback = () => {
      const now = Date.now();
      if (now - this.lastSwitchTimestamp < SWITCH_COOLDOWN_MS) {
        return;
      }
      this.lastSwitchTimestamp = now;
      const targetVideo = this.currentVideoElement;
      void switchHandler.onVideoSwitch(targetVideo);
    };

    this.global.utils.initializeWithVideo = async (video) => {
      if (!video) {
        return;
      }
      this.rebindVideoElement(video);
      await switchHandler.onVideoSwitch(video);
    };

    this.currentVideoElement = videoElement;
  }

  private observeVideoElement(): void {
    const videoElement = this.currentVideoElement;
    if (!videoElement) {
      return;
    }

    this.domMutationObserver?.disconnect();

    this.domMutationObserver = new MutationObserver(() => {
      const nextVideo = document.querySelector<HTMLVideoElement>(
        DANIME_SELECTORS.watchVideoElement,
      );
      if (!nextVideo || nextVideo === this.currentVideoElement) {
        return;
      }
      this.rebindVideoElement(nextVideo);
    });

    this.domMutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.attachVideoEventListeners(videoElement);
  }

  private rebindVideoElement(videoElement: HTMLVideoElement): void {
    this.detachVideoEventListeners();
    this.currentVideoElement = videoElement;
    const renderer = this.global.instances.renderer;
    const switchHandler = this.global.instances.switchHandler;

    if (renderer) {
      renderer.destroy();
      renderer.initialize(videoElement);
      renderer.resize();
    }
    if (switchHandler) {
      void switchHandler.onVideoSwitch(videoElement);
      this.setupSwitchHandling(videoElement, switchHandler);
    }
    this.attachVideoEventListeners(videoElement);
  }

  private attachVideoEventListeners(video: HTMLVideoElement): void {
    this.detachVideoEventListeners();
    const listener = (): void => {
      if (!this.switchCallback) {
        return;
      }
      this.switchDebounce.resetExecution(this.switchCallback);
      this.switchDebounce.execOnce(this.switchCallback);
    };
    video.addEventListener("ended", listener);
    // Firefox: 同一ノードでの src 差し替え時に確実に走るイベントをトリガに追加
    video.addEventListener("loadedmetadata", listener);
    video.addEventListener("emptied", listener);
    this.videoEndedListener = listener;
  }

  private detachVideoEventListeners(): void {
    const video = this.currentVideoElement;
    if (video && this.videoEndedListener) {
      video.removeEventListener("ended", this.videoEndedListener);
      video.removeEventListener("loadedmetadata", this.videoEndedListener);
      video.removeEventListener("emptied", this.videoEndedListener);
    }
    this.videoEndedListener = null;
  }
}

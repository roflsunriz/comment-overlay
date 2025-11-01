import { GM_getValue, GM_setValue } from "$";
import { cloneDefaultSettings } from "../config/default-settings";
import type { RendererSettings, VideoMetadata } from "@/shared/types";
import type { Notifier, NotificationType } from "./notification";

const SETTINGS_STORAGE_KEY = "settings";
const VIDEO_STORAGE_KEY = "currentVideo";
const LAST_DANIME_IDS_KEY = "lastDanimeIds";

type SettingsObserver = (settings: RendererSettings) => void;

const cloneSettings = (settings: RendererSettings): RendererSettings => ({
  ...settings,
  ngWords: [...settings.ngWords],
  ngRegexps: [...settings.ngRegexps],
});

export class SettingsManager {
  private settings: RendererSettings;
  private currentVideo: VideoMetadata | null;
  private readonly observers = new Set<SettingsObserver>();

  constructor(private readonly notifier?: Notifier) {
    this.settings = cloneDefaultSettings();
    this.currentVideo = null;
    this.loadSettings();
    this.currentVideo = this.loadVideoData();
  }

  getSettings(): RendererSettings {
    return cloneSettings(this.settings);
  }

  loadSettings(): RendererSettings {
    try {
      const stored = GM_getValue<RendererSettings | string | null>(
        SETTINGS_STORAGE_KEY,
        null,
      );
      if (!stored) {
        this.settings = cloneDefaultSettings();
        return this.settings;
      }

      if (typeof stored === "string") {
        const parsed = JSON.parse(stored) as Partial<RendererSettings>;
        this.settings = {
          ...cloneDefaultSettings(),
          ...parsed,
          ngWords: Array.isArray(parsed?.ngWords) ? [...parsed.ngWords] : [],
          ngRegexps: Array.isArray(parsed?.ngRegexps)
            ? [...parsed.ngRegexps]
            : [],
        };
      } else {
        this.settings = {
          ...cloneDefaultSettings(),
          ...stored,
          ngWords: Array.isArray(stored.ngWords) ? [...stored.ngWords] : [],
          ngRegexps: Array.isArray(stored.ngRegexps)
            ? [...stored.ngRegexps]
            : [],
        };
      }

      this.notifyObservers();
      return this.settings;
    } catch (error) {
      console.error("[SettingsManager] 設定の読み込みに失敗しました", error);
      this.notify("設定の読み込みに失敗しました", "error");
      this.settings = cloneDefaultSettings();
      return this.settings;
    }
  }

  saveSettings(): boolean {
    try {
      GM_setValue(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyObservers();
      this.notify("設定を保存しました", "success");
      return true;
    } catch (error) {
      console.error("[SettingsManager] 設定の保存に失敗しました", error);
      this.notify("設定の保存に失敗しました", "error");
      return false;
    }
  }

  updateSettings(newSettings: Partial<RendererSettings>): boolean {
    this.settings = {
      ...this.settings,
      ...newSettings,
      ngWords: newSettings.ngWords
        ? [...newSettings.ngWords]
        : [...this.settings.ngWords],
      ngRegexps: newSettings.ngRegexps
        ? [...newSettings.ngRegexps]
        : [...this.settings.ngRegexps],
    };
    return this.saveSettings();
  }

  addObserver(observer: SettingsObserver): void {
    this.observers.add(observer);
  }

  removeObserver(observer: SettingsObserver): void {
    this.observers.delete(observer);
  }

  private notifyObservers(): void {
    const snapshot = this.getSettings();
    for (const observer of this.observers) {
      try {
        observer(snapshot);
      } catch (error) {
        console.error("[SettingsManager] 設定変更通知でエラー", error);
      }
    }
  }

  loadVideoData(): VideoMetadata | null {
    try {
      const videoData = GM_getValue<VideoMetadata | null>(
        VIDEO_STORAGE_KEY,
        null,
      );
      return videoData ?? null;
    } catch (error) {
      console.error(
        "[SettingsManager] 動画データの読み込みに失敗しました",
        error,
      );
      this.notify("動画データの読み込みに失敗しました", "error");
      return null;
    }
  }

  saveVideoData(_title: string, videoInfo: VideoMetadata): boolean {
    try {
      const videoData: VideoMetadata = {
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        viewCount: videoInfo.viewCount,
        commentCount: videoInfo.commentCount,
        mylistCount: videoInfo.mylistCount,
        postedAt: videoInfo.postedAt,
        thumbnail: videoInfo.thumbnail,
        owner: videoInfo.owner ?? null,
        channel: videoInfo.channel ?? null,
      };
      GM_setValue(VIDEO_STORAGE_KEY, videoData);
      this.currentVideo = videoData;
      return true;
    } catch (error) {
      console.error("[SettingsManager] 動画データの保存に失敗しました", error);
      this.notify("動画データの保存に失敗しました", "error");
      return false;
    }
  }

  getCurrentVideo(): VideoMetadata | null {
    return this.currentVideo ? { ...this.currentVideo } : null;
  }

  // --- 追加: dアニメの厳密な識別 (workId, partId) の保存/復元 ---
  saveLastDanimeIds(ids: { workId: string; partId: string }): boolean {
    try {
      GM_setValue(LAST_DANIME_IDS_KEY, ids);
      return true;
    } catch (e) {
      console.error("[SettingsManager] saveLastDanimeIds failed", e);
      this.notify("ID情報の保存に失敗しました", "error");
      return false;
    }
  }

  loadLastDanimeIds(): { workId: string; partId: string } | null {
    try {
      const ids = GM_getValue<{ workId: string; partId: string } | null>(
        LAST_DANIME_IDS_KEY,
        null,
      );
      return ids ?? null;
    } catch (e) {
      console.error("[SettingsManager] loadLastDanimeIds failed", e);
      this.notify("ID情報の読込に失敗しました", "error");
      return null;
    }
  }

  private notify(message: string, type: NotificationType = "info"): void {
    this.notifier?.show(message, type);
  }
}

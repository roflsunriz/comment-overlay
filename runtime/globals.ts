import { getUnsafeWindow } from "@/shared/userscript/getUnsafeWindow";
import { cloneDefaultSettings } from "../config/default-settings";
import { SettingsManager } from "../services/settings-manager";
import { Comment } from "./comment";
import { CommentRenderer } from "./comment-renderer";
import { KeyboardShortcutHandler } from "./input/keyboard-shortcut-handler";
import { NotificationManager } from "./notification-manager";
import { NicoApiFetcher } from "./services/nico-api-fetcher";
import { NicoVideoSearcher } from "./services/nico-video-searcher";
import { VideoSwitchHandler } from "./services/video-switch-handler";
import { DebounceExecutor } from "./utils/debounce-executor";
import { ShadowDOMComponent } from "./shadow/shadow-dom-component";
import { ShadowStyleManager } from "./styles/shadow-style-manager";
import { StyleManager } from "./styles/style-manager";
import { SettingsUI } from "./settings/settings-ui";

export interface DanimeGlobalInstances {
  renderer?: CommentRenderer;
  fetcher?: NicoApiFetcher;
  switchHandler?: VideoSwitchHandler;
  settingsManager?: SettingsManager;
}

export interface DanimeGlobalApi {
  classes: {
    Comment: typeof Comment;
    CommentRenderer: typeof CommentRenderer;
    NicoApiFetcher: typeof NicoApiFetcher;
    NotificationManager: typeof NotificationManager;
    StyleManager: typeof StyleManager;
    SettingsUI: typeof SettingsUI;
    NicoVideoSearcher: typeof NicoVideoSearcher;
    VideoSwitchHandler: typeof VideoSwitchHandler;
    SettingsManager: typeof SettingsManager;
    KeyboardShortcutHandler: typeof KeyboardShortcutHandler;
    DebounceExecutor: typeof DebounceExecutor;
    ShadowDOMComponent: typeof ShadowDOMComponent;
    ShadowStyleManager: typeof ShadowStyleManager;
  };
  instances: DanimeGlobalInstances;
  utils: {
    initialize: () => Promise<void>;
    initializeWithVideo: (video: HTMLVideoElement) => Promise<void>;
  };
  debug: {
    showState: () => void;
    showSettings: () => void;
    showComments: () => void;
  };
  settingsManager?: SettingsManager;
  defaultSettings: () => ReturnType<typeof cloneDefaultSettings>;
}

const noopAsync = async (): Promise<void> => {
  // placeholder until actual initialize functions are wired up
};

export const ensureDanimeGlobal = (): DanimeGlobalApi => {
  const globalWindow = getUnsafeWindow() as ReturnType<
    typeof getUnsafeWindow
  > & {
    dAniRenderer?: DanimeGlobalApi;
  };

  if (!globalWindow.dAniRenderer) {
    const instances: DanimeGlobalInstances = {};

    globalWindow.dAniRenderer = {
      classes: {
        Comment,
        CommentRenderer,
        NicoApiFetcher,
        NotificationManager,
        StyleManager,
        SettingsUI,
        NicoVideoSearcher,
        VideoSwitchHandler,
        SettingsManager,
        KeyboardShortcutHandler,
        DebounceExecutor,
        ShadowDOMComponent,
        ShadowStyleManager,
      },
      instances,
      utils: {
        initialize: noopAsync,
        initializeWithVideo: noopAsync,
      },
      debug: {
        showState: () => {
          console.log("Current instances:", instances);
        },
        showSettings: () => {
          const manager = instances.settingsManager;
          if (!manager) {
            console.log("SettingsManager not initialized");
            return;
          }
          console.log("Current settings:", manager.getSettings());
        },
        showComments: () => {
          const renderer = instances.renderer;
          if (!renderer) {
            console.log("CommentRenderer not initialized");
            return;
          }
          console.log("Current comments:", renderer.getCommentsSnapshot());
        },
      },
      defaultSettings: cloneDefaultSettings,
    };
  }

  return globalWindow.dAniRenderer;
};

export type DanimeGlobal = ReturnType<typeof ensureDanimeGlobal>;

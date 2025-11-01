import { SettingsManager } from "../../services/settings-manager";
import { NotificationManager } from "../notification-manager";
import { SettingsUI } from "../settings/settings-ui";
import type { DanimeGlobal } from "../globals";
import { DANIME_SELECTORS } from "@/shared/constants/d-anime";

const RETRY_INTERVAL_MS = 100;

export class MypageController {
  constructor(private readonly global: DanimeGlobal) {}

  initialize(): void {
    const notifier = NotificationManager.getInstance();
    const settingsManager =
      this.global.settingsManager ?? new SettingsManager(notifier);
    this.global.settingsManager = settingsManager;
    this.global.instances.settingsManager = settingsManager;

    const settingsUI = new SettingsUI(settingsManager);
    this.waitForHeader(settingsUI);
  }

  private waitForHeader(settingsUI: SettingsUI): void {
    const header = document.querySelector<HTMLElement>(
      DANIME_SELECTORS.mypageHeaderTitle,
    );
    if (!header) {
      window.setTimeout(
        () => this.waitForHeader(settingsUI),
        RETRY_INTERVAL_MS,
      );
      return;
    }

    settingsUI.insertIntoMypage();
    settingsUI.addAutoCommentButtons();
    this.observeList(settingsUI);
  }

  private observeList(settingsUI: SettingsUI): void {
    const listContainer = document.querySelector(
      DANIME_SELECTORS.mypageListContainer,
    );
    if (!listContainer) {
      return;
    }

    const observer = new MutationObserver(() => {
      try {
        settingsUI.addAutoCommentButtons();
      } catch (error) {
        console.error(
          "[MypageController] auto comment buttons update failed",
          error,
        );
      }
    });

    observer.observe(listContainer, {
      childList: true,
      subtree: true,
    });
  }
}

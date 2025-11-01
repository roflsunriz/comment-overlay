import { getUnsafeWindow } from "@/shared/userscript/getUnsafeWindow";
import { ShadowDOMComponent } from "../shadow/shadow-dom-component";
import { ShadowStyleManager } from "../styles/shadow-style-manager";
import { NotificationManager } from "../notification-manager";
import { SettingsManager } from "../../services/settings-manager";
import type { RendererSettings, VideoMetadata } from "@/shared/types";
import {
  NicoApiFetcher,
  NicoApiResponseBody,
} from "../services/nico-api-fetcher";
import {
  NicoVideoSearcher,
  NicoSearchResultItem,
} from "../services/nico-video-searcher";
import { createLogger } from "@/shared/logger";
import {
  svgClose,
  svgComment,
  svgCommentCount,
  svgLock,
  svgMylistCount,
  svgPalette,
  svgPostedAt,
  svgVideoId,
  svgVideoOwner,
  svgVideoTitle,
  svgViewCount,
  svgPlay,
  svgCommentText,
  svgStar,
} from "@/shared/icons/mdi";
import { DANIME_SELECTORS } from "@/shared/constants/d-anime";
import {
  buildNicovideoSearchUrl,
  NICOVIDEO_URLS,
} from "@/shared/constants/urls";
import { RENDERER_VERSION } from "@/d-anime/config/default-settings";

const logger = createLogger("dAnime:SettingsUI");

const SELECTORS = {
  searchInput: "#searchInput",
  searchButton: "#searchButton",
  openSearchPage: "#openSearchPageDirect",
  searchResults: "#searchResults",
  saveButton: "#saveSettings",
  opacitySelect: "#commentOpacity",
  visibilityToggle: "#commentVisibilityToggle",
  currentTitle: "#currentTitle",
  currentVideoId: "#currentVideoId",
  currentOwner: "#currentOwner",
  currentViewCount: "#currentViewCount",
  currentCommentCount: "#currentCommentCount",
  currentMylistCount: "#currentMylistCount",
  currentPostedAt: "#currentPostedAt",
  currentThumbnail: "#currentThumbnail",
  colorValue: ".color-value",
  colorPreview: ".color-preview",
  colorPickerInput: "#colorPickerInput",
  ngWords: "#ngWords",
  ngRegexps: "#ngRegexps",
  showNgWords: "#showNgWords",
  showNgRegexps: "#showNgRegexp",
  playCurrentVideo: "#playCurrentVideo",
  settingsModal: "#settingsModal",
  closeSettingsModal: "#closeSettingsModal",
  modalOverlay: ".settings-modal__overlay",
  modalTabs: ".settings-modal__tab",
  modalPane: ".settings-modal__pane",
} as const;

type SelectorKey = keyof typeof SELECTORS;

type SearchResultRenderer = (item: NicoSearchResultItem) => string;

const MODAL_TAB_KEYS = ["search", "display", "ng"] as const;
type ModalTabKey = (typeof MODAL_TAB_KEYS)[number];

const SIMILARITY_STYLES = `
  .similarity-container {
    position: relative;
    width: 100px;
    height: 18px;
    background-color: var(--bg-primary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .similarity-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, var(--secondary), var(--primary));
    opacity: 0.6;
    transition: width 0.3s ease;
  }
  .similarity-text {
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const MODAL_PLAY_BUTTON_STYLES = `
  .settings-modal__footer {
    align-items: center;
  }
  .settings-modal__play-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--primary);
    color: var(--text-primary);
    border-radius: 8px;
    text-align: center;
  }
  .settings-modal__play-icon svg {
    width: 18px;
    height: 18px;
    display:inline-block;
    text-align: center;
  }
  .settings-modal__play-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export class SettingsUI extends ShadowDOMComponent {
  private static readonly FAB_HOST_ID = "danime-settings-fab-host";

  private readonly settingsManager: SettingsManager;
  private readonly fetcher: NicoApiFetcher;
  private readonly searcher: NicoVideoSearcher;
  private settings: RendererSettings;
  private currentVideoInfo: VideoMetadata | null;
  private hostElement: HTMLDivElement | null = null;
  private lastAutoButtonElement: HTMLElement | null = null;
  private activeTab: ModalTabKey = "search";
  private modalElement: HTMLDivElement | null = null;
  private overlayElement: HTMLDivElement | null = null;
  private closeButtonElement: HTMLButtonElement | null = null;
  private fabElement: HTMLButtonElement | null = null;
  private fabHostElement: HTMLDivElement | null = null;
  private fabShadowRoot: ShadowRoot | null = null;
  private readonly handleFabClick = (event: MouseEvent): void => {
    event.preventDefault();
    this.openSettingsModal();
  };
  private readonly handleOverlayClick = (): void => {
    this.closeSettingsModal();
  };
  private readonly handleCloseClick = (): void => {
    this.closeSettingsModal();
  };

  constructor(
    settingsManager: SettingsManager,
    fetcher = new NicoApiFetcher(),
    searcher = new NicoVideoSearcher(),
  ) {
    super();
    this.settingsManager = settingsManager;
    this.fetcher = fetcher;
    this.searcher = searcher;
    this.settings = this.settingsManager.getSettings();
    this.currentVideoInfo = this.settingsManager.loadVideoData();
  }

  insertIntoMypage(): void {
    const target = document.querySelector(DANIME_SELECTORS.mypageHeaderTitle);
    if (!target) {
      return;
    }
    this.hostElement = this.createSettingsUI();
    target.parentElement?.insertBefore(this.hostElement, target.nextSibling);

    this.waitMypageListStable()
      .then(() => {
        try {
          this.tryRestoreByDanimeIds();
        } catch (e) {
          console.warn("[SettingsUI] restore failed:", e);
        }
      });
  }

  addAutoCommentButtons(): void {
    const items = document.querySelectorAll<HTMLDivElement>(
      DANIME_SELECTORS.mypageItem,
    );
    items.forEach((item) => {
      const titleElement = item.querySelector(DANIME_SELECTORS.mypageItemTitle);
      if (
        !titleElement ||
        titleElement.querySelector(".auto-comment-button-host")
      ) {
        return;
      }

      const title =
        titleElement.querySelector("span")?.textContent?.trim() ?? "";
      const episodeNumber =
        item
          .querySelector(DANIME_SELECTORS.mypageEpisodeNumber)
          ?.textContent?.trim() ?? "";
      const episodeTitle =
        item
          .querySelector(DANIME_SELECTORS.mypageEpisodeTitle)
          ?.textContent?.trim() ?? "";

      const buttonHost = document.createElement("div");
      buttonHost.className =
        "nico-comment-shadow-host auto-comment-button-host";
      buttonHost.style.cssText =
        "position:absolute;left:150px;top:3px;margin-left:8px;";
      const shadowRoot = buttonHost.attachShadow({ mode: "closed" });
      const style = document.createElement("style");
      style.textContent = ShadowStyleManager.getAutoButtonStyles();
      shadowRoot.appendChild(style);

      const button = document.createElement("button");
      button.className = "auto-comment-button";
      button.innerHTML = svgComment;
      button.setAttribute("aria-label", "コメント設定");
      button.setAttribute("title", "コメント設定");
      button.setAttribute("type", "button");
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        try {
          const keyword = [title, episodeNumber, episodeTitle]
            .filter(Boolean)
            .join(" ");
          this.openSettingsModal(false);
          this.setSearchKeyword(keyword);
          this.lastAutoButtonElement = buttonHost;

          // 追加: 厳密識別子 (workId, partId) を抽出して保存
          try {
            const workId =
              item.querySelector<HTMLInputElement>('input[name="workId"]')
                ?.value?.trim() ?? "";
            // partId は a[onclick*="mypageContentPlayWrapper("...")"] か、テキスト側リンクの href クエリから取得
            const thumbA = item.querySelector<HTMLAnchorElement>(
              ".thumbnailContainer > a, .thumbnail-container > a",
            );
            const textA = item.querySelector<HTMLAnchorElement>(
              'a.textContainer[href*="partId="]',
            );
            let partId = "";
            const onclk = thumbA?.getAttribute("onclick") ?? "";
            const m = onclk.match(/mypageContentPlayWrapper\(["'](\d+)["']\)/);
            if (m) {
              partId = m[1];
            } else if (textA?.href) {
              const u = new URL(textA.href, location.origin);
              partId = (u.searchParams.get("partId") ?? "").trim();
            }
            if (workId && partId) {
              this.settingsManager.saveLastDanimeIds({ workId, partId });
            }
          } catch (e) {
            console.warn("[SettingsUI] save (workId, partId) skipped:", e);
          }

          const results = await this.executeSearch(keyword);
          if (results.length === 0) {
            return;
          }
          await this.applySearchResult(results[0]);
        } catch (error) {
          logger.error("SettingsUI.autoCommentButton", error as Error);
        }
      });

      shadowRoot.appendChild(button);
      titleElement.appendChild(buttonHost);
      this.lastAutoButtonElement = buttonHost;
    });

    this.waitMypageListStable()
      .then(() => {
        try {
          this.tryRestoreByDanimeIds();
        } catch (e) {
          console.warn("[SettingsUI] restore failed:", e);
        }
      });
  }

  private async waitMypageListStable(): Promise<void> {
    const container = document.querySelector<HTMLElement>(
      DANIME_SELECTORS.mypageListContainer,
    );
    if (!container) return;
    let lastCount = container.querySelectorAll(DANIME_SELECTORS.mypageItem).length;
    const until = Date.now() + 1500;
    return new Promise((resolve) => {
      const obs = new MutationObserver(() => {
        const c = container.querySelectorAll(DANIME_SELECTORS.mypageItem).length;
        if (c !== lastCount) {
          lastCount = c;
          return;
        }
        if (Date.now() >= until) {
          obs.disconnect();
          resolve();
        }
      });
      obs.observe(container, { childList: true, subtree: true });
      setTimeout(() => {
        try {
          obs.disconnect();
        } catch (e) {
          // 既に切断済みの場合など
          logger.debug("waitMypageListStable: observer already disconnected", e);
        }
        resolve();
      }, 1600);
    });
  }

  // --- 追加: (workId, partId) 完全一致で厳密復元 ---
  private tryRestoreByDanimeIds(): boolean {
    const ids = this.settingsManager.loadLastDanimeIds();
    if (!ids) return false;
    const items = Array.from(
      document.querySelectorAll<HTMLElement>(DANIME_SELECTORS.mypageItem),
    );
    for (const it of items) {
      const w =
        it.querySelector<HTMLInputElement>('input[name="workId"]')?.value?.trim();
      if (w !== ids.workId) continue;
      // partId はテキスト側リンクか onclick から照合
      const textA = it.querySelector<HTMLAnchorElement>(
        'a.textContainer[href*="partId="]',
      );
      const hrefOk = (() => {
        if (!textA?.href) return false;
        const u = new URL(textA.href, location.origin);
        return (u.searchParams.get("partId") ?? "") === ids.partId;
      })();
      const thumbA = it.querySelector<HTMLAnchorElement>(
        ".thumbnailContainer > a, .thumbnail-container > a",
      );
      const onclickOk = (() => {
        const onclk = thumbA?.getAttribute("onclick") ?? "";
        const m = onclk.match(/mypageContentPlayWrapper\(["'](\d+)["']\)/);
        return !!m && m[1] === ids.partId;
      })();
      if (hrefOk || onclickOk) {
        const host =
          it.querySelector<HTMLElement>(".auto-comment-button-host") ?? it;
        this.lastAutoButtonElement = host;
        this.updatePlayButtonState(this.currentVideoInfo);
        return true;
      }
    }
    return false;
  }

  private createSettingsUI(): HTMLDivElement {
    const host = document.createElement("div");
    host.className = "nico-comment-shadow-host settings-host";

    this.createShadowDOM(host);
    this.addStyles(ShadowStyleManager.getCommonStyles());

    const settingsHTML = this.buildSettingsHtml();
    this.setHTML(settingsHTML);

    this.applySettingsToUI();

    this.addStyles(SIMILARITY_STYLES);
    this.setupEventListeners();
    return host;
  }

  private buildSettingsHtml(): string {
    const renderNumber = (value?: number | null): string =>
      typeof value === "number" ? value.toLocaleString() : "-";
    const renderDate = (value?: string | null): string => {
      if (!value) {
        return "-";
      }
      try {
        return new Date(value).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch {
        return value;
      }
    };

    const video = this.currentVideoInfo;
    return `
      <div class="nico-comment-settings">
        <h2>
          <span class="settings-title">d-anime-nico-comment-renderer</span>
          <span class="version-badge" aria-label="バージョン">${RENDERER_VERSION}</span>
        </h2>
        <div class="setting-group current-settings">
          <h3>オーバーレイする動画</h3>
          <div id="currentVideoInfo" class="current-video-info">
            <div class="thumbnail-wrapper">
              <div class="thumbnail-container">
                <img id="currentThumbnail" src="${video?.thumbnail ?? ""}" alt="サムネイル">
                <div class="thumbnail-overlay"></div>
              </div>
            </div>
            <div class="info-container" role="list">
              <div class="info-item info-item--wide" role="listitem" title="動画ID">
                <span class="info-icon" aria-hidden="true">${svgVideoId}</span>
                <span class="sr-only">動画ID</span>
                <span class="info-value" id="currentVideoId">${video?.videoId ?? "未設定"}</span>
              </div>
              <div class="info-item info-item--wide" role="listitem" title="タイトル">
                <span class="info-icon" aria-hidden="true">${svgVideoTitle}</span>
                <span class="sr-only">タイトル</span>
                <span class="info-value" id="currentTitle">${video?.title ?? "未設定"}</span>
              </div>
              <div class="info-item info-item--wide" role="listitem" title="投稿者">
                <span class="info-icon" aria-hidden="true">${svgVideoOwner}</span>
                <span class="sr-only">投稿者</span>
                <span class="info-value" id="currentOwner">${video?.owner?.nickname ?? video?.channel?.name ?? "-"}</span>
              </div>
              <div class="info-item" role="listitem" title="再生数">
                <span class="info-icon" aria-hidden="true">${svgViewCount}</span>
                <span class="sr-only">再生数</span>
                <span class="info-value" id="currentViewCount">${renderNumber(video?.viewCount)}</span>
              </div>
              <div class="info-item" role="listitem" title="コメント数">
                <span class="info-icon" aria-hidden="true">${svgCommentCount}</span>
                <span class="sr-only">コメント数</span>
                <span class="info-value" id="currentCommentCount">${renderNumber(video?.commentCount)}</span>
              </div>
              <div class="info-item" role="listitem" title="マイリスト数">
                <span class="info-icon" aria-hidden="true">${svgMylistCount}</span>
                <span class="sr-only">マイリスト数</span>
                <span class="info-value" id="currentMylistCount">${renderNumber(video?.mylistCount)}</span>
              </div>
              <div class="info-item" role="listitem" title="投稿日">
                <span class="info-icon" aria-hidden="true">${svgPostedAt}</span>
                <span class="sr-only">投稿日</span>
                <span class="info-value" id="currentPostedAt">${renderDate(video?.postedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private buildModalHtml(): string {
    const colorOptions = ["#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"]
      .map(
        (color) =>
          `<button class="color-preset-btn" data-color="${color}" style="background-color: ${color}"></button>`,
      )
      .join("");
    const opacityOptions = ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.75", "0.8", "0.9", "1.0"]
      .map((value) => `<option value="${value}">${value}</option>`)
      .join("");

    return `
      <div id="settingsModal" class="settings-modal hidden" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle" aria-hidden="true">
        <div class="settings-modal__overlay"></div>
        <div class="settings-modal__content">
          <header class="settings-modal__header">
            <h3 id="settingsModalTitle">設定</h3>
            <button id="closeSettingsModal" class="settings-modal__close" type="button" aria-label="設定を閉じる">
              <span aria-hidden="true">${svgClose}</span>
            </button>
          </header>
          <div class="settings-modal__tabs" role="tablist">
            <button class="settings-modal__tab is-active" type="button" data-tab="search" role="tab" aria-selected="true" aria-controls="settingsPaneSearch" id="settingsTabSearch">
              <span class="settings-modal__tab-icon" aria-hidden="true">${svgComment}</span>
              <span class="settings-modal__tab-label">検索</span>
            </button>
            <button class="settings-modal__tab" type="button" data-tab="display" role="tab" aria-selected="false" aria-controls="settingsPaneDisplay" id="settingsTabDisplay" tabindex="-1">
              <span class="settings-modal__tab-icon" aria-hidden="true">${svgPalette}</span>
              <span class="settings-modal__tab-label">表示</span>
            </button>
            <button class="settings-modal__tab" type="button" data-tab="ng" role="tab" aria-selected="false" aria-controls="settingsPaneNg" id="settingsTabNg" tabindex="-1">
              <span class="settings-modal__tab-icon" aria-hidden="true">${svgLock}</span>
              <span class="settings-modal__tab-label">NG</span>
            </button>
          </div>
          <div class="settings-modal__panes">
            <section class="settings-modal__pane is-active" data-pane="search" role="tabpanel" id="settingsPaneSearch" aria-labelledby="settingsTabSearch">
              <div class="setting-group search-section">
                <h3>コメントをオーバーレイする動画を検索</h3>
                <div class="search-container">
                  <input type="text" id="searchInput" placeholder="作品名 や エピソード名 で検索">
                  <button id="searchButton">検索</button>
                  <button id="openSearchPageDirect" class="open-search-page-direct-btn">検索ページ</button>
                </div>
                <div id="searchResults" class="search-results"></div>
              </div>
            </section>
            <section class="settings-modal__pane" data-pane="display" role="tabpanel" id="settingsPaneDisplay" aria-labelledby="settingsTabDisplay" aria-hidden="true">
              <div class="setting-group display-settings-group">
                <h3>表示設定</h3>
                <div class="display-settings-grid">
                  <section class="display-settings-item display-settings-item--color" aria-labelledby="displaySettingsColorTitle">
                    <h4 id="displaySettingsColorTitle" class="display-settings-item__title">コメント色</h4>
                    <div class="display-settings-item__body">
                      <div class="color-presets">
                        ${colorOptions}
                      </div>
                      <div class="color-picker">
                        <label class="color-picker__label" for="colorPickerInput">カスタムカラー</label>
                        <input type="color" id="colorPickerInput" value="${this.settings.commentColor}">
                        <span class="current-color-display">
                          <span class="color-preview" style="background-color: ${this.settings.commentColor}"></span>
                          <span class="color-value">${this.settings.commentColor}</span>
                        </span>
                      </div>
                      <p class="color-picker__note">プリセットで近い色を選んでから細かく調整できます。</p>
                    </div>
                  </section>
                  <section class="display-settings-item" aria-labelledby="displaySettingsOpacityTitle">
                    <h4 id="displaySettingsOpacityTitle" class="display-settings-item__title">透明度</h4>
                    <div class="display-settings-item__body">
                      <label class="opacity-setting" for="commentOpacity">
                        <span class="opacity-setting__label">透明度</span>
                        <select id="commentOpacity">
                          ${opacityOptions}
                        </select>
                      </label>
                    </div>
                  </section>
                  <section class="display-settings-item" aria-labelledby="displaySettingsVisibilityTitle">
                    <h4 id="displaySettingsVisibilityTitle" class="display-settings-item__title">表示 / 非表示</h4>
                    <div class="display-settings-item__body">
                      <button id="commentVisibilityToggle" class="toggle-button${this.settings.isCommentVisible ? "" : " off"}">${this.settings.isCommentVisible ? "表示中" : "非表示中"}</button>
                    </div>
                  </section>
                </div>
              </div>
            </section>
            <section class="settings-modal__pane" data-pane="ng" role="tabpanel" id="settingsPaneNg" aria-labelledby="settingsTabNg" aria-hidden="true">
              <div class="setting-group ng-settings">
                <div class="ng-settings__column" aria-labelledby="ngWordsTitle">
                  <h3 id="ngWordsTitle" class="ng-settings__title">NGワード</h3>
                  <textarea class="ng-settings__textarea" id="ngWords" placeholder="NGワードを1行ずつ入力">${this.settings.ngWords.join("\n")}</textarea>
                </div>
                <div class="ng-settings__column" aria-labelledby="ngRegexTitle">
                  <h3 id="ngRegexTitle" class="ng-settings__title">NG正規表現</h3>
                  <textarea class="ng-settings__textarea" id="ngRegexps" placeholder="NG正規表現を1行ずつ入力">${this.settings.ngRegexps.join("\n")}</textarea>
                </div>
              </div>
            </section>
          </div>
          <footer class="settings-modal__footer">
            <button id="playCurrentVideo" class="settings-modal__play-button" type="button" title="この動画を再生">
              <span class="settings-modal__play-icon" aria-hidden="true">${svgPlay}</span>
              <span class="settings-modal__play-label">動画を再生</span>
            </button>
            <button id="saveSettings" type="button">設定を保存</button>
          </footer>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    this.setupModalControls();
    this.setupModalTabs();
    this.setupColorPresets();
    this.setupColorPicker();
    this.setupOpacitySelect();
    this.setupVisibilityToggle();
    this.setupNgControls();
    this.setupSaveButton();
    this.setupSearch();
    this.setupPlayButton();
  }

  private setupModalControls(): void {
    this.closeButtonElement?.removeEventListener("click", this.handleCloseClick);
    this.overlayElement?.removeEventListener("click", this.handleOverlayClick);

    const fab = this.createOrUpdateFab();

    const modal = this.queryModalElement<HTMLDivElement>(SELECTORS.settingsModal);
    const closeButton = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.closeSettingsModal,
    );
    const overlay = this.queryModalElement<HTMLDivElement>(SELECTORS.modalOverlay);

    this.modalElement = modal ?? null;
    this.closeButtonElement = closeButton ?? null;
    this.overlayElement = overlay ?? null;

    if (!modal || !closeButton || !overlay || !fab) {
      return;
    }

    this.fabElement?.removeEventListener("click", this.handleFabClick);
    fab.addEventListener("click", this.handleFabClick);
    fab.setAttribute("aria-controls", modal.id);
    fab.setAttribute("aria-haspopup", "dialog");
    fab.setAttribute("aria-expanded", "false");
    this.fabElement = fab;

    closeButton.addEventListener("click", this.handleCloseClick);
    overlay.addEventListener("click", this.handleOverlayClick);

    this.shadowRoot?.addEventListener("keydown", (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (
        keyboardEvent.key === "Escape" &&
        !this.modalElement?.classList.contains("hidden")
      ) {
        keyboardEvent.preventDefault();
        this.closeSettingsModal();
      }
    });

    this.applySettingsToUI();
  }

  private setupModalTabs(): void {
    const tabButtons = Array.from(
      this.queryModalSelectorAll<HTMLButtonElement>(SELECTORS.modalTabs),
    );
    const panes = Array.from(
      this.queryModalSelectorAll<HTMLElement>(SELECTORS.modalPane),
    );
    if (tabButtons.length === 0 || panes.length === 0) {
      return;
    }

    const activateTab = (key: ModalTabKey) => {
      tabButtons.forEach((button) => {
        const tabKey = this.toModalTabKey(button.dataset.tab);
        const isActive = tabKey === key;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      panes.forEach((pane) => {
        const paneKey = this.toModalTabKey(pane.dataset.pane);
        const isActive = paneKey === key;
        pane.classList.toggle("is-active", isActive);
        pane.setAttribute("aria-hidden", String(!isActive));
      });

      this.activeTab = key;
    };

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const key = this.toModalTabKey(button.dataset.tab);
        if (key) {
          activateTab(key);
        }
      });

      button.addEventListener("keydown", (event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key !== "ArrowRight" && keyboardEvent.key !== "ArrowLeft") {
          return;
        }
        keyboardEvent.preventDefault();
        const currentKey = this.toModalTabKey(button.dataset.tab);
        if (!currentKey) {
          return;
        }
        const direction = keyboardEvent.key === "ArrowRight" ? 1 : -1;
        const nextIndex =
          (MODAL_TAB_KEYS.indexOf(currentKey) + direction + MODAL_TAB_KEYS.length) %
          MODAL_TAB_KEYS.length;
        const nextKey = MODAL_TAB_KEYS[nextIndex];
        activateTab(nextKey);
        const nextButton = tabButtons.find(
          (candidate) => this.toModalTabKey(candidate.dataset.tab) === nextKey,
        );
        nextButton?.focus({ preventScroll: true });
      });
    });

    activateTab(this.activeTab);
  }

  private openSettingsModal(focusActiveTab: boolean = true): void {
    if (!this.modalElement || !this.fabElement) {
      return;
    }
    this.modalElement.classList.remove("hidden");
    this.modalElement.setAttribute("aria-hidden", "false");
    this.fabElement.setAttribute("aria-expanded", "true");
    if (focusActiveTab) {
      const activeTab = this.queryModalElement<HTMLButtonElement>(
        `${SELECTORS.modalTabs}.is-active`,
      );
      activeTab?.focus({ preventScroll: true });
    }
  }

  private closeSettingsModal(): void {
    if (!this.modalElement || !this.fabElement) {
      return;
    }
    this.modalElement.classList.add("hidden");
    this.modalElement.setAttribute("aria-hidden", "true");
    this.fabElement.setAttribute("aria-expanded", "false");
    if (this.fabElement?.isConnected) {
      this.fabElement.focus({ preventScroll: true });
    }
  }

  private toModalTabKey(value?: string): ModalTabKey | null {
    if (!value) {
      return null;
    }
    return (MODAL_TAB_KEYS as readonly string[]).includes(value)
      ? (value as ModalTabKey)
      : null;
  }

  private setupColorPresets(): void {
    const buttons =
      this.queryModalSelectorAll<HTMLButtonElement>(".color-preset-btn");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const color = button.dataset.color;
        if (!color) {
          return;
        }
        this.settings.commentColor = color;
        const preview = this.queryModalElement<HTMLSpanElement>(
          SELECTORS.colorPreview,
        );
        const value = this.queryModalElement<HTMLSpanElement>(
          SELECTORS.colorValue,
        );
        if (preview) {
          preview.style.backgroundColor = color;
        }
        if (value) {
          value.textContent = color;
        }
      });
    });
  }

  private setupColorPicker(): void {
    const input = this.queryModalElement<HTMLInputElement>(
      SELECTORS.colorPickerInput,
    );
    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      this.settings.commentColor = input.value;
      const preview = this.queryModalElement<HTMLSpanElement>(
        SELECTORS.colorPreview,
      );
      const value = this.queryModalElement<HTMLSpanElement>(
        SELECTORS.colorValue,
      );
      if (preview) {
        preview.style.backgroundColor = input.value;
      }
      if (value) {
        value.textContent = input.value;
      }
    });
  }

  private setupOpacitySelect(): void {
    const select = this.queryModalElement<HTMLSelectElement>(
      SELECTORS.opacitySelect,
    );
    if (!select) {
      return;
    }
    select.value = this.settings.commentOpacity.toString();
    select.addEventListener("change", () => {
      const value = Number(select.value);
      if (!Number.isNaN(value)) {
        this.settings.commentOpacity = value;
      }
    });
  }

  private setupVisibilityToggle(): void {
    const button = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.visibilityToggle,
    );
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      this.settings.isCommentVisible = !this.settings.isCommentVisible;
      this.updateVisibilityToggleState(button);
    });
    this.updateVisibilityToggleState(button);
  }

  private setupNgControls(): void {
    // 以前のトグル制御は不要になったため、初期表示だけ反映する
    const ngWordsArea = this.queryModalElement<HTMLTextAreaElement>(
      SELECTORS.ngWords,
    );
    if (ngWordsArea) {
      ngWordsArea.classList.remove("hidden");
    }
    const ngRegexArea = this.queryModalElement<HTMLTextAreaElement>(
      SELECTORS.ngRegexps,
    );
    if (ngRegexArea) {
      ngRegexArea.classList.remove("hidden");
    }
  }

  private setupSaveButton(): void {
    const button = this.queryModalElement<HTMLButtonElement>(SELECTORS.saveButton);
    if (!button) {
      return;
    }
    button.addEventListener("click", () => this.saveSettings());
  }

  private setupSearch(): void {
    const input = this.queryModalElement<HTMLInputElement>(
      SELECTORS.searchInput,
    );
    const button = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.searchButton,
    );
    const openPage = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.openSearchPage,
    );

    const execute = async () => {
      const keyword = input?.value.trim();
      if (!keyword) {
        NotificationManager.show("キーワードを入力してください", "warning");
        return;
      }
      await this.executeSearch(keyword);
    };

    button?.addEventListener("click", execute);
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        execute();
      }
    });

    openPage?.addEventListener("click", (event) => {
      event.preventDefault();
      const keyword = input?.value.trim();
      const url = keyword
        ? buildNicovideoSearchUrl(keyword)
        : NICOVIDEO_URLS.searchBase;
      const globalWindow = getUnsafeWindow();
      globalWindow.open(url, "_blank", "noopener");
    });
  }

  private async executeSearch(
    keyword: string,
  ): Promise<NicoSearchResultItem[]> {
    try {
      NotificationManager.show(`「${keyword}」を検索中...`, "info");
      const results = await this.searcher.search(keyword);
      this.renderSearchResults(results, (item) =>
        this.renderSearchResultItem(item),
      );
      if (results.length === 0) {
        NotificationManager.show("検索結果が見つかりませんでした", "warning");
      }
      return results;
    } catch (error) {
      logger.error("SettingsUI.executeSearch", error as Error);
      return [];
    }
  }

  private setSearchKeyword(keyword: string): void {
    const input = this.queryModalElement<HTMLInputElement>(SELECTORS.searchInput);
    if (!input) {
      return;
    }
    input.value = keyword;
    input.focus({ preventScroll: true });
  }

  private renderSearchResults(
    results: NicoSearchResultItem[],
    renderer: SearchResultRenderer,
  ): void {
    const container = this.queryModalElement<HTMLDivElement>(
      SELECTORS.searchResults,
    );
    if (!container) {
      return;
    }
    container.innerHTML = results.map((item) => renderer(item)).join("");
    const items = container.querySelectorAll<HTMLDivElement>(
      ".search-result-item",
    );
    items.forEach((element, index) => {
      element.addEventListener("click", () => {
        const item = results[index];
        void this.applySearchResult(item);
      });

      // Add event listener for the new "Open on Watch Page" link
      const openWatchPageLink = element.querySelector<HTMLAnchorElement>(".open-search-page-direct-btn");
      if (openWatchPageLink) {
        openWatchPageLink.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent the parent item's click listener from firing
        });
      }
    });
  }

  private renderSearchResultItem(item: NicoSearchResultItem): string {
    const postedAt = this.formatSearchResultDate(item.postedAt);
    const similarityHtml =
      typeof item.similarity === "number"
        ? `
          <div class="similarity-container" title="類似度: ${item.similarity.toFixed(2)}%">
            <div class="similarity-bar" style="width: ${item.similarity.toFixed(2)}%;"></div>
            <span class="similarity-text">${item.similarity.toFixed(0)}%</span>
          </div>
        `
        : "";

    return `
      <div class="search-result-item">
        <img src="${item.thumbnail}" alt="thumbnail">
        <div class="search-result-info">
          <div class="title">${item.title}</div>
          <div class="stats">
            <span class="stat-icon" title="再生">
              ${svgPlay}
            </span>
            <span>${item.viewCount.toLocaleString()}</span>
            <span style="margin: 0 8px;">/</span>
            <span class="stat-icon" title="コメント">
              ${svgCommentText}
            </span>
            <span>${item.commentCount.toLocaleString()}</span>
            <span style="margin: 0 8px;">/</span>
            <span class="stat-icon" title="マイリスト">
              ${svgStar}
            </span>
            <span>${item.mylistCount.toLocaleString()}</span>
            ${similarityHtml}
          </div>
          <div class="date">${postedAt}</div>
          <a href="${NICOVIDEO_URLS.watchBase}/${item.videoId}" target="_blank" rel="noopener"
             class="open-search-page-direct-btn" style="margin-top: 8px; margin-left: 8px; display: inline-block; text-decoration: none;">
            視聴ページ
          </a>
        </div>
      </div>
    `;
  }

  private async applySearchResult(result: NicoSearchResultItem): Promise<void> {
    try {
      const apiData = await this.fetcher.fetchApiData(result.videoId);
      await this.fetcher.fetchComments();
      NotificationManager.show(
        `「${result.title}」のコメントを設定しました`,
        "success",
      );
      this.updateCurrentVideoInfo(this.buildVideoMetadata(result, apiData));
    } catch (error) {
      logger.error("SettingsUI.applySearchResult", error as Error);
    }
  }

  private buildVideoMetadata(
    result: NicoSearchResultItem,
    apiData: NicoApiResponseBody,
  ): VideoMetadata {
    return {
      videoId: result.videoId,
      title: result.title,
      viewCount: apiData.video?.count?.view ?? result.viewCount,
      commentCount: apiData.video?.count?.comment ?? result.commentCount,
      mylistCount: apiData.video?.count?.mylist ?? result.mylistCount,
      postedAt: apiData.video?.registeredAt ?? result.postedAt,
      thumbnail: apiData.video?.thumbnail?.url ?? result.thumbnail,
      owner: apiData.owner ?? result.owner ?? undefined,
      channel: apiData.channel ?? result.channel ?? undefined,
    } as VideoMetadata;
  }

  private applySettingsToUI(): void {
    const opacitySelect = this.queryModalElement<HTMLSelectElement>(
      SELECTORS.opacitySelect,
    );
    const visibilityButton = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.visibilityToggle,
    );
    const colorPreview = this.queryModalElement<HTMLSpanElement>(
      SELECTORS.colorPreview,
    );
    const colorValue = this.queryModalElement<HTMLSpanElement>(
      SELECTORS.colorValue,
    );
    const ngWords = this.queryModalElement<HTMLTextAreaElement>(SELECTORS.ngWords);
    const ngRegex = this.queryModalElement<HTMLTextAreaElement>(
      SELECTORS.ngRegexps,
    );

    if (opacitySelect) {
      opacitySelect.value = this.settings.commentOpacity.toString();
    }
    if (visibilityButton) {
      this.updateVisibilityToggleState(visibilityButton);
    }
    if (colorPreview) {
      colorPreview.style.backgroundColor = this.settings.commentColor;
    }
    if (colorValue) {
      colorValue.textContent = this.settings.commentColor;
    }
    if (ngWords) {
      ngWords.value = this.settings.ngWords.join("\n");
    }
    if (ngRegex) {
      ngRegex.value = this.settings.ngRegexps.join("\n");
    }
    this.updatePlayButtonState(this.currentVideoInfo);
  }

  private saveSettings(): void {
    const opacitySelect = this.queryModalElement<HTMLSelectElement>(
      SELECTORS.opacitySelect,
    );
    const ngWords = this.queryModalElement<HTMLTextAreaElement>(SELECTORS.ngWords);
    const ngRegex = this.queryModalElement<HTMLTextAreaElement>(
      SELECTORS.ngRegexps,
    );

    if (opacitySelect) {
      const value = Number(opacitySelect.value);
      if (!Number.isNaN(value)) {
        this.settings.commentOpacity = value;
      }
    }
    if (ngWords) {
      this.settings.ngWords = ngWords.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
    if (ngRegex) {
      this.settings.ngRegexps = ngRegex.value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }

    if (this.settingsManager.updateSettings(this.settings)) {
      NotificationManager.show("設定を保存しました", "success");
    } else {
      NotificationManager.show("設定の保存に失敗しました", "error");
    }
  }

  private updateCurrentVideoInfo(videoInfo: VideoMetadata): void {
    this.currentVideoInfo = videoInfo;

    const entries: Array<[SelectorKey, string]> = [
      ["currentTitle", videoInfo.title ?? "-"],
      ["currentVideoId", videoInfo.videoId ?? "-"],
      [
        "currentOwner",
        videoInfo.owner?.nickname ?? videoInfo.channel?.name ?? "-",
      ],
      ["currentViewCount", this.formatNumber(videoInfo.viewCount)],
      ["currentCommentCount", this.formatNumber(videoInfo.commentCount)],
      ["currentMylistCount", this.formatNumber(videoInfo.mylistCount)],
      ["currentPostedAt", this.formatSearchResultDate(videoInfo.postedAt)],
    ];

    entries.forEach(([key, value]) => {
      const element = this.querySelector<HTMLElement>(SELECTORS[key]);
      if (element) {
        element.textContent = value;
      }
    });

    const thumbnail = this.querySelector<HTMLImageElement>(
      SELECTORS.currentThumbnail,
    );
    if (thumbnail && videoInfo.thumbnail) {
      thumbnail.src = videoInfo.thumbnail;
      thumbnail.alt = videoInfo.title ?? "サムネイル";
    }

    try {
      this.settingsManager.saveVideoData(videoInfo.title ?? "", videoInfo);
    } catch (error) {
      logger.error("SettingsUI.updateCurrentVideoInfo", error as Error);
    }
    this.updatePlayButtonState(videoInfo);
  }

  private formatNumber(value?: number | null): string {
    return typeof value === "number" ? value.toLocaleString() : "-";
  }

  private formatSearchResultDate(value?: string | null): string {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date);
  }

  private setupPlayButton(): void {
    const button = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.playCurrentVideo,
    );
    if (!button) {
      return;
    }
    button.addEventListener("click", () => {
      try {
        const videoId = this.currentVideoInfo?.videoId;
        if (!videoId) {
          NotificationManager.show(
            "再生できる動画が設定されていません",
            "warning",
          );
          return;
        }
        const itemElement = this.lastAutoButtonElement?.closest(
          ".itemModule.list",
        ) as HTMLElement | null;
        if (this.lastAutoButtonElement) {
          const playLink = itemElement?.querySelector<HTMLAnchorElement>(
            ".thumbnailContainer > a, .thumbnail-container > a",
          );
          if (playLink) {
            NotificationManager.show(
              `「${this.currentVideoInfo?.title || "動画"}」を再生します...`,
              "success",
            );
            setTimeout(() => {
              playLink.click();
            }, 300);
            return;
          }
        }
        NotificationManager.show(
          "再生リンクが見つかりませんでした（対象アイテム内に限定して検索済み）",
          "warning",
        );
      } catch (error) {
        logger.error("SettingsUI.playCurrentVideo", error as Error);
        NotificationManager.show(`再生エラー: ${(error as Error).message}`, "error");
      }
    });
    this.updatePlayButtonState(this.currentVideoInfo);
  }

  private updatePlayButtonState(videoInfo: VideoMetadata | null): void {
    const button = this.queryModalElement<HTMLButtonElement>(
      SELECTORS.playCurrentVideo,
    );
    if (!button) {
      return;
    }
    const hasVideo = Boolean(videoInfo?.videoId);
    button.disabled = !hasVideo;
    button.setAttribute("aria-disabled", (!hasVideo).toString());
  }

  private updateVisibilityToggleState(button: HTMLButtonElement): void {
    button.textContent = this.settings.isCommentVisible ? "表示中" : "非表示中";
    button.classList.toggle("off", !this.settings.isCommentVisible);
  }

  public override destroy(): void {
    this.closeButtonElement?.removeEventListener("click", this.handleCloseClick);
    this.overlayElement?.removeEventListener("click", this.handleOverlayClick);
    this.closeButtonElement = null;
    this.overlayElement = null;
    this.modalElement = null;
    this.removeFabElement();
    super.destroy();
  }

  private createOrUpdateFab(): HTMLButtonElement | null {
    if (!document.body) {
      return null;
    }
    let host = this.fabHostElement;
    if (!host || !host.isConnected) {
      host?.remove();
      host = document.createElement("div");
      host.id = SettingsUI.FAB_HOST_ID;
      host.style.position = "fixed";
      host.style.bottom = "32px";
      host.style.right = "32px";
      host.style.zIndex = "2147483646";
      host.style.display = "inline-block";
      this.fabShadowRoot = host.attachShadow({ mode: "open" });
      document.body.appendChild(host);
      this.fabHostElement = host;
    } else if (!this.fabShadowRoot) {
      this.fabShadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    }

    const shadow = this.fabShadowRoot;
    if (!shadow) {
      return null;
    }

    let baseStyle = shadow.querySelector<HTMLStyleElement>(
      "style[data-role='fab-base-style']",
    );
    if (!baseStyle) {
      baseStyle = document.createElement("style");
      baseStyle.dataset.role = "fab-base-style";
      baseStyle.textContent = ShadowStyleManager.getCommonStyles();
      shadow.appendChild(baseStyle);
    }

    let styleElement = shadow.querySelector<HTMLStyleElement>(
      "style[data-role='fab-style']",
    );
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.dataset.role = "fab-style";
      styleElement.textContent = `
        :host {
          all: initial;
        }

        .fab-container {
          position: relative;
          display: inline-block;
        }

        .fab-button {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #7F5AF0 0%, #6E44FF 100%);
          color: #FFFFFE;
          box-shadow: 0 18px 36px rgba(36, 13, 78, 0.55);
          padding: 0;
          border: none;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          font: inherit;
        }

        .fab-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 42px rgba(36, 13, 78, 0.6);
        }

        .fab-button:active {
          transform: scale(0.96);
        }

        .fab-button__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .fab-button__icon svg {
          width: 28px;
          height: 28px;
        }

        .fab-button__label {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }
      `;
      shadow.appendChild(styleElement);
    }

    let similarityStyle = shadow.querySelector<HTMLStyleElement>(
      "style[data-role='similarity-style']",
    );
    if (!similarityStyle) {
      similarityStyle = document.createElement("style");
      similarityStyle.dataset.role = "similarity-style";
      similarityStyle.textContent = SIMILARITY_STYLES;
      shadow.appendChild(similarityStyle);
    }

    let modalPlayButtonStyle = shadow.querySelector<HTMLStyleElement>(
      "style[data-role='modal-play-button-style']",
    );
    if (!modalPlayButtonStyle) {
      modalPlayButtonStyle = document.createElement("style");
      modalPlayButtonStyle.dataset.role = "modal-play-button-style";
      modalPlayButtonStyle.textContent = MODAL_PLAY_BUTTON_STYLES;
      shadow.appendChild(modalPlayButtonStyle);
    }

    let container = shadow.querySelector<HTMLDivElement>(".fab-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "fab-container";
      shadow.appendChild(container);
    }

    let button = container.querySelector<HTMLButtonElement>("button.fab-button");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "fab-button";
      container.appendChild(button);
    }
    button.innerHTML = `
      <span class="fab-button__icon" aria-hidden="true">${svgComment}</span>
      <span class="fab-button__label">設定</span>
    `;
    button.setAttribute("aria-label", "ニコニココメント設定を開く");
    button.setAttribute("aria-haspopup", "dialog");

    let modal = container.querySelector<HTMLDivElement>(SELECTORS.settingsModal);
    if (!modal) {
      container.insertAdjacentHTML("beforeend", this.buildModalHtml());
      modal = container.querySelector<HTMLDivElement>(SELECTORS.settingsModal);
    }
    this.modalElement = modal ?? null;
    return button;
  }

  private removeFabElement(): void {
    if (this.fabElement) {
      this.fabElement.removeEventListener("click", this.handleFabClick);
    }
    if (this.fabHostElement?.isConnected) {
      this.fabHostElement.remove();
    }
    this.fabElement = null;
    this.fabHostElement = null;
    this.fabShadowRoot = null;
  }

  private queryModalElement<T extends Element>(selector: string): T | null {
    if (!this.fabShadowRoot) {
      return null;
    }
    return this.fabShadowRoot.querySelector<T>(selector);
  }

  private queryModalSelectorAll<T extends Element>(
    selector: string,
  ): NodeListOf<T> {
    if (!this.fabShadowRoot) {
      return document.createDocumentFragment()
        .childNodes as unknown as NodeListOf<T>;
    }
    return this.fabShadowRoot.querySelectorAll<T>(selector);
  }
}

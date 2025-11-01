import { getUnsafeWindow } from "@/shared/userscript/getUnsafeWindow";
import { createLogger, Logger } from "@/shared/logger";
import { ensureDanimeGlobal } from "./globals";
import { WatchPageController } from "./controllers/watch-page-controller";
import { MypageController } from "./controllers/mypage-controller";
import { StyleManager } from "./styles/style-manager";

export class DanimeApplication {
  private readonly log: Logger;
  private readonly global = ensureDanimeGlobal();
  private watchController: WatchPageController | null = null;
  private mypageController: MypageController | null = null;

  constructor() {
    this.log = createLogger("DanimeApp");
  }

  start(): void {
    this.log.info("starting renderer");
    StyleManager.initialize();
    this.global.utils.initialize = () => this.initialize();
    window.addEventListener("load", () => {
      void this.initialize();
    });
  }

  private async initialize(): Promise<void> {
    if (!this.acquireInstanceLock()) {
      this.log.info("renderer already initialized, skipping");
      return;
    }

    const pathname = location.pathname.toLowerCase();
    try {
      if (pathname.includes("/animestore/sc_d_pc")) {
        this.watchController = new WatchPageController(this.global);
        await this.watchController.initialize();
      } else if (pathname.includes("/animestore/mp_viw_pc")) {
        this.mypageController = new MypageController(this.global);
        this.mypageController.initialize();
      } else {
        this.log.info("page not supported, initialization skipped");
      }
    } catch (error) {
      this.log.error("initialization failed", error);
    }
  }

  private acquireInstanceLock(): boolean {
    const guardedWindow = getUnsafeWindow() as ReturnType<
      typeof getUnsafeWindow
    > & {
      __dAnimeNicoCommentRenderer2Instance?: number;
    };
    guardedWindow.__dAnimeNicoCommentRenderer2Instance =
      (guardedWindow.__dAnimeNicoCommentRenderer2Instance ?? 0) + 1;
    return guardedWindow.__dAnimeNicoCommentRenderer2Instance === 1;
  }
}

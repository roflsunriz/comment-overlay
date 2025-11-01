import { createLogger } from "@/shared/logger";
import { DanimeApplication } from "./application";

const log = createLogger("dAnimeNicoCommentRenderer2");

export async function bootstrapDanimeUserscript(): Promise<void> {
  log.info("bootstrap start");
  try {
    const app = new DanimeApplication();
    app.start();
    log.info("bootstrap completed");
  } catch (error) {
    log.error("bootstrap failed", error);
  }
}

export const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
] as const;

export const INITIAL_VIDEO_VOLUME = 0.01;

export {
  DEFAULT_COMMENT_DATA_SOURCES,
  DEFAULT_VIDEO_CASE_ID,
  VIDEO_CASES,
} from "./video-cases.generated.js";
export type { VideoCaseId } from "./video-cases.generated.js";

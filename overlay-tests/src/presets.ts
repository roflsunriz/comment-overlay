export const moduleCandidates = [
  "./dist/comment-overlay.es.js",
  "../dist/comment-overlay.es.js",
  "../dist/comment-overlay.es",
] as const;

export const INITIAL_VIDEO_VOLUME = 0.01;

export const VIDEO_CASES = {
  sm6240144: {
    label: "sm6240144",
    comments: "./fixtures/sm6240144-comments.json",
    video: "./fixtures/sm6240144.mp4",
  },
  sm6945510: {
    label: "sm6945510",
    comments: "./fixtures/sm6945510-comments.json",
    video: "./fixtures/sm6945510.mp4",
  },
  sm38851567: {
    label: "sm38851567",
    comments: "./fixtures/sm38851567-comments.json",
    video: "./fixtures/sm38851567.mp4",
  },
} as const;

export const DEFAULT_VIDEO_CASE_ID = "sm6240144" as const;
export const DEFAULT_COMMENT_DATA_SOURCES = [VIDEO_CASES[DEFAULT_VIDEO_CASE_ID].comments] as const;

export type VideoCaseId = keyof typeof VIDEO_CASES;

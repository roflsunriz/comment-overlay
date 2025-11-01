const NICOVIDEO_BASE_URL = "https://www.nicovideo.jp";
const SEARCH_PATH = "/search";
const WATCH_PATH = "/watch";

export const NICOVIDEO_URLS = {
  base: NICOVIDEO_BASE_URL,
  searchBase: `${NICOVIDEO_BASE_URL}${SEARCH_PATH}`,
  watchBase: `${NICOVIDEO_BASE_URL}${WATCH_PATH}`,
} as const;

const encode = (value: string): string => encodeURIComponent(value).replace(/%20/g, "+");

export const buildNicovideoSearchUrl = (keyword: string): string => {
  const safeKeyword = keyword.trim();
  if (!safeKeyword) {
    return NICOVIDEO_URLS.searchBase;
  }
  return `${NICOVIDEO_URLS.searchBase}/${encode(safeKeyword)}?sort=h&order=d`;
};

export const buildNicovideoWatchUrl = (videoId: string): string => {
  const safeId = videoId.trim();
  if (!safeId) {
    return NICOVIDEO_URLS.watchBase;
  }
  return `${NICOVIDEO_URLS.watchBase}/${encode(safeId)}`;
};

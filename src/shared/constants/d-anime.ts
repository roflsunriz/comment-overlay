export interface DanimeSelectors {
  watchVideoElement: string;
  mypageHeaderTitle: string;
  mypageListContainer: string;
  mypageItem: string;
  mypageItemTitle: string;
  mypageEpisodeNumber: string;
  mypageEpisodeTitle: string;
}

export const DANIME_SELECTORS: DanimeSelectors = {
  watchVideoElement: "video",
  mypageHeaderTitle: ".d-anime__mypage-header__title",
  mypageListContainer: ".d-anime__mypage-list",
  mypageItem: ".d-anime__mypage-list-item",
  mypageItemTitle: ".d-anime__mypage-list-item-title",
  mypageEpisodeNumber: ".d-anime__mypage-list-item-episode-number",
  mypageEpisodeTitle: ".d-anime__mypage-list-item-episode-title",
};

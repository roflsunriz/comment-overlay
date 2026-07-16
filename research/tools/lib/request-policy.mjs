export const isLocalInjectionRequest = (rawUrl) => {
  const url = new URL(rawUrl);
  return url.hostname === "www.nicovideo.jp" && url.pathname.startsWith("/local/");
};

const buildIcon = (path: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

export const svgClose = buildIcon("M18.3 5.71 12 12l6.3 6.29-1.41 1.42L12 13.41 7.11 18.3 5.7 16.89 10.59 12 5.7 7.11 7.11 5.7 12 10.59l5.89-4.88z");
export const svgComment = buildIcon("M9 22c-1.1 0-2-.9-2-2v-2H4c-1.11 0-2-.9-2-2V4c0-1.11.89-2 2-2h16c1.1 0 2 .89 2 2v12c0 1.1-.9 2-2 2h-6l-4 4z");
export const svgCommentCount = buildIcon("M20 2H4a2 2 0 0 0-2 2v12c0 1.11.89 2 2 2h4v4l5.33-4H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 11h12v2H6v-2zm12-2H6V7h12v2z");
export const svgLock = buildIcon("M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-8h-1V7a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7 0h2V7a2 2 0 0 0-4 0v2z");
export const svgMylistCount = buildIcon("M12 21.35 10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.01 6.01 0 0 1 20 3c3.04 0 5.5 2.42 5.5 5.5 0 3.77-3.4 6.86-8.55 11.54L12 21.35z");
export const svgPalette = buildIcon("M17.5 12c.82 0 1.5.68 1.5 1.5S18.32 15 17.5 15 16 14.32 16 13.5 16.68 12 17.5 12m-11-1C7.33 11 8 11.67 8 12.5S7.33 14 6.5 14 5 13.33 5 12.5 5.67 11 6.5 11m7-7A7.5 7.5 0 0 0 6 11.87a4.5 4.5 0 0 0 4.5 4.63H12v1.12A2.38 2.38 0 0 0 14.38 20 2.38 2.38 0 0 0 16.75 17.63a2.37 2.37 0 0 0-.73-1.73A2.5 2.5 0 0 0 20 13.5 7.5 7.5 0 0 0 13.5 4z");
export const svgPostedAt = buildIcon("M12 20.5A8.5 8.5 0 1 1 20.5 12 8.5 8.5 0 0 1 12 20.5zm0-15A6.5 6.5 0 1 0 18.5 12 6.5 6.5 0 0 0 12 5.5zm.75 3.25v3.38l2.88 1.72-.75 1.23L11 12V8.75h1.75z");
export const svgVideoId = buildIcon("M5 4h4l2 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5c-1.11 0-2-.89-2-2V6a2 2 0 0 1 2-2zm6 6H7v2h4v-2zm6-6h4v12h-4V4zm-2 4h-8v2h8V8zm0 4h-8v2h8v-2z");
export const svgVideoOwner = buildIcon("M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z");
export const svgVideoTitle = buildIcon("M3 3h18v2H3V3zm2 4h14v2H5V7zm-2 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z");
export const svgViewCount = buildIcon("M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 1 0 3 3 3 3 0 0 0-3-3z");
export const svgPlay = buildIcon("M8 5v14l11-7z");
export const svgCommentText = buildIcon("M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z");
export const svgStar = buildIcon("M12 2.5 14.59 8h5.91l-4.78 3.47 1.83 6.03L12 15.77 6.45 17.5 8.28 11.47 3.5 8h5.91z");

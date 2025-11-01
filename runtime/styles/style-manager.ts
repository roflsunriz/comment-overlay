import { GM_addStyle } from "$";

const HOST_STYLE = `
.nico-comment-shadow-host {
  display: block;
  position: relative;
}
`;

export class StyleManager {
  static initialize(): void {
    GM_addStyle(HOST_STYLE);
  }
}

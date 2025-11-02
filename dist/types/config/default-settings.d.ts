import type { RendererSettings } from "../shared/types";
type ReadonlySettings = {
    readonly [K in keyof RendererSettings]: RendererSettings[K] extends string | number | boolean | null | undefined ? RendererSettings[K] : ReadonlyArray<string>;
};
export declare const NICO_COMPAT_SCROLL_VISIBLE_DURATION_MS = 4000;
export declare const DEFAULT_RENDERER_SETTINGS: ReadonlySettings;
export declare const cloneDefaultSettings: () => RendererSettings;
export declare const COMMENT_OVERLAY_VERSION = "v1.1.0";
export {};
//# sourceMappingURL=default-settings.d.ts.map
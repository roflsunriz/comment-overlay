import type { RendererSettings } from "../shared/types";
type ReadonlySettings = {
    readonly [K in keyof RendererSettings]: RendererSettings[K] extends string | number | boolean | null | undefined ? RendererSettings[K] : ReadonlyArray<string>;
};
export declare const DEFAULT_RENDERER_SETTINGS: ReadonlySettings;
export declare const cloneDefaultSettings: () => RendererSettings;
export declare const COMMENT_OVERLAY_VERSION = "v1.0.1";
export {};
//# sourceMappingURL=default-settings.d.ts.map
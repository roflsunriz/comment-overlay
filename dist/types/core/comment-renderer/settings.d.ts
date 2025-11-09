import type { RendererSettings } from "../../shared/types";
import type { AnimationFrameProvider } from "./types";
import type { TimeSource } from "../comment";
export declare const clampOpacity: (value: number) => number;
export declare const calculateStaticCommentVerticalPadding: (fontSize: number) => number;
export declare const normalizeSettings: (settings: RendererSettings) => RendererSettings;
export declare const createDefaultAnimationFrameProvider: (timeSource: TimeSource) => AnimationFrameProvider;
export declare const createBrowserCanvasFactory: () => (() => HTMLCanvasElement);
export declare const isRendererSettings: (input: unknown) => input is RendererSettings;
//# sourceMappingURL=settings.d.ts.map
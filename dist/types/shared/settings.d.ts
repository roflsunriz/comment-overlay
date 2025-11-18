import type { RendererSettings, AnimationFrameProvider, TimeSource } from "@/shared/types";
export declare const clampOpacity: (value: number) => number;
export declare const calculateStaticCommentVerticalPadding: (_fontSize: number, laneIndex?: number) => number;
export declare const normalizeSettings: (settings: RendererSettings) => RendererSettings;
export declare const createDefaultAnimationFrameProvider: (timeSource: TimeSource) => AnimationFrameProvider;
export declare const createBrowserCanvasFactory: () => (() => HTMLCanvasElement);
export declare const isRendererSettings: (input: unknown) => input is RendererSettings;
//# sourceMappingURL=settings.d.ts.map
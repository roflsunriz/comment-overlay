export declare const NICO_SCROLL_TRAVERSAL_DURATION_MS = 4000;
export declare const NICO_SCROLL_ACTIVATION_LEAD_MS = 2000;
export declare const resolveNicoScrollTexturePaddingX: (fontSize: number) => number;
export type NicoScrollMotion = {
    renderLeft: number;
    renderWidth: number;
    pixelsPerMs: number;
    startX: number;
    exitX: number;
    collisionDurationMs: number;
    totalDurationMs: number;
};
export declare const resolveNicoScrollMotion: ({ visibleWidth, inkWidth, texturePaddingX, direction, traversalDurationMs, }: {
    visibleWidth: number;
    inkWidth: number;
    texturePaddingX: number;
    direction: "rtl" | "ltr";
    traversalDurationMs?: number;
}) => NicoScrollMotion;
//# sourceMappingURL=nico-scroll.d.ts.map
import type { CommentLayoutCommand, RenderStyle, RendererSettings, ScrollDirection } from "../shared/types";
export declare const STATIC_VISIBLE_DURATION_MS = 4000;
export interface TimeSource {
    now(): number;
}
export declare const createDefaultTimeSource: () => TimeSource;
export interface CommentDependencies {
    timeSource?: TimeSource;
    settingsVersion?: number;
}
export interface CommentPrepareOptions {
    visibleWidth: number;
    virtualExtension: number;
    maxVisibleDurationMs: number;
    minVisibleDurationMs: number;
    maxWidthRatio: number;
    bufferRatio: number;
    baseBufferPx: number;
    entryBufferPx: number;
}
export declare class Comment {
    readonly text: string;
    readonly vposMs: number;
    readonly commands: string[];
    readonly layout: CommentLayoutCommand;
    readonly isScrolling: boolean;
    readonly sizeScale: number;
    readonly opacityMultiplier: number;
    readonly opacityOverride: number | null;
    readonly colorOverride: string | null;
    readonly isInvisible: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    baseSpeed: number;
    speed: number;
    lane: number;
    color: string;
    fontSize: number;
    fontFamily: string;
    opacity: number;
    activationTimeMs: number | null;
    staticExpiryTimeMs: number | null;
    isActive: boolean;
    hasShown: boolean;
    isPaused: boolean;
    lastUpdateTime: number;
    reservationWidth: number;
    bufferWidth: number;
    visibleDurationMs: number;
    totalDurationMs: number;
    preCollisionDurationMs: number;
    speedPixelsPerMs: number;
    virtualStartX: number;
    exitThreshold: number;
    scrollDirection: ScrollDirection;
    renderStyle: RenderStyle;
    creationIndex: number;
    letterSpacing: number;
    lineHeightMultiplier: number;
    lineHeightPx: number;
    lines: string[];
    epochId: number;
    private directionSign;
    private readonly timeSource;
    private lastSyncedSettingsVersion;
    private cachedTexture;
    private textureCacheKey;
    constructor(text: string, vposMs: number, commands: string[] | undefined, settings: RendererSettings, dependencies?: CommentDependencies);
    prepare(ctx: CanvasRenderingContext2D, visibleWidth: number, canvasHeight: number, options: CommentPrepareOptions): void;
    update(playbackRate?: number, isPaused?: boolean): void;
    private generateTextureCacheKey;
    private static cacheStats;
    private static reportCacheStats;
    private isOffscreenCanvasSupported;
    private createTextureCanvas;
    draw(ctx: CanvasRenderingContext2D, interpolatedX?: number | null): void;
    syncWithSettings(settings: RendererSettings, settingsVersion?: number): void;
    getEffectiveColor(defaultColor: string): string;
    getEffectiveOpacity(defaultOpacity: number): number;
    markActivated(atTimeMs: number): void;
    clearActivation(): void;
    hasStaticExpired(currentTimeMs: number): boolean;
    getDirectionSign(): -1 | 1;
    private applyScrollDirection;
    private createSegmentDrawer;
    private getOutlineOffsets;
    private updateTextMetrics;
}
//# sourceMappingURL=comment.d.ts.map
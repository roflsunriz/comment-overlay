import type { RendererSettings } from "../shared/types";
import type { CommentLayoutCommand } from "../types/comment";
export declare const STATIC_VISIBLE_DURATION_MS = 4000;
export interface TimeSource {
    now(): number;
}
export declare const createDefaultTimeSource: () => TimeSource;
export interface CommentDependencies {
    timeSource?: TimeSource;
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
    readonly vpos: number;
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
    private readonly timeSource;
    constructor(text: string, vpos: number, commands: string[] | undefined, settings: RendererSettings, dependencies?: CommentDependencies);
    prepare(ctx: CanvasRenderingContext2D, visibleWidth: number, canvasHeight: number, options: CommentPrepareOptions): void;
    update(playbackRate?: number, isPaused?: boolean): void;
    draw(ctx: CanvasRenderingContext2D, interpolatedX?: number | null): void;
    syncWithSettings(settings: RendererSettings): void;
    getEffectiveColor(defaultColor: string): string;
    getEffectiveOpacity(defaultOpacity: number): number;
    markActivated(atTimeMs: number): void;
    clearActivation(): void;
    hasStaticExpired(currentTimeMs: number): boolean;
}
//# sourceMappingURL=comment.d.ts.map
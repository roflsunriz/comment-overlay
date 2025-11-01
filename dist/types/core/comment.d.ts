import type { RendererSettings } from "../shared/types";
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
}
//# sourceMappingURL=comment.d.ts.map
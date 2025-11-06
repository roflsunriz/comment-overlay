import type { RendererSettings } from "../shared/types";
import { Comment, type TimeSource } from "./comment";
import type { DebugLoggingOptions } from "../shared/debug";
export interface CommentRendererConfig {
    loggerNamespace?: string;
    timeSource?: TimeSource;
    animationFrameProvider?: AnimationFrameProvider;
    createCanvasElement?: () => HTMLCanvasElement;
    debug?: DebugLoggingOptions;
}
export interface CommentRendererInitializeOptions {
    video: HTMLVideoElement;
    container?: HTMLElement | null;
}
export interface AnimationFrameProvider {
    request(callback: FrameRequestCallback): ReturnType<typeof setTimeout>;
    cancel(handle: ReturnType<typeof setTimeout>): void;
}
export declare const createDefaultAnimationFrameProvider: (timeSource: TimeSource) => AnimationFrameProvider;
export declare class CommentRenderer {
    private _settings;
    private readonly comments;
    private readonly activeComments;
    private readonly reservedLanes;
    private readonly topStaticLaneReservations;
    private readonly bottomStaticLaneReservations;
    private readonly log;
    private readonly timeSource;
    private readonly animationFrameProvider;
    private readonly createCanvasElement;
    private readonly commentDependencies;
    private settingsVersion;
    private normalizedNgWords;
    private compiledNgRegexps;
    private canvas;
    private ctx;
    private videoElement;
    private containerElement;
    private fullscreenActive;
    private laneCount;
    private laneHeight;
    private displayWidth;
    private displayHeight;
    private canvasDpr;
    private currentTime;
    private duration;
    private playbackRate;
    private isPlaying;
    private lastDrawTime;
    private finalPhaseActive;
    private finalPhaseStartTime;
    private finalPhaseScheduleDirty;
    private playbackHasBegun;
    private skipDrawingForCurrentFrame;
    private readonly finalPhaseVposOverrides;
    private frameId;
    private videoFrameHandle;
    private resizeObserver;
    private resizeObserverTarget;
    private readonly isResizeObserverAvailable;
    private readonly cleanupTasks;
    private commentSequence;
    constructor(settings: RendererSettings | null, config?: CommentRendererConfig);
    constructor(config?: CommentRendererConfig);
    get settings(): RendererSettings;
    set settings(value: RendererSettings);
    private resolveContainer;
    private ensureContainerPositioning;
    initialize(options: HTMLVideoElement | CommentRendererInitializeOptions): void;
    addComments(entries: ReadonlyArray<{
        text: string;
        vposMs: number;
        commands?: string[];
    }>): Comment[];
    addComment(text: string, vposMs: number, commands?: string[]): Comment | null;
    clearComments(): void;
    resetState(): void;
    destroy(): void;
    private resetFinalPhaseState;
    private getEffectiveCommentVpos;
    private getFinalPhaseDisplayDuration;
    private resolveFinalPhaseVpos;
    private recomputeFinalPhaseTimeline;
    private shouldSuppressRendering;
    private updatePlaybackProgressState;
    updateSettings(newSettings: RendererSettings): void;
    getVideoElement(): HTMLVideoElement | null;
    getCurrentVideoSource(): string | null;
    getCommentsSnapshot(): Comment[];
    private rebuildNgMatchers;
    isNGComment(text: string): boolean;
    resize(width?: number, height?: number): void;
    private resolveDevicePixelRatio;
    private destroyCanvasOnly;
    private calculateLaneMetrics;
    private updateComments;
    private buildPrepareOptions;
    private findAvailableLane;
    /**
     * 二分探索で、指定した時刻より後に終了する最初の予約のインデックスを返す
     */
    private findFirstValidReservationIndex;
    private pruneLaneReservations;
    private pruneStaticLaneReservations;
    /**
     * 二分探索で、指定した時刻以上の最初のコメントのインデックスを返す
     */
    private findCommentIndexAtOrAfter;
    /**
     * 指定した時刻範囲内のコメントのみを返す
     */
    private getCommentsInTimeWindow;
    private getStaticLaneMap;
    private getStaticLaneDepth;
    private getStaticLaneLimit;
    private getGlobalLaneIndexForBottom;
    private resolveStaticCommentOffset;
    private getStaticReservedLaneSet;
    private shouldActivateCommentAtTime;
    private activateComment;
    private assignStaticLane;
    private reserveStaticLane;
    private releaseStaticLane;
    private getLanePriorityOrder;
    private getLaneNextAvailableTime;
    private createLaneReservation;
    private isLaneAvailable;
    private storeLaneReservation;
    private areReservationsConflicting;
    private computeForwardGap;
    private getBufferedEdges;
    private solveLeftRightEqualityTime;
    private draw;
    private processFrame;
    private readonly handleAnimationFrame;
    private readonly handleVideoFrame;
    private shouldUseVideoFrameCallback;
    private scheduleNextFrame;
    private cancelAnimationFrameRequest;
    private cancelVideoFrameCallback;
    private startAnimation;
    private stopAnimation;
    private onSeek;
    private setupVideoEventListeners;
    private handleVideoMetadataLoaded;
    private handleVideoSourceChange;
    private syncVideoState;
    private resetCommentActivity;
    private setupVideoChangeDetection;
    private extractVideoElement;
    private setupVisibilityHandling;
    private handleVisibilityRestore;
    private setupResizeHandling;
    private cleanupResizeHandling;
    private setupFullscreenHandling;
    private resolveResizeObserverTarget;
    private handleFullscreenChange;
    private resolveFullscreenContainer;
    private resolveActiveOverlayContainer;
    private getFullscreenElement;
    private addCleanup;
    private runCleanupTasks;
}
//# sourceMappingURL=comment-renderer.d.ts.map
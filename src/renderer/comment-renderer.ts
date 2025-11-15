import { cloneDefaultSettings } from "@/config/default-settings";
import type {
  RendererSettings,
  CommentRendererEventHooks,
  CommentDependencies,
  CommentPrepareOptions,
  TimeSource,
} from "@/shared/types";
import { Comment } from "@/comment/comment";
import { createDefaultTimeSource } from "@/comment/time-source";
import { createLogger } from "@/shared/logger";
import type { Logger } from "@/shared/types";
import { configureDebugLogging } from "@/shared/debug";
import {
  createBrowserCanvasFactory,
  createDefaultAnimationFrameProvider,
  isRendererSettings,
  normalizeSettings,
} from "@/shared/settings";
export { createDefaultAnimationFrameProvider } from "@/shared/settings";
import type {
  AnimationFrameProvider,
  CommentRendererConfig,
  CommentRendererInitializeOptions,
  LaneReservation,
  StaticLaneReservation,
  VideoFrameCallbackMetadataLike,
} from "@/shared/types";
import {
  AUTO_HARD_RESET_DEDUP_WINDOW_MS,
  AUTO_HARD_RESET_INITIAL_PLAYBACK_DELAY_MS,
  DEFAULT_LANE_COUNT,
} from "@/shared/constants";
import { rebuildNgMatchersImpl, registerCommentCollectionMethods } from "@/renderer/comments";
import { registerFinalPhaseMethods } from "@/renderer/final-phase";
import { registerPlaybackHelpers } from "@/renderer/playback";
import { registerActivationMethods } from "@/renderer/activation";
import { registerLanePruneMethods } from "@/renderer/lanes-prune";
import { registerLaneStaticMethods } from "@/renderer/lanes-static";
import { registerLaneActivationMethods } from "@/renderer/lanes-activation";
import { registerLaneReservationMethods } from "@/renderer/lanes-reservations";
import { registerRenderMethods } from "@/renderer/render";
import { registerTimingMethods } from "@/renderer/timing";
import { registerLifecycleCoreMethods } from "@/renderer/lifecycle-core";
import { registerLifecycleVideoMethods } from "@/renderer/lifecycle-video-events";
import { registerVisibilityMethods } from "@/renderer/visibility";
import { registerResizeMethods } from "@/renderer/resize";
import { registerFullscreenMethods } from "@/renderer/fullscreen";
import { registerCleanupMethods } from "@/renderer/cleanup";

export type { CommentRendererConfig, CommentRendererInitializeOptions, AnimationFrameProvider };

export class CommentRenderer {
  public _settings: RendererSettings;
  public readonly comments: Comment[] = [];
  public readonly activeComments = new Set<Comment>();
  public readonly reservedLanes = new Map<number, LaneReservation[]>();
  public readonly topStaticLaneReservations: StaticLaneReservation[] = [];
  public readonly bottomStaticLaneReservations: StaticLaneReservation[] = [];
  public readonly log: Logger;
  public readonly timeSource: TimeSource;
  public readonly animationFrameProvider: AnimationFrameProvider;
  public readonly createCanvasElement: () => HTMLCanvasElement;
  public readonly commentDependencies: CommentDependencies;
  public settingsVersion = 0;
  public normalizedNgWords: string[] = [];
  public compiledNgRegexps: RegExp[] = [];
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;
  public videoElement: HTMLVideoElement | null = null;
  public containerElement: HTMLElement | null = null;
  public fullscreenActive = false;
  public laneCount = DEFAULT_LANE_COUNT;
  public laneHeight = 0;
  public displayWidth = 0;
  public displayHeight = 0;
  public canvasDpr = 1;
  public currentTime = 0;
  public duration = 0;
  public playbackRate = 1;
  public isPlaying = true;
  public isStalled = false;
  public lastDrawTime = 0;
  public finalPhaseActive = false;
  public finalPhaseStartTime: number | null = null;
  public finalPhaseScheduleDirty = false;
  public playbackHasBegun = false;
  public skipDrawingForCurrentFrame = false;
  public pendingInitialSync = false;
  public readonly finalPhaseVposOverrides = new Map<Comment, number>();
  public frameId: ReturnType<typeof setTimeout> | null = null;
  public videoFrameHandle: number | null = null;
  public resizeObserver: ResizeObserver | null = null;
  public resizeObserverTarget: Element | null = null;
  public readonly isResizeObserverAvailable = typeof ResizeObserver !== "undefined";
  public readonly cleanupTasks: Array<() => void> = [];
  public commentSequence = 0;
  public epochId = 0;
  public readonly eventHooks: CommentRendererEventHooks;
  public lastSnapshotEmitTime = 0;
  public readonly snapshotEmitThrottleMs = 1000;
  public lastPlayResumeTime = 0;
  public readonly playResumeSeekIgnoreDurationMs = 500;
  public lastVideoSource: string | null = null;
  public lastHardResetAt = 0;
  public readonly autoHardResetDedupWindowMs = AUTO_HARD_RESET_DEDUP_WINDOW_MS;
  public readonly initialPlaybackAutoResetDelayMs = AUTO_HARD_RESET_INITIAL_PLAYBACK_DELAY_MS;
  public initialPlaybackAutoResetTimer: ReturnType<typeof setTimeout> | null = null;
  public initialPlaybackAutoResetTriggered = false;

  declare public initialize: (options: HTMLVideoElement | CommentRendererInitializeOptions) => void;
  declare public destroy: () => void;
  declare public destroyCanvasOnly: () => void;
  declare public resolveContainer: (
    explicit: HTMLElement | null | undefined,
    video: HTMLVideoElement,
  ) => HTMLElement;
  declare public ensureContainerPositioning: (container: HTMLElement) => void;
  declare public resize: (width?: number, height?: number) => void;
  declare public resolveDevicePixelRatio: () => number;
  declare public calculateLaneMetrics: () => void;
  declare public setupResizeHandling: (videoElement: HTMLVideoElement) => void;
  declare public cleanupResizeHandling: () => void;
  declare public setupVideoEventListeners: (videoElement: HTMLVideoElement) => void;
  declare public handleVideoMetadataLoaded: (videoElement: HTMLVideoElement) => void;
  declare public handleVideoStalled: () => void;
  declare public handleVideoCanPlay: () => void;
  declare public handleVideoSourceChange: (videoElement?: HTMLVideoElement | null) => void;
  declare public syncVideoState: (videoElement: HTMLVideoElement) => void;
  declare public resetCommentActivity: () => void;
  declare public setupVideoChangeDetection: (
    video: HTMLVideoElement,
    container: HTMLElement,
  ) => void;
  declare public extractVideoElement: (node: Node) => HTMLVideoElement | null;
  declare public setupVisibilityHandling: () => void;
  declare public handleVisibilityRestore: () => void;
  declare public setupFullscreenHandling: () => void;
  declare public resolveResizeObserverTarget: (videoElement: HTMLVideoElement) => Element;
  declare public handleFullscreenChange: () => Promise<void>;
  declare public resolveFullscreenContainer: (videoElement: HTMLVideoElement) => HTMLElement | null;
  declare public resolveActiveOverlayContainer: (
    videoElement: HTMLVideoElement,
    baseContainer: HTMLElement | null,
    fullscreenElement: Element | null,
  ) => HTMLElement | null;
  declare public getFullscreenElement: () => Element | null;
  declare public addCleanup: (task: () => void) => void;
  declare public runCleanupTasks: () => void;
  public rebuildNgMatchers(): void {
    rebuildNgMatchersImpl.call(this);
  }
  declare public isNGComment: (text: string) => boolean;
  declare public addComments: (
    entries: ReadonlyArray<{ text: string; vposMs: number; commands?: string[] }>,
  ) => Comment[];
  declare public addComment: (text: string, vposMs: number, commands?: string[]) => Comment | null;
  declare public clearComments: () => void;
  declare public resetState: () => void;
  declare public hardReset: () => void;
  declare public resetFinalPhaseState: () => void;
  declare public incrementEpoch: (
    reason: "source-change" | "metadata-loaded" | "manual-reset",
  ) => void;
  declare public emitStateSnapshot: (label: string) => void;
  declare public getEffectiveCommentVpos: (comment: Comment) => number;
  declare public getFinalPhaseDisplayDuration: (comment: Comment) => number;
  declare public resolveFinalPhaseVpos: (comment: Comment) => number;
  declare public recomputeFinalPhaseTimeline: () => void;
  declare public shouldSuppressRendering: () => boolean;
  declare public updatePlaybackProgressState: () => void;
  declare public updateComments: (frameTimeMs?: number) => void;
  declare public buildPrepareOptions: (visibleWidth: number) => CommentPrepareOptions;
  declare public findAvailableLane: (comment: Comment) => number;
  declare public findFirstValidReservationIndex: (
    reservations: LaneReservation[],
    cutoffTime: number,
  ) => number;
  declare public pruneLaneReservations: (currentTime: number) => void;
  declare public pruneStaticLaneReservations: (currentTime: number) => void;
  declare public findCommentIndexAtOrAfter: (targetVposMs: number) => number;
  declare public getCommentsInTimeWindow: (centerTimeMs: number, windowMs: number) => Comment[];
  declare public getStaticReservations: (position: "ue" | "shita") => StaticLaneReservation[];
  declare public getStaticLaneDepth: (position: "ue" | "shita") => number;
  declare public getStaticLaneLimit: (position: "ue" | "shita") => number;
  declare public getGlobalLaneIndexForBottom: (localIndex: number) => number;
  declare public resolveStaticCommentOffset: (
    position: "ue" | "shita",
    lane: number,
    displayHeight: number,
    comment: Comment,
  ) => number;
  declare public getStaticReservedLaneSet: () => Set<number>;
  declare public shouldActivateCommentAtTime: (
    comment: Comment,
    timeMs: number,
    preview?: string,
  ) => boolean;
  declare public activateComment: (
    comment: Comment,
    context: CanvasRenderingContext2D,
    displayWidth: number,
    displayHeight: number,
    options: CommentPrepareOptions,
    referenceTime: number,
  ) => void;
  declare public assignStaticLane: (
    position: "ue" | "shita",
    comment: Comment,
    displayHeight: number,
    currentTime: number,
  ) => number;
  declare public reserveStaticLane: (
    position: "ue" | "shita",
    comment: Comment,
    lane: number,
    releaseTime: number,
  ) => void;
  declare public releaseStaticLane: (position: "ue" | "shita", lane: number) => void;
  declare public getLanePriorityOrder: (currentTime: number) => number[];
  declare public getLaneNextAvailableTime: (lane: number, currentTime: number) => number;
  declare public createLaneReservation: (
    comment: Comment,
    referenceTime: number,
  ) => LaneReservation;
  declare public isLaneAvailable: (
    lane: number,
    candidate: LaneReservation,
    currentTime: number,
  ) => boolean;
  declare public storeLaneReservation: (lane: number, reservation: LaneReservation) => void;
  declare public areReservationsConflicting: (a: LaneReservation, b: LaneReservation) => boolean;
  declare public computeForwardGap: (
    from: LaneReservation,
    to: LaneReservation,
    time: number,
  ) => number;
  declare public getBufferedEdges: (
    reservation: LaneReservation,
    time: number,
  ) => { left: number; right: number };
  declare public solveLeftRightEqualityTime: (
    left: LaneReservation,
    right: LaneReservation,
  ) => number | null;
  declare public draw: () => void;
  declare public performInitialSync: (frameTimeMs?: number) => void;
  declare public processFrame: (frameTimeMs?: number) => void;
  declare public handleAnimationFrame: () => void;
  declare public handleVideoFrame: (
    now: DOMHighResTimeStamp,
    metadata: VideoFrameCallbackMetadataLike,
  ) => void;
  declare public shouldUseVideoFrameCallback: () => boolean;
  declare public scheduleNextFrame: () => void;
  declare public cancelAnimationFrameRequest: () => void;
  declare public cancelVideoFrameCallback: () => void;
  declare public startAnimation: () => void;
  declare public stopAnimation: () => void;
  declare public onSeek: () => void;

  constructor(settings: RendererSettings | null, config?: CommentRendererConfig);
  constructor(config?: CommentRendererConfig);
  constructor(
    settingsOrConfig: RendererSettings | CommentRendererConfig | null = null,
    maybeConfig: CommentRendererConfig | undefined = undefined,
  ) {
    let baseSettings: RendererSettings;
    let config: CommentRendererConfig;

    if (isRendererSettings(settingsOrConfig)) {
      baseSettings = normalizeSettings({ ...(settingsOrConfig as RendererSettings) });
      config = maybeConfig ?? {};
    } else {
      const configCandidate = settingsOrConfig ?? maybeConfig ?? {};
      config =
        typeof configCandidate === "object" ? (configCandidate as CommentRendererConfig) : {};
      baseSettings = normalizeSettings(cloneDefaultSettings());
    }

    this._settings = normalizeSettings(baseSettings);
    this.timeSource = config.timeSource ?? createDefaultTimeSource();
    this.animationFrameProvider =
      config.animationFrameProvider ?? createDefaultAnimationFrameProvider(this.timeSource);
    this.createCanvasElement = config.createCanvasElement ?? createBrowserCanvasFactory();
    this.commentDependencies = {
      timeSource: this.timeSource,
      settingsVersion: this.settingsVersion,
    };
    this.log = createLogger(config.loggerNamespace ?? "CommentRenderer");
    this.eventHooks = config.eventHooks ?? {};

    this.handleAnimationFrame = this.handleAnimationFrame.bind(this);
    this.handleVideoFrame = this.handleVideoFrame.bind(this);

    this.rebuildNgMatchers();

    if (config.debug) {
      configureDebugLogging(config.debug);
    }
  }

  get settings(): RendererSettings {
    return this._settings;
  }

  set settings(value: RendererSettings) {
    this._settings = normalizeSettings(value);
    this.settingsVersion += 1;
    this.commentDependencies.settingsVersion = this.settingsVersion;
    this.rebuildNgMatchers();
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  getCurrentVideoSource(): string | null {
    const video = this.videoElement;
    if (!video) {
      return null;
    }
    if (typeof video.currentSrc === "string" && video.currentSrc.length > 0) {
      return video.currentSrc;
    }
    const attribute = video.getAttribute("src");
    if (attribute && attribute.length > 0) {
      return attribute;
    }
    const sourceElement = video.querySelector("source[src]") as HTMLSourceElement | null;
    if (sourceElement && typeof sourceElement.src === "string") {
      return sourceElement.src;
    }
    return null;
  }

  getCommentsSnapshot(): Comment[] {
    return [...this.comments];
  }
}

registerCommentCollectionMethods(CommentRenderer);
registerFinalPhaseMethods(CommentRenderer);
registerPlaybackHelpers(CommentRenderer);
registerActivationMethods(CommentRenderer);
registerLanePruneMethods(CommentRenderer);
registerLaneStaticMethods(CommentRenderer);
registerLaneActivationMethods(CommentRenderer);
registerLaneReservationMethods(CommentRenderer);
registerRenderMethods(CommentRenderer);
registerTimingMethods(CommentRenderer);
registerLifecycleCoreMethods(CommentRenderer);
registerLifecycleVideoMethods(CommentRenderer);
registerVisibilityMethods(CommentRenderer);
registerResizeMethods(CommentRenderer);
registerFullscreenMethods(CommentRenderer);
registerCleanupMethods(CommentRenderer);

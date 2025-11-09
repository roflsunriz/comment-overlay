import { cloneDefaultSettings } from "../config/default-settings";
import type { RendererSettings, CommentRendererEventHooks } from "../shared/types";
import {
  Comment,
  createDefaultTimeSource,
  type CommentDependencies,
  type CommentPrepareOptions,
  type TimeSource,
} from "./comment";
import { createLogger, type Logger } from "../shared/logger";
import { configureDebugLogging } from "../shared/debug";
import {
  createBrowserCanvasFactory,
  createDefaultAnimationFrameProvider,
  isRendererSettings,
  normalizeSettings,
} from "./comment-renderer/settings";
export { createDefaultAnimationFrameProvider } from "./comment-renderer/settings";
import type {
  AnimationFrameProvider,
  CommentRendererConfig,
  CommentRendererInitializeOptions,
  LaneReservation,
  StaticLaneReservation,
  VideoFrameCallbackMetadataLike,
} from "./comment-renderer/types";
import { DEFAULT_LANE_COUNT } from "./comment-renderer/constants";
import {
  rebuildNgMatchersImpl,
  registerCommentCollectionMethods,
} from "./comment-renderer/methods/comments";
import { registerFinalPhaseMethods } from "./comment-renderer/methods/final-phase";
import { registerPlaybackHelpers } from "./comment-renderer/methods/playback";
import { registerActivationMethods } from "./comment-renderer/methods/activation";
import { registerLanePruneMethods } from "./comment-renderer/methods/lanes-prune";
import { registerLaneStaticMethods } from "./comment-renderer/methods/lanes-static";
import { registerLaneActivationMethods } from "./comment-renderer/methods/lanes-activation";
import { registerLaneReservationMethods } from "./comment-renderer/methods/lanes-reservations";
import { registerRenderMethods } from "./comment-renderer/methods/render";
import { registerTimingMethods } from "./comment-renderer/methods/timing";
import { registerLifecycleCoreMethods } from "./comment-renderer/methods/lifecycle-core";
import { registerLifecycleVideoMethods } from "./comment-renderer/methods/lifecycle-video-events";
import { registerVisibilityMethods } from "./comment-renderer/methods/visibility";
import { registerResizeMethods } from "./comment-renderer/methods/resize";
import { registerFullscreenMethods } from "./comment-renderer/methods/fullscreen";
import { registerCleanupMethods } from "./comment-renderer/methods/cleanup";

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

  public initialize!: (options: HTMLVideoElement | CommentRendererInitializeOptions) => void;
  public destroy!: () => void;
  public destroyCanvasOnly!: () => void;
  public resolveContainer!: (
    explicit: HTMLElement | null | undefined,
    video: HTMLVideoElement,
  ) => HTMLElement;
  public ensureContainerPositioning!: (container: HTMLElement) => void;
  public resize!: (width?: number, height?: number) => void;
  public resolveDevicePixelRatio!: () => number;
  public calculateLaneMetrics!: () => void;
  public setupResizeHandling!: (videoElement: HTMLVideoElement) => void;
  public cleanupResizeHandling!: () => void;
  public setupVideoEventListeners!: (videoElement: HTMLVideoElement) => void;
  public handleVideoMetadataLoaded!: (videoElement: HTMLVideoElement) => void;
  public handleVideoStalled!: () => void;
  public handleVideoCanPlay!: () => void;
  public handleVideoSourceChange!: (videoElement?: HTMLVideoElement | null) => void;
  public syncVideoState!: (videoElement: HTMLVideoElement) => void;
  public resetCommentActivity!: () => void;
  public setupVideoChangeDetection!: (video: HTMLVideoElement, container: HTMLElement) => void;
  public extractVideoElement!: (node: Node) => HTMLVideoElement | null;
  public setupVisibilityHandling!: () => void;
  public handleVisibilityRestore!: () => void;
  public setupFullscreenHandling!: () => void;
  public resolveResizeObserverTarget!: (videoElement: HTMLVideoElement) => Element;
  public handleFullscreenChange!: () => Promise<void>;
  public resolveFullscreenContainer!: (videoElement: HTMLVideoElement) => HTMLElement | null;
  public resolveActiveOverlayContainer!: (
    videoElement: HTMLVideoElement,
    baseContainer: HTMLElement | null,
    fullscreenElement: Element | null,
  ) => HTMLElement | null;
  public getFullscreenElement!: () => Element | null;
  public addCleanup!: (task: () => void) => void;
  public runCleanupTasks!: () => void;
  public rebuildNgMatchers(): void {
    rebuildNgMatchersImpl.call(this);
  }
  public isNGComment!: (text: string) => boolean;
  public addComments!: (
    entries: ReadonlyArray<{ text: string; vposMs: number; commands?: string[] }>,
  ) => Comment[];
  public addComment!: (text: string, vposMs: number, commands?: string[]) => Comment | null;
  public clearComments!: () => void;
  public resetState!: () => void;
  public hardReset!: () => void;
  public resetFinalPhaseState!: () => void;
  public incrementEpoch!: (reason: "source-change" | "metadata-loaded" | "manual-reset") => void;
  public emitStateSnapshot!: (label: string) => void;
  public getEffectiveCommentVpos!: (comment: Comment) => number;
  public getFinalPhaseDisplayDuration!: (comment: Comment) => number;
  public resolveFinalPhaseVpos!: (comment: Comment) => number;
  public recomputeFinalPhaseTimeline!: () => void;
  public shouldSuppressRendering!: () => boolean;
  public updatePlaybackProgressState!: () => void;
  public updateComments!: (frameTimeMs?: number) => void;
  public buildPrepareOptions!: (visibleWidth: number) => CommentPrepareOptions;
  public findAvailableLane!: (comment: Comment) => number;
  public findFirstValidReservationIndex!: (
    reservations: LaneReservation[],
    cutoffTime: number,
  ) => number;
  public pruneLaneReservations!: (currentTime: number) => void;
  public pruneStaticLaneReservations!: (currentTime: number) => void;
  public findCommentIndexAtOrAfter!: (targetVposMs: number) => number;
  public getCommentsInTimeWindow!: (centerTimeMs: number, windowMs: number) => Comment[];
  public getStaticReservations!: (position: "ue" | "shita") => StaticLaneReservation[];
  public getStaticLaneDepth!: (position: "ue" | "shita") => number;
  public getStaticLaneLimit!: (position: "ue" | "shita") => number;
  public getGlobalLaneIndexForBottom!: (localIndex: number) => number;
  public resolveStaticCommentOffset!: (
    position: "ue" | "shita",
    lane: number,
    displayHeight: number,
    comment: Comment,
  ) => number;
  public getStaticReservedLaneSet!: () => Set<number>;
  public shouldActivateCommentAtTime!: (
    comment: Comment,
    timeMs: number,
    preview?: string,
  ) => boolean;
  public activateComment!: (
    comment: Comment,
    context: CanvasRenderingContext2D,
    displayWidth: number,
    displayHeight: number,
    options: CommentPrepareOptions,
    referenceTime: number,
  ) => void;
  public assignStaticLane!: (
    position: "ue" | "shita",
    comment: Comment,
    displayHeight: number,
    currentTime: number,
  ) => number;
  public reserveStaticLane!: (
    position: "ue" | "shita",
    comment: Comment,
    lane: number,
    releaseTime: number,
  ) => void;
  public releaseStaticLane!: (position: "ue" | "shita", lane: number) => void;
  public getLanePriorityOrder!: (currentTime: number) => number[];
  public getLaneNextAvailableTime!: (lane: number, currentTime: number) => number;
  public createLaneReservation!: (comment: Comment, referenceTime: number) => LaneReservation;
  public isLaneAvailable!: (
    lane: number,
    candidate: LaneReservation,
    currentTime: number,
  ) => boolean;
  public storeLaneReservation!: (lane: number, reservation: LaneReservation) => void;
  public areReservationsConflicting!: (a: LaneReservation, b: LaneReservation) => boolean;
  public computeForwardGap!: (from: LaneReservation, to: LaneReservation, time: number) => number;
  public getBufferedEdges!: (
    reservation: LaneReservation,
    time: number,
  ) => { left: number; right: number };
  public solveLeftRightEqualityTime!: (
    left: LaneReservation,
    right: LaneReservation,
  ) => number | null;
  public draw!: () => void;
  public performInitialSync!: (frameTimeMs?: number) => void;
  public processFrame!: (frameTimeMs?: number) => void;
  public handleAnimationFrame!: () => void;
  public handleVideoFrame!: (
    now: DOMHighResTimeStamp,
    metadata: VideoFrameCallbackMetadataLike,
  ) => void;
  public shouldUseVideoFrameCallback!: () => boolean;
  public scheduleNextFrame!: () => void;
  public cancelAnimationFrameRequest!: () => void;
  public cancelVideoFrameCallback!: () => void;
  public startAnimation!: () => void;
  public stopAnimation!: () => void;
  public onSeek!: () => void;

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

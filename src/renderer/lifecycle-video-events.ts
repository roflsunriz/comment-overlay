import type { CommentRenderer } from "@/renderer/comment-renderer";
import { SEEK_DIRECTION_EPSILON_MS, toMilliseconds } from "@/shared/constants";

const setupVideoEventListenersImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
): void {
  try {
    const onPlay = (): void => {
      this.isPlaying = true;
      this.playbackHasBegun = true;
      const now = this.timeSource.now();
      this.lastDrawTime = now;
      this.lastPlayResumeTime = now;
      this.comments.forEach((comment) => {
        comment.lastUpdateTime = now;
        comment.isPaused = false;
      });
    };
    const onPause = (): void => {
      this.isPlaying = false;
      const now = this.timeSource.now();
      this.comments.forEach((comment) => {
        comment.lastUpdateTime = now;
        comment.isPaused = true;
      });
    };
    const onSeeking = (): void => {
      this.onSeek();
    };
    const onSeeked = (): void => {
      this.onSeek();
    };
    const onRateChange = (): void => {
      this.playbackRate = videoElement.playbackRate;
      const now = this.timeSource.now();
      this.comments.forEach((comment) => {
        comment.lastUpdateTime = now;
      });
    };
    const onLoadedMetadata = (): void => {
      this.handleVideoMetadataLoaded(videoElement);
    };
    const onDurationChange = (): void => {
      this.duration = Number.isFinite(videoElement.duration)
        ? toMilliseconds(videoElement.duration)
        : 0;
    };
    const onEmptied = (): void => {
      this.handleVideoSourceChange();
    };
    const onWaiting = (): void => {
      this.handleVideoStalled();
    };
    const onCanPlay = (): void => {
      this.handleVideoCanPlay();
    };
    const onPlaying = (): void => {
      this.handleVideoCanPlay();
    };

    videoElement.addEventListener("play", onPlay);
    videoElement.addEventListener("pause", onPause);
    videoElement.addEventListener("seeking", onSeeking);
    videoElement.addEventListener("seeked", onSeeked);
    videoElement.addEventListener("ratechange", onRateChange);
    videoElement.addEventListener("loadedmetadata", onLoadedMetadata);
    videoElement.addEventListener("durationchange", onDurationChange);
    videoElement.addEventListener("emptied", onEmptied);
    videoElement.addEventListener("waiting", onWaiting);
    videoElement.addEventListener("canplay", onCanPlay);
    videoElement.addEventListener("playing", onPlaying);

    this.addCleanup(() => videoElement.removeEventListener("play", onPlay));
    this.addCleanup(() => videoElement.removeEventListener("pause", onPause));
    this.addCleanup(() => videoElement.removeEventListener("seeking", onSeeking));
    this.addCleanup(() => videoElement.removeEventListener("seeked", onSeeked));
    this.addCleanup(() => videoElement.removeEventListener("ratechange", onRateChange));
    this.addCleanup(() => videoElement.removeEventListener("loadedmetadata", onLoadedMetadata));
    this.addCleanup(() => videoElement.removeEventListener("durationchange", onDurationChange));
    this.addCleanup(() => videoElement.removeEventListener("emptied", onEmptied));
    this.addCleanup(() => videoElement.removeEventListener("waiting", onWaiting));
    this.addCleanup(() => videoElement.removeEventListener("canplay", onCanPlay));
    this.addCleanup(() => videoElement.removeEventListener("playing", onPlaying));
  } catch (error) {
    this.log.error("CommentRenderer.setupVideoEventListeners", error as Error);
    throw error;
  }
};

const handleVideoMetadataLoadedImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
): void {
  this.lastVideoSource = this.getCurrentVideoSource();
  this.incrementEpoch("metadata-loaded");
  this.handleVideoSourceChange(videoElement);
  this.resize();
  this.calculateLaneMetrics();
  this.hardReset();
  this.onSeek();
  this.emitStateSnapshot("metadata-loaded");
};

const handleVideoStalledImpl = function (this: CommentRenderer): void {
  const canvas = this.canvas;
  const ctx = this.ctx;
  if (!canvas || !ctx) {
    return;
  }

  this.isStalled = true;

  const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
  const effectiveWidth = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
  const effectiveHeight =
    this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
  ctx.clearRect(0, 0, effectiveWidth, effectiveHeight);

  this.comments.forEach((comment) => {
    if (comment.isActive) {
      comment.lastUpdateTime = this.timeSource.now();
    }
  });
};

const handleVideoCanPlayImpl = function (this: CommentRenderer): void {
  if (!this.isStalled) {
    return;
  }

  this.isStalled = false;

  if (this.videoElement) {
    this.currentTime = toMilliseconds(this.videoElement.currentTime);
    this.isPlaying = !this.videoElement.paused;
  }

  this.lastDrawTime = this.timeSource.now();
};

const handleVideoSourceChangeImpl = function (
  this: CommentRenderer,
  videoElement?: HTMLVideoElement | null,
): void {
  const target = videoElement ?? this.videoElement;
  if (!target) {
    this.lastVideoSource = null;
    this.isPlaying = false;
    this.resetFinalPhaseState();
    this.resetCommentActivity();
    return;
  }

  const currentSource = this.getCurrentVideoSource();
  const sourceChanged = currentSource !== this.lastVideoSource;
  if (!sourceChanged) {
    return;
  }

  this.lastVideoSource = currentSource;
  this.incrementEpoch("source-change");
  this.syncVideoState(target);
  this.resetFinalPhaseState();
  this.resetCommentActivity();
  this.emitStateSnapshot("source-change");
};

const syncVideoStateImpl = function (this: CommentRenderer, videoElement: HTMLVideoElement): void {
  this.duration = Number.isFinite(videoElement.duration)
    ? toMilliseconds(videoElement.duration)
    : 0;
  this.currentTime = toMilliseconds(videoElement.currentTime);
  this.playbackRate = videoElement.playbackRate;
  this.isPlaying = !videoElement.paused;
  this.isStalled = false;
  this.playbackHasBegun = this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS;
  this.lastDrawTime = this.timeSource.now();
};

const resetCommentActivityImpl = function (this: CommentRenderer): void {
  const now = this.timeSource.now();
  const canvas = this.canvas;
  const context = this.ctx;
  this.resetFinalPhaseState();
  this.skipDrawingForCurrentFrame = false;
  this.isStalled = false;
  this.pendingInitialSync = false;
  this.playbackHasBegun = this.isPlaying || this.currentTime > SEEK_DIRECTION_EPSILON_MS;
  if (canvas && context) {
    const effectiveDpr = this.canvasDpr > 0 ? this.canvasDpr : 1;
    const width = this.displayWidth > 0 ? this.displayWidth : canvas.width / effectiveDpr;
    const height = this.displayHeight > 0 ? this.displayHeight : canvas.height / effectiveDpr;
    context.clearRect(0, 0, width, height);
  }
  this.reservedLanes.clear();
  this.topStaticLaneReservations.length = 0;
  this.bottomStaticLaneReservations.length = 0;
  this.comments.forEach((comment) => {
    comment.isActive = false;
    comment.isPaused = !this.isPlaying;
    comment.hasShown = false;
    comment.lane = -1;
    comment.x = comment.virtualStartX;
    comment.speed = comment.baseSpeed;
    comment.lastUpdateTime = now;
    comment.clearActivation();
  });
  this.activeComments.clear();
};

const setupVideoChangeDetectionImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
  container: HTMLElement,
): void {
  if (typeof MutationObserver === "undefined") {
    this.log.debug(
      "MutationObserver is not available in this environment. Video change detection is disabled.",
    );
    return;
  }

  const videoObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "src") {
        const targetNode = mutation.target;
        let previous: string | null = null;
        let current: string | null = null;
        if (targetNode instanceof HTMLVideoElement || targetNode instanceof HTMLSourceElement) {
          previous = typeof mutation.oldValue === "string" ? mutation.oldValue : null;
          current = targetNode.getAttribute("src");
        }
        if (previous === current) {
          continue;
        }
        this.handleVideoSourceChange(videoElement);
        return;
      }
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLSourceElement) {
            this.handleVideoSourceChange(videoElement);
            return;
          }
        }
        for (const node of mutation.removedNodes) {
          if (node instanceof HTMLSourceElement) {
            this.handleVideoSourceChange(videoElement);
            return;
          }
        }
      }
    }
  });

  videoObserver.observe(videoElement, {
    attributes: true,
    attributeFilter: ["src"],
    attributeOldValue: true,
    childList: true,
    subtree: true,
  });
  this.addCleanup(() => videoObserver.disconnect());

  const containerObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        const nextVideo = this.extractVideoElement(node);
        if (nextVideo && nextVideo !== this.videoElement) {
          this.initialize(nextVideo);
          return;
        }
      }
      for (const node of mutation.removedNodes) {
        if (node === this.videoElement) {
          this.videoElement = null;
          this.handleVideoSourceChange(null);
          return;
        }
        if (node instanceof Element) {
          const removedVideo = node.querySelector("video");
          if (removedVideo && removedVideo === this.videoElement) {
            this.videoElement = null;
            this.handleVideoSourceChange(null);
            return;
          }
        }
      }
    }
  });

  containerObserver.observe(container, { childList: true, subtree: true });
  this.addCleanup(() => containerObserver.disconnect());
};

const extractVideoElementImpl = function (
  this: CommentRenderer,
  node: Node,
): HTMLVideoElement | null {
  if (node instanceof HTMLVideoElement) {
    return node;
  }
  if (node instanceof Element) {
    const candidate = node.querySelector("video");
    if (candidate instanceof HTMLVideoElement) {
      return candidate;
    }
  }
  return null;
};

export const registerLifecycleVideoMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.setupVideoEventListeners = setupVideoEventListenersImpl;
  ctor.prototype.handleVideoMetadataLoaded = handleVideoMetadataLoadedImpl;
  ctor.prototype.handleVideoStalled = handleVideoStalledImpl;
  ctor.prototype.handleVideoCanPlay = handleVideoCanPlayImpl;
  ctor.prototype.handleVideoSourceChange = handleVideoSourceChangeImpl;
  ctor.prototype.syncVideoState = syncVideoStateImpl;
  ctor.prototype.resetCommentActivity = resetCommentActivityImpl;
  ctor.prototype.setupVideoChangeDetection = setupVideoChangeDetectionImpl;
  ctor.prototype.extractVideoElement = extractVideoElementImpl;
};

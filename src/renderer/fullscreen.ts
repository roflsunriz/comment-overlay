import type { CommentRenderer } from "@/renderer/comment-renderer";

const setupFullscreenHandlingImpl = function (this: CommentRenderer): void {
  if (
    typeof document === "undefined" ||
    typeof document.addEventListener !== "function" ||
    typeof document.removeEventListener !== "function"
  ) {
    return;
  }

  const onFullscreenChange = (): void => {
    void this.handleFullscreenChange();
  };

  const events = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ];

  events.forEach((eventName) => {
    document.addEventListener(eventName, onFullscreenChange);
    this.addCleanup(() => document.removeEventListener(eventName, onFullscreenChange));
  });

  void this.handleFullscreenChange();
};

const resolveResizeObserverTargetImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
): Element {
  const fullscreenContainer = this.resolveFullscreenContainer(videoElement);
  if (fullscreenContainer) {
    return fullscreenContainer;
  }
  return videoElement.parentElement ?? videoElement;
};

const handleFullscreenChangeImpl = async function (this: CommentRenderer): Promise<void> {
  const canvas = this.canvas;
  const video = this.videoElement;
  if (!canvas || !video) {
    return;
  }

  const baseContainer = this.containerElement ?? video.parentElement ?? null;
  const fullscreenElement = this.getFullscreenElement();
  const nextContainer = this.resolveActiveOverlayContainer(video, baseContainer, fullscreenElement);

  if (!(nextContainer instanceof HTMLElement)) {
    return;
  }

  if (canvas.parentElement !== nextContainer) {
    this.ensureContainerPositioning(nextContainer);
    nextContainer.appendChild(canvas);
  } else {
    this.ensureContainerPositioning(nextContainer);
  }

  const fullscreenContainer =
    fullscreenElement instanceof HTMLElement && fullscreenElement.contains(video)
      ? fullscreenElement
      : null;
  const isFullscreenNow = fullscreenContainer !== null;
  if (this.fullscreenActive !== isFullscreenNow) {
    this.fullscreenActive = isFullscreenNow;
    this.setupResizeHandling(video);
  }

  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";

  this.resize();
};

const resolveFullscreenContainerImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
): HTMLElement | null {
  const fullscreenElement = this.getFullscreenElement();
  if (!(fullscreenElement instanceof HTMLElement)) {
    return null;
  }
  if (fullscreenElement === videoElement) {
    return fullscreenElement;
  }
  if (fullscreenElement.contains(videoElement)) {
    return fullscreenElement;
  }
  return null;
};

const resolveActiveOverlayContainerImpl = function (
  this: CommentRenderer,
  videoElement: HTMLVideoElement,
  baseContainer: HTMLElement | null,
  fullscreenElement: Element | null,
): HTMLElement | null {
  if (fullscreenElement instanceof HTMLElement && fullscreenElement.contains(videoElement)) {
    if (fullscreenElement instanceof HTMLVideoElement) {
      if (baseContainer instanceof HTMLElement) {
        return baseContainer;
      }
      return fullscreenElement;
    }
    return fullscreenElement;
  }
  return baseContainer ?? null;
};

const getFullscreenElementImpl = function (this: CommentRenderer): Element | null {
  if (typeof document === "undefined") {
    return null;
  }
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
  };
  return (
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement ??
    null
  );
};

export const registerFullscreenMethods = (ctor: typeof CommentRenderer): void => {
  ctor.prototype.setupFullscreenHandling = setupFullscreenHandlingImpl;
  ctor.prototype.resolveResizeObserverTarget = resolveResizeObserverTargetImpl;
  ctor.prototype.handleFullscreenChange = handleFullscreenChangeImpl;
  ctor.prototype.resolveFullscreenContainer = resolveFullscreenContainerImpl;
  ctor.prototype.resolveActiveOverlayContainer = resolveActiveOverlayContainerImpl;
  ctor.prototype.getFullscreenElement = getFullscreenElementImpl;
};

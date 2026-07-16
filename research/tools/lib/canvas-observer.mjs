export const buildCanvasObserverScript = () => String.raw`
(() => {
  const observerVersion = 4;
  if (globalThis.__CO_RESEARCH_CANVAS_OBSERVER_VERSION__ === observerVersion) return;
  globalThis.__CO_RESEARCH_CANVAS_OBSERVER_VERSION__ = observerVersion;
  const records = [];
  const canvasIds = new WeakMap();
  const canvasTextMetadata = new Map();
  let nextCanvasId = 1;
  let sequence = 0;
  const canvasId = (canvas) => {
    if (!canvas) return null;
    let id = canvasIds.get(canvas);
    if (!id) {
      id = nextCanvasId++;
      canvasIds.set(canvas, id);
    }
    return id;
  };
  const mediaState = () => {
    const video = document.querySelector("video");
    return {
      videoCurrentTimeMs: Number.isFinite(video?.currentTime)
        ? Math.round(video.currentTime * 1000)
        : null,
      videoPaused: video?.paused ?? null,
      videoReadyState: video?.readyState ?? null,
    };
  };
  const transformValue = (context) => {
    if (typeof context?.getTransform !== "function") return null;
    const transform = context.getTransform();
    return [
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      transform.e,
      transform.f,
    ];
  };
  const measureTextWidth = (context, text) => {
    if (typeof context?.measureText !== "function") return null;
    const width = context.measureText(String(text ?? "")).width;
    return Number.isFinite(width) ? width : null;
  };
  const rememberText = (context, text, measuredTextWidth) => {
    const id = canvasId(context?.canvas);
    if (id === null) return;
    const metadata = canvasTextMetadata.get(id) ?? { textParts: [] };
    metadata.textParts.push(String(text ?? ""));
    metadata.text = metadata.textParts.join("\n").slice(0, 1000);
    metadata.font = context.font;
    metadata.measuredTextWidth = measuredTextWidth;
    metadata.textTransform = transformValue(context);
    const horizontalScale = Array.isArray(metadata.textTransform)
      ? Math.hypot(metadata.textTransform[0], metadata.textTransform[1])
      : 1;
    metadata.renderedTextWidth = Number.isFinite(measuredTextWidth)
      ? measuredTextWidth * horizontalScale
      : null;
    metadata.canvasWidth = context.canvas?.width ?? null;
    metadata.canvasHeight = context.canvas?.height ?? null;
    canvasTextMetadata.set(id, metadata);
  };
  const push = (context, operation, details) => {
    const canvas = context?.canvas;
    records.push({
      sequence: sequence++,
      timestampMs: performance.now(),
      operation,
      canvasId: canvasId(canvas),
      canvasWidth: typeof canvas?.width === "number" ? canvas.width : null,
      canvasHeight: typeof canvas?.height === "number" ? canvas.height : null,
      font: "font" in context ? context.font : null,
      fillStyle: "fillStyle" in context ? String(context.fillStyle) : null,
      strokeStyle: "strokeStyle" in context ? String(context.strokeStyle) : null,
      globalAlpha: "globalAlpha" in context ? context.globalAlpha : null,
      transform: transformValue(context),
      ...mediaState(),
      ...details,
    });
    if (records.length > 20000) records.splice(0, records.length - 20000);
  };
  const patch = (prototype, name, observe) => {
    if (!prototype || typeof prototype[name] !== "function") return;
    const original = prototype[name];
    if (original.__CO_RESEARCH_PATCHED__) return;
    const wrapped = function observedCanvasMethod(...args) {
      const result = original.apply(this, args);
      try { observe(this, args); } catch {}
      return result;
    };
    Object.defineProperty(wrapped, "__CO_RESEARCH_PATCHED__", { value: true });
    prototype[name] = wrapped;
  };
  const patchContext = (constructor) => {
    const prototype = constructor?.prototype;
    patch(prototype, "fillText", (context, args) =>
      {
        const measuredTextWidth = measureTextWidth(context, args[0]);
        rememberText(context, args[0], measuredTextWidth);
        push(context, "fillText", {
          text: String(args[0] ?? ""),
          measuredTextWidth,
          x: Number(args[1]),
          y: Number(args[2]),
          maxWidth: args[3] === undefined ? null : Number(args[3]),
        });
      },
    );
    patch(prototype, "strokeText", (context, args) => {
      const measuredTextWidth = measureTextWidth(context, args[0]);
      push(context, "strokeText", {
        text: String(args[0] ?? ""),
        measuredTextWidth,
        x: Number(args[1]),
        y: Number(args[2]),
        maxWidth: args[3] === undefined ? null : Number(args[3]),
      });
    });
    patch(prototype, "drawImage", (context, args) =>
      {
        const sourceCanvas = args[0] && typeof args[0].getContext === "function" ? args[0] : null;
        const sourceCanvasId = sourceCanvas ? canvasId(sourceCanvas) : null;
        push(context, "drawImage", {
          sourceKind: args[0]?.constructor?.name ?? null,
          sourceCanvasId,
          sourceCanvasText:
            sourceCanvasId === null ? null : (canvasTextMetadata.get(sourceCanvasId) ?? null),
          sourceWidth: typeof args[0]?.width === "number" ? args[0].width : null,
          sourceHeight: typeof args[0]?.height === "number" ? args[0].height : null,
          args: args.slice(1).map((value) => (typeof value === "number" ? value : null)),
        });
      },
    );
  };
  patchContext(globalThis.CanvasRenderingContext2D);
  patchContext(globalThis.OffscreenCanvasRenderingContext2D);
  globalThis.__CO_RESEARCH_CANVAS_SNAPSHOT__ = () => records.slice();
  globalThis.__CO_RESEARCH_CANVAS_STATUS__ = () => ({
    installed: true,
    observerVersion,
    recordCount: records.length,
    nextCanvasId,
  });
})();
`;

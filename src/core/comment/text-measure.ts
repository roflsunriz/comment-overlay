type TextMeasurementCache = Map<string, number>;

const textMeasurementCaches = new WeakMap<CanvasRenderingContext2D, TextMeasurementCache>();

const getTextMeasurementCache = (ctx: CanvasRenderingContext2D): TextMeasurementCache => {
  let cache = textMeasurementCaches.get(ctx);
  if (!cache) {
    cache = new Map();
    textMeasurementCaches.set(ctx, cache);
  }
  return cache;
};

export const measureTextWidth = (ctx: CanvasRenderingContext2D, text: string): number => {
  if (!ctx) {
    return 0;
  }
  const fontKey = ctx.font ?? "";
  const cacheKey = `${fontKey}::${text}`;
  const cache = getTextMeasurementCache(ctx);
  const cached = cache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const width = ctx.measureText(text).width;
  cache.set(cacheKey, width);
  return width;
};

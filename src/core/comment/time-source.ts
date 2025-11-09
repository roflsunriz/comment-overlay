export interface TimeSource {
  now(): number;
}

const createPerformanceTimeSource = (): TimeSource => ({
  now: () => {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  },
});

export const createDefaultTimeSource = (): TimeSource => createPerformanceTimeSource();

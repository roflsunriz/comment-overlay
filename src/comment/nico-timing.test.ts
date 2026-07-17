import { describe, expect, test } from "bun:test";

import { resolveNicoCommentTiming } from "@/comment/nico-timing";

describe("resolveNicoCommentTiming", () => {
  test("keeps ordinary fixed and scrolling timings unchanged", () => {
    expect(
      resolveNicoCommentTiming({ vposMs: 10_000, durationMs: 100_000, isScrolling: false }),
    ).toEqual({ displayVposMs: 10_000, activationVposMs: 10_000 });
    expect(
      resolveNicoCommentTiming({ vposMs: 10_000, durationMs: 100_000, isScrolling: true }),
    ).toEqual({ displayVposMs: 10_000, activationVposMs: 8_000 });
  });

  test("clamps every late comment to three seconds before the media end", () => {
    for (const vposMs of [97_001, 98_000, 99_000, 99_900]) {
      expect(resolveNicoCommentTiming({ vposMs, durationMs: 100_000, isScrolling: false })).toEqual(
        {
          displayVposMs: 97_000,
          activationVposMs: 97_000,
        },
      );
      expect(resolveNicoCommentTiming({ vposMs, durationMs: 100_000, isScrolling: true })).toEqual({
        displayVposMs: 97_000,
        activationVposMs: 95_000,
      });
    }
  });

  test("preserves the exact boundary and handles unknown or short durations", () => {
    expect(
      resolveNicoCommentTiming({ vposMs: 97_000, durationMs: 100_000, isScrolling: true }),
    ).toEqual({ displayVposMs: 97_000, activationVposMs: 95_000 });
    expect(resolveNicoCommentTiming({ vposMs: 500, durationMs: 0, isScrolling: true })).toEqual({
      displayVposMs: 500,
      activationVposMs: 0,
    });
    expect(
      resolveNicoCommentTiming({ vposMs: 500, durationMs: 2_000, isScrolling: false }),
    ).toEqual({ displayVposMs: 0, activationVposMs: 0 });
  });
});

import { describe, expect, test } from "bun:test";

import { resolveStaticPlacement } from "@/renderer/lanes-activation";

describe("resolveStaticPlacement", () => {
  test("stacks fixed comments from their requested edge while space remains", () => {
    const top = resolveStaticPlacement({
      position: "ue",
      reservationHeight: 100,
      displayHeight: 768,
      reservations: [{ releaseTime: 3000, yStart: 0, yEnd: 100 }],
      currentTime: 0,
    });
    const bottom = resolveStaticPlacement({
      position: "shita",
      reservationHeight: 100,
      displayHeight: 768,
      reservations: [{ releaseTime: 3000, yStart: 668, yEnd: 768 }],
      currentTime: 0,
    });

    expect(top.y).toBeCloseTo(100.1, 8);
    expect(bottom.y).toBeCloseTo(567.9, 8);
    expect(top.usedFallback).toBe(false);
    expect(bottom.usedFallback).toBe(false);
  });

  test("uses the official random fallback only when one block fits but no gap does", () => {
    const placement = resolveStaticPlacement({
      position: "ue",
      reservationHeight: 400,
      displayHeight: 768,
      reservations: [{ releaseTime: 3000, yStart: 0, yEnd: 400 }],
      currentTime: 0,
      random: () => 0.25,
    });

    expect(placement.y).toBe(92);
    expect(placement.usedFallback).toBe(true);
  });

  test("anchors every screen-height-or-taller layer to the same edge", () => {
    const reservation = [{ releaseTime: 3000, yStart: 0, yEnd: 810 }];
    const top = resolveStaticPlacement({
      position: "ue",
      reservationHeight: 810,
      displayHeight: 768,
      reservations: reservation,
      currentTime: 0,
      random: () => 0.75,
    });
    const bottom = resolveStaticPlacement({
      position: "shita",
      reservationHeight: 810,
      displayHeight: 768,
      reservations: reservation,
      currentTime: 0,
      random: () => 0.75,
    });

    expect(top.y).toBe(0);
    expect(bottom.y).toBe(-42);
  });

  test("ignores expired reservations", () => {
    const placement = resolveStaticPlacement({
      position: "ue",
      reservationHeight: 100,
      displayHeight: 768,
      reservations: [{ releaseTime: 1000, yStart: 0, yEnd: 100 }],
      currentTime: 1000,
    });

    expect(placement.y).toBe(0);
    expect(placement.usedFallback).toBe(false);
  });
});

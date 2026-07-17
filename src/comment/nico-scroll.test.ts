import { describe, expect, test } from "bun:test";

import {
  NICO_SCROLL_ACTIVATION_LEAD_MS,
  NICO_SCROLL_TRAVERSAL_DURATION_MS,
  resolveNicoScrollMotion,
  resolveNicoScrollTexturePaddingX,
} from "@/comment/nico-scroll";
import { Comment } from "@/comment/comment";
import { cloneDefaultSettings } from "@/config/default-settings";

const context = {
  font: "",
  measureText(text: string) {
    const fontSize = Number.parseFloat(/([0-9.]+)px/.exec(this.font)?.[1] ?? "0");
    return { width: [...text].length * fontSize };
  },
} as unknown as CanvasRenderingContext2D;

const automaticOptions = {
  visibleWidth: 1364,
  virtualExtension: 0,
  maxVisibleDurationMs: 6000,
  minVisibleDurationMs: 2700,
  maxWidthRatio: 4,
  bufferRatio: 0,
  baseBufferPx: 0,
  entryBufferPx: 0,
};

describe("resolveNicoScrollMotion", () => {
  test("uses the measured 1024px render area and four-second ink traversal", () => {
    const motion = resolveNicoScrollMotion({
      visibleWidth: 1364,
      inkWidth: 2340,
      texturePaddingX: 42,
      direction: "rtl",
    });

    expect(motion.renderLeft).toBe(170);
    expect(motion.renderWidth).toBe(1024);
    expect(motion.pixelsPerMs).toBeCloseTo(0.841, 10);
    expect(motion.collisionDurationMs).toBeCloseTo(2782.4019025, 7);
    expect(Math.ceil(motion.collisionDurationMs)).toBe(2783);
    expect(NICO_SCROLL_TRAVERSAL_DURATION_MS).toBe(4000);
    expect(NICO_SCROLL_ACTIVATION_LEAD_MS).toBe(2000);
    expect(resolveNicoScrollTexturePaddingX(20)).toBe(13);
    expect(resolveNicoScrollTexturePaddingX(28)).toBe(17);
    expect(resolveNicoScrollTexturePaddingX(40)).toBe(23);
    expect(resolveNicoScrollTexturePaddingX(78)).toBe(42);
  });

  test("matches the measured short-comment lane-reuse boundary", () => {
    const motion = resolveNicoScrollMotion({
      visibleWidth: 1364,
      inkWidth: 78,
      texturePaddingX: 42,
      direction: "rtl" as const,
    });

    expect(motion.pixelsPerMs).toBeCloseTo(0.2755, 10);
    expect(Math.ceil(motion.collisionDurationMs)).toBe(284);
  });

  test("mirrors the same motion for left-to-right rendering", () => {
    const rtl = resolveNicoScrollMotion({
      visibleWidth: 1364,
      inkWidth: 600,
      texturePaddingX: 20,
      direction: "rtl",
    });
    const ltr = resolveNicoScrollMotion({
      visibleWidth: 1364,
      inkWidth: 600,
      texturePaddingX: 20,
      direction: "ltr",
    });

    expect(ltr.pixelsPerMs).toBe(rtl.pixelsPerMs);
    expect(ltr.collisionDurationMs).toBe(rtl.collisionDurationMs);
    expect(ltr.startX).toBeLessThan(ltr.exitX);
    expect(rtl.startX).toBeGreaterThan(rtl.exitX);
  });

  test("prepare derives speed and lane reuse solely from measured ink width", () => {
    const comment = new Comment(
      "幅".repeat(30),
      10_000,
      ["naka", "big", "mincho"],
      cloneDefaultSettings(),
    );
    comment.prepare(context, 1364, 768, automaticOptions);

    expect(comment.fontSize).toBe(78);
    expect(comment.width).toBe(2340);
    expect(comment.staticWidthScale).toBe(1);
    expect(comment.speedPixelsPerMs).toBeCloseTo(0.841, 10);
    expect(comment.preCollisionDurationMs).toBe(2783);
    expect(comment.virtualStartX - resolveNicoScrollTexturePaddingX(comment.fontSize)).toBeCloseTo(
      2035,
      10,
    );
  });

  test("full is geometry-neutral for scrolling comments at ordinary and extreme widths", () => {
    for (const characters of [1, 30, 120]) {
      const plain = new Comment(
        "幅".repeat(characters),
        10_000,
        ["naka", "big", "mincho"],
        cloneDefaultSettings(),
      );
      const full = new Comment(
        "幅".repeat(characters),
        10_000,
        ["naka", "big", "mincho", "full"],
        cloneDefaultSettings(),
      );
      plain.prepare(context, 1364, 768, automaticOptions);
      full.prepare(context, 1364, 768, automaticOptions);

      expect({
        fontSize: full.fontSize,
        width: full.width,
        height: full.height,
        speed: full.speedPixelsPerMs,
        collision: full.preCollisionDurationMs,
        total: full.totalDurationMs,
        start: full.virtualStartX,
        exit: full.exitThreshold,
      }).toEqual({
        fontSize: plain.fontSize,
        width: plain.width,
        height: plain.height,
        speed: plain.speedPixelsPerMs,
        collision: plain.preCollisionDurationMs,
        total: plain.totalDurationMs,
        start: plain.virtualStartX,
        exit: plain.exitThreshold,
      });
    }
  });

  test("ender only bypasses multiline shrinking and does not alter the motion formula", () => {
    const text = ["幅".repeat(30), "幅", "幅"].join("\n");
    const normal = new Comment(text, 10_000, ["naka", "big", "mincho"], cloneDefaultSettings());
    const ender = new Comment(
      text,
      10_000,
      ["naka", "big", "mincho", "ender"],
      cloneDefaultSettings(),
    );
    normal.prepare(context, 1364, 768, automaticOptions);
    ender.prepare(context, 1364, 768, automaticOptions);

    expect(normal.fontSize).toBe(40);
    expect(normal.width).toBe(1200);
    expect(normal.speedPixelsPerMs).toBeCloseTo((1024 + 1200) / 4000, 10);
    expect(normal.preCollisionDurationMs).toBe(2159);
    expect(ender.fontSize).toBe(78);
    expect(ender.width).toBe(2340);
    expect(ender.speedPixelsPerMs).toBeCloseTo((1024 + 2340) / 4000, 10);
    expect(ender.preCollisionDurationMs).toBe(2783);
  });
});

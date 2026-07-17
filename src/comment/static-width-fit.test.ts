import { describe, expect, test } from "bun:test";

import { resolveNicoStaticWidthFit } from "@/comment/static-width-fit";
import { Comment } from "@/comment/comment";
import { cloneDefaultSettings } from "@/config/default-settings";

const base = {
  visibleWidth: 1364,
  canvasHeight: 768,
  isFull: false,
  isEnder: false,
  lineCount: 1,
  verticalFontSize: 78,
  verticalTextWidth: 0,
  originalFontSize: 78,
  originalTextWidth: 0,
};

describe("resolveNicoStaticWidthFit", () => {
  test("fits ordinary single-line comments to the narrow measured-width target", () => {
    const fit = resolveNicoStaticWidthFit({
      ...base,
      verticalTextWidth: 1170,
      originalTextWidth: 1170,
    });

    expect(fit.fontSize).toBe(68);
    expect(fit.drawScale).toBe(1);
    expect(fit.useOriginalMetrics).toBe(false);
  });

  test("prepare applies fitted font, scale, and reservation height together", () => {
    const context = {
      font: "",
      measureText(text: string) {
        const fontSize = Number.parseFloat(/([0-9.]+)px/.exec(this.font)?.[1] ?? "0");
        return { width: [...text].length * fontSize };
      },
    } as unknown as CanvasRenderingContext2D;
    const options = {
      visibleWidth: 1364,
      virtualExtension: 0,
      maxVisibleDurationMs: 6700,
      minVisibleDurationMs: 6700,
      maxWidthRatio: 4,
      bufferRatio: 0,
      baseBufferPx: 0,
      entryBufferPx: 0,
    };
    const long = new Comment("幅".repeat(60), 0, ["ue", "big", "mincho"], cloneDefaultSettings());
    long.prepare(context, 1364, 768, options);

    expect(long.fontSize).toBe(20);
    expect(long.staticWidthScale).toBe(0.8);
    expect(long.slotHeight).toBeCloseTo(((98.6615376472473 - 0.1) * 20 * 0.8) / 78, 8);
    expect(long.reservationWidth).toBeCloseTo(960, 8);
  });

  test("prepare preserves the observed multiline overflow classifications", () => {
    const context = {
      font: "",
      measureText(text: string) {
        const fontSize = Number.parseFloat(/([0-9.]+)px/.exec(this.font)?.[1] ?? "0");
        return { width: [...text].length * fontSize };
      },
    } as unknown as CanvasRenderingContext2D;
    const options = {
      visibleWidth: 1364,
      virtualExtension: 0,
      maxVisibleDurationMs: 6700,
      minVisibleDurationMs: 6700,
      maxWidthRatio: 4,
      bufferRatio: 0,
      baseBufferPx: 0,
      entryBufferPx: 0,
    };
    const prepare = (characters: number, extraCommands: string[]) => {
      const body = ["幅".repeat(characters), ...Array.from({ length: 15 }, () => "　")].join("\n");
      const comment = new Comment(
        body,
        0,
        ["ue", "big", "mincho", ...extraCommands],
        cloneDefaultSettings(),
      );
      comment.prepare(context, 1364, 768, options);
      return comment.slotHeight;
    };

    expect(prepare(30, [])).toBeGreaterThanOrEqual(768);
    expect(prepare(60, [])).toBeLessThan(768);
    expect(prepare(30, ["full"])).toBeGreaterThanOrEqual(768);
    expect(prepare(60, ["full"])).toBeGreaterThanOrEqual(768);
    expect(prepare(30, ["ender"])).toBeLessThan(768);
    expect(prepare(30, ["full", "ender"])).toBeGreaterThanOrEqual(768);
  });

  test("uses the minimum font and quantized draw scale for extreme width", () => {
    const fit = resolveNicoStaticWidthFit({
      ...base,
      verticalTextWidth: 4680,
      originalTextWidth: 4680,
    });

    expect(fit.fontSize).toBe(20);
    expect(fit.drawScale).toBe(0.8);
  });

  test("gives full comments the full visible-width target", () => {
    const fit = resolveNicoStaticWidthFit({
      ...base,
      isFull: true,
      verticalTextWidth: 2340,
      originalTextWidth: 2340,
    });

    expect(fit.fontSize).toBe(44);
    expect(fit.targetWidth).toBe(1364);
  });

  test("switches overflowing multiline comments from vertical to original metrics", () => {
    const plain = resolveNicoStaticWidthFit({
      ...base,
      lineCount: 3,
      verticalFontSize: 40,
      verticalTextWidth: 1200,
      originalTextWidth: 2340,
    });
    const fullKept = resolveNicoStaticWidthFit({
      ...base,
      isFull: true,
      lineCount: 16,
      verticalFontSize: 40,
      verticalTextWidth: 1200,
      originalTextWidth: 2340,
    });
    const fullWide = resolveNicoStaticWidthFit({
      ...base,
      isFull: true,
      lineCount: 16,
      verticalFontSize: 40,
      verticalTextWidth: 2400,
      originalTextWidth: 4680,
    });

    expect(plain).toMatchObject({ fontSize: 66, useOriginalMetrics: true });
    expect(fullKept).toMatchObject({ fontSize: 40, useOriginalMetrics: false });
    expect(fullWide).toMatchObject({ fontSize: 44, useOriginalMetrics: true });
  });

  test("ender bypasses multiline metrics and fits directly to the narrow target", () => {
    const fit = resolveNicoStaticWidthFit({
      ...base,
      isEnder: true,
      lineCount: 16,
      verticalTextWidth: 2340,
      originalTextWidth: 2340,
    });

    expect(fit).toMatchObject({ fontSize: 34, useOriginalMetrics: false, drawScale: 1 });
  });

  test("composes full, ender, multiline, and minimum-font scaling at extreme widths", () => {
    const cases = [
      { lineCount: 1, width: 4680, originalWidth: 4680, full: true, ender: false },
      { lineCount: 1, width: 7020, originalWidth: 7020, full: true, ender: false },
      { lineCount: 1, width: 9360, originalWidth: 9360, full: true, ender: false },
      ...[7020, 9360].flatMap((originalWidth) =>
        [false, true].flatMap((full) =>
          [false, true].map((ender) => ({
            lineCount: 16,
            width: originalWidth * (20 / 78),
            originalWidth,
            full,
            ender,
          })),
        ),
      ),
    ];

    for (const testCase of cases) {
      const fit = resolveNicoStaticWidthFit({
        ...base,
        lineCount: testCase.lineCount,
        isFull: testCase.full,
        isEnder: testCase.ender,
        verticalFontSize: testCase.lineCount === 1 ? 78 : 20,
        verticalTextWidth: testCase.width,
        originalTextWidth: testCase.originalWidth,
      });
      const baseFont = fit.useOriginalMetrics ? 78 : testCase.lineCount === 1 ? 78 : 20;
      const baseWidth = fit.useOriginalMetrics ? testCase.originalWidth : testCase.width;
      const finalWidth = baseWidth * (fit.fontSize / baseFont) * fit.drawScale;

      expect(fit.fontSize).toBeGreaterThanOrEqual(20);
      expect(fit.drawScale).toBeGreaterThanOrEqual(0.1);
      expect(finalWidth).toBeLessThanOrEqual(fit.targetWidth + 0.001);
    }
  });
});

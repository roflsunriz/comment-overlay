import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

import { resolveNicoCommentLayoutMetrics } from "../../../src/comment/nico-layout";
import { Comment } from "../../../src/comment/comment";
import { cloneDefaultSettings } from "../../../src/config/default-settings";
import { resolveStaticPlacement } from "../../../src/renderer/lanes-activation";

type FixtureComment = {
  vposMs: number;
  body: string;
  commands: string[];
  fork: string;
};

const fixture = JSON.parse(
  readFileSync("overlay-tests/fixtures/so31723295-ed-comments.json", "utf8"),
) as { comments: FixtureComment[] };

const artComments = fixture.comments.filter(
  (comment) =>
    comment.fork === "leaf" &&
    ["ue", "big", "full", "mincho"].every((command) => comment.commands.includes(command)),
);

const context = {
  font: "",
  measureText(text: string) {
    const fontSize = Number.parseFloat(/([0-9.]+)px/.exec(this.font)?.[1] ?? "0");
    return { width: [...text].length * fontSize };
  },
} as unknown as CanvasRenderingContext2D;

const prepareFixtureComment = (input: FixtureComment): Comment => {
  const comment = new Comment(input.body, input.vposMs, input.commands, cloneDefaultSettings());
  comment.prepare(context, 1364, 768, {
    visibleWidth: 1364,
    virtualExtension: 0,
    maxVisibleDurationMs: 6700,
    minVisibleDurationMs: 6700,
    maxWidthRatio: 4,
    bufferRatio: 0,
    baseBufferPx: 0,
    entryBufferPx: 0,
  });
  return comment;
};

describe("so31723295 episode 5 ED holdout", () => {
  test("all 48 art layers fall on the measured screen-height boundary", () => {
    const batches = new Set(artComments.map((comment) => comment.vposMs));
    expect(artComments).toHaveLength(48);
    expect(batches.size).toBe(11);

    for (const comment of artComments) {
      const lineCount = comment.body.split(/\r?\n/).length;
      const metrics = resolveNicoCommentLayoutMetrics({
        canvasHeight: 768,
        size: "big",
        lineCount,
        isEnder: false,
        lineHeightMultiplier: 1,
      });
      expect(lineCount).toBe(16);
      expect(metrics.slotHeight).toBeGreaterThanOrEqual(768);
      expect(prepareFixtureComment(comment).slotHeight).toBeGreaterThanOrEqual(768);
    }
  });

  test("every layer in every batch resolves to the same top anchor", () => {
    for (const vposMs of new Set(artComments.map((comment) => comment.vposMs))) {
      const batch = artComments.filter((comment) => comment.vposMs === vposMs);
      const reservations: Array<{ releaseTime: number; yStart: number; yEnd: number }> = [];
      for (const comment of batch) {
        const prepared = prepareFixtureComment(comment);
        const placement = resolveStaticPlacement({
          position: "ue",
          reservationHeight: prepared.slotHeight,
          displayHeight: 768,
          reservations,
          currentTime: vposMs,
          random: () => 0.75,
        });
        expect(placement.y).toBe(0);
        reservations.push({
          releaseTime: vposMs + 3000,
          yStart: placement.y,
          yEnd: placement.y + prepared.slotHeight,
        });
      }
    }
  });
});

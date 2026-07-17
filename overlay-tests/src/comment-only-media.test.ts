import { describe, expect, test } from "bun:test";

import { createSilentTimeline, resolveCommentTimelineDuration } from "./comment-only-media.js";

describe("comment-only media", () => {
  test("extends the timeline beyond the last comment", () => {
    expect(resolveCommentTimelineDuration([{ vposMs: 250 }, { vposMs: 12_500 }])).toBe(22.5);
    expect(resolveCommentTimelineDuration([])).toBe(10);
  });

  test("creates a seekable PCM wave with the requested duration", async () => {
    const bytes = new Uint8Array(await createSilentTimeline(2).arrayBuffer());
    const view = new DataView(bytes.buffer);
    const ascii = (offset: number, length: number): string =>
      String.fromCharCode(...bytes.slice(offset, offset + length));

    expect(ascii(0, 4)).toBe("RIFF");
    expect(ascii(8, 4)).toBe("WAVE");
    expect(view.getUint32(24, true)).toBe(8000);
    expect(view.getUint32(40, true)).toBe(16_000);
    expect(bytes.byteLength).toBe(16_044);
  });
});

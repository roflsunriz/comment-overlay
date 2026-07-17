import assert from "node:assert/strict";
import test from "node:test";

import { buildCases } from "../run-fixed-comment-matrix.mjs";

test("scrolling matrix covers every declared equivalence class", () => {
  const expectedCounts = {
    "scroll-features": 108,
    "scroll-width": 152,
    "scroll-sync": 36,
    "scroll-metadata": 14,
    "scroll-viewport": 12,
    "scroll-seek": 2,
    "scroll-lifecycle": 12,
    "scroll-lifecycle-boundary": 4,
    "scroll-lifecycle-edge": 24,
    "scroll-reuse-boundary": 50,
    "scroll-glyph": 6,
    "scroll-cleanup-boundary": 11,
    "final-phase-equivalence": 72,
  };

  for (const [profile, expectedCount] of Object.entries(expectedCounts)) {
    const cases = buildCases(profile);
    assert.equal(cases.length, expectedCount, profile);
    assert.equal(new Set(cases.map((entry) => entry.id)).size, cases.length, profile);
    assert.ok(
      cases.every((entry) => entry.scenario.comments.length > 0),
      profile,
    );
  }

  assert.equal(buildCases("all").length, 824);
});

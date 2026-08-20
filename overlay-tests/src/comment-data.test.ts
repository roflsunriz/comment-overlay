import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { extractCommentEntries, sanitizeCommentEntry } from "./comment-data";

describe("overlay test comment data", () => {
  test("reads every main thread from a raw nvComment response and supplies thread metadata", () => {
    const entries = extractCommentEntries({
      meta: { status: 200 },
      data: {
        threads: [
          { id: "owner-thread", fork: "owner", comments: [{ body: "owner", vposMs: 1 }] },
          { id: "old-main", fork: "main", comments: [] },
          {
            id: "display-thread",
            fork: "main",
            comments: [
              { body: "leaf", vposMs: 10, source: "leaf" },
              { body: "trunk", vposMs: 20, source: "trunk" },
            ],
          },
          { id: "easy-thread", fork: "easy", comments: [{ body: "easy", vposMs: 30 }] },
        ],
      },
    });

    expect(entries).toHaveLength(1);
    expect(sanitizeCommentEntry(entries[0])).toEqual({
      text: "trunk",
      vposMs: 20,
      commands: [],
      meta: {
        no: undefined,
        fork: "main",
        source: "trunk",
        threadId: "display-thread",
        date: undefined,
        userIdHash: undefined,
      },
    });
  });

  test("keeps the legacy comments wrapper and untrimmed comment text compatible", () => {
    const entries = extractCommentEntries({
      comments: [
        { body: "leaf", vposMs: 10, source: "leaf" },
        { body: "　trunk　", vposMs: 20, source: "trunk", commands: ["ue", null] },
      ],
    });

    expect(entries).toHaveLength(1);
    expect(sanitizeCommentEntry(entries[0])?.text).toBe("　trunk　");
    expect(sanitizeCommentEntry(entries[0])?.commands).toEqual(["ue"]);
  });

  test("loads all checked-in fixture responses", async () => {
    const fixtureDirectory = path.resolve("overlay-tests", "fixtures");
    const fixtureNames = (await readdir(fixtureDirectory)).filter((name) =>
      name.endsWith("-comments.json"),
    );

    expect(fixtureNames.length).toBeGreaterThan(0);
    for (const fixtureName of fixtureNames) {
      const payload = JSON.parse(
        await readFile(path.join(fixtureDirectory, fixtureName), "utf8"),
      ) as unknown;
      const entries = extractCommentEntries(payload);
      const cleaned = entries.map((entry) => sanitizeCommentEntry(entry)).filter(Boolean);
      expect(cleaned.length, fixtureName).toBeGreaterThan(0);
    }
  });
});

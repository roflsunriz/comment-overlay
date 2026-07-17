import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateOverlayTestCases } from "./generate-overlay-test-cases.mjs";

const testRootParent = path.resolve("research", "runs", "overlay-case-generator-tests");
const createdRoots = [];

const createTestRoot = async () => {
  await mkdir(testRootParent, { recursive: true });
  const root = await mkdtemp(path.join(testRootParent, "case-"));
  createdRoots.push(root);
  return root;
};

afterEach(async () => {
  await Promise.all(
    createdRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("generateOverlayTestCases", () => {
  test("generates a case from comment JSON when the corresponding video is absent", async () => {
    const root = await createTestRoot();
    const fixtures = path.join(root, "fixtures");
    const generatedFile = path.join(root, "video-cases.generated.ts");
    await mkdir(fixtures);
    await writeFile(path.join(fixtures, "sample-comments.json"), '{"label":"sample"}\n');
    const result = await generateOverlayTestCases({ inputDirectory: fixtures, generatedFile });
    const generated = await readFile(generatedFile, "utf8");

    expect(result.cases).toHaveLength(1);
    expect(generated).toContain("sample: {");
    expect(generated).toContain('video: "./fixtures/sample.mp4"');
  });

  test("regenerates from every comment JSON regardless of optional video files", async () => {
    const root = await createTestRoot();
    const fixtures = path.join(root, "fixtures");
    const generatedFile = path.join(root, "video-cases.generated.ts");
    await mkdir(fixtures);
    await writeFile(path.join(fixtures, "sample-comments.json"), '{"label":"Sample Case"}\n');
    await writeFile(path.join(fixtures, "sample.mp4"), "");

    const result = await generateOverlayTestCases({ inputDirectory: fixtures, generatedFile });
    const generated = await readFile(generatedFile, "utf8");

    expect(result.cases).toHaveLength(1);
    expect(generated).toContain("sample: {");
    expect(generated).toContain('label: "Sample Case"');
  });
});

import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const sourceModule = resolve(projectRoot, "dist/comment-overlay.es");
const sourceMap = `${sourceModule}.map`;
const targetModule = resolve(projectRoot, "overlay-tests/dist/comment-overlay.es.js");
const targetMap = `${targetModule}.map`;

const ensureDirectory = async (filePath) => {
  await mkdir(dirname(filePath), { recursive: true });
};

const copyIfPresent = async (from, to) => {
  try {
    await copyFile(from, to);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
  return true;
};

const main = async () => {
  await ensureDirectory(targetModule);

  const mainCopied = await copyIfPresent(sourceModule, targetModule);
  if (!mainCopied) {
    throw new Error("dist/comment-overlay.es not found. Run `vite build` before syncing overlay tests.");
  }

  await copyIfPresent(sourceMap, targetMap);
};

await main();

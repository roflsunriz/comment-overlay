import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CommentOverlay",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "comment-overlay.es.js" : "comment-overlay.cjs.js")
    },
    rollupOptions: {
      external: [],
      output: {
        exports: "named"
      }
    },
  }
});

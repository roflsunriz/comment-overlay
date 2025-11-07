import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
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
    }
  }
});

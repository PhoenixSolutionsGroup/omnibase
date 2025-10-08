import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom"],
  clean: true,
  tsconfig: "tsconfig.app.json",
  banner: {
    js: '"use client";',
  },
  onSuccess: "cp src/index.css dist/index.css",
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  external: ["react", "react-dom"],
  clean: true,
  tsconfig: "tsconfig.app.json",
  onSuccess: "cp src/index.css dist/index.css",
});

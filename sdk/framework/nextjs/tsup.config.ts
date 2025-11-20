import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/middleware/index.ts", "src/auth/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom", "next", "@ory/elements-react"],
  clean: true,
  splitting: false,
  noExternal: ["@omnibase/core-js"],
});

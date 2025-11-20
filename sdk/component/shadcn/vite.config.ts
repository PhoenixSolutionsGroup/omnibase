import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import peerDependencies from "./package.json";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.stories.*", "src/**/*.test.*", "**/*.css"],
      outDir: "dist",
      insertTypesEntry: true,
      rollupTypes: false, // Disable this to avoid the absolute path error
      // skipDiagnostics: false,
      tsconfigPath: "./tsconfig.app.json",
      compilerOptions: {
        declaration: true,
        declarationMap: true,
        noEmit: false,
        emitDeclarationOnly: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (ext) => `index.${ext}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies)],
      output: {
        preserveModules: true,
        exports: "named",
      },
    },
    target: "esnext",
    sourcemap: true,
  },
});

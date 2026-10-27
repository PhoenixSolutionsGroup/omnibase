import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/pg-cloudflare/dist/index.js",
      "./node_modules/pg-cloudflare/dist/index.d.ts",
      "./node_modules/pg-cloudflare/esm/index.mjs",
    ],
  },
};

export default nextConfig;

import app from "./src/index";

Bun.serve({
  port: parseInt(process.env.PORT || "8787", 10),
  fetch(req) {
    // Inject process.env as bindings to mimic Cloudflare Workers
    return app.fetch(req, process.env as any);
  },
});

console.log(
  `🚀 Edge functions running at http://localhost:${process.env.PORT || 8787}`
);

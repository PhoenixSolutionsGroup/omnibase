import { Hono } from "hono";
import { cors } from "hono/cors";

type EnvVars = any;

const app = new Hono<{ Bindings: EnvVars }>();

// Enable CORS for development
app.use("/*", cors());

app.get("/", (c) => {
  return c.json({
    message: "Hello World, from the edge!",
    timestamp: new Date().toISOString(),
  });
});

// Example API endpoint
app.get("/api/hello", (c) => {
  return c.json({
    message: "Edge function is working!",
    env: c.env,
  });
});

export default {
  fetch: app.fetch,
};

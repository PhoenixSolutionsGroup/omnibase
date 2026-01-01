import { Hono } from "hono";
import { cors } from "hono/cors";

type EnvVars = {
  WEBSITE_URL?: string;
};

interface HealthCheckRequest {
  urls: string[];
}

interface HealthCheckResult {
  url: string;
  status: "healthy" | "unhealthy" | "error";
  responseTime: number;
  statusCode?: number;
  error?: string;
}

const app = new Hono<{ Bindings: EnvVars }>();

// Enable CORS for the dashboard website
app.use("/*", (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.WEBSITE_URL || "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  });
  return corsMiddleware(c, next);
});

app.get("/", (c) => {
  return c.json({
    message: "Hello World, from the edge!",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint that checks multiple service URLs
app.post("/api/health-check", async (c) => {
  try {
    const body = await c.req.json<HealthCheckRequest>();

    if (!body.urls || !Array.isArray(body.urls)) {
      return c.json({ error: "Invalid request: urls array is required" }, 400);
    }

    if (body.urls.length === 0) {
      return c.json({ results: [] });
    }

    // Check all URLs in parallel
    const results = await Promise.all(
      body.urls.map(async (url): Promise<HealthCheckResult> => {
        const startTime = Date.now();

        try {
          // Set timeout for health checks
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(url, {
            method: "GET",
            signal: controller.signal,
            headers: {
              "User-Agent": "OmniBase-Health-Checker/1.0",
            },
          });

          clearTimeout(timeoutId);
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (url.includes("postgrest")) {
            return {
              url,
              status: response.ok
                ? "healthy"
                : response.status == 404
                ? "healthy"
                : "unhealthy",
              responseTime,
              statusCode: response.status,
            };
          }
          return {
            url,
            status: response.ok ? "healthy" : "unhealthy",
            responseTime,
            statusCode: response.status,
          };
        } catch (error) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          console.warn(error);
          return {
            url,
            status: "error",
            responseTime,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    return c.json({ results });
  } catch (error) {
    return c.json(
      {
        error: "Failed to process health check request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
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

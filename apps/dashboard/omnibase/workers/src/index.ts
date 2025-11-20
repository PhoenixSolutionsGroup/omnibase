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

async function scheduledHandler(event: ScheduledEvent, env: EnvVars) {
  const tenants = await fetchTenants(env);

  for (const tenant of tenants) {
    await env.USAGE_QUEUE.send({
      tenant_id: tenant.tenant_id,
      stripe_customer_id: tenant.stripe_customer_id,
    });
  }
}

type Tenant = {
  tenant_id: string;
  stripe_customer_id: string | null;
};

type TenantsResponse = {
  tenants: Tenant[];
  count: number;
};

async function fetchTenants(env: EnvVars): Promise<Tenant[]> {
  const response = await fetch(
    `${env.MANAGED_HOSTING_URL}/internal/usage/list-tenants`,
    {
      method: "GET",
      headers: {
        "X-API-Key": env.INTERNAL_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tenants: ${response.statusText}`);
  }

  const data = (await response.json()) as TenantsResponse;
  return data.tenants || [];
}

type TenantMessage = {
  tenant_id: string;
  stripe_customer_id: string | null;
};

async function queueHandler(batch: MessageBatch<TenantMessage>, env: EnvVars) {
  batch.messages.map(async (message) => {
    const { tenant_id, stripe_customer_id } = message.body;

    // 1. Collect usage
    await fetch(`${env.MANAGED_HOSTING_URL}/internal/v1/usage/collect`, {
      method: "POST",
      headers: {
        "X-API-Key": env.INTERNAL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant_id }),
    });

    // 2. Record usage (immediately after)
    await fetch(`${env.MANAGED_HOSTING_URL}/internal/v1/usage/record`, {
      method: "POST",
      headers: {
        "X-API-Key": env.INTERNAL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tenant_id }),
    });

    message.ack();
  });
}

export default {
  fetch: app.fetch,
};

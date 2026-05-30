---
title: Queues
description: Background job processing with guaranteed delivery on Cloudflare Queues
---

# Queues

Process background jobs asynchronously with guaranteed delivery. Perfect for heavy processing, email sending, webhook retries, and any task that shouldn't block your API responses.

## What Are Queues?

Queues enable asynchronous message passing between workers. Send messages to a queue from your API endpoints, then process them in the background with automatic retries and guaranteed delivery.

### Key Features

- **Guaranteed Delivery** — Messages are persisted and retried automatically
- **Batch Processing** — Process multiple messages at once for efficiency
- **Automatic Retries** — Failed messages retry up to 3 times
- **No Infrastructure** — Fully managed by Cloudflare

---

## Quick Start

### Configure Queue

Add queue configuration to `omnibase/workers/wrangler.toml`:

```toml title="wrangler.toml"
name = "omnibase-edge"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Producer: Send messages to queue
[[queues.producers]]
queue = "background-jobs"
binding = "JOB_QUEUE"

# Consumer: Process messages from queue
[[queues.consumers]]
queue = "background-jobs"
max_batch_size = 10
```

### Send Messages (Producer)

Send messages to the queue from your API:

```typescript title="src/index.ts"
import { Hono } from "hono";

type EnvVars = {
  JOB_QUEUE: Queue;
};

const app = new Hono<{ Bindings: EnvVars }>();

app.post("/api/process", async (c) => {
  const data = await c.req.json();

  // Send to queue for background processing
  await c.env.JOB_QUEUE.send({
    type: "process-data",
    userId: data.userId,
    payload: data,
    timestamp: Date.now(),
  });

  return c.json({ queued: true });
});
```

### Process Messages (Consumer)

Add a queue handler to process messages:

```typescript title="src/index.ts"
export default {
  fetch: app.fetch,

  // Process messages from queue
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        const data = message.body;
        console.log("Processing:", data);

        // Your processing logic
        await processJob(data, env);

        // Mark as successfully processed
        message.ack();
      } catch (error) {
        console.error("Job failed:", error);
        // Message will be retried automatically
        message.retry();
      }
    }
  },
};
```

### Deploy

Deploy your worker with queue configuration:

```bash
omnibase cloud workers deploy --env production
```

Your queue is now active and will process messages in the background.

---

## Sending Messages

### Basic Send

```typescript
// Send single message
await env.MY_QUEUE.send({ userId: 123, action: "process" });
```

### Batch Send

Send multiple messages efficiently:

```typescript
// Send multiple messages at once
await env.MY_QUEUE.sendBatch([
  { body: { userId: 1, action: "email" } },
  { body: { userId: 2, action: "email" } },
  { body: { userId: 3, action: "email" } },
]);
```

### With Delay

Delay message processing:

```typescript
// Process after 60 seconds
await env.MY_QUEUE.send(
  { userId: 123 },
  { delaySeconds: 60 }
);
```

---

## Processing Messages

### Message Object

```typescript
interface QueueMessage {
  id: string;              // Unique message ID
  timestamp: Date;         // When message was sent
  body: any;              // Your message data
  ack: () => void;        // Mark as successfully processed
  retry: () => void;      // Retry this message
}
```

### Batch Processing

```typescript
async queue(batch: MessageBatch, env: EnvVars) {
  console.log(`Processing ${batch.messages.length} messages`);

  for (const message of batch.messages) {
    try {
      await handleMessage(message.body, env);
      message.ack();
    } catch (error) {
      console.error("Failed:", error);
      message.retry();
    }
  }
}
```

### Parallel Processing

Process messages concurrently for speed:

```typescript
async queue(batch, env) {
  await Promise.all(
    batch.messages.map(async (message) => {
      try {
        await handleMessage(message.body, env);
        message.ack();
      } catch (error) {
        message.retry();
      }
    })
  );
}
```

---

## Use Cases

### Email Sending

Don't block API responses while sending emails:

```typescript
// API endpoint - responds immediately
app.post("/api/signup", async (c) => {
  const { email, name } = await c.req.json();

  // Queue welcome email
  await c.env.EMAIL_QUEUE.send({
    type: "welcome-email",
    email,
    name,
  });

  return c.json({ success: true });
});

// Queue consumer - sends email in background
async queue(batch, env) {
  for (const message of batch.messages) {
    const { type, email, name } = message.body;

    if (type === "welcome-email") {
      await sendEmail(email, `Welcome ${name}!`, env);
      message.ack();
    }
  }
}
```

### Webhook Processing

Retry failed webhooks automatically:

```typescript
app.post("/api/webhooks/stripe", async (c) => {
  const event = await c.req.json();

  await c.env.WEBHOOK_QUEUE.send({
    provider: "stripe",
    event,
  });

  return c.json({ received: true });
});
```

### Data Processing

Handle heavy computations in the background:

```typescript
app.post("/api/reports/generate", async (c) => {
  const { userId, reportType } = await c.req.json();

  await c.env.REPORT_QUEUE.send({
    userId,
    reportType,
    requestedAt: Date.now(),
  });

  return c.json({ status: "processing" });
});
```

---

## Best Practices

### Always ack() or retry()

Always explicitly handle each message:

```typescript
for (const message of batch.messages) {
  try {
    await processMessage(message.body);
    message.ack();  // ✅ Mark as done
  } catch (error) {
    message.retry(); // ✅ Retry later
  }
}
```

### Use Batch Processing

Process multiple messages together when possible:

```typescript
async queue(batch, env) {
  // Extract all user IDs
  const userIds = batch.messages.map(m => m.body.userId);

  // Fetch data once for all users
  const users = await fetchUsers(userIds, env);

  // Process all messages
  for (const message of batch.messages) {
    const user = users.find(u => u.id === message.body.userId);
    await process(user);
    message.ack();
  }
}
```

### Add Message Metadata

Include useful debugging information:

```typescript
await env.MY_QUEUE.send({
  type: "process-order",
  orderId: 123,
  userId: 456,
  timestamp: Date.now(),
  source: "api",
});
```

### Handle Retries Gracefully

Design idempotent handlers that can safely retry:

```typescript
async queue(batch, env) {
  for (const message of batch.messages) {
    const { orderId } = message.body;

    // Check if already processed
    const exists = await checkIfProcessed(orderId, env);
    if (exists) {
      message.ack();
      continue;
    }

    try {
      await processOrder(orderId, env);
      message.ack();
    } catch (error) {
      message.retry();
    }
  }
}
```

---

## Configuration

### Multiple Queues

Use different queues for different job types:

```toml title="wrangler.toml"
[[queues.producers]]
queue = "emails"
binding = "EMAIL_QUEUE"

[[queues.producers]]
queue = "webhooks"
binding = "WEBHOOK_QUEUE"

[[queues.consumers]]
queue = "emails"
max_batch_size = 5

[[queues.consumers]]
queue = "webhooks"
max_batch_size = 10
```

### Batch Size

Control how many messages are processed at once:

```toml
[[queues.consumers]]
queue = "my-queue"
max_batch_size = 10  # Process up to 10 messages per batch
```

> **Note:**
Larger batch sizes improve throughput but increase processing time. Start with 10 and adjust based on your needs.

---

## Deployment

Deploy your worker with queue configuration:

```bash
omnibase cloud workers deploy --env production
```

Queues are automatically created when you deploy. No additional setup required.

---

## Next Steps

- [Edge Functions](/docs/guides/workers/edge-functions) — Build APIs that send messages to queues
- [Cron Jobs](/docs/guides/workers/cron) — Schedule periodic jobs that use queues
- [Cloudflare Queues](https://developers.cloudflare.com/queues/) — Deep dive into the platform

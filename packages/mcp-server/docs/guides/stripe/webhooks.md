---
title: Webhooks
description: Configure Stripe webhook endpoints for real-time event handling
---

# Webhooks

Webhooks allow your application to receive real-time notifications about events in your Stripe account, such as successful payments, subscription changes, and invoice updates.

## Webhook Configuration

### Basic Webhook Setup

```json
{
  "webhooks": [
    {
      "id": "main_webhook",
      "url": "${STRIPE_WEBHOOK_URL}/api/stripe/webhook",
      "events": [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "invoice.paid",
        "invoice.payment_failed"
      ],
      "connect": false
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Unique identifier for the webhook |
| `url` | `string` | Yes | Webhook endpoint URL |
| `events` | `string[]` | Yes | List of events to subscribe to (minimum 1) |
| `connect` | `boolean` | No | Listen to Stripe Connect events (default: false) |

### Environment Variable Interpolation

Use `${VAR_NAME}` syntax for environment-specific URLs:

```json
{
  "webhooks": [
    {
      "id": "main_webhook",
      "url": "${STRIPE_WEBHOOK_URL}/api/stripe/webhook",
      "events": ["invoice.created"]
    }
  ]
}
```

Set the environment variable:

```bash title=".env"
STRIPE_WEBHOOK_URL=https://api.example.com
```

## Supported Events

OmniBase supports 60+ Stripe webhook events organized by category:

### Account Events

| Event | Description |
|-------|-------------|
| `account.updated` | Account details changed |
| `account.application.deauthorized` | OAuth application disconnected |
| `account.external_account.created` | Bank account/card added |
| `account.external_account.deleted` | Bank account/card removed |
| `account.external_account.updated` | Bank account/card updated |

### Customer Events

| Event | Description |
|-------|-------------|
| `customer.created` | New customer created |
| `customer.updated` | Customer details updated |
| `customer.deleted` | Customer deleted |

### Subscription Events

| Event | Description |
|-------|-------------|
| `customer.subscription.created` | New subscription started |
| `customer.subscription.updated` | Subscription changed |
| `customer.subscription.deleted` | Subscription canceled |
| `customer.subscription.paused` | Subscription paused |
| `customer.subscription.resumed` | Subscription resumed |
| `customer.subscription.trial_will_end` | Trial ending soon (3 days) |

### Payment Events

| Event | Description |
|-------|-------------|
| `payment_intent.created` | Payment intent created |
| `payment_intent.succeeded` | Payment successful |
| `payment_intent.payment_failed` | Payment failed |
| `payment_intent.canceled` | Payment canceled |
| `payment_intent.requires_action` | Requires customer action (3DS) |

### Charge Events

| Event | Description |
|-------|-------------|
| `charge.succeeded` | Charge successful |
| `charge.failed` | Charge failed |
| `charge.refunded` | Charge refunded |
| `charge.captured` | Charge captured |
| `charge.dispute.created` | Dispute opened |
| `charge.dispute.updated` | Dispute updated |
| `charge.dispute.closed` | Dispute closed |

### Invoice Events

| Event | Description |
|-------|-------------|
| `invoice.created` | Draft invoice created |
| `invoice.finalized` | Invoice finalized |
| `invoice.paid` | Invoice paid |
| `invoice.payment_failed` | Payment failed |
| `invoice.payment_action_required` | Requires customer action |
| `invoice.upcoming` | Upcoming invoice notification |
| `invoice.marked_uncollectible` | Marked uncollectible |
| `invoice.voided` | Invoice voided |

### Checkout Events

| Event | Description |
|-------|-------------|
| `checkout.session.completed` | Checkout completed |
| `checkout.session.expired` | Checkout expired |
| `checkout.session.async_payment_succeeded` | Async payment succeeded |
| `checkout.session.async_payment_failed` | Async payment failed |

### Product & Price Events

| Event | Description |
|-------|-------------|
| `product.created` | Product created |
| `product.updated` | Product updated |
| `product.deleted` | Product archived |
| `price.created` | Price created |
| `price.updated` | Price updated |
| `price.deleted` | Price archived |

### Other Events

| Event | Description |
|-------|-------------|
| `payout.created` | Payout initiated |
| `payout.paid` | Payout completed |
| `payout.failed` | Payout failed |
| `refund.created` | Refund created |
| `refund.updated` | Refund updated |
| `payment_method.attached` | Payment method attached |
| `payment_method.detached` | Payment method detached |
| `transfer.created` | Transfer created |
| `transfer.reversed` | Transfer reversed |

## Stripe Connect Webhooks

For platforms using Stripe Connect, set `connect: true` to receive events from connected accounts:

```json
{
  "webhooks": [
    {
      "id": "platform_webhook",
      "url": "${WEBHOOK_URL}/api/stripe/webhook",
      "events": [
        "account.updated",
        "payment_intent.succeeded"
      ],
      "connect": false
    },
    {
      "id": "connect_webhook",
      "url": "${WEBHOOK_URL}/api/stripe/connect-webhook",
      "events": [
        "account.updated",
        "payment_intent.succeeded",
        "payout.paid"
      ],
      "connect": true
    }
  ]
}
```

## Webhook Secrets

After configuring webhooks, retrieve the signing secrets:

### CLI

```bash
omnibase stripe webhook secret
```

### API

```bash
GET /api/v1/stripe/admin/webhooks
X-Service-Key: your-service-key
```

Response:

```json
{
  "webhooks": [
    {
      "id": "main_webhook",
      "stripe_id": "we_1ABC123...",
      "url": "https://api.example.com/api/stripe/webhook",
      "events": ["invoice.paid", "customer.subscription.created"],
      "connect": false,
      "secret": "whsec_xxxxxxxxxxxxx"
    }
  ]
}
```

## Handling Webhooks

### Signature Verification

Always verify webhook signatures to ensure events are from Stripe:

**Next.js:**

```typescript title="app/api/stripe/webhook/route.ts"
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      // Handle new subscription
      break;
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      // Handle paid invoice
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response('OK', { status: 200 });
}
```

**Go:**

```go title="internal/handlers/stripe_webhook.go"
package handlers

import (
    "encoding/json"
    "io"
    "net/http"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/stripe/stripe-go/v82/webhook"
)

func HandleStripeWebhook(c *gin.Context) {
    body, err := io.ReadAll(c.Request.Body)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
        return
    }

    signature := c.GetHeader("Stripe-Signature")
    webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

    event, err := webhook.ConstructEvent(body, signature, webhookSecret)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid signature"})
        return
    }

    switch event.Type {
    case "customer.subscription.created":
        var subscription stripe.Subscription
        json.Unmarshal(event.Data.Raw, &subscription)
        // Handle new subscription

    case "invoice.paid":
        var invoice stripe.Invoice
        json.Unmarshal(event.Data.Raw, &invoice)
        // Handle paid invoice

    case "invoice.payment_failed":
        var invoice stripe.Invoice
        json.Unmarshal(event.Data.Raw, &invoice)
        // Handle failed payment
    }

    c.JSON(http.StatusOK, gin.H{"received": true})
}
```

## Common Webhook Patterns

### Subscription Lifecycle

```json
{
  "webhooks": [
    {
      "id": "subscription_events",
      "url": "${WEBHOOK_URL}/api/webhooks/subscriptions",
      "events": [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "customer.subscription.paused",
        "customer.subscription.resumed",
        "customer.subscription.trial_will_end"
      ]
    }
  ]
}
```

### Payment Monitoring

```json
{
  "webhooks": [
    {
      "id": "payment_events",
      "url": "${WEBHOOK_URL}/api/webhooks/payments",
      "events": [
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "charge.refunded",
        "charge.dispute.created"
      ]
    }
  ]
}
```

### Invoice Processing

```json
{
  "webhooks": [
    {
      "id": "invoice_events",
      "url": "${WEBHOOK_URL}/api/webhooks/invoices",
      "events": [
        "invoice.created",
        "invoice.finalized",
        "invoice.paid",
        "invoice.payment_failed",
        "invoice.marked_uncollectible"
      ]
    }
  ]
}
```

## Idempotency

Webhooks may be delivered multiple times. Ensure your handlers are idempotent:

```typescript
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Check if already processed
  const existing = await db.payments.findUnique({
    where: { stripeInvoiceId: invoice.id },
  });

  if (existing) {
    console.log(`Invoice ${invoice.id} already processed`);
    return;
  }

  // Process the invoice
  await db.payments.create({
    data: {
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      customerId: invoice.customer as string,
      processedAt: new Date(),
    },
  });
}
```

## Testing Webhooks

### Local Development

Use the Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Trigger Test Events

```bash
stripe trigger customer.subscription.created
stripe trigger invoice.paid
stripe trigger payment_intent.succeeded
```

> **Note:**
See [Testing Guide](/guides/stripe/testing) for comprehensive webhook testing strategies.

## Best Practices

1. **Verify Signatures** — Always verify webhook signatures in production

2. **Respond Quickly** — Return a 2xx response within 10 seconds; process asynchronously if needed

3. **Handle Idempotency** — Webhooks may be delivered multiple times

4. **Log Events** — Log all received events for debugging

5. **Use Specific Events** — Subscribe only to events you need

6. **Separate Endpoints** — Consider separate endpoints for different event categories

## Related

- [Subscriptions](/guides/stripe/subscriptions) — Handling subscription events
- [Invoices](/guides/stripe/invoices) — Invoice webhook processing
- [Testing](/guides/stripe/testing) — Testing webhook handlers

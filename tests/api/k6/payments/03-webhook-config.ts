import { check } from "k6";
import { client, logError, uniqueId } from "../client";

/**
 * Test Scenario: Webhook Configuration Lifecycle
 *
 * This test validates the webhook configuration endpoints:
 * - Single webhook creation via configureWebhooks
 * - Multiple webhooks configuration (batch)
 * - Connect webhook support
 * - Webhook update and idempotency
 * - Retrieve webhook secret
 *
 * Flow:
 * 1. Configure a single webhook endpoint
 * 2. Verify webhook was created with correct properties
 * 3. Retrieve webhook secret
 * 4. Update the webhook with new events
 * 5. Configure multiple webhooks (including Connect webhook)
 * 6. Verify all webhooks configured correctly
 */
export function webhookConfigLifecycle() {
  const id = uniqueId();
  const webhookUrl = `https://example.com/webhooks/test-${id}`;

  // Step 1: Configure a single webhook endpoint using configureWebhooks
  const singleWebhookResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "main_webhook",
        url: webhookUrl,
        events: ["invoice.paid", "invoice.created"],
        connect: false,
      },
    ],
  });

  check(singleWebhookResponse.response, {
    "configure webhook: status is 200": (r) => r.status === 200,
    "configure webhook: returns webhooks array": (r) => {
      const body = r.json() as any;
      return Array.isArray(body?.data?.webhooks);
    },
    "configure webhook: has 1 webhook": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.length === 1;
    },
    "configure webhook: returns stripe_id": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.[0]?.stripe_id !== undefined;
    },
    "configure webhook: returns secret": (r) => {
      const body = r.json() as any;
      const secret = body?.data?.webhooks?.[0]?.secret;
      return secret !== undefined && secret.startsWith("whsec_");
    },
    "configure webhook: action is created": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.[0]?.action === "created";
    },
  });

  const webhooksData = singleWebhookResponse.data?.data?.webhooks;
  if (!webhooksData || webhooksData.length === 0) {
    logError("configureWebhooks", singleWebhookResponse.response);
    return;
  }

  const webhookData = webhooksData[0];

  // Step 2: Retrieve webhook secret
  const getSecretResponse = client.getWebhookSecret();

  check(getSecretResponse.response, {
    "get webhook secret: status is 200": (r) => r.status === 200,
    "get webhook secret: returns secret": (r) => {
      const body = r.json() as any;
      return body?.data?.secret !== undefined;
    },
    "get webhook secret: returns events array": (r) => {
      const body = r.json() as any;
      return Array.isArray(body?.data?.events) && body?.data?.events.length > 0;
    },
    "get webhook secret: connect is false": (r) => {
      const body = r.json() as any;
      return body?.data?.connect === false;
    },
  });

  // Step 3: Update webhook with new events (should return "updated")
  const updateWebhookResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "main_webhook",
        url: webhookUrl,
        events: [
          "invoice.paid",
          "invoice.created",
          "customer.subscription.created",
        ],
        connect: false,
      },
    ],
  });

  check(updateWebhookResponse.response, {
    "update webhook: status is 200": (r) => r.status === 200,
    "update webhook: action is updated or unchanged or created": (r) => {
      const body = r.json() as any;
      const action = body?.data?.webhooks?.[0]?.action;
      return action === "updated" || action === "unchanged" || action === "created";
    },
  });

  // Step 4: Configure multiple webhooks including a Connect webhook
  const connectWebhookUrl = `https://example.com/webhooks/connect-${id}`;

  const multiWebhooksResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "account_events",
        url: webhookUrl,
        events: ["invoice.paid", "charge.succeeded"],
        connect: false,
      },
      {
        id: "connect_events",
        url: connectWebhookUrl,
        events: ["account.updated", "payout.paid"],
        connect: true,
      },
    ],
  });

  check(multiWebhooksResponse.response, {
    "configure webhooks: status is 200": (r) => r.status === 200,
    "configure webhooks: returns webhooks array": (r) => {
      const body = r.json() as any;
      return Array.isArray(body?.data?.webhooks);
    },
    "configure webhooks: has 2 webhooks": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.length === 2;
    },
    "configure webhooks: account webhook has correct connect value": (r) => {
      const body = r.json() as any;
      const accountWebhook = body?.data?.webhooks?.find(
        (w: any) => w.id === "account_events"
      );
      return accountWebhook?.connect === false;
    },
    "configure webhooks: connect webhook has connect true": (r) => {
      const body = r.json() as any;
      const connectWebhook = body?.data?.webhooks?.find(
        (w: any) => w.id === "connect_events"
      );
      return connectWebhook?.connect === true;
    },
    "configure webhooks: all webhooks have secrets": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.every(
        (w: any) => w.secret && w.secret.startsWith("whsec_")
      );
    },
    "configure webhooks: all webhooks have stripe_id": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.every((w: any) => w.stripe_id !== undefined);
    },
  });

  // Step 5: Verify idempotency - same config should return "unchanged"
  const idempotentResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "account_events",
        url: webhookUrl,
        events: ["invoice.paid", "charge.succeeded"],
        connect: false,
      },
      {
        id: "connect_events",
        url: connectWebhookUrl,
        events: ["account.updated", "payout.paid"],
        connect: true,
      },
    ],
  });

  check(idempotentResponse.response, {
    "idempotent webhooks: status is 200": (r) => r.status === 200,
    "idempotent webhooks: actions are unchanged": (r) => {
      const body = r.json() as any;
      return body?.data?.webhooks?.every((w: any) => w.action === "unchanged");
    },
  });

  return {
    webhook_created: true,
    stripe_id: webhookData?.stripe_id,
  };
}

/**
 * Test Scenario: Webhook Validation Errors
 *
 * Tests that the API properly validates webhook requests:
 * - Missing URL
 * - Empty events array
 * - Duplicate webhook IDs
 */
export function webhookValidationErrors() {
  // Test: Missing URL
  const missingUrlResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "test",
        url: "",
        events: ["invoice.paid"],
      },
    ],
  } as any);

  check(missingUrlResponse.response, {
    "missing url: returns 400": (r) => r.status === 400,
  });

  // Test: Empty events array
  const emptyEventsResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "test",
        url: "https://example.com/webhook",
        events: [],
      },
    ],
  } as any);

  check(emptyEventsResponse.response, {
    "empty events: returns 400": (r) => r.status === 400,
  });

  // Test: Multiple webhooks with duplicate IDs
  const duplicateIdsResponse = client.configureWebhooks({
    webhooks: [
      {
        id: "same_id",
        url: "https://example.com/webhook1",
        events: ["invoice.paid"],
      },
      {
        id: "same_id",
        url: "https://example.com/webhook2",
        events: ["charge.succeeded"],
      },
    ],
  });

  check(duplicateIdsResponse.response, {
    "duplicate ids: returns 400": (r) => r.status === 400,
  });

  return {
    validation_tested: true,
  };
}

export default function () {
  webhookConfigLifecycle();
  webhookValidationErrors();
}

import { check } from "k6";
import { createClient, SERVICE_KEY } from "../client";

/**
 * Test Scenario: Invoice Lifecycle
 *
 * Tests the invoice management endpoints (service key auth required):
 * 1. Create invoice (requires X-Tenant-Id or X-Stripe-Customer-Id)
 * 2. Get invoice by ID
 * 3. Update invoice description/metadata
 * 4. Add line items to draft invoice (requires X-Tenant-Id or X-Stripe-Customer-Id)
 * 5. Finalize invoice for sending
 */
export async function invoiceLifecycle() {
  const timestamp = Date.now();
  const email = `test-invoice-${timestamp}@example.com`;
  const password = crypto.randomUUID();
  const client = createClient();

  // Step 1: Create user
  const authResponse = client.createUser({
    email,
    password,
    name: { first: "Test", last: "Invoice" },
  });

  check(authResponse.response, {
    "create user: status is 200": (r) => r.status === 200,
  });

  const user = authResponse.data.data;
  if (!user) {
    console.error("User creation failed");
    return;
  }

  // Step 2: Create tenant with billing_email (triggers Stripe customer creation)
  const tenantResponse = client.createTenant(
    { name: `Invoice Test Org ${timestamp}`, billing_email: email },
    { "X-User-Id": user.id }
  );

  check(tenantResponse.response, {
    "create tenant: status is 200": (r) => r.status === 200,
  });

  const tenantData = tenantResponse.data.data;
  if (!tenantData?.tenant) {
    console.error("Tenant creation failed");
    return;
  }

  const tenant = tenantData.tenant;

  check(tenant, {
    "tenant: has stripe_customer_id": (t) => {
      return (
        t.stripe_customer_id !== null && t.stripe_customer_id !== undefined
      );
    },
  });

  if (!tenant.stripe_customer_id) {
    console.error("Stripe customer ID not created");
    return;
  }

  // Step 3: Create a draft invoice using our API
  // Requires X-Service-Key + X-Tenant-Id to look up stripe_customer_id
  const createInvoiceResponse = client.createInvoice(
    {
      currency: "usd",
      auto_advance: false,
      description: `Test invoice ${timestamp}`,
      metadata: { test_run: `${timestamp}` },
    },
    { "X-Service-Key": SERVICE_KEY, "X-Tenant-Id": tenant.id }
  );

  check(createInvoiceResponse.response, {
    "create invoice: status is 200": (r) => r.status === 200,
    "create invoice: returns invoice id": (r) => {
      const body = r.json() as any;
      return body?.data?.id !== undefined && body?.data?.id.startsWith("in_");
    },
    "create invoice: status is draft": (r) => {
      const body = r.json() as any;
      return body?.data?.status === "draft";
    },
  });

  const invoiceData = createInvoiceResponse.data.data;
  if (!invoiceData?.id) {
    console.error("Failed to create invoice");
    return;
  }

  const invoiceId = invoiceData.id;

  // Step 4: Test GET invoice endpoint
  const getInvoiceResponse = client.getInvoice(invoiceId, {
    "X-Service-Key": SERVICE_KEY,
  });

  check(getInvoiceResponse.response, {
    "get invoice: status is 200": (r) => r.status === 200,
    "get invoice: returns correct id": (r) => {
      const body = r.json() as any;
      return body?.data?.id === invoiceId;
    },
    "get invoice: status is draft": (r) => {
      const body = r.json() as any;
      return body?.data?.status === "draft";
    },
    "get invoice: has customer_id": (r) => {
      const body = r.json() as any;
      return body?.data?.customer_id === tenant.stripe_customer_id;
    },
  });

  // Step 5: Test UPDATE invoice endpoint
  const updateInvoiceResponse = client.updateInvoice(
    invoiceId,
    {
      description: "Test invoice description",
      metadata: {
        test_key: "test_value",
        order_id: `order_${timestamp}`,
      },
    },
    { "X-Service-Key": SERVICE_KEY }
  );

  check(updateInvoiceResponse.response, {
    "update invoice: status is 200": (r) => r.status === 200,
    "update invoice: returns invoice id": (r) => {
      const body = r.json() as any;
      return body?.data?.id === invoiceId;
    },
  });

  // Step 6: Test ADD LINE ITEM endpoint (requires X-Tenant-Id for stripe_customer_id lookup)
  const addLineItemResponse = client.addInvoiceLineItem(
    invoiceId,
    {
      amount: 1500,
      description: "Platform fee",
      currency: "usd",
    },
    { "X-Service-Key": SERVICE_KEY, "X-Tenant-Id": tenant.id }
  );

  check(addLineItemResponse.response, {
    "add line item: status is 200": (r) => r.status === 200,
    "add line item: returns item id": (r) => {
      const body = r.json() as any;
      return body?.data?.id !== undefined && body?.data?.id.startsWith("ii_");
    },
    "add line item: correct amount": (r) => {
      const body = r.json() as any;
      return body?.data?.amount === 1500;
    },
    "add line item: correct description": (r) => {
      const body = r.json() as any;
      return body?.data?.description === "Platform fee";
    },
  });

  // Step 7: Add another line item to verify multiple items work
  const addSecondLineItemResponse = client.addInvoiceLineItem(
    invoiceId,
    {
      amount: 500,
      description: "Service charge",
      currency: "usd",
    },
    { "X-Service-Key": SERVICE_KEY, "X-Tenant-Id": tenant.id }
  );

  check(addSecondLineItemResponse.response, {
    "add second line item: status is 200": (r) => r.status === 200,
    "add second line item: correct amount": (r) => {
      const body = r.json() as any;
      return body?.data?.amount === 500;
    },
  });

  // Step 8: Test FINALIZE invoice endpoint
  const finalizeResponse = client.finalizeInvoice(
    invoiceId,
    { auto_advance: false },
    { "X-Service-Key": SERVICE_KEY }
  );

  check(finalizeResponse.response, {
    "finalize invoice: status is 200": (r) => r.status === 200,
    "finalize invoice: status changed to open": (r) => {
      const body = r.json() as any;
      return body?.data?.status === "open";
    },
    "finalize invoice: has correct total": (r) => {
      const body = r.json() as any;
      return body?.data?.amount_due === 2000; // 1500 + 500
    },
  });

  // Step 9: Verify final state
  const verifyResponse = client.getInvoice(invoiceId, {
    "X-Service-Key": SERVICE_KEY,
  });

  check(verifyResponse.response, {
    "verify: invoice is finalized": (r) => {
      const body = r.json() as any;
      return body?.data?.status === "open";
    },
    "verify: has hosted_invoice_url": (r) => {
      const body = r.json() as any;
      return (
        body?.data?.hosted_invoice_url !== undefined &&
        body?.data?.hosted_invoice_url !== ""
      );
    },
  });

  // Step 10: Test error case - cannot update finalized invoice
  const updateFinalizedResponse = client.updateInvoice(
    invoiceId,
    { description: "Should fail" },
    { "X-Service-Key": SERVICE_KEY }
  );

  check(updateFinalizedResponse.response, {
    "update finalized invoice: returns error (400)": (r) => r.status === 400,
  });

  return {
    user: user,
    tenant: tenant,
    invoice_id: invoiceId,
    invoice_tested: true,
  };
}

export default function () {
  invoiceLifecycle();
}

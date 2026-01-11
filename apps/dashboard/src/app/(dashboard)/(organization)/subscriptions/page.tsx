import { PricingTable } from "@omnibase/shadcn";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import { CustomerPortalButton } from "./customer-portal-button";
import { getOmnibaseConfiguration } from "@/lib/server";
import { V1PaymentsApi, V1StripeApi, V1TenantsApi } from "@omnibase/core-js";

async function createCustomerPortal() {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1PaymentsApi(config);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}`;

  const { data: portal } = await client.createCustomerPortal({
    createPortalRequest: {
      returnUrl: currentUrl,
    },
  });

  if (!portal?.url) return;
  redirect(portal.url);
}

async function createCheckout(id: string) {
  "use server";
  const config = await getOmnibaseConfiguration();
  const client = new V1PaymentsApi(config);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}`;

  const { data } = await client.createCheckout({
    createCheckoutRequest: {
      priceId: id,
      successUrl: `${currentUrl}/subscriptions?success=true`,
      cancelUrl: `${currentUrl}/subscriptions`,
      trialPeriodDays: 14,
      allowPromotionCodes: true,
    },
  });

  if (!data) return;
  redirect(data.url!);
}

export default async function Page() {
  const config = await getOmnibaseConfiguration();
  const tenantClient = new V1TenantsApi(config);
  const stripeClient = new V1StripeApi(config);

  const { data: configData } = await stripeClient.getStripeConfig();
  if (!configData) {
    throw new Error("Failed to fetch Stripe config");
  }
  const products = configData.config.products;

  const { data: subscriptions } = await tenantClient.listTenantSubscriptions();

  let active_subscription_id = undefined;

  if (subscriptions && subscriptions?.length > 0) {
    active_subscription_id = subscriptions[0].configPriceId;
  }

  return (
    <div className="my-8 mx-16">
      <div className="mb-16 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plans and billing details
          </p>
        </div>
        <form action={createCustomerPortal}>
          <CustomerPortalButton />
        </form>
      </div>
      {products.length !== 0 && (
        <PricingTable
          // TODO: Fix `as any` type
          products={products as any}
          selectedPriceId={active_subscription_id}
          showPricingToggle
          className="scale-[95%]"
          onPriceSelect={createCheckout}
        />
      )}
    </div>
  );
}

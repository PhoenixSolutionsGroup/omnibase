import { PricingTable } from "@omnibase/shadcn";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import { CustomerPortalButton } from "./customer-portal-button";
import {
  createPaymentsServerClient,
  createStripeServerClient,
  createTenantsServerClient,
} from "@/lib/server";

async function createCustomerPortal() {
  "use server";
  const payments = await createPaymentsServerClient();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}`;

  const { data: portal } = await payments.createCustomerPortal({
    request: {
      returnUrl: currentUrl,
    },
  });

  if (!portal?.url) return;
  redirect(portal.url);
}

async function createCheckout(id: string) {
  "use server";
  const payments = await createPaymentsServerClient();

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}`;

  const { data } = await payments.createCheckout({
    request: {
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
  const tenants = await createTenantsServerClient();
  const stripe = await createStripeServerClient();

  const { data: configData } = await stripe.getStripeConfig();
  if (!configData) {
    throw new Error("Failed to fetch Stripe config");
  }
  const products = configData.config.products;

  const { data: subscriptions } = await tenants.listTenantSubscriptions();

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
          products={products}
          selectedPriceId={active_subscription_id}
          showPricingToggle
          className="scale-[95%]"
          onPriceSelect={createCheckout}
        />
      )}
    </div>
  );
}

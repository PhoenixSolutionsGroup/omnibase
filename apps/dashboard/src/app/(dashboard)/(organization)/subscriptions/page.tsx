import { omnibase } from "@/lib/server";
import { PricingTable } from "@omnibase/shadcn";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import React from "react";
import { CustomerPortalButton } from "./customer-portal-button";

export default async function Page() {
  const products = await omnibase.payments.config.getAvailableProducts();
  const { data } = await omnibase.tenants.subscriptions.getActive();

  const active_subscription_id = data?.[0].config_price_id;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto");
  const currentUrl = `${protocol}://${host}`;

  return (
    <div className="my-8 mx-16">
      <div className="mb-16 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plans and billing details
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            const portal = await omnibase.payments.portal.create({
              return_url: currentUrl,
            });
            if (!portal.data?.url) return;
            redirect(portal.data.url);
          }}
        >
          <CustomerPortalButton />
        </form>
      </div>
      {products.length !== 0 && (
        <PricingTable
          products={products}
          selectedPriceId={active_subscription_id}
          showPricingToggle
          className="scale-[95%]"
          onPriceSelect={async (id) => {
            "use server";
            const { data } = await omnibase.payments.checkout.createSession({
              price_id: id,
              success_url: `${currentUrl}/subscriptions?success=true`,
              cancel_url: `${currentUrl}/subscriptions`,
              trial_period_days: 14,
              allow_promotion_codes: true,
            });
            if (!data) return;
            redirect(data.url);
          }}
        />
      )}
    </div>
  );
}

"use client";

import { PricingTable, PricingTableProps } from "@omnibase/shadcn";
import React from "react";
import { omnibase } from "../../lib/omnibase";
import { redirect } from "next/navigation";

export default function PricingTableClient(props: PricingTableProps) {
  return (
    <PricingTable
      showPricingToggle
      onPriceSelect={(price) => {
        console.log("Here");
        omnibase.payments.checkout
          .createSession({
            price_id: price,
            cancel_url: "http://127.0.0.1:3000?success=false",
            success_url: "http://127.0.0.1:3000?success=true",
          })
          .then((res) => {
            console.log(res);
            if (res.data?.url) window.location.href = res.data.url;
          })
          .catch((err) => redirect("/auth/registration"));
      }}
      {...props}
    />
  );
}

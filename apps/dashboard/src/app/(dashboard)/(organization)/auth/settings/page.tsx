import { getSettingsFlow } from "@omnibase/nextjs/auth";
import { SettingsForm } from "@omnibase/shadcn";
import React from "react";

export default async function page({ searchParams }: any) {
  const flow = await getSettingsFlow({ searchParams, url: "/auth/settings" });
  if (!flow) return null;
  return (
    <div className="my-8">
      <SettingsForm flow={flow} />
    </div>
  );
}

"use server";

import { getOmnibaseConfiguration } from "@/lib/server";
import { V1TenantsLifecycleApi } from "@omnibase/core-js";
import { revalidatePath } from "next/cache";

export async function switchTenant(formData: FormData) {
  const tenantId = formData.get("tenant_id") as string;

  if (!tenantId) {
    return { success: false, error: "Tenant ID is required" };
  }

  const config = await getOmnibaseConfiguration();
  const tenantsApi = new V1TenantsLifecycleApi(config);

  try {
    await tenantsApi.switchActiveTenant({
      switchActiveRequest: { tenantId },
    });

    revalidatePath("/", "page");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to switch tenant" };
  }
}

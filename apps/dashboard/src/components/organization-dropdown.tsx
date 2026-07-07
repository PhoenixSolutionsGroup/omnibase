"use client";

import * as React from "react";
import { SwitchActiveTenant } from "@omnibase/shadcn";
import type { GetTenantByIDRow as Tenant } from "@omnibase/core-js";

interface OrganizationDropdownProps {
  tenants?: Tenant[];
  currentTenantId?: string;
  currentOrganization?: string;
  onTenantChange?: (tenantId: string) => void;
  formAction?: (formData: FormData) => void | Promise<void>;
  onCreateTenant?: () => void;
  createTenantLabel?: string;
}

export function OrganizationDropdown({
  tenants = [],
  currentTenantId,
  currentOrganization,
  onTenantChange,
  formAction,
  onCreateTenant,
  createTenantLabel,
}: OrganizationDropdownProps) {
  if (tenants.length === 0 && currentOrganization) {
    return (
      <span className="px-2 py-1 text-sm font-medium">
        {currentOrganization}
      </span>
    );
  }

  return (
    <SwitchActiveTenant
      tenants={tenants}
      currentTenantId={currentTenantId}
      onTenantChange={onTenantChange}
      formAction={formAction}
      placeholder="Select organization..."
      className="w-fit border-none bg-transparent shadow-none hover:bg-accent"
      // TODO: Uncomment after publishing @omnibase/shadcn with onCreateTenant support
      // onCreateTenant={onCreateTenant}
      // createTenantLabel={createTenantLabel}
    />
  );
}

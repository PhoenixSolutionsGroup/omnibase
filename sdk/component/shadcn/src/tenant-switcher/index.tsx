import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GetTenantByIDRow as Tenant } from "@omnibase/core-js";

const CREATE_TENANT_VALUE = "__create_tenant__";

export interface SwitchActiveTenantProps {
  /** Array of tenants available to the user */
  tenants: Tenant[];
  /** Currently active tenant ID */
  currentTenantId?: string;
  /** Custom form action to handle tenant switching */
  formAction?: (formData: FormData) => void | Promise<void>;
  /** Placeholder text when no tenant is selected */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback fired when tenant selection changes */
  onTenantChange?: (tenantId: string) => void;
  /** Callback fired when "Create Tenant" is clicked */
  onCreateTenant?: () => void;
  /** Label for the create tenant option */
  createTenantLabel?: string;
}

/**
 * SwitchActiveTenant Component
 *
 * A dropdown component that allows users to switch between different tenants.
 * When a tenant is selected, it triggers a form action with the tenant_id in form data.
 *
 * @param tenants - Array of available tenants
 * @param currentTenantId - Currently active tenant ID
 * @param formAction - Custom form action handler
 * @param placeholder - Placeholder text for the select
 * @param className - Additional CSS classes
 * @param onTenantChange - Callback for tenant changes
 * @param onCreateTenant - Callback for creating a new tenant
 * @param createTenantLabel - Label for the create tenant option
 */
export function SwitchActiveTenant({
  tenants,
  currentTenantId,
  formAction,
  placeholder = "Select tenant...",
  className,
  onTenantChange,
  onCreateTenant,
  createTenantLabel = "Create Tenant",
}: SwitchActiveTenantProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTenantChange = async (value: string) => {
    if (value === CREATE_TENANT_VALUE) {
      onCreateTenant?.();
      return;
    }

    if (value === currentTenantId) return;

    setIsLoading(true);

    try {
      onTenantChange?.(value);

      if (formAction) {
        const formData = new FormData();
        formData.append("tenant_id", value);
        await formAction(formData);
      }
    } catch (error) {
      console.error("Failed to switch tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTenant = tenants.find((tenant) => tenant.id === currentTenantId);

  return (
    <Select
      value={currentTenantId}
      onValueChange={handleTenantChange}
      disabled={isLoading}
    >
      <SelectTrigger className={cn("max-w-64", className)}>
        <SelectValue placeholder={placeholder}>
          {currentTenant ? currentTenant.name : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
        {onCreateTenant && (
          <>
            <SelectSeparator />
            <SelectItem value={CREATE_TENANT_VALUE}>
              {createTenantLabel}
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}

export default SwitchActiveTenant;

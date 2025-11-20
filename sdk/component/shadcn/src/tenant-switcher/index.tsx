import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ModelsTenant } from "@omnibase/core-js";

export interface SwitchActiveTenantProps {
  /** Array of tenants available to the user */
  tenants: ModelsTenant[];
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
 */
export function SwitchActiveTenant({
  tenants,
  currentTenantId,
  formAction,
  placeholder = "Select tenant...",
  className,
  onTenantChange,
}: SwitchActiveTenantProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleTenantChange = async (tenantId: string) => {
    if (tenantId === currentTenantId) return;

    setIsLoading(true);

    try {
      // Call the onTenantChange callback if provided
      onTenantChange?.(tenantId);

      // If a custom form action is provided, use it
      if (formAction) {
        const formData = new FormData();
        formData.append("tenant_id", tenantId);
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
      </SelectContent>
    </Select>
  );
}

export default SwitchActiveTenant;

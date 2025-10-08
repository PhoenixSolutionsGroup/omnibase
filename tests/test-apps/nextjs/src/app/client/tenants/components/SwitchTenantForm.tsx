import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface SwitchTenantFormProps {
  tenantId: string;
  isLoading: boolean;
  onTenantIdChange: (value: string) => void;
  onSubmit: () => void;
}

export function SwitchTenantForm({
  tenantId,
  isLoading,
  onTenantIdChange,
  onSubmit,
}: SwitchTenantFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Switch Active Tenant
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Tenant ID"
          value={tenantId}
          onChange={onTenantIdChange}
          placeholder="tenant_123"
        />
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Switching..." : "Switch Tenant"}
        </Button>
      </div>
    </div>
  );
}

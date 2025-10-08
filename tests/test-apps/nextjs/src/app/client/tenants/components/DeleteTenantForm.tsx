import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface DeleteTenantFormProps {
  tenantId: string;
  isLoading: boolean;
  onTenantIdChange: (value: string) => void;
  onSubmit: () => void;
}

export function DeleteTenantForm({
  tenantId,
  isLoading,
  onTenantIdChange,
  onSubmit,
}: DeleteTenantFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        5. Delete Tenant (Owner Only)
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Tenant ID"
          value={tenantId}
          onChange={onTenantIdChange}
          placeholder="tenant_123"
        />
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          variant="destructive"
          className="w-full"
        >
          {isLoading ? "Deleting..." : "Delete Tenant"}
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface CreateTenantFormProps {
  name: string;
  email: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export function CreateTenantForm({
  name,
  email,
  isLoading,
  onNameChange,
  onEmailChange,
  onSubmit,
}: CreateTenantFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Create Tenant
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Tenant Name"
          value={name}
          onChange={onNameChange}
          placeholder="e.g., Acme Corporation"
        />
        <FormInput
          label="Billing Email"
          value={email}
          onChange={onEmailChange}
          placeholder="billing@acme.com"
          type="email"
        />
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create Tenant"}
        </Button>
      </div>
    </div>
  );
}

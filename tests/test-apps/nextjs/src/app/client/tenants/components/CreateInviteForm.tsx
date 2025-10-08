import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface CreateInviteFormProps {
  tenantId: string;
  email: string;
  role: string;
  isLoading: boolean;
  onTenantIdChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onSubmit: () => void;
}

export function CreateInviteForm({
  tenantId,
  email,
  role,
  isLoading,
  onTenantIdChange,
  onEmailChange,
  onRoleChange,
  onSubmit,
}: CreateInviteFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Create Tenant Invite
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Tenant ID"
          value={tenantId}
          onChange={onTenantIdChange}
          placeholder="tenant_123"
        />
        <FormInput
          label="Email"
          value={email}
          onChange={onEmailChange}
          placeholder="user@example.com"
          type="email"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create Invite"}
        </Button>
      </div>
    </div>
  );
}

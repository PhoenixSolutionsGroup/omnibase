"use client";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";

interface CreateInviteFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
  tenant_id: string;
}

export function CreateInviteForm({ action, tenant_id }: CreateInviteFormProps) {
  const [state, formAction] = useActionState(action, null);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Create Tenant Invite
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="invite-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="invite-role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Role
          </label>
          <select
            id="invite-role"
            name="role"
            defaultValue="member"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <Button type="submit" className="w-full">
          Create Invite
        </Button>
      </form>
    </div>
  );
}

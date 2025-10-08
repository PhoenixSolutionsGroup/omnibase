"use client";
import { Button } from "@/components/ui/button";

import { useActionState } from "react";

interface SwitchTenantFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function SwitchTenantForm({ action }: SwitchTenantFormProps) {
  const [state, formAction] = useActionState(action, null);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Switch Active Tenant
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="tenant_id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tenant ID
          </label>
          <input
            id="tenant_id"
            name="tenant_id"
            type="text"
            required
            placeholder="tenant_123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full">
          Switch Tenant
        </Button>
      </form>
    </div>
  );
}

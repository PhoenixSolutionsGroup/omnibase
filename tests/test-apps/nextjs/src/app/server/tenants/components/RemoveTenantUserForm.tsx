"use client";

import { Button } from "@/components/ui/button";
import { useActionState } from "react";

interface RemoveTenantUserFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function RemoveTenantUserForm({ action }: RemoveTenantUserFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        6. Remove User
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="delete-tenant-id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            User ID
          </label>
          <input
            id="remove-user-id"
            name="user_id"
            type="text"
            required
            placeholder="user_123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" variant="destructive" className="w-full">
          Remove User
        </Button>
      </form>
    </div>
  );
}

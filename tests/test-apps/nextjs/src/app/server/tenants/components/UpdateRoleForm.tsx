"use client";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";

interface UpdateRoleFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function UpdateRoleForm({ action }: UpdateRoleFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        7. Update User Role
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="user-id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            User ID
          </label>
          <input
            id="user-id"
            name="user_id"
            type="text"
            required
            placeholder="user_123"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            required
            placeholder="admin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full">
          Update User Role
        </Button>
      </form>
    </div>
  );
}

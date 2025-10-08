"use client";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";

interface CreateTenantFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function CreateTenantForm({ action }: CreateTenantFormProps) {
  const [state, formAction] = useActionState(action, null);
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Create Tenant
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="tenant-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tenant Name
          </label>
          <input
            id="tenant-name"
            name="name"
            type="text"
            required
            placeholder="e.g., Acme Corporation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="billing-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Billing Email
          </label>
          <input
            id="billing_email"
            name="billing_email"
            type="email"
            required
            placeholder="billing@acme.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full">
          Create Tenant
        </Button>
      </form>
    </div>
  );
}

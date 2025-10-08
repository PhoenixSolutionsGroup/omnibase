"use client";
import { Button } from "@/components/ui/button";
import { useActionState } from "react";

interface AcceptInviteFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function AcceptInviteForm({ action }: AcceptInviteFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        4. Accept Tenant Invite
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="invite-token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Invite Token
          </label>
          <input
            id="invite-token"
            name="token"
            type="text"
            required
            placeholder="Enter invite token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full">
          Accept Invite
        </Button>
      </form>
    </div>
  );
}

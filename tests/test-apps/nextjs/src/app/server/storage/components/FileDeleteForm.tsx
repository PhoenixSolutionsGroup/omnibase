"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

export interface DeleteState {
  success: boolean;
  error?: string;
  message?: string;
  path?: string;
}

interface FileDeleteFormProps {
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;
}

export function FileDeleteForm({ action }: FileDeleteFormProps) {
  const [state, formAction, isPending] = useActionState<DeleteState, FormData>(
    action,
    { success: false }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Delete File
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="delete-path"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            File path to delete
          </label>
          <input
            id="delete-path"
            name="deletePath"
            type="text"
            required
            placeholder="e.g., tenant_123/test/example.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          type="submit"
          variant="destructive"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete File"}
        </Button>
        {state.error && (
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-red-600 mb-1">Error:</p>
            <code className="text-xs text-red-900 break-all">
              {state.error}
            </code>
          </div>
        )}
        {state.success && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-green-600 mb-1">
              {state.message || "File deleted successfully!"}
            </p>
            {state.path && (
              <code className="text-xs text-green-900 break-all">
                {state.path}
              </code>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

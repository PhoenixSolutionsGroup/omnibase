"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";

export interface UploadState {
  success: boolean;
  error?: string;
  message?: string;
  path?: string;
}

interface FileUploadFormProps {
  action: (prevState: UploadState, formData: FormData) => Promise<UploadState>;
}

export function FileUploadForm({ action }: FileUploadFormProps) {
  const [state, formAction, isPending] = useActionState<UploadState, FormData>(
    action,
    { success: false }
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Upload File
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select a file to upload
          </label>
          <input
            id="file-upload"
            name="file"
            type="file"
            required
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload File"}
        </Button>
        {state.error && (
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-red-600 mb-1">Error:</p>
            <code className="text-xs text-red-900 break-all">
              {state.error}
            </code>
          </div>
        )}
        {state.success && state.path && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-green-600 mb-1">
              {state.message || "Uploaded Path:"}
            </p>
            <code className="text-xs text-green-900 break-all">
              {state.path}
            </code>
          </div>
        )}
      </form>
    </div>
  );
}

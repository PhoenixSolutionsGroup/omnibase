"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface DownloadState {
  success: boolean;
  error?: string;
  message?: string;
  downloadUrl?: string;
}

interface FileDownloadFormProps {
  action: (
    prevState: DownloadState,
    formData: FormData
  ) => Promise<DownloadState>;
}

export function FileDownloadForm({ action }: FileDownloadFormProps) {
  const [state, formAction, isPending] = useActionState<
    DownloadState,
    FormData
  >(action, { success: false });

  useEffect(() => {
    if (state.downloadUrl) {
      // Download the file when URL is available
      fetch(state.downloadUrl, {
        credentials: "omit",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Download failed");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "download";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        })
        .catch((err) => {
          console.error("Download error:", err);
        });
    }
  }, [state.downloadUrl]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Download File
      </h2>
      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="download-path"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            File path to download
          </label>
          <input
            id="download-path"
            name="downloadPath"
            type="text"
            required
            placeholder="e.g., tenant_123/test/example.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Generating..." : "Download File"}
        </Button>
        {state.error && (
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-red-600 mb-1">Error:</p>
            <code className="text-xs text-red-900 break-all">
              {state.error}
            </code>
          </div>
        )}
        {state.success && state.downloadUrl && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs text-green-600 mb-1">
              {state.message || "Download URL:"}
            </p>
            <a
              href={state.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 break-all underline"
            >
              {state.downloadUrl}
            </a>
          </div>
        )}
      </form>
    </div>
  );
}

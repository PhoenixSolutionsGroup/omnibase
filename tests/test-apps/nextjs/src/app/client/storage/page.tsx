"use client";

import { useState } from "react";
import { omnibase } from "../../lib/omnibase";
import { PageHeader } from "./components/PageHeader";
import { StatusMessages } from "./components/StatusMessages";
import { FileUploadForm } from "./components/FileUploadForm";
import { FileDownloadForm } from "./components/FileDownloadForm";
import { FileDeleteForm } from "./components/FileDeleteForm";

export default function StoragePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [downloadPath, setDownloadPath] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [deletePath, setDeletePath] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.storage
        .bucket("public")
        .upload(`test/${file.name}`, file, {
          metadata: {
            department: "engineering",
            project: "test-upload",
            tags: ["test", "demo"],
            uploaded_by: "test-user",
          },
        });

      setUploadResult(result.path);
      setSuccess(`✅ File uploaded successfully! Path: ${result.path}`);
      setFile(null);
    } catch (err: any) {
      setError(`❌ Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!downloadPath) {
      setError("Please enter a file path to download");
      return;
    }

    setDownloading(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.storage
        .bucket("public")
        .download(downloadPath);

      // Open download URL in new tab
      const response = await fetch(result.download_url, {
        credentials: "omit", // Don't send cookies
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadPath.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(`✅ Download URL generated! Opening in new tab...`);
    } catch (err: any) {
      setError(`❌ Download failed: ${err.message || "Unknown error"}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePath) {
      setError("Please enter a file path to delete");
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await omnibase.storage.bucket("public").delete(deletePath);
      setSuccess(`✅ File deleted successfully! Path: ${deletePath}`);
      setDeletePath("");
    } catch (err: any) {
      setError(`❌ Delete failed: ${err.message || "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📁 Storage Testing
            </h1>
            <p className="text-gray-600">
              Test file upload, download, delete, and RLS via tenant switching
            </p>
          </div>

          <div className="space-y-6">
            <StatusMessages error={error} success={success} />

            <FileUploadForm
              file={file}
              uploading={uploading}
              uploadResult={uploadResult}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
            />

            <FileDownloadForm
              downloadPath={downloadPath}
              downloading={downloading}
              onDownloadPathChange={setDownloadPath}
              onDownload={handleDownload}
            />

            <FileDeleteForm
              deletePath={deletePath}
              deleting={deleting}
              onDeletePathChange={setDeletePath}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

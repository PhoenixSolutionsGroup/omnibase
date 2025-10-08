import { omnibase } from "../../lib/server";
import { PageHeader } from "./components/PageHeader";
import { StatusMessages } from "./components/StatusMessages";
import { FileUploadForm, UploadState } from "./components/FileUploadForm";
import { FileDownloadForm, DownloadState } from "./components/FileDownloadForm";
import { FileDeleteForm, DeleteState } from "./components/FileDeleteForm";
import { redirect } from "next/navigation";

async function uploadFile(
  prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  "use server";

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Please select a file first",
    };
  }

  try {
    const result = await omnibase.storage
      .bucket("public")
      .upload(`${file.name}`, file);

    return {
      success: true,
      message: "✅ File uploaded successfully!",
      path: result.path,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `❌ Upload failed: ${err.message || "Unknown error"}`,
    };
  }
}

async function downloadFile(
  prevState: DownloadState,
  formData: FormData
): Promise<DownloadState> {
  "use server";

  const downloadPath = formData.get("downloadPath") as string;

  if (!downloadPath) {
    return {
      success: false,
      error: "Please enter a file path to download",
    };
  }

  try {
    const result = await omnibase.storage
      .bucket("public")
      .download(downloadPath);

    return {
      success: true,
      message: "✅ Download URL generated!",
      downloadUrl: result.download_url,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `❌ Download failed: ${err.message || "Unknown error"}`,
    };
  }
}

async function deleteFile(
  prevState: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  "use server";

  const deletePath = formData.get("deletePath") as string;

  if (!deletePath) {
    return {
      success: false,
      error: "Please enter a file path to delete",
    };
  }

  try {
    await omnibase.storage.bucket("public").delete(deletePath);
    return {
      success: true,
      message: `✅ File deleted successfully!`,
      path: deletePath,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `❌ Delete failed: ${err.message || "Unknown error"}`,
    };
  }
}

export default async function StoragePage() {
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
            <FileUploadForm action={uploadFile} />

            <FileDownloadForm action={downloadFile} />

            <FileDeleteForm action={deleteFile} />
          </div>
        </div>
      </main>
    </div>
  );
}

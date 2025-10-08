import { Button } from "@/components/ui/button";

interface FileUploadFormProps {
  file: File | null;
  uploading: boolean;
  uploadResult: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export function FileUploadForm({
  file,
  uploading,
  uploadResult,
  onFileChange,
  onUpload,
}: FileUploadFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Upload File
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select a file to upload
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              cursor-pointer"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        <Button
          onClick={onUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
        {uploadResult && (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Uploaded Path:</p>
            <code className="text-xs text-gray-900 break-all">
              {uploadResult}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

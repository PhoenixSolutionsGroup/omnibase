import { Button } from "@/components/ui/button";

interface FileDownloadFormProps {
  downloadPath: string;
  downloading: boolean;
  onDownloadPathChange: (value: string) => void;
  onDownload: () => void;
}

export function FileDownloadForm({
  downloadPath,
  downloading,
  onDownloadPathChange,
  onDownload,
}: FileDownloadFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Download File
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="download-path"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            File path to download
          </label>
          <input
            id="download-path"
            type="text"
            value={downloadPath}
            onChange={(e) => onDownloadPathChange(e.target.value)}
            placeholder="e.g., tenant_123/test/example.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          onClick={onDownload}
          disabled={!downloadPath || downloading}
          className="w-full"
        >
          {downloading ? "Generating URL..." : "Download File"}
        </Button>
      </div>
    </div>
  );
}

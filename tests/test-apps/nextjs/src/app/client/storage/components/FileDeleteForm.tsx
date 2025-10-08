import { Button } from "@/components/ui/button";

interface FileDeleteFormProps {
  deletePath: string;
  deleting: boolean;
  onDeletePathChange: (value: string) => void;
  onDelete: () => void;
}

export function FileDeleteForm({
  deletePath,
  deleting,
  onDeletePathChange,
  onDelete,
}: FileDeleteFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Delete File
      </h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="delete-path"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            File path to delete
          </label>
          <input
            id="delete-path"
            type="text"
            value={deletePath}
            onChange={(e) => onDeletePathChange(e.target.value)}
            placeholder="e.g., tenant_123/test/example.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          onClick={onDelete}
          disabled={!deletePath || deleting}
          variant="destructive"
          className="w-full"
        >
          {deleting ? "Deleting..." : "Delete File"}
        </Button>
      </div>
    </div>
  );
}

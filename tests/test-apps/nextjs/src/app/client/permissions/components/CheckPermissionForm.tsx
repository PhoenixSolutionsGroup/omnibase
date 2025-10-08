import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";

interface CheckPermissionFormProps {
  namespace: string;
  object: string;
  relation: string;
  subjectId: string;
  isLoading: boolean;
  checkResult: boolean | null;
  onNamespaceChange: (value: string) => void;
  onObjectChange: (value: string) => void;
  onRelationChange: (value: string) => void;
  onSubjectIdChange: (value: string) => void;
  onSubmit: () => void;
}

export function CheckPermissionForm({
  namespace,
  object,
  relation,
  subjectId,
  isLoading,
  checkResult,
  onNamespaceChange,
  onObjectChange,
  onRelationChange,
  onSubjectIdChange,
  onSubmit,
}: CheckPermissionFormProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Check Permission
      </h2>
      <div className="space-y-4">
        <FormInput
          label="Namespace"
          value={namespace}
          onChange={onNamespaceChange}
          placeholder="e.g., Tenant"
        />
        <FormInput
          label="Object (Resource ID)"
          value={object}
          onChange={onObjectChange}
          placeholder="e.g., tenant_123"
        />
        <FormInput
          label="Relation (Permission)"
          value={relation}
          onChange={onRelationChange}
          placeholder="e.g., view, edit, delete, manage_members"
        />
        <FormInput
          label="Subject ID (User ID)"
          value={subjectId}
          onChange={onSubjectIdChange}
          placeholder="e.g., user_456"
        />
        <Button onClick={onSubmit} disabled={isLoading} className="w-full">
          {isLoading ? "Checking..." : "Check Permission"}
        </Button>
        {checkResult !== null && (
          <div
            className={`p-4 rounded-md border ${
              checkResult
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                checkResult ? "text-green-800" : "text-red-800"
              }`}
            >
              {checkResult ? "✅ PERMISSION GRANTED" : "❌ PERMISSION DENIED"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

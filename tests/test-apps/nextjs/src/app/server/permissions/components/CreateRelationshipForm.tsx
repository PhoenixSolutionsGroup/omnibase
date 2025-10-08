"use client";
import { Button } from "@/components/ui/button";
import { FormInput } from "./FormInput";
import { useActionState } from "react";

interface CreateRelationshipFormProps {
  action: (prevState: any, formData: FormData) => Promise<any>;
}

export function CreateRelationshipForm({
  action,
}: CreateRelationshipFormProps) {
  const [state, formAction, ready] = useActionState(action, null);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1. Create Relationship Tuple
      </h2>
      <form action={formAction} className="space-y-4">
        <FormInput
          label="Namespace"
          name="namespace"
          defaultValue="Tenant"
          placeholder="e.g., Tenant"
        />
        <FormInput
          label="Object (Resource ID)"
          name="object"
          defaultValue=""
          placeholder="e.g., tenant_123"
        />
        <FormInput
          label="Relation"
          name="relation"
          defaultValue=""
          placeholder="e.g., owners, admins, members"
        />
        <FormInput
          label="Subject ID (User ID)"
          name="subject_id"
          defaultValue=""
          placeholder="e.g., user_456"
        />
        <Button type="submit" className="w-full">
          Create Relationship
        </Button>
      </form>
    </div>
  );
}

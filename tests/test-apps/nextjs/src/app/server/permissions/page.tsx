import { omnibase } from "../../lib/server";
import { PageHeader } from "./components/PageHeader";
import { StatusMessages } from "./components/StatusMessages";
import { CreateRelationshipForm } from "./components/CreateRelationshipForm";
import { CheckPermissionForm } from "./components/CheckPermissionForm";
import { DeleteRelationshipForm } from "./components/DeleteRelationshipForm";
import { PermissionActionsHandler } from "@omnibase/nextjs/permissions";
import { redirect } from "next/navigation";

const permissions = new PermissionActionsHandler(omnibase);

export default function PermissionsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string; checkResult?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Permissions Testing
            </h1>
            <p className="text-gray-600">
              Test permission checking, relationship tuples, and access control
              via Ory Keto
            </p>
          </div>

          <div className="space-y-6">
            <CreateRelationshipForm
              action={async (prevState, formData) => {
                "use server";
                return permissions.relationship.create(prevState, formData);
              }}
            />

            <CheckPermissionForm
              action={async (prevState, formData) => {
                "use server";

                const namespace = formData.get("namespace") as string;
                const object = formData.get("object") as string;
                const relation = formData.get("relation") as string;
                const subject_id = formData.get("subject_id") as string;

                if (!namespace || !object || !relation || !subject_id) {
                  throw new Error("All form inputs not filled in");
                }

                const result =
                  await omnibase.permissions.permissions.postCheckPermission({
                    postCheckPermissionBody: {
                      namespace,
                      object,
                      relation,
                      subject_id,
                    },
                  });
                redirect(`/server/permissions?allowed=${result.data.allowed}`);
              }}
            />

            <DeleteRelationshipForm
              action={async (prevState, formData) => {
                "use server";
                return permissions.relationship.delete(prevState, formData);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

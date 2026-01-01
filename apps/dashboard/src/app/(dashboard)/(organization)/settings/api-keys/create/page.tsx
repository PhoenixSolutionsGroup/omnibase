import { createTenantsServerClient } from "@/lib/server";
import { getAllProjects } from "@/utils/get-project";
import { CreateAPIKeyForm } from "./create-api-key-form";

export default async function Page() {
  const client = await createTenantsServerClient();

  // Filter definitions to only show permissions that ApiKey can be granted
  const { data: definitionsData } = await client.getRoleDefinitions({
    subject: "ApiKey",
  });
  if (!definitionsData) {
    return null;
  }

  const projects = await getAllProjects();

  const namespaceMap: Record<string, { id: string; label: string }[]> = {
    Project:
      projects?.map((p) => ({
        id: p.id,
        label: p.name,
      })) || [],
  };

  return (
    <div className="flex h-full w-full flex-col items-center my-8 gap-y-8 max-w-3xl mx-auto px-4">
      <CreateAPIKeyForm
        definitions={definitionsData.definitions}
        namespaceMap={namespaceMap}
      />
    </div>
  );
}

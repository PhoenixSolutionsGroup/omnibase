import { getOmnibaseConfiguration } from "@/lib/server";
import { getAllProjects } from "@/utils/get-project";
import { CreateAPIKeyForm } from "./create-api-key-form";
import { V1TenantsRolesApi } from "@omnibase/core-js";

export default async function Page() {
  const config = await getOmnibaseConfiguration();
  const client = new V1TenantsRolesApi(config);
  const definitions = await client.listRoleDefinitions({ subject: "ApiKey" });

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
        definitions={definitions}
        namespaceMap={namespaceMap}
      />
    </div>
  );
}

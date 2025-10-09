import { omnibase, getDb } from "../../lib/server";
import { SwitchActiveTenant } from "@omnibase/shadcn";
import { PageHeader } from "./components/PageHeader";
import { CreateTenantForm } from "./components/CreateTenantForm";
import { SwitchTenantForm } from "./components/SwitchTenantForm";
import { CreateInviteForm } from "./components/CreateInviteForm";
import { AcceptInviteForm } from "./components/AcceptInviteForm";
import { DeleteTenantForm } from "./components/DeleteTenantForm";
import { TenantActionsHandler } from "@omnibase/nextjs/tenants";
import { getServerSession } from "@omnibase/nextjs/auth";
import { RemoveTenantUserForm } from "./components/RemoveTenantUserForm";

const actions = new TenantActionsHandler(omnibase);

export default async function TenantsPage() {
  const session = await getServerSession();

  let tenants: any[] = [];
  let activeTenantId = "";

  try {
    // Query tenant_users and join with tenants
    const db = await getDb();
    const { data, error: fetchError } = await db
      .schema("auth")
      .from("tenant_users").select(`
        is_active,
        tenant:tenant_id (
          id,
          name,
          stripe_customer_id,
          type,
          created_at,
          updated_at
        )
      `);

    if (fetchError) {
      console.error("Error fetching tenants:", fetchError);
    } else {
      // Extract tenants and find active one
      const tenantList =
        data?.map((item: any) => ({
          ...item.tenant,
          is_active: item.is_active,
        })) || [];

      const active = tenantList.find((t: any) => t.is_active);

      tenants = tenantList;
      activeTenantId = active?.id || "";
    }
  } catch (err: any) {
    console.error("Error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageHeader />

      <main className="flex-1 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏢 Tenants Testing
            </h1>
            <p className="text-gray-600">
              Test tenant creation, switching, deletion, and invite management
            </p>
          </div>

          <div className="space-y-6">
            {tenants.length === 0 ? (
              <div className="text-sm text-gray-600">Loading tenants...</div>
            ) : (
              <SwitchActiveTenant
                tenants={tenants}
                currentTenantId={activeTenantId}
                formAction={async (formData) => {
                  "use server";
                  await actions.manage.switch(null, formData);
                }}
              />
            )}

            <CreateTenantForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                formData.set("user_id", session.identity?.id!);
                return actions.manage.create(prevState, formData);
              }}
            />

            <SwitchTenantForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                formData.set("user_id", session.identity?.id!);
                return actions.manage.switch(prevState, formData);
              }}
            />

            <CreateInviteForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                formData.set(
                  "invite_url",
                  process.env.NEXT_PUBLIC_WEBSITE_URL! + "/auth/onboarding"
                );
                return actions.invites.create(prevState, formData);
              }}
              tenant_id={activeTenantId}
            />

            <AcceptInviteForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                return actions.invites.accept(prevState, formData);
              }}
            />

            <DeleteTenantForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                return actions.manage.delete(prevState, formData);
              }}
            />

            <RemoveTenantUserForm
              action={async (prevState: any, formData: FormData) => {
                "use server";
                return actions.user.remove(prevState, formData);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

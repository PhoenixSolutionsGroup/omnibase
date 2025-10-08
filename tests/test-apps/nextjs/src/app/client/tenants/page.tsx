"use client";

import { useState, useEffect } from "react";
import { omnibase, db } from "../../lib/omnibase";
import { SwitchActiveTenant } from "@omnibase/shadcn";
import { PageHeader } from "./components/PageHeader";
import { StatusMessages } from "./components/StatusMessages";
import { CreateTenantForm } from "./components/CreateTenantForm";
import { SwitchTenantForm } from "./components/SwitchTenantForm";
import { CreateInviteForm } from "./components/CreateInviteForm";
import { AcceptInviteForm } from "./components/AcceptInviteForm";
import { DeleteTenantForm } from "./components/DeleteTenantForm";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [creating, setCreating] = useState(false);

  const [switchTenantId, setSwitchTenantId] = useState("");
  const [switching, setSwitching] = useState(false);

  const [deleteTenantId, setDeleteTenantId] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [inviteTenantId, setInviteTenantId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const [acceptToken, setAcceptToken] = useState("");
  const [accepting, setAccepting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      // Query tenant_users and join with tenants
      const { data, error } = await db.schema("auth").from("tenant_users")
        .select(`
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

      if (error) {
        console.error("Error fetching tenants:", error);
        setError(`Failed to fetch tenants: ${error.message}`);
        return;
      }

      // Extract tenants and find active one
      const tenantList =
        data?.map((item: any) => ({
          ...item.tenant,
          is_active: item.is_active,
        })) || [];

      const active = tenantList.find((t: any) => t.is_active);

      setTenants(tenantList);
      setActiveTenantId(active?.id || "");
    } catch (err: any) {
      console.error("Error:", err);
      setError(`Failed to fetch tenants: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    if (!createName || !createEmail) {
      setError("Please fill in all fields");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.tenants.manage.createTenant({
        billing_email: createEmail,
        name: createName,
        user_id: "cd960665-80cc-4a4f-9c0b-ce2731dc0e65",
      });

      if (!result.error) throw new Error("Failed to create tenant");

      const tenant = result.data?.tenant!;
      setSuccess(`✅ Tenant created! ID: ${tenant.id}`);
      setCreateName("");
      setCreateEmail("");
    } catch (err: any) {
      setError(`❌ Create failed: ${err.message || "Unknown error"}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchTenant = async (tenant_id?: string) => {
    if (!switchTenantId && !tenant_id) {
      setError("Please enter a tenant ID");
      return;
    }

    setSwitching(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.tenants.manage.switchActiveTenant(
        switchTenantId! || tenant_id!
      );
      if (result.error) throw new Error(result.error);
      setSuccess(`✅ Switched to tenant: ${switchTenantId}`);
      setSwitchTenantId("");
      // Refresh tenants list after switching
      await fetchTenants();
    } catch (err: any) {
      setError(`❌ Switch failed: ${err.message || "Unknown error"}`);
    } finally {
      setSwitching(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!deleteTenantId) {
      setError("Please enter a tenant ID");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this tenant? This cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.tenants.manage.deleteTenant(deleteTenantId);
      if (result.error) throw new Error(result.error);
      setSuccess(`✅ Tenant deleted: ${deleteTenantId}`);
      setDeleteTenantId("");
    } catch (err: any) {
      setError(`❌ Delete failed: ${err.message || "Unknown error"}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!inviteTenantId || !inviteEmail || !inviteRole) {
      setError("Please fill in all invite fields");
      return;
    }

    setInviting(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.tenants.invites.create(inviteTenantId, {
        email: inviteEmail,
        role: inviteRole,
      });

      if (result.error) throw new Error(result.error);
      setSuccess(
        `✅ Invite created for ${inviteEmail}! Token: ${result.data?.invite.token.substring(
          0,
          20
        )}...`
      );
      setInviteEmail("");
    } catch (err: any) {
      setError(`❌ Invite creation failed: ${err.message || "Unknown error"}`);
    } finally {
      setInviting(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!acceptToken) {
      setError("Please enter an invite token");
      return;
    }

    setAccepting(true);
    setError("");
    setSuccess("");

    try {
      const result = await omnibase.tenants.invites.accept(acceptToken);
      if (result.error) throw new Error(result.error);
      setSuccess(
        `✅ Invite accepted! Joined tenant: ${result.data?.tenant_id}`
      );
      setAcceptToken("");
    } catch (err: any) {
      setError(`❌ Accept failed: ${err.message || "Unknown error"}`);
    } finally {
      setAccepting(false);
    }
  };

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
            {loading ? (
              <div className="text-sm text-gray-600">Loading tenants...</div>
            ) : (
              <SwitchActiveTenant
                tenants={tenants}
                currentTenantId={activeTenantId}
                onTenantChange={(tenantId) => {
                  handleSwitchTenant(tenantId);
                }}
              />
            )}

            <StatusMessages error={error} success={success} />

            <CreateTenantForm
              name={createName}
              email={createEmail}
              isLoading={creating}
              onNameChange={setCreateName}
              onEmailChange={setCreateEmail}
              onSubmit={handleCreateTenant}
            />

            <SwitchTenantForm
              tenantId={switchTenantId}
              isLoading={switching}
              onTenantIdChange={setSwitchTenantId}
              onSubmit={handleSwitchTenant}
            />

            <CreateInviteForm
              tenantId={inviteTenantId}
              email={inviteEmail}
              role={inviteRole}
              isLoading={inviting}
              onTenantIdChange={setInviteTenantId}
              onEmailChange={setInviteEmail}
              onRoleChange={setInviteRole}
              onSubmit={handleCreateInvite}
            />

            <AcceptInviteForm
              token={acceptToken}
              isLoading={accepting}
              onTokenChange={setAcceptToken}
              onSubmit={handleAcceptInvite}
            />

            <DeleteTenantForm
              tenantId={deleteTenantId}
              isLoading={deleting}
              onTenantIdChange={setDeleteTenantId}
              onSubmit={handleDeleteTenant}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

package roles_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRolePermissionPropagation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-prop-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-prop-%s@example.com", id)
	password := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, password)
	tenant := h.CreateTenant(t, client, ownerID, "Role Prop "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, password)

	roleName := fmt.Sprintf("prop_role_%s", id)
	role := h.CreateRole(t, client, ownerID, tenant.Id, roleName, []string{"Tenant#view_users"})

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, roleName)
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("baseline: member has view_users from initial role", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})

	t.Run("baseline: member lacks invite_user before role update", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	h.UpdateRole(t, client, ownerID, tenant.Id, role.Id, []string{"Tenant#view_users", "Tenant#invite_user"})

	t.Run("member gains invite_user after role update", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member retains view_users after role update", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})
}

func TestRolePermissionRevocation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-revoke-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-revoke-%s@example.com", id)
	password := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, password)
	tenant := h.CreateTenant(t, client, ownerID, "Role Revoke "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, password)

	roleName := fmt.Sprintf("revoke_role_%s", id)
	role := h.CreateRole(t, client, ownerID, tenant.Id, roleName, []string{"Tenant#view_users", "Tenant#invite_user"})

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, roleName)
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("baseline: member has invite_user before revocation", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("baseline: member has view_users before revocation", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})

	h.UpdateRole(t, client, ownerID, tenant.Id, role.Id, []string{"Tenant#view_users"})

	t.Run("member loses invite_user after role update", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member retains view_users after role update", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})
}

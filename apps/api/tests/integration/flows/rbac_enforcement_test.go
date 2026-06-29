package flows_test

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRBACEnforcement(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-%s@example.com", id)
	password := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, password)
	tenant := h.CreateTenant(t, client, ownerID, "RBAC Test "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, password)

	restrictedName := fmt.Sprintf("viewer_only_%s", id)
	restrictedRole := h.CreateRole(t, client, ownerID, tenant.Id, restrictedName, []string{"Tenant#view_users"})

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, restrictedName)
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("member has view_users via permission check", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})

	t.Run("member lacks invite_user initially", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member can list users (has permission)", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, memberID, tenant.Id)
		assert.GreaterOrEqual(t, len(users), 2)
	})

	t.Run("member cannot create invite (403)", func(t *testing.T) {
		resp, _ := h.CreateInviteRaw(t, client, memberID, tenant.Id, fmt.Sprintf("another-%s@example.com", id), "member")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("member cannot delete tenant (403)", func(t *testing.T) {
		resp, _ := h.DeleteTenant(t, client, memberID, tenant.Id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	// Grant invite_user
	h.UpdateRole(t, client, ownerID, tenant.Id, restrictedRole.Id, []string{"Tenant#view_users", "Tenant#invite_user"})

	t.Run("member has invite_user after grant", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member can create invite after grant", func(t *testing.T) {
		invite := h.CreateInvite(t, client, memberID, tenant.Id, fmt.Sprintf("invited-%s@example.com", id), "member")
		assert.NotEmpty(t, invite.Token)
	})

	// Revoke invite_user
	h.UpdateRole(t, client, ownerID, tenant.Id, restrictedRole.Id, []string{"Tenant#view_users"})

	t.Run("member lacks invite_user after revoke", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member cannot invite after revoke (403)", func(t *testing.T) {
		resp, _ := h.CreateInviteRaw(t, client, memberID, tenant.Id, fmt.Sprintf("another-invite-%s@example.com", id), "member")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	// Move member to no-effective-permissions role
	noPermName := fmt.Sprintf("no_permissions_%s", id)
	h.CreateRole(t, client, ownerID, tenant.Id, noPermName, []string{"Tenant#placeholder_permission"})

	resp, err := h.UpdateTenantUserRole(t, client, ownerID, tenant.Id, memberID, noPermName)
	require.NoError(t, err)
	require.NotNil(t, resp)
	require.Equal(t, http.StatusOK, resp.StatusCode)

	t.Run("member has no view_users in no-perm role", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})

	t.Run("member has no invite_user in no-perm role", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "invite_user", memberID))
	})

	t.Run("member list users denied (403) in no-perm role", func(t *testing.T) {
		resp, _ := h.ListTenantUsersRaw(t, client, memberID, tenant.Id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
		body := readBody(t, resp)
		msg := strings.ToLower(body)
		assert.True(t, strings.Contains(msg, "permission") || strings.Contains(msg, "forbidden"), "body should mention permission/forbidden: %s", body)
	})
}

func readBody(t *testing.T, resp *http.Response) string {
	t.Helper()
	if resp == nil || resp.Body == nil {
		return ""
	}
	buf := make([]byte, 4096)
	n, _ := resp.Body.Read(buf)
	return string(buf[:n])
}

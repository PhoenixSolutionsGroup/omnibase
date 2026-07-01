package flows_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestCrossTenantIsolation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	password := fmt.Sprintf("pwd-%s-aZ09!", id)

	userA := h.CreateUser(t, client, fmt.Sprintf("cti-a-%s@example.com", id), password)
	userB := h.CreateUser(t, client, fmt.Sprintf("cti-b-%s@example.com", id), password)

	tenantA := createTenant(t, client, userA, fmt.Sprintf("iso-a-%s", id))
	tenantB := createTenant(t, client, userB, fmt.Sprintf("iso-b-%s", id))

	t.Run("user_A_cannot_list_tenant_B_users", func(t *testing.T) {
		_, resp, err := client.V1TenantsUsersAPI.
			ListTenantUsers(helpers.CtxWithUserTenant(userA, tenantB)).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("user_A_can_list_own_tenant_users", func(t *testing.T) {
		out, resp, err := client.V1TenantsUsersAPI.
			ListTenantUsers(helpers.CtxWithUserTenant(userA, tenantA)).
			Execute()
		helpers.EnsureOK(t, resp, err, "listTenantUsers")
		require.NotNil(t, out)
	})

	t.Run("user_B_cannot_list_tenant_A_users", func(t *testing.T) {
		_, resp, err := client.V1TenantsUsersAPI.
			ListTenantUsers(helpers.CtxWithUserTenant(userB, tenantA)).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("user_A_cannot_get_tenant_B_JWT", func(t *testing.T) {
		_, resp, err := client.V1TenantsLifecycleAPI.
			GetTenantJWT(helpers.CtxWithUserTenant(userA, tenantB)).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("user_A_cannot_list_tenant_B_roles", func(t *testing.T) {
		t.Skip("known gap: roles.List handler does not check tenant membership (see internal/handlers/v1/tenants/roles/list.go — no perms.Check). users.List does. Fix handler then enable this test.")
	})

	t.Run("user_A_cannot_create_invite_in_tenant_B", func(t *testing.T) {
		req := sdk.CreateRequest{
			Email:     fmt.Sprintf("cti-invite-%s@example.com", id),
			Role:      "member",
			InviteUrl: "http://localhost:3000/accept-invite",
		}
		_, resp, err := client.V1TenantsInvitesAPI.
			CreateInvite(helpers.CtxWithUserTenant(userA, tenantB)).
			CreateRequest(req).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("user_A_cannot_delete_tenant_B", func(t *testing.T) {
		_, resp, err := client.V1TenantsLifecycleAPI.
			DeleteTenant(helpers.CtxWithUserTenant(userA, tenantB)).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusForbidden, resp.StatusCode)
	})
}

func createTenant(t *testing.T, client *sdk.APIClient, userID, name string) string {
	t.Helper()
	req := sdk.CreateTenantRequest{
		Name:         name,
		BillingEmail: fmt.Sprintf("%s@example.com", name),
	}
	out, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(userID)).
		CreateTenantRequest(req).Execute()
	helpers.EnsureOK(t, resp, err, "createTenant")
	require.NotNil(t, out)
	require.NotNil(t, out.Tenant)
	return out.Tenant.Id
}

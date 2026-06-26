package users_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/integration/helpers"
	h "api/tests/integration/helpers/v1"
	"api/tests/integration/testenv"
)

func TestTenantUsersUpdateRole(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-upd-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-upd-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Users Update "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, pw)

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("owner can change member to admin", func(t *testing.T) {
		resp, err := h.UpdateTenantUserRole(t, client, ownerID, tenant.Id, memberID, "admin")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		users := h.ListTenantUsers(t, client, ownerID, tenant.Id)
		for _, u := range users {
			if u.UserId == memberID {
				assert.Equal(t, "admin", u.Role)
			}
		}
	})

	t.Run("admin lacks update_user_role_to_owner promotes blocked (403)", func(t *testing.T) {
		resp, _ := h.UpdateTenantUserRole(t, client, memberID, tenant.Id, memberID, "owner")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("demoting last owner blocked (400)", func(t *testing.T) {
		resp, _ := h.UpdateTenantUserRole(t, client, ownerID, tenant.Id, ownerID, "member")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("missing target user 404", func(t *testing.T) {
		resp, _ := h.UpdateTenantUserRole(t, client, ownerID, tenant.Id, "00000000-0000-0000-0000-000000000000", "admin")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

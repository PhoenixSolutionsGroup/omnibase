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

func TestTenantUsersDelete(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-del-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-del-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Users Delete "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, pw)

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("removing last owner blocked (400)", func(t *testing.T) {
		resp, _ := h.RemoveTenantUser(t, client, ownerID, tenant.Id, ownerID)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("owner removes member", func(t *testing.T) {
		resp, err := h.RemoveTenantUser(t, client, ownerID, tenant.Id, memberID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		users := h.ListTenantUsers(t, client, ownerID, tenant.Id)
		for _, u := range users {
			assert.NotEqual(t, memberID, u.UserId, "removed member should not appear")
		}
	})

	t.Run("removed member lost view_users", func(t *testing.T) {
		assert.False(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", memberID))
	})

	t.Run("removing non-member 404", func(t *testing.T) {
		resp, _ := h.RemoveTenantUser(t, client, ownerID, tenant.Id, "00000000-0000-0000-0000-000000000000")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

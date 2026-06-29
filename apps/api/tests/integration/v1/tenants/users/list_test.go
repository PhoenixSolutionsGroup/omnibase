package users_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestTenantUsersList(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-list-%s@example.com", id)
	memberEmail := fmt.Sprintf("member-list-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Users List "+id, ownerEmail).Tenant
	memberID := h.CreateUser(t, client, memberEmail, pw)

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("owner lists both users with identity fields populated", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, ownerID, tenant.Id)
		require.Len(t, users, 2)

		emails := map[string]string{}
		roles := map[string]string{}
		for _, u := range users {
			emails[u.UserId] = u.Email
			roles[u.UserId] = u.Role
		}
		assert.Equal(t, ownerEmail, emails[ownerID])
		assert.Equal(t, memberEmail, emails[memberID])
		assert.Equal(t, "owner", roles[ownerID])
		assert.Equal(t, "member", roles[memberID])
	})

	t.Run("member with view_users sees full list", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, memberID, tenant.Id)
		assert.GreaterOrEqual(t, len(users), 2)
	})

	t.Run("member without view_users gets 403", func(t *testing.T) {
		noPerm := fmt.Sprintf("no_view_%s", id)
		h.CreateRole(t, client, ownerID, tenant.Id, noPerm, []string{"Tenant#placeholder_permission"})
		resp, err := h.UpdateTenantUserRole(t, client, ownerID, tenant.Id, memberID, noPerm)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		raw, _ := h.ListTenantUsersRaw(t, client, memberID, tenant.Id)
		require.NotNil(t, raw)
		assert.Equal(t, http.StatusForbidden, raw.StatusCode)
	})
}

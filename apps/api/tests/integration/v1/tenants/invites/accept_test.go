package invites_test

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

func TestInvitesAccept(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-accept-%s@example.com", id)
	invitedEmail := fmt.Sprintf("invited-accept-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Invites Accept "+id, ownerEmail).Tenant
	invitedID := h.CreateUser(t, client, invitedEmail, pw)

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, invitedEmail, "member")
	acceptResp := h.AcceptInvite(t, client, invitedID, invite.Token)

	t.Run("accept returns tenant_id + token", func(t *testing.T) {
		assert.Equal(t, tenant.Id, acceptResp.TenantId)
		assert.NotEmpty(t, acceptResp.Token)
	})

	t.Run("invited user appears in tenant users list", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, invitedID, tenant.Id)
		var invitedSeen bool
		for _, u := range users {
			if u.UserId == invitedID {
				invitedSeen = true
				assert.Equal(t, "member", u.Role)
			}
		}
		assert.True(t, invitedSeen, "invited user present in list")
	})

	t.Run("tenant appears as active in invited user's tenant list", func(t *testing.T) {
		tenants := h.ListUserTenants(t, client, invitedID)
		var found bool
		for _, item := range tenants {
			if item.Tenant.Id == tenant.Id {
				found = true
				assert.True(t, item.IsActive, "joined tenant should be active")
			}
		}
		require.True(t, found, "tenant should appear in invited user's list")
	})

	t.Run("invited user can generate tenant JWT", func(t *testing.T) {
		token := h.GetTenantJWT(t, client, invitedID, tenant.Id)
		assert.NotEmpty(t, token)
	})

	t.Run("invited user gets role permissions (view_users)", func(t *testing.T) {
		assert.True(t, h.CheckTenantPermission(t, client, tenant.Id, "view_users", invitedID))
	})

	t.Run("re-accepting same invite returns 400", func(t *testing.T) {
		resp, _ := h.AcceptInviteRaw(t, client, invitedID, invite.Token)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

func TestInvitesAccept_InvalidToken(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("user-bad-token-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, pw)

	t.Run("garbage token returns 400", func(t *testing.T) {
		resp, _ := h.AcceptInviteRaw(t, client, userID, "not-a-real-token")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

// Email-mismatch enforcement is session-scoped (handler skips check under service-key auth).
// Integration test stack uses X-Service-Key, so this path is currently uncovered by tests.

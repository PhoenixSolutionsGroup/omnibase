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

func TestInvitesCreate(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-create-%s@example.com", id)
	invitedEmail := fmt.Sprintf("invited-create-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Invites Create "+id, ownerEmail).Tenant

	t.Run("owner creates member invite with correct shape", func(t *testing.T) {
		invite := h.CreateInvite(t, client, ownerID, tenant.Id, invitedEmail, "member")
		assert.Equal(t, invitedEmail, invite.Email)
		assert.Equal(t, "member", invite.Role)
		assert.Equal(t, tenant.Id, invite.TenantId)
		assert.Equal(t, ownerID, invite.InviterId)
		assert.NotEmpty(t, invite.Token)
		assert.False(t, invite.ExpiresAt.IsZero(), "expires_at should be set")
		assert.Nil(t, invite.UsedAt, "invite not yet used")
	})

	t.Run("owner creates admin invite", func(t *testing.T) {
		adminEmail := fmt.Sprintf("admin-invitee-%s@example.com", id)
		invite := h.CreateInvite(t, client, ownerID, tenant.Id, adminEmail, "admin")
		assert.Equal(t, "admin", invite.Role)
	})

	t.Run("member without invite_user permission gets 403", func(t *testing.T) {
		memberEmail := fmt.Sprintf("member-noinv-%s@example.com", id)
		memberID := h.CreateUser(t, client, memberEmail, pw)

		joinInvite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
		h.AcceptInvite(t, client, memberID, joinInvite.Token)

		anotherEmail := fmt.Sprintf("another-%s@example.com", id)
		resp, _ := h.CreateInviteRaw(t, client, memberID, tenant.Id, anotherEmail, "member")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})

	t.Run("non-existent tenant returns 403 (no perm tuple)", func(t *testing.T) {
		resp, _ := h.CreateInviteRaw(t, client, ownerID, "00000000-0000-0000-0000-000000000000", invitedEmail, "member")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})
}

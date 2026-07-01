package invites_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestInvites_EmailMismatchRejected(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	ownerEmail := fmt.Sprintf("owner-edge-%s@example.com", id)
	inviteeEmail := fmt.Sprintf("invitee-edge-%s@example.com", id)
	wrongEmail := fmt.Sprintf("wrong-edge-%s@example.com", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Invites Edges "+id, ownerEmail).Tenant

	invite := h.CreateInvite(t, client, ownerID, tenant.Id, inviteeEmail, "member")

	wrongID := h.CreateUser(t, client, wrongEmail, pw)

	resp, _ := h.AcceptInviteRaw(t, client, wrongID, invite.Token)
	require.NotNil(t, resp)
	require.Truef(t, resp.StatusCode == 400 || resp.StatusCode == 403,
		"expected 400 or 403, got %d", resp.StatusCode)
}

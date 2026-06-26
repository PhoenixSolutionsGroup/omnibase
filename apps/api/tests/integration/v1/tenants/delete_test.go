package tenants_test

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

func TestTenantDelete(t *testing.T) {
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
	tenantResp := h.CreateTenant(t, client, ownerID, "Test Tenant "+id, ownerEmail)
	tenant := tenantResp.Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	assert.NotEmpty(t, *tenant.StripeCustomerId, "tenant should have stripe_customer_id before deletion")

	memberID := h.CreateUser(t, client, memberEmail, password)
	invite := h.CreateInvite(t, client, ownerID, tenant.Id, memberEmail, "member")
	h.AcceptInvite(t, client, memberID, invite.Token)

	t.Run("tenant has 2 users before delete", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, ownerID, tenant.Id)
		require.Len(t, users, 2)
		ids := []string{users[0].UserId, users[1].UserId}
		assert.Contains(t, ids, ownerID)
		assert.Contains(t, ids, memberID)
	})

	resp, err := h.DeleteTenant(t, client, ownerID, tenant.Id)
	t.Run("delete tenant returns 200", func(t *testing.T) {
		require.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("owner tenant list omits deleted tenant", func(t *testing.T) {
		tenants := h.ListUserTenants(t, client, ownerID)
		for _, item := range tenants {
			assert.NotEqual(t, tenant.Id, item.Tenant.Id, "deleted tenant should not be in owner list")
		}
	})

	t.Run("member tenant list omits deleted tenant", func(t *testing.T) {
		tenants := h.ListUserTenants(t, client, memberID)
		for _, item := range tenants {
			assert.NotEqual(t, tenant.Id, item.Tenant.Id, "deleted tenant should not be in member list")
		}
	})
}

package tenants_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestCreateTenant_Lifecycle(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("test-%s@example.com", id)
	password := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, password)
	tenantResp := h.CreateTenant(t, client, userID, "Test Organization "+id, email)
	tenant := tenantResp.Tenant

	t.Run("tenant has id", func(t *testing.T) {
		assert.NotEmpty(t, tenant.Id)
	})
	t.Run("tenant has correct name", func(t *testing.T) {
		assert.Equal(t, "Test Organization "+id, tenant.Name)
	})
	t.Run("tenant has stripe customer id", func(t *testing.T) {
		require.NotNil(t, tenant.StripeCustomerId)
		assert.NotEmpty(t, *tenant.StripeCustomerId)
	})
	t.Run("tenant create returns jwt token", func(t *testing.T) {
		assert.NotEmpty(t, tenantResp.Token)
	})

	t.Run("list tenant users contains creator as owner", func(t *testing.T) {
		users := h.ListTenantUsers(t, client, userID, tenant.Id)
		var found bool
		for _, u := range users {
			if u.UserId == userID {
				found = true
				assert.Equal(t, "owner", u.Role)
			}
		}
		assert.True(t, found, "creator should be in tenant users list")
	})

	t.Run("get tenant jwt", func(t *testing.T) {
		token := h.GetTenantJWT(t, client, userID, tenant.Id)
		assert.NotEmpty(t, token)
	})

	t.Run("list tenants contains new tenant as active", func(t *testing.T) {
		tenants := h.ListUserTenants(t, client, userID)
		var found bool
		for _, item := range tenants {
			if item.Tenant.Id == tenant.Id {
				found = true
				assert.True(t, item.IsActive, "new tenant should be active")
			}
		}
		assert.True(t, found, "new tenant should appear in user's tenant list")
	})
}

package flows_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestMultiTenantSwitching(t *testing.T) {
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

	t1Resp := h.CreateTenant(t, client, userID, "Tenant One "+id, email)
	t1 := t1Resp.Tenant

	t2Resp := h.CreateTenant(t, client, userID, "Tenant Two "+id, email)
	t2 := t2Resp.Tenant
	t2Token := t2Resp.Token

	t.Run("both tenants in list", func(t *testing.T) {
		tenants := h.ListUserTenants(t, client, userID)
		require.Len(t, tenants, 2)
		ids := []string{tenants[0].Tenant.Id, tenants[1].Tenant.Id}
		assert.Contains(t, ids, t1.Id)
		assert.Contains(t, ids, t2.Id)
	})

	t.Run("initial state: tenant2 active, tenant1 inactive", func(t *testing.T) {
		assertActive(t, h.ListUserTenants(t, client, userID), t2.Id, true)
		assertActive(t, h.ListUserTenants(t, client, userID), t1.Id, false)
	})

	t1SwitchToken := h.SwitchActiveTenant(t, client, userID, t1.Id)

	t.Run("switch to tenant1 returns different token", func(t *testing.T) {
		assert.NotEmpty(t, t1SwitchToken)
		assert.NotEqual(t, t2Token, t1SwitchToken)
	})

	t.Run("after switch: tenant1 active, tenant2 inactive", func(t *testing.T) {
		assertActive(t, h.ListUserTenants(t, client, userID), t1.Id, true)
		assertActive(t, h.ListUserTenants(t, client, userID), t2.Id, false)
	})

	t.Run("get tenant1 jwt after switch", func(t *testing.T) {
		token := h.GetTenantJWT(t, client, userID, t1.Id)
		assert.NotEmpty(t, token)
	})

	t2SwitchToken := h.SwitchActiveTenant(t, client, userID, t2.Id)

	t.Run("switch back to tenant2 returns different token from tenant1", func(t *testing.T) {
		assert.NotEmpty(t, t2SwitchToken)
		assert.NotEqual(t, t1SwitchToken, t2SwitchToken)
	})

	t.Run("final state: tenant2 active, tenant1 inactive", func(t *testing.T) {
		assertActive(t, h.ListUserTenants(t, client, userID), t2.Id, true)
		assertActive(t, h.ListUserTenants(t, client, userID), t1.Id, false)
	})
}

func assertActive(t *testing.T, list []sdk.UserTenantListItem, tenantID string, want bool) {
	t.Helper()
	for _, item := range list {
		if item.Tenant.Id == tenantID {
			assert.Equal(t, want, item.IsActive, "tenant %s active=%v expected %v", tenantID, item.IsActive, want)
			return
		}
	}
	t.Fatalf("tenant %s not found in list", tenantID)
}

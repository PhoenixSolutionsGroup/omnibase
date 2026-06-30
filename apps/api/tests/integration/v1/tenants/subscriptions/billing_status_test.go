package subscriptions_test

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

func TestGetBillingStatus(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("billing-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Billing "+id, email).Tenant

	t.Run("returns is_active for tenant with stripe customer", func(t *testing.T) {
		out, resp, err := h.GetBillingStatusRaw(t, client, userID, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.NotNil(t, out.IsActive)
	})

	t.Run("missing X-Tenant-Id returns 401", func(t *testing.T) {
		_, resp, _ := h.GetBillingStatusRaw(t, client, userID, "")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("invalid X-Tenant-Id returns 400", func(t *testing.T) {
		_, resp, _ := h.GetBillingStatusRaw(t, client, userID, "not-a-uuid")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

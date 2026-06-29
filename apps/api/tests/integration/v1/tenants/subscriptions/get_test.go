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

func TestGetTenantSubscription(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("sub-get-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Sub Get "+id, email).Tenant

	t.Run("unknown config_price_id returns 404", func(t *testing.T) {
		_, resp, _ := h.GetTenantSubscriptionRaw(t, client, userID, tenant.Id, "definitely_not_a_real_plan_"+id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("missing X-Tenant-Id returns 401", func(t *testing.T) {
		_, resp, _ := h.GetTenantSubscriptionRaw(t, client, userID, "", "some_plan")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("invalid X-Tenant-Id returns 400", func(t *testing.T) {
		_, resp, _ := h.GetTenantSubscriptionRaw(t, client, userID, "not-a-uuid", "some_plan")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

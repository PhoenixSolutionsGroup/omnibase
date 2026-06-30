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

func TestAddSubscription(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("sub-add-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Sub Add "+id, email).Tenant

	t.Run("unmapped plan_id returns 404", func(t *testing.T) {
		_, resp, _ := h.AddSubscriptionRaw(t, client, userID, tenant.Id, "unknown_plan_"+id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("missing X-Tenant-Id returns 401", func(t *testing.T) {
		_, resp, _ := h.AddSubscriptionRaw(t, client, userID, "", "any_plan")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("invalid X-Tenant-Id returns 400", func(t *testing.T) {
		_, resp, _ := h.AddSubscriptionRaw(t, client, userID, "not-a-uuid", "any_plan")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

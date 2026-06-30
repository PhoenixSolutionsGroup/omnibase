package tenants_test

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

func TestTenantLookupByStripe(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("test-lookup-stripe-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Lookup By Stripe "+id, email).Tenant
	require.NotNil(t, tenant.StripeCustomerId)
	stripeID := *tenant.StripeCustomerId

	t.Run("get by stripe customer id returns tenant", func(t *testing.T) {
		out, resp, err := h.GetTenantByStripeCustomerID(t, client, stripeID)
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, tenant.Id, out.Id)
		require.True(t, out.StripeCustomerId.IsSet())
		assert.Equal(t, stripeID, *out.StripeCustomerId.Get())
	})

	t.Run("get by non-existent stripe id returns 404", func(t *testing.T) {
		_, resp, _ := h.GetTenantByStripeCustomerID(t, client, "cus_nonexistent123456")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

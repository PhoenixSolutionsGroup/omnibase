package e2e_test

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

func TestSubscriptionLifecycle(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")
	planID := testenv.FirstConfiguredPlanID(t, sb.Client)

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-sub-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenantResp := h.CreateTenant(t, sb.Client, userID, "E2E Sub "+id, email)
	tenant := tenantResp.Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	require.NotEmpty(t, *tenant.StripeCustomerId, "tenant must have stripe_customer_id")
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		testenv.CancelAllSubscriptions(sb.StripeClient, customerID)
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	testenv.AttachVisaCard(t, sb.StripeClient, customerID)

	t.Run("add subscription", func(t *testing.T) {
		out, resp, err := h.AddSubscriptionRaw(t, sb.Client, userID, tenant.Id, planID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.NotEmpty(t, out.SubscriptionId)
		assert.Contains(t, []string{"active", "trialing"}, out.Status)
	})

	t.Run("get subscription by plan returns same sub", func(t *testing.T) {
		out, resp, err := h.GetTenantSubscriptionRaw(t, sb.Client, userID, tenant.Id, planID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, planID, out.ConfigPriceId)
		assert.NotEmpty(t, out.SubscriptionId)
	})

	t.Run("get unknown plan returns 404", func(t *testing.T) {
		_, resp, _ := h.GetTenantSubscriptionRaw(t, sb.Client, userID, tenant.Id, "non_existent_plan_"+id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("list contains added subscription", func(t *testing.T) {
		out, resp, err := h.ListTenantSubscriptionsRaw(t, sb.Client, userID, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		var found bool
		for _, sub := range out {
			if sub.ConfigPriceId == planID {
				found = true
				break
			}
		}
		assert.True(t, found, "list must contain subscription for planID=%s", planID)
	})

	t.Run("billing status active after payment method attached", func(t *testing.T) {
		out, resp, err := h.GetBillingStatusRaw(t, sb.Client, userID, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.True(t, out.IsActive, "billing should be active after pm_card_visa attached")
	})

	t.Run("remove subscription", func(t *testing.T) {
		out, resp, err := h.RemoveSubscriptionRaw(t, sb.Client, userID, tenant.Id, planID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.NotEmpty(t, out.SubscriptionId)
	})

	t.Run("list after remove no longer shows active sub", func(t *testing.T) {
		out, resp, err := h.ListTenantSubscriptionsRaw(t, sb.Client, userID, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		for _, sub := range out {
			if sub.ConfigPriceId == planID {
				assert.NotEqual(t, "active", sub.Status, "removed sub should not be active")
			}
		}
	})
}

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

func TestEnterprisePricingFetch(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	t.Run("get prices by tier1_10pct_off template", func(t *testing.T) {
		out, resp, err := h.GetEnterprisePricesByTemplateRaw(t, sb.Client, "tier1_10pct_off")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, int32(len(out.Prices)), out.Count)
		assert.GreaterOrEqual(t, len(out.Prices), 2, "fixture defines 2 prices for tier1_10pct_off")
	})

	t.Run("get prices by tier2_25pct_off template", func(t *testing.T) {
		out, resp, err := h.GetEnterprisePricesByTemplateRaw(t, sb.Client, "tier2_25pct_off")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.GreaterOrEqual(t, len(out.Prices), 2)
	})

	t.Run("get prices by enterprise_id acme_corp", func(t *testing.T) {
		out, resp, err := h.GetEnterprisePricesByIDRaw(t, sb.Client, "acme_corp")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.GreaterOrEqual(t, len(out.Prices), 2, "fixture defines 2 prices for acme_corp")
	})

	t.Run("unknown template returns empty list", func(t *testing.T) {
		out, resp, err := h.GetEnterprisePricesByTemplateRaw(t, sb.Client, "definitely_no_such_template")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, int32(0), out.Count)
	})
}

func TestEnterprisePricingApplyTemplate(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")
	planID := testenv.FirstConfiguredPlanID(t, sb.Client)

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-ent-tpl-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Ent Template "+id, email).Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		testenv.CancelAllSubscriptions(sb.StripeClient, customerID)
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	testenv.AttachVisaCard(t, sb.StripeClient, customerID)

	t.Run("subscribe to base price", func(t *testing.T) {
		out, resp, err := h.AddSubscriptionRaw(t, sb.Client, userID, tenant.Id, planID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Contains(t, []string{"active", "trialing"}, out.Status)
	})

	t.Run("apply tier1_10pct_off swaps subscription price", func(t *testing.T) {
		out, resp, err := h.ApplyEnterpriseTemplateRaw(t, sb.Client, tenant.Id, "tier1_10pct_off")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, tenant.Id, out.TenantId)
		assert.GreaterOrEqual(t, out.PricesSwapped, int32(1), "at least one subscription item should be swapped")
	})

	t.Run("tenant record reflects enterprise_template", func(t *testing.T) {
		got, resp, err := h.GetTenantByID(t, sb.Client, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, got)
		require.True(t, got.EnterpriseTemplate.IsSet())
		assert.Equal(t, "tier1_10pct_off", *got.EnterpriseTemplate.Get())
	})
}

func TestEnterprisePricingApplyCustom(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")
	planID := testenv.FirstConfiguredPlanID(t, sb.Client)

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-ent-cust-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Ent Custom "+id, email).Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		testenv.CancelAllSubscriptions(sb.StripeClient, customerID)
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	testenv.AttachVisaCard(t, sb.StripeClient, customerID)

	t.Run("subscribe to base price", func(t *testing.T) {
		out, resp, err := h.AddSubscriptionRaw(t, sb.Client, userID, tenant.Id, planID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
	})

	t.Run("apply acme_corp custom pricing", func(t *testing.T) {
		out, resp, err := h.ApplyEnterpriseCustomRaw(t, sb.Client, tenant.Id, "acme_corp")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, tenant.Id, out.TenantId)
		assert.GreaterOrEqual(t, out.PricesSwapped, int32(1))
	})

	t.Run("tenant record reflects enterprise_id", func(t *testing.T) {
		got, resp, err := h.GetTenantByID(t, sb.Client, tenant.Id)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, got)
		require.True(t, got.EnterpriseId.IsSet())
		assert.Equal(t, "acme_corp", *got.EnterpriseId.Get())
	})
}

func TestEnterprisePricingValidation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	t.Run("apply template to non-existent tenant returns 404", func(t *testing.T) {
		_, resp, _ := h.ApplyEnterpriseTemplateRaw(t, sb.Client, "00000000-0000-0000-0000-000000000000", "tier1_10pct_off")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-ent-val-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Ent Val "+id, email).Tenant
	t.Cleanup(func() {
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	t.Run("apply non-existent template returns 404", func(t *testing.T) {
		_, resp, _ := h.ApplyEnterpriseTemplateRaw(t, sb.Client, tenant.Id, "non_existent_template_"+id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("apply non-existent enterprise_id returns 404", func(t *testing.T) {
		_, resp, _ := h.ApplyEnterpriseCustomRaw(t, sb.Client, tenant.Id, "non_existent_corp_"+id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

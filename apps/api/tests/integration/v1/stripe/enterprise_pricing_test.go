package stripe_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestEnterprisePricing(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	testenv.EnsureStripeConfig(t, client, "example.config.json")

	t.Log("happy-path enterprise apply requires a seeded stripe config with enterprise templates and an active tenant subscription; that setup is deferred and covered only for error/404 paths here")

	t.Run("get_prices_by_template_unknown_returns_empty", func(t *testing.T) {
		out, resp, err := client.V1StripeAPI.GetEnterprisePricesByTemplate(helpers.Ctx(), "nonexistent_template").Execute()
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		require.Empty(t, out.Prices)
		require.Equal(t, int64(0), out.Count)
	})

	t.Run("get_prices_by_id_unknown_returns_empty", func(t *testing.T) {
		out, resp, err := client.V1StripeAPI.GetEnterprisePricesByID(helpers.Ctx(), "nonexistent_enterprise").Execute()
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		require.Empty(t, out.Prices)
		require.Equal(t, int64(0), out.Count)
	})

	t.Run("apply_template_to_invalid_tenant", func(t *testing.T) {
		req := sdk.ApplyEnterpriseTemplateRequest{
			TenantId:           "invalid-uuid",
			EnterpriseTemplate: "tier1_10pct_off",
		}
		_, resp, err := client.V1StripeAPI.ApplyEnterpriseTemplate(helpers.Ctx()).
			ApplyEnterpriseTemplateRequest(req).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Contains(
			t,
			[]int{http.StatusBadRequest, http.StatusNotFound},
			resp.StatusCode,
			"expected 400 or 404 for invalid tenant id",
		)
	})

	t.Run("apply_custom_with_invalid_enterprise_id", func(t *testing.T) {
		id := helpers.UniqueID()
		email := fmt.Sprintf("ent-%s@example.com", id)
		pw := fmt.Sprintf("pwd-%s-aZ09!", id)

		userID := h.CreateUser(t, client, email, pw)
		tenantReq := sdk.CreateTenantRequest{
			Name:         "ent-" + id,
			BillingEmail: email,
			Type:         "organization",
		}
		tenantOut, tenantResp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(userID)).
			CreateTenantRequest(tenantReq).
			Execute()
		helpers.EnsureOK(t, tenantResp, err, "createTenant")
		require.NotNil(t, tenantOut)
		tenantID := tenantOut.Tenant.Id

		req := sdk.ApplyEnterpriseCustomRequest{
			TenantId:     tenantID,
			EnterpriseId: "nonexistent",
		}
		_, resp, err := client.V1StripeAPI.ApplyEnterpriseCustom(helpers.Ctx()).
			ApplyEnterpriseCustomRequest(req).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

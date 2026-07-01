package stripe_config_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	"api/tests/testenv"
)

func TestStripeConfigLookups(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	t.Cleanup(func() { archiveAll(t, sb.Client) })

	t.Run("get_price_by_id_happy", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetPriceByID(helpers.Ctx(), "price_test_base_monthly").Execute()
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, "price_test_base_monthly", out.Price.Id)
		assert.Equal(t, "prod_test_enterprise_base", out.Product.Id)
	})

	t.Run("get_price_by_id_not_found", func(t *testing.T) {
		_, resp, err := sb.Client.V1StripeAPI.GetPriceByID(helpers.Ctx(), "price_does_not_exist").Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("get_product_by_id_happy", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetProductByID(helpers.Ctx(), "prod_test_enterprise_base").Execute()
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, "prod_test_enterprise_base", out.Product.Id)
		assert.NotEmpty(t, out.Product.Prices)
	})

	t.Run("get_product_by_id_not_found", func(t *testing.T) {
		_, resp, err := sb.Client.V1StripeAPI.GetProductByID(helpers.Ctx(), "prod_does_not_exist").Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("get_meter_by_id_happy", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetMeterByID(helpers.Ctx(), "meter_test_api_calls").Execute()
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, "meter_test_api_calls", out.Meter.Id)
		assert.Equal(t, "test_api_call", out.Meter.EventName)
	})

	t.Run("get_meter_by_id_not_found", func(t *testing.T) {
		_, resp, err := sb.Client.V1StripeAPI.GetMeterByID(helpers.Ctx(), "meter_does_not_exist").Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

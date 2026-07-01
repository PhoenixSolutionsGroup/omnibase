package stripe_config_test

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

func loadFixtureAsMap(t *testing.T) map[string]interface{} {
	t.Helper()
	data, err := os.ReadFile(testenv.StripeConfigFixturePath(t, "example.config.json"))
	require.NoError(t, err, "read example.config.json")
	var m map[string]interface{}
	require.NoError(t, json.Unmarshal(data, &m), "parse example.config.json")
	return m
}

func appendPriceToProduct(t *testing.T, cfg map[string]interface{}, productID string, price map[string]interface{}) {
	t.Helper()
	products, ok := cfg["products"].([]interface{})
	require.True(t, ok, "products must be an array")
	for _, p := range products {
		pm, ok := p.(map[string]interface{})
		require.True(t, ok, "product entry must be an object")
		if pm["id"] == productID {
			prices, _ := pm["prices"].([]interface{})
			pm["prices"] = append(prices, price)
			return
		}
	}
	t.Fatalf("product %s not found in fixture", productID)
}

func findAdminPrice(t *testing.T, client *sdk.APIClient, priceID string) sdk.PriceWithStripeID {
	t.Helper()
	out, resp, err := client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	require.NotNil(t, out)
	for _, p := range out.Config.Products {
		for _, pr := range p.Prices {
			if pr.Id == priceID {
				return pr
			}
		}
	}
	t.Fatalf("price %s not found in admin config", priceID)
	return sdk.PriceWithStripeID{}
}

func assertCreatedPrice(t *testing.T, resp *sdk.ConfigResponse, productID, priceID string) {
	t.Helper()
	require.NotNil(t, resp)
	require.NotNil(t, resp.Changes)
	require.NotNil(t, resp.Changes.Products)
	var product *sdk.ProductChange
	for i, p := range resp.Changes.Products.Updated {
		if p.ProductId == productID {
			product = &resp.Changes.Products.Updated[i]
			break
		}
	}
	require.NotNil(t, product, "product %s should appear in changes.products.updated", productID)
	assert.Contains(t, strings.Join(product.Details, "|"), priceID,
		"details should reference added price %s", priceID)
}

func TestStripeConfigTieredPricing(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	t.Cleanup(func() { archiveAll(t, sb.Client) })

	t.Run("create_graduated_tiered_price", func(t *testing.T) {
		suffix := strings.ReplaceAll(helpers.UniqueID(), "-", "_")
		priceID := "price_tiered_grad_" + suffix

		cfg := loadFixtureAsMap(t)
		appendPriceToProduct(t, cfg, "prod_test_tiered_seats", map[string]interface{}{
			"id":             priceID,
			"public":         true,
			"currency":       "usd",
			"interval":       "month",
			"interval_count": 1,
			"billing_scheme": "tiered",
			"tiers_mode":     "graduated",
			"tiers": []map[string]interface{}{
				{"up_to": 100, "unit_amount": 10},
				{"up_to": 500, "unit_amount": 8},
				{"up_to": "inf", "unit_amount": 5},
			},
		})

		out, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(cfg).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		assertCreatedPrice(t, out, "prod_test_tiered_seats", priceID)

		pr := findAdminPrice(t, sb.Client, priceID)
		require.NotNil(t, pr.StripeId)
		assert.NotEmpty(t, *pr.StripeId)
		require.NotNil(t, pr.BillingScheme)
		assert.Equal(t, "tiered", *pr.BillingScheme)
		require.NotNil(t, pr.TiersMode)
		assert.Equal(t, "graduated", *pr.TiersMode)
		require.Len(t, pr.Tiers, 3, "graduated tier count should round-trip")
		require.NotNil(t, pr.Tiers[0].UnitAmount)
		assert.Equal(t, int64(10), *pr.Tiers[0].UnitAmount)
		require.NotNil(t, pr.Tiers[1].UnitAmount)
		assert.Equal(t, int64(8), *pr.Tiers[1].UnitAmount)
		require.NotNil(t, pr.Tiers[2].UnitAmount)
		assert.Equal(t, int64(5), *pr.Tiers[2].UnitAmount)
	})

	t.Run("create_volume_tiered_price", func(t *testing.T) {
		suffix := strings.ReplaceAll(helpers.UniqueID(), "-", "_")
		priceID := "price_tiered_vol_" + suffix

		cfg := loadFixtureAsMap(t)
		appendPriceToProduct(t, cfg, "prod_test_tiered_seats", map[string]interface{}{
			"id":             priceID,
			"public":         true,
			"currency":       "usd",
			"interval":       "month",
			"interval_count": 1,
			"billing_scheme": "tiered",
			"tiers_mode":     "volume",
			"tiers": []map[string]interface{}{
				{"up_to": 100, "unit_amount": 10},
				{"up_to": 500, "unit_amount": 8},
				{"up_to": "inf", "unit_amount": 5},
			},
		})

		out, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(cfg).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		assertCreatedPrice(t, out, "prod_test_tiered_seats", priceID)

		pr := findAdminPrice(t, sb.Client, priceID)
		require.NotNil(t, pr.StripeId)
		assert.NotEmpty(t, *pr.StripeId)
		require.NotNil(t, pr.BillingScheme)
		assert.Equal(t, "tiered", *pr.BillingScheme)
		require.NotNil(t, pr.TiersMode)
		assert.Equal(t, "volume", *pr.TiersMode)
		require.Len(t, pr.Tiers, 3, "volume tier count should round-trip")
	})

	t.Run("tiers_include_infinity_tier", func(t *testing.T) {
		suffix := strings.ReplaceAll(helpers.UniqueID(), "-", "_")
		priceID := "price_tiered_inf_" + suffix

		cfg := loadFixtureAsMap(t)
		appendPriceToProduct(t, cfg, "prod_test_tiered_seats", map[string]interface{}{
			"id":             priceID,
			"public":         true,
			"currency":       "usd",
			"interval":       "month",
			"interval_count": 1,
			"billing_scheme": "tiered",
			"tiers_mode":     "graduated",
			"tiers": []map[string]interface{}{
				{"up_to": 25, "unit_amount": 4200},
				{"up_to": "inf", "unit_amount": 1200},
			},
		})

		_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(cfg).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		pr := findAdminPrice(t, sb.Client, priceID)
		require.Len(t, pr.Tiers, 2, "tier count should include the infinity tier")

		last := pr.Tiers[len(pr.Tiers)-1]
		require.NotNil(t, last.UpTo, "last tier up_to should be present")
		assert.Equal(t, "inf", last.UpTo, "last tier up_to should round-trip as the 'inf' marker")
		require.NotNil(t, last.UnitAmount)
		assert.Equal(t, int64(1200), *last.UnitAmount)

		first := pr.Tiers[0]
		require.NotNil(t, first.UpTo)
		if n, ok := first.UpTo.(float64); ok {
			assert.Equal(t, float64(25), n, "numeric tier up_to should round-trip")
		} else {
			t.Fatalf("expected numeric up_to for first tier, got %T (%v)", first.UpTo, first.UpTo)
		}
	})
}

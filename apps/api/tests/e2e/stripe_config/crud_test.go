package stripe_config_test

import (
	"context"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

func archiveAll(t *testing.T, client *sdk.APIClient) {
	t.Helper()
	_, resp, err := client.V1ConfigurationAPI.ArchiveAllStripeConfig(context.Background()).Execute()
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func configAsMap(t *testing.T, cfg sdk.StripeConfiguration) map[string]interface{} {
	t.Helper()
	data, err := json.Marshal(cfg)
	require.NoError(t, err)
	var m map[string]interface{}
	require.NoError(t, json.Unmarshal(data, &m))
	return m
}

func TestStripeConfigCRUD(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "")

	t.Cleanup(func() { archiveAll(t, sb.Client) })

	t.Run("create simple config returns changes.created", func(t *testing.T) {
		archiveAll(t, sb.Client)

		desc := "Created by CRUD test " + helpers.UniqueID()
		productType := "service"
		month := "month"
		usd := "usd"
		amount := float64(1000)
		cfg := sdk.StripeConfiguration{
			Version: "v1.0.0",
			Products: []sdk.Product{
				{
					Id:          "test_product_crud",
					Name:        "CRUD Test Product",
					Description: &desc,
					Type:        &productType,
					Prices: []sdk.Price{
						{
							Id:            "test_price_crud_monthly",
							Amount:        &amount,
							Currency:      usd,
							Interval:      &month,
							IntervalCount: ptrInt64(1),
						},
					},
				},
			},
		}
		out, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(configAsMap(t, cfg)).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Products)
		assert.GreaterOrEqual(t, len(out.Changes.Products.Created), 1, "expected at least one created product")

		var found bool
		for _, c := range out.Changes.Products.Created {
			if c.ProductId == "test_product_crud" {
				found = true
				assert.Equal(t, "created", c.Action)
				assert.NotNil(t, c.StripeId, "newly-created product should have stripe_id")
			}
		}
		assert.True(t, found, "test_product_crud should be in changes.created")
	})

	t.Run("admin config returns product with stripe_id mapping", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)

		var found bool
		for _, p := range out.Config.Products {
			if p.Id == "test_product_crud" {
				found = true
				require.NotNil(t, p.StripeId)
				assert.NotEmpty(t, *p.StripeId)
				require.NotEmpty(t, p.Prices)
				require.NotNil(t, p.Prices[0].StripeId)
				assert.NotEmpty(t, *p.Prices[0].StripeId)
			}
		}
		assert.True(t, found, "test_product_crud should appear in admin config")
	})

	t.Run("public config filters private prices", func(t *testing.T) {
		archiveAll(t, sb.Client)

		month := "month"
		usd := "usd"
		pubAmount := float64(1000)
		privAmount := float64(500)
		cfg := sdk.StripeConfiguration{
			Version: "v1.0.0",
			Products: []sdk.Product{
				{
					Id:   "test_filter_product",
					Name: "Filter Test Product",
					Prices: []sdk.Price{
						{
							Id:       "public_price",
							Amount:   &pubAmount,
							Currency: usd,
							Interval: &month,
							Public:   ptrBool(true),
						},
						{
							Id:       "private_price",
							Amount:   &privAmount,
							Currency: usd,
							Interval: &month,
							Public:   ptrBool(false),
						},
					},
				},
			},
		}
		_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(configAsMap(t, cfg)).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		pub, pubResp, err := sb.Client.V1StripeAPI.GetStripeConfig(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, pubResp.StatusCode)

		var pubFound, privFound bool
		for _, p := range pub.Config.Products {
			for _, pr := range p.Prices {
				switch pr.Id {
				case "public_price":
					pubFound = true
				case "private_price":
					privFound = true
				}
			}
		}
		assert.True(t, pubFound, "public_price should appear in public config")
		assert.False(t, privFound, "private_price should NOT appear in public config")

		adm, admResp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, admResp.StatusCode)

		var admPub, admPriv bool
		for _, p := range adm.Config.Products {
			if p.Id != "test_filter_product" {
				continue
			}
			for _, pr := range p.Prices {
				switch pr.Id {
				case "public_price":
					admPub = true
				case "private_price":
					admPriv = true
				}
			}
		}
		assert.True(t, admPub, "public_price in admin config")
		assert.True(t, admPriv, "private_price in admin config")
	})

	t.Run("archive all empties config", func(t *testing.T) {
		archiveAll(t, sb.Client)

		out, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Empty(t, out.Config.Products, "products should be empty after archive_all")
	})
}

func ptrBool(b bool) *bool    { return &b }
func ptrInt64(i int64) *int64 { return &i }

package stripe_config_test

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

func loadMetersFixture(t *testing.T) map[string]interface{} {
	t.Helper()
	data, err := os.ReadFile(testenv.StripeConfigFixturePath(t, "example.config.json"))
	require.NoError(t, err, "read fixture")
	var m map[string]interface{}
	require.NoError(t, json.Unmarshal(data, &m), "parse fixture")
	return m
}

func TestStripeConfigMeters(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	t.Cleanup(func() { archiveAll(t, sb.Client) })

	t.Run("create_meter_assigns_stripe_id", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)

		var found bool
		for _, m := range out.Config.Meters {
			if m.Id == "meter_test_api_calls" {
				found = true
				require.NotNil(t, m.StripeId, "seeded meter should have stripe_id")
				assert.NotEmpty(t, *m.StripeId)
			}
		}
		assert.True(t, found, "meter_test_api_calls should appear in admin config")
	})

	t.Run("create_multiple_meters", func(t *testing.T) {
		raw := loadMetersFixture(t)
		meters, ok := raw["meters"].([]interface{})
		require.True(t, ok, "fixture meters should be an array")
		raw["meters"] = append(meters, map[string]interface{}{
			"id":           "meter_test_events",
			"display_name": "Test Events",
			"event_name":   "test_event_v2",
			"default_aggregation": map[string]interface{}{
				"formula": "sum",
			},
		})

		_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(raw).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		adm, admResp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, admResp.StatusCode)
		require.NotNil(t, adm)

		found := map[string]bool{}
		for _, m := range adm.Config.Meters {
			switch m.Id {
			case "meter_test_api_calls", "meter_test_events":
				require.NotNil(t, m.StripeId, "meter %s missing stripe_id", m.Id)
				assert.NotEmpty(t, *m.StripeId, "meter %s stripe_id empty", m.Id)
				found[m.Id] = true
			}
		}
		assert.True(t, found["meter_test_api_calls"], "existing meter should retain stripe_id")
		assert.True(t, found["meter_test_events"], "new meter should be created with stripe_id")
	})

	t.Run("metered_price_references_correct_meter", func(t *testing.T) {
		adm, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, adm)

		var found bool
		for _, p := range adm.Config.Products {
			for _, pr := range p.Prices {
				if pr.Id != "price_test_compute_hourly" {
					continue
				}
				found = true
				require.NotNil(t, pr.UsageType)
				assert.Equal(t, "metered", *pr.UsageType)
				require.NotNil(t, pr.Meter, "metered price should carry meter reference")
				assert.Equal(t, "meter_test_api_calls", *pr.Meter)
			}
		}
		assert.True(t, found, "price_test_compute_hourly should appear in admin config")
	})

	t.Run("meter_missing_event_name_rejected", func(t *testing.T) {
		badCfg := map[string]interface{}{
			"version": "1.0.0",
			"meters": []interface{}{
				map[string]interface{}{
					"id":           "meter_bad_missing_event",
					"display_name": "Missing Event Name",
					"default_aggregation": map[string]interface{}{
						"formula": "sum",
					},
				},
			},
			"products": []interface{}{
				map[string]interface{}{
					"id":   "prod_reject_missing_event",
					"name": "Reject Missing Event",
					"prices": []interface{}{
						map[string]interface{}{
							"id":       "price_reject_missing_event",
							"amount":   float64(100),
							"currency": "usd",
							"interval": "month",
						},
					},
				},
			},
		}
		_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(badCfg).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("meter_missing_display_name_rejected", func(t *testing.T) {
		badCfg := map[string]interface{}{
			"version": "1.0.0",
			"meters": []interface{}{
				map[string]interface{}{
					"id":         "meter_bad_missing_display",
					"event_name": "test_event_bad",
					"default_aggregation": map[string]interface{}{
						"formula": "sum",
					},
				},
			},
			"products": []interface{}{
				map[string]interface{}{
					"id":   "prod_reject_missing_display",
					"name": "Reject Missing Display",
					"prices": []interface{}{
						map[string]interface{}{
							"id":       "price_reject_missing_display",
							"amount":   float64(100),
							"currency": "usd",
							"interval": "month",
						},
					},
				},
			},
		}
		_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(badCfg).
			Execute()
		require.Error(t, err)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

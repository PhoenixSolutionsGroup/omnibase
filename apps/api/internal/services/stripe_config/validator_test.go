package stripe_config

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValidator(t *testing.T) {
	tests := []struct {
		name    string
		cfg     ConfigData
		wantErr string
	}{
		{
			name: "empty products is valid",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
			},
			wantErr: "",
		},
		{
			name: "missing products rejected",
			cfg: ConfigData{
				"version": "1.0.0",
			},
			wantErr: "products is required",
		},
		{
			name: "null products rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": nil,
			},
			wantErr: "products must be an array, not null",
		},
		{
			name: "missing version rejected",
			cfg: ConfigData{
				"products": []any{},
			},
			wantErr: "version is required",
		},
		{
			name: "empty version rejected",
			cfg: ConfigData{
				"version":  "",
				"products": []any{},
			},
			wantErr: "version is required",
		},
		{
			name: "missing product id rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"name": "test",
						"prices": []any{
							map[string]any{"id": "p1", "currency": "usd", "amount": 100.0},
						},
					},
				},
			},
			wantErr: "product ID is required",
		},
		{
			name: "missing product name rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1",
						"prices": []any{
							map[string]any{"id": "p1", "currency": "usd", "amount": 100.0},
						},
					},
				},
			},
			wantErr: "product name is required",
		},
		{
			name: "product with no prices rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id":     "prod_1",
						"name":   "Test",
						"prices": []any{},
					},
				},
			},
			wantErr: "at least one price is required",
		},
		{
			name: "duplicate product IDs rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{"id": "p1", "currency": "usd", "amount": 100.0}},
					},
					map[string]any{
						"id": "prod_1", "name": "B",
						"prices": []any{map[string]any{"id": "p2", "currency": "usd", "amount": 200.0}},
					},
				},
			},
			wantErr: "duplicate product ID",
		},
		{
			name: "missing price id rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{"currency": "usd", "amount": 100.0}},
					},
				},
			},
			wantErr: "price ID is required",
		},
		{
			name: "negative amount rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{"id": "p1", "currency": "usd", "amount": -50.0}},
					},
				},
			},
			wantErr: "amount must be non-negative",
		},
		{
			name: "invalid currency rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{"id": "p1", "currency": "xyz", "amount": 100.0}},
					},
				},
			},
			wantErr: "invalid currency",
		},
		{
			name: "invalid interval rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd", "amount": 100.0,
							"interval": "fortnight",
						}},
					},
				},
			},
			wantErr: "invalid interval",
		},
		{
			name: "duplicate price IDs rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{"id": "p1", "currency": "usd", "amount": 100.0}},
					},
					map[string]any{
						"id": "prod_2", "name": "B",
						"prices": []any{map[string]any{"id": "p1", "currency": "usd", "amount": 200.0}},
					},
				},
			},
			wantErr: "duplicate price ID",
		},
		{
			name: "tiered price with amount rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd", "amount": 100.0,
							"billing_scheme": "tiered", "tiers_mode": "graduated",
							"tiers": []any{
								map[string]any{"up_to": "inf", "flat_amount": 1000},
							},
						}},
					},
				},
			},
			wantErr: "amount must not be set for tiered pricing",
		},
		{
			name: "tiered without tiers_mode rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd",
							"billing_scheme": "tiered",
							"tiers": []any{
								map[string]any{"up_to": "inf", "flat_amount": 1000},
							},
						}},
					},
				},
			},
			wantErr: "tiers_mode is required",
		},
		{
			name: "tiered with empty tiers rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd",
							"billing_scheme": "tiered", "tiers_mode": "graduated",
							"tiers": []any{},
						}},
					},
				},
			},
			wantErr: "tiers are required",
		},
		{
			name: "tiered without inf last tier rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd",
							"billing_scheme": "tiered", "tiers_mode": "graduated",
							"tiers": []any{
								map[string]any{"up_to": 100, "flat_amount": 500},
							},
						}},
					},
				},
			},
			wantErr: "final tier with up_to",
		},
		{
			name: "per_unit with tiers rejected",
			cfg: ConfigData{
				"version": "1.0.0",
				"products": []any{
					map[string]any{
						"id": "prod_1", "name": "A",
						"prices": []any{map[string]any{
							"id": "p1", "currency": "usd", "amount": 100.0,
							"billing_scheme": "per_unit", "tiers_mode": "graduated",
							"tiers": []any{
								map[string]any{"up_to": "inf", "flat_amount": 1000},
							},
						}},
					},
				},
			},
			wantErr: "per_unit billing scheme cannot have tiers",
		},
		{
			name: "meter missing event_name rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"meters": []any{
					map[string]any{
						"id": "m1", "display_name": "M1",
						"default_aggregation": map[string]any{"formula": "sum"},
					},
				},
			},
			wantErr: "event_name is required",
		},
		{
			name: "meter missing display_name rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"meters": []any{
					map[string]any{
						"id": "m1", "event_name": "e1",
						"default_aggregation": map[string]any{"formula": "sum"},
					},
				},
			},
			wantErr: "display_name is required",
		},
		{
			name: "meter missing aggregation formula rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"meters": []any{
					map[string]any{
						"id": "m1", "display_name": "M1", "event_name": "e1",
						"default_aggregation": map[string]any{},
					},
				},
			},
			wantErr: "formula is required",
		},
		{
			name: "meter invalid aggregation formula rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"meters": []any{
					map[string]any{
						"id": "m1", "display_name": "M1", "event_name": "e1",
						"default_aggregation": map[string]any{"formula": "median"},
					},
				},
			},
			wantErr: "invalid aggregation formula",
		},
		{
			name: "duplicate meter IDs rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"meters": []any{
					map[string]any{
						"id": "m1", "display_name": "M1", "event_name": "e1",
						"default_aggregation": map[string]any{"formula": "sum"},
					},
					map[string]any{
						"id": "m1", "display_name": "M2", "event_name": "e2",
						"default_aggregation": map[string]any{"formula": "sum"},
					},
				},
			},
			wantErr: "duplicate meter ID",
		},
		{
			name: "coupon without percent_off or amount_off rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{"id": "c1", "duration": "once"},
				},
			},
			wantErr: "must have either percent_off or amount_off",
		},
		{
			name: "coupon with both percent_off and amount_off rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{
						"id": "c1", "duration": "once",
						"percent_off": 10.0, "amount_off": 500,
						"currency": "usd",
					},
				},
			},
			wantErr: "cannot have both percent_off and amount_off",
		},
		{
			name: "amount_off without currency rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{
						"id": "c1", "duration": "once", "amount_off": 500,
					},
				},
			},
			wantErr: "currency is required when amount_off is set",
		},
		{
			name: "amount_off with forever duration rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{
						"id": "c1", "duration": "forever",
						"amount_off": 500, "currency": "usd",
					},
				},
			},
			wantErr: "forever' duration is only allowed with percent_off",
		},
		{
			name: "duplicate coupon IDs rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{"id": "c1", "duration": "once", "percent_off": 10.0},
					map[string]any{"id": "c1", "duration": "once", "percent_off": 20.0},
				},
			},
			wantErr: "duplicate coupon ID",
		},
		{
			name: "repeating without duration_in_months rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{
						"id": "c1", "duration": "repeating", "percent_off": 10.0,
					},
				},
			},
			wantErr: "duration_in_months is required",
		},
		{
			name: "percent_off over 100 rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{
						"id": "c1", "duration": "once", "percent_off": 150.0,
					},
				},
			},
			wantErr: "percent_off must be between 0 and 100",
		},
		{
			name: "promo code without coupon rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"promotion_codes": []any{
					map[string]any{"id": "pc1", "code": "SAVE10"},
				},
			},
			wantErr: "coupon reference is required",
		},
		{
			name: "promo code references undefined coupon rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"promotion_codes": []any{
					map[string]any{
						"id": "pc1", "code": "SAVE10", "coupon": "nonexistent",
					},
				},
			},
			wantErr: "references undefined coupon",
		},
		{
			name: "duplicate promo code IDs rejected",
			cfg: ConfigData{
				"version":  "1.0.0",
				"products": []any{},
				"coupons": []any{
					map[string]any{"id": "c1", "duration": "once", "percent_off": 10.0},
				},
				"promotion_codes": []any{
					map[string]any{"id": "pc1", "code": "SAVE10", "coupon": "c1"},
					map[string]any{"id": "pc1", "code": "SAVE20", "coupon": "c1"},
				},
			},
			wantErr: "duplicate promotion code ID",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			validator := NewValidator()
			_, err := validator.ParseAndValidateConfig(tc.cfg)
			if tc.wantErr == "" {
				require.NoError(t, err)
			} else {
				require.Error(t, err)
				require.Contains(t, err.Error(), tc.wantErr)
			}
		})
	}

	t.Log("skipped: empty-string variants of missing-id / missing-name fields (same code path as absent key)")
}

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

func TestStripeConfigCouponsAndPromos(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")
	t.Cleanup(func() { archiveAll(t, sb.Client) })

	loadBase := func(t *testing.T) map[string]interface{} {
		t.Helper()
		data, err := os.ReadFile(testenv.StripeConfigFixturePath(t, "example.config.json"))
		require.NoError(t, err)
		var m map[string]interface{}
		require.NoError(t, json.Unmarshal(data, &m))
		return m
	}

	postConfig := func(t *testing.T, cfg map[string]interface{}) *sdk.ConfigResponse {
		t.Helper()
		out, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
			Body(cfg).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		return out
	}

	getAdminCoupon := func(t *testing.T, couponID string) *sdk.CouponWithStripeID {
		t.Helper()
		adm, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, adm)
		for i, c := range adm.Config.Coupons {
			if c.Id == couponID {
				return &adm.Config.Coupons[i]
			}
		}
		return nil
	}

	getAdminPromo := func(t *testing.T, promoID string) *sdk.PromotionCodeWithStripeID {
		t.Helper()
		adm, resp, err := sb.Client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, adm)
		for i, p := range adm.Config.PromotionCodes {
			if p.Id == promoID {
				return &adm.Config.PromotionCodes[i]
			}
		}
		return nil
	}

	t.Run("create_percent_off_coupon_assigns_stripe_id", func(t *testing.T) {
		cfg := loadBase(t)
		couponID := "coupon_pct_" + helpers.UniqueID()
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "10% Off Test",
				"percent_off": 10,
				"duration":    "once",
			},
		}
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		var found bool
		for _, c := range out.Changes.Coupons.Created {
			if c.CouponId == couponID {
				found = true
				assert.Equal(t, "created", c.Action)
				require.NotNil(t, c.StripeId)
				assert.NotEmpty(t, *c.StripeId)
			}
		}
		assert.True(t, found, "created coupon should appear in changes.coupons.created")

		admCoupon := getAdminCoupon(t, couponID)
		require.NotNil(t, admCoupon, "coupon should appear in admin config")
		require.NotNil(t, admCoupon.StripeId)
		assert.NotEmpty(t, *admCoupon.StripeId)
	})

	t.Run("create_amount_off_coupon", func(t *testing.T) {
		cfg := loadBase(t)
		couponID := "coupon_amt_" + helpers.UniqueID()
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":         couponID,
				"name":       "$5 Off Test",
				"amount_off": 500,
				"currency":   "usd",
				"duration":   "once",
			},
		}
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		var found bool
		for _, c := range out.Changes.Coupons.Created {
			if c.CouponId == couponID {
				found = true
				assert.Equal(t, "created", c.Action)
				require.NotNil(t, c.StripeId)
				assert.NotEmpty(t, *c.StripeId)
			}
		}
		assert.True(t, found, "amount_off coupon should appear in changes.coupons.created")

		admCoupon := getAdminCoupon(t, couponID)
		require.NotNil(t, admCoupon)
		require.NotNil(t, admCoupon.StripeId)
		assert.NotEmpty(t, *admCoupon.StripeId)
	})

	t.Run("create_repeating_coupon", func(t *testing.T) {
		cfg := loadBase(t)
		couponID := "coupon_rep_" + helpers.UniqueID()
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":                 couponID,
				"name":               "25% Off For 3 Months",
				"percent_off":        25,
				"duration":           "repeating",
				"duration_in_months": 3,
			},
		}
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		var found bool
		for _, c := range out.Changes.Coupons.Created {
			if c.CouponId == couponID {
				found = true
				require.NotNil(t, c.StripeId)
				assert.NotEmpty(t, *c.StripeId)
			}
		}
		assert.True(t, found, "repeating coupon should appear in changes.coupons.created")

		admCoupon := getAdminCoupon(t, couponID)
		require.NotNil(t, admCoupon)
		require.NotNil(t, admCoupon.StripeId)
		assert.NotEmpty(t, *admCoupon.StripeId)
	})

	t.Run("create_promo_code_linked_to_coupon", func(t *testing.T) {
		cfg := loadBase(t)
		suffix := helpers.UniqueID()
		couponID := "coupon_promo_" + suffix
		promoID := "promo_" + suffix
		code := "SAVE" + strings.ReplaceAll(helpers.UniqueID(), "-", "")
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "Promo Coupon",
				"percent_off": 15,
				"duration":    "once",
			},
		}
		cfg["promotion_codes"] = []map[string]interface{}{
			{
				"id":     promoID,
				"code":   code,
				"coupon": couponID,
			},
		}
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.PromotionCodes)
		var found bool
		for _, p := range out.Changes.PromotionCodes.Created {
			if p.PromoId == promoID {
				found = true
				assert.Equal(t, "created", p.Action)
				require.NotNil(t, p.StripeId)
				assert.NotEmpty(t, *p.StripeId)
			}
		}
		assert.True(t, found, "promo code should appear in changes.promotion_codes.created")

		admPromo := getAdminPromo(t, promoID)
		require.NotNil(t, admPromo, "promo code should appear in admin config")
		require.NotNil(t, admPromo.StripeId)
		assert.NotEmpty(t, *admPromo.StripeId)
	})

	t.Run("update_coupon_mutable_fields", func(t *testing.T) {
		suffix := helpers.UniqueID()
		couponID := "coupon_upd_" + suffix

		cfg := loadBase(t)
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "Original Name",
				"percent_off": 5,
				"duration":    "once",
			},
		}
		_ = postConfig(t, cfg)

		cfg = loadBase(t)
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "Renamed Coupon",
				"percent_off": 5,
				"duration":    "once",
			},
		}
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		var found bool
		for _, c := range out.Changes.Coupons.Updated {
			if c.CouponId == couponID {
				found = true
				assert.Equal(t, "updated", c.Action)
			}
		}
		assert.True(t, found, "renamed coupon should appear in changes.coupons.updated")
	})

	t.Run("remove_coupon", func(t *testing.T) {
		suffix := helpers.UniqueID()
		couponID := "coupon_rm_" + suffix

		cfg := loadBase(t)
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "To Be Removed",
				"percent_off": 20,
				"duration":    "once",
			},
		}
		_ = postConfig(t, cfg)

		cfg = loadBase(t)
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		var found bool
		for _, c := range out.Changes.Coupons.Archived {
			if c.CouponId == couponID {
				found = true
			}
		}
		assert.True(t, found, "removed coupon should appear in changes.coupons.archived")
	})

	t.Run("delete_coupon_cascades_to_promos", func(t *testing.T) {
		suffix := helpers.UniqueID()
		couponID := "coupon_casc_" + suffix
		promoID := "promo_casc_" + suffix
		code := "CASC" + strings.ReplaceAll(helpers.UniqueID(), "-", "")

		cfg := loadBase(t)
		cfg["coupons"] = []map[string]interface{}{
			{
				"id":          couponID,
				"name":        "Cascade Coupon",
				"percent_off": 30,
				"duration":    "once",
			},
		}
		cfg["promotion_codes"] = []map[string]interface{}{
			{
				"id":     promoID,
				"code":   code,
				"coupon": couponID,
			},
		}
		_ = postConfig(t, cfg)

		cfg = loadBase(t)
		out := postConfig(t, cfg)
		require.NotNil(t, out.Changes)
		require.NotNil(t, out.Changes.Coupons)
		require.NotNil(t, out.Changes.PromotionCodes)

		var couponFound bool
		for _, c := range out.Changes.Coupons.Archived {
			if c.CouponId == couponID {
				couponFound = true
			}
		}
		assert.True(t, couponFound, "removed coupon should appear in changes.coupons.archived")

		var promoFound bool
		for _, p := range out.Changes.PromotionCodes.Deactivated {
			if p.PromoId == promoID {
				promoFound = true
			}
		}
		assert.True(t, promoFound, "linked promo should appear in changes.promotion_codes.deactivated")
	})
}

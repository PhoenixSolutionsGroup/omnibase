package e2e_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

const tieredConfigPriceID = "price_test_tiered_seats_graduated"

func TestTieredBillingPreview(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-tiered-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Tiered "+id, email).Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	stripePriceID := testenv.StripeIDForConfigPrice(t, sb.Client, tieredConfigPriceID)

	t.Run("tiered price uploaded with graduated mode", func(t *testing.T) {
		price, err := sb.StripeClient.V1Prices.Retrieve(context.Background(), stripePriceID, &stripe.PriceRetrieveParams{
			Params: stripe.Params{Expand: []*string{stripe.String("tiers")}},
		})
		require.NoError(t, err)
		require.Equal(t, stripe.PriceBillingSchemeTiered, price.BillingScheme)
		require.Equal(t, stripe.PriceTiersModeGraduated, price.TiersMode)
		require.Len(t, price.Tiers, 2, "expected 2 tiers")
		assert.Equal(t, int64(10), price.Tiers[0].UpTo)
		assert.Equal(t, int64(2000), price.Tiers[0].UnitAmount)
		assert.Equal(t, int64(0), price.Tiers[1].UpTo, "last tier UpTo=0 means inf")
		assert.Equal(t, int64(1500), price.Tiers[1].UnitAmount)
	})

	t.Run("preview qty=15 spans both tiers", func(t *testing.T) {
		preview, err := sb.StripeClient.V1Invoices.CreatePreview(context.Background(), &stripe.InvoiceCreatePreviewParams{
			Customer: stripe.String(customerID),
			SubscriptionDetails: &stripe.InvoiceCreatePreviewSubscriptionDetailsParams{
				Items: []*stripe.InvoiceCreatePreviewSubscriptionDetailsItemParams{
					{
						Price:    stripe.String(stripePriceID),
						Quantity: stripe.Int64(15),
					},
				},
			},
		})
		require.NoError(t, err)
		require.NotNil(t, preview)

		var total int64
		var matched int
		for _, l := range preview.Lines.Data {
			if l.Pricing != nil && l.Pricing.PriceDetails != nil && l.Pricing.PriceDetails.Price == stripePriceID {
				total += l.Amount
				matched++
			}
		}
		require.GreaterOrEqual(t, matched, 1, "no line items for tiered price")

		// graduated: 10 * 2000 + 5 * 1500 = 27500 (stripe splits across two lines)
		assert.Equal(t, int64(27500), total, "summed tiered lines should match 10*2000 + 5*1500")
		assert.Equal(t, int64(27500), preview.Total, "invoice total should match tiered math")
	})

	t.Run("preview qty=8 stays in first tier only", func(t *testing.T) {
		preview, err := sb.StripeClient.V1Invoices.CreatePreview(context.Background(), &stripe.InvoiceCreatePreviewParams{
			Customer: stripe.String(customerID),
			SubscriptionDetails: &stripe.InvoiceCreatePreviewSubscriptionDetailsParams{
				Items: []*stripe.InvoiceCreatePreviewSubscriptionDetailsItemParams{
					{
						Price:    stripe.String(stripePriceID),
						Quantity: stripe.Int64(8),
					},
				},
			},
		})
		require.NoError(t, err)
		require.NotNil(t, preview)

		// 8 * 2000 = 16000
		assert.Equal(t, int64(16000), preview.Total, "qty 8 should be 8 * 2000")
	})

	t.Run("public config exposes tiered price metadata", func(t *testing.T) {
		out, resp, err := sb.Client.V1StripeAPI.GetStripeConfig(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)

		var found bool
		for _, p := range out.Config.Products {
			for _, pr := range p.Prices {
				if pr.Id == tieredConfigPriceID {
					found = true
				}
			}
		}
		assert.True(t, found, "tiered price should appear in public config")
	})
}

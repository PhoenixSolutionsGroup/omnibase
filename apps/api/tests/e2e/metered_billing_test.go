package e2e_test

import (
	"context"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

const meteredConfigPriceID = "price_test_compute_hourly"
const meterEventName = "test_api_call"

func TestMeteredBilling(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	id := helpers.UniqueID()
	email := fmt.Sprintf("e2e-metered-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, sb.Client, email, pw)
	tenant := h.CreateTenant(t, sb.Client, userID, "E2E Metered "+id, email).Tenant

	require.NotNil(t, tenant.StripeCustomerId)
	customerID := *tenant.StripeCustomerId

	t.Cleanup(func() {
		testenv.CancelAllSubscriptions(sb.StripeClient, customerID)
		_, _ = h.DeleteTenant(t, sb.Client, userID, tenant.Id)
	})

	testenv.AttachVisaCard(t, sb.StripeClient, customerID)

	t.Run("subscribe to metered plan", func(t *testing.T) {
		out, resp, err := h.AddSubscriptionRaw(t, sb.Client, userID, tenant.Id, meteredConfigPriceID)
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Contains(t, []string{"active", "trialing"}, out.Status)
	})

	t.Run("record usage event via omnibase", func(t *testing.T) {
		_, resp, err := h.RecordUsageRaw(t, sb.Client, tenant.Id, meterEventName, "100")
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("meter event ingested by stripe", func(t *testing.T) {
		stripePriceID := testenv.StripeIDForConfigPrice(t, sb.Client, meteredConfigPriceID)
		assertMeterUsage(t, sb.StripeClient, stripePriceID, customerID, 100)
	})
}

func assertMeterUsage(t *testing.T, sc *stripe.Client, stripePriceID, customerID string, expectMin float64) {
	t.Helper()

	price, err := sc.V1Prices.Retrieve(context.Background(), stripePriceID, nil)
	require.NoError(t, err, "retrieve price")
	require.NotNil(t, price.Recurring)
	require.NotEmpty(t, price.Recurring.Meter, "price has no meter linkage")
	meterID := price.Recurring.Meter

	startTime := time.Now().Add(-1 * time.Hour).Truncate(time.Hour).Unix()
	endTime := time.Now().Add(1 * time.Hour).Truncate(time.Hour).Unix()

	deadline := time.Now().Add(90 * time.Second)
	var totalValue float64
	for time.Now().Before(deadline) {
		iter := sc.V1BillingMeterEventSummaries.List(context.Background(), &stripe.BillingMeterEventSummaryListParams{
			ID:        stripe.String(meterID),
			Customer:  stripe.String(customerID),
			StartTime: stripe.Int64(startTime),
			EndTime:   stripe.Int64(endTime),
		})
		totalValue = 0
		ok := true
		for s, err := range iter {
			if err != nil {
				ok = false
				break
			}
			totalValue += s.AggregatedValue
		}
		if ok && totalValue >= expectMin {
			return
		}
		time.Sleep(3 * time.Second)
	}
	t.Fatalf("meter %s never ingested >= %v for customer %s (got %v)", meterID, expectMin, customerID, totalValue)
}

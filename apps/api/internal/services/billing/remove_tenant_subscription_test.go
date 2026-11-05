package billing

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/stripe_client"
)

func TestRemoveTenantSubscriptionDeletesMatchingItemFromMultiItemSubscription(t *testing.T) {
	var deletedItemID string
	var itemDeleteQuery string
	cancelCalled := false

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions":
			writeJSON(t, w, listPayload(subscriptionWithItems("sub_123", "active", subscriptionItem("item_a", "price_a"), subscriptionItem("item_b", "price_b"))))
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions/sub_123":
			writeJSON(t, w, subscriptionWithItems("sub_123", "active", subscriptionItem("item_a", "price_a"), subscriptionItem("item_b", "price_b")))
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/subscription_items/item_a":
			deletedItemID = "item_a"
			itemDeleteQuery = r.URL.RawQuery
			writeJSON(t, w, subscriptionItem("item_a", "price_a"))
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/subscriptions/sub_123":
			cancelCalled = true
			writeJSON(t, w, subscriptionWithItems("sub_123", "canceled"))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := removeSubscriptionService(server)

	result, err := service.RemoveTenantSubscription(context.Background(), RemoveTenantSubscriptionArgs{
		StripeCustomerID: "cus_123",
		ConfigPriceID:    "price_a",
	})

	require.NoError(t, err)
	require.Equal(t, "sub_123", result.SubscriptionID)
	require.Equal(t, "active", result.Status)
	require.Equal(t, "item_a", deletedItemID)
	require.Contains(t, itemDeleteQuery, "proration_behavior=none")
	require.False(t, cancelCalled)
}

func TestRemoveTenantSubscriptionCancelsLastItemSubscription(t *testing.T) {
	cancelCalled := false
	itemDeleteCalled := false

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions":
			writeJSON(t, w, listPayload(subscriptionWithItems("sub_123", "active", subscriptionItem("item_a", "price_a"))))
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions/sub_123":
			writeJSON(t, w, subscriptionWithItems("sub_123", "active", subscriptionItem("item_a", "price_a")))
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/subscriptions/sub_123":
			cancelCalled = true
			writeJSON(t, w, subscriptionWithItems("sub_123", "canceled"))
		case r.Method == http.MethodDelete && r.URL.Path == "/v1/subscription_items/item_a":
			itemDeleteCalled = true
			writeJSON(t, w, subscriptionItem("item_a", "price_a"))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := removeSubscriptionService(server)

	result, err := service.RemoveTenantSubscription(context.Background(), RemoveTenantSubscriptionArgs{
		StripeCustomerID: "cus_123",
		ConfigPriceID:    "price_a",
	})

	require.NoError(t, err)
	require.Equal(t, "sub_123", result.SubscriptionID)
	require.Equal(t, "canceled", result.Status)
	require.True(t, cancelCalled)
	require.False(t, itemDeleteCalled)
}

func TestRemoveTenantSubscriptionReturnsNotFoundWhenItemMissing(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, "acct_test", r.Header.Get("Stripe-Account"))
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions":
			writeJSON(t, w, listPayload(subscriptionWithItems("sub_123", "active", subscriptionItem("item_a", "price_a"))))
		case r.Method == http.MethodGet && r.URL.Path == "/v1/subscriptions/sub_123":
			writeJSON(t, w, subscriptionWithItems("sub_123", "active", subscriptionItem("item_b", "price_b"), subscriptionItem("item_c", "price_c")))
		default:
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	t.Cleanup(server.Close)

	service := removeSubscriptionService(server)

	_, err := service.RemoveTenantSubscription(context.Background(), RemoveTenantSubscriptionArgs{
		StripeCustomerID: "cus_123",
		ConfigPriceID:    "price_a",
	})

	require.ErrorIs(t, err, RemoveTenantSubscriptionNotFound)
}

func removeSubscriptionService(server *httptest.Server) *Service {
	return New(Deps{Stripe: stripe_client.New(config.StripeConfig{
		SecretKey:       "sk_test",
		StripeAccountID: "acct_test",
		APIBaseURL:      server.URL,
	})})
}

func listPayload(items ...map[string]any) map[string]any {
	return map[string]any{
		"object":   "list",
		"has_more": false,
		"data":     items,
	}
}

func subscriptionWithItems(id, status string, items ...map[string]any) map[string]any {
	return map[string]any{
		"id":     id,
		"object": "subscription",
		"status": status,
		"items": map[string]any{
			"object":   "list",
			"has_more": false,
			"data":     items,
		},
	}
}

func subscriptionItem(id, configPriceID string) map[string]any {
	return map[string]any{
		"id":     id,
		"object": "subscription_item",
		"price": map[string]any{
			"id":         "stripe_" + configPriceID,
			"object":     "price",
			"lookup_key": configPriceID,
		},
	}
}

package stripe_client

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
)

func TestManagedClient_ProxiesThroughManagedHosting(t *testing.T) {
	var path string
	var headers http.Header

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
		headers = r.Header.Clone()
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"prod_1","object":"product"}`))
	}))
	defer server.Close()

	client := New(config.StripeConfig{
		IsManaged:       true,
		ProxyURL:        server.URL,
		ProxyToken:      "branch-key",
		BranchID:        "branch-id",
		StripeAccountID: "acct_1",
	})

	params := &stripe.ProductRetrieveParams{}
	client.ApplyAccount(params)

	_, err := client.Stripe.V1Products.Retrieve(context.Background(), "prod_1", params)
	require.NoError(t, err)

	assert.Equal(t, "/api/v1/stripe/proxy/v1/products/prod_1", path)
	assert.Equal(t, "branch-key", headers.Get("X-Api-Key"))
	assert.Equal(t, "branch-id", headers.Get("X-Branch-Id"))
	assert.Equal(t, "acct_1", headers.Get("Stripe-Account"))
	assert.Equal(t, "Bearer "+managedProxyKey, headers.Get("Authorization"))
}

func TestNew_UsesSelfHostedWithoutManagedConfig(t *testing.T) {
	var path string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"prod_1","object":"product"}`))
	}))
	defer server.Close()

	client := New(config.StripeConfig{
		SecretKey:  "sk_test",
		APIBaseURL: server.URL,
	})

	_, err := client.Stripe.V1Products.Retrieve(context.Background(), "prod_1", &stripe.ProductRetrieveParams{})
	require.NoError(t, err)

	assert.Equal(t, "/v1/products/prod_1", path)
}

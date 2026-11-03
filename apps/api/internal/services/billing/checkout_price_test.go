package billing

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/database/repository"
	repomock "api/internal/mocks/repository"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"
)

func TestAuthorizeConfigPriceRejectsPrivatePriceForSessionCaller(t *testing.T) {
	private := false
	price := &stripe_config.Price{ID: "price_private", Public: &private}

	err := authorizeConfigPrice(price, nil, false)

	require.ErrorIs(t, err, CheckoutPriceForbiddenError)
}

func TestAuthorizeConfigPriceAllowsPrivatePriceForServiceCaller(t *testing.T) {
	private := false
	price := &stripe_config.Price{ID: "price_private", Public: &private}

	err := authorizeConfigPrice(price, nil, true)

	require.NoError(t, err)
}

func TestAuthorizeConfigPriceAllowsPublicPriceForSessionCaller(t *testing.T) {
	price := &stripe_config.Price{ID: "price_public"}
	tenant := &repository.GetTenantByIDRow{}

	err := authorizeConfigPrice(price, tenant, false)

	require.NoError(t, err)
}

func TestAuthorizeConfigPriceRequiresMatchingEnterpriseID(t *testing.T) {
	price := &stripe_config.Price{ID: "price_enterprise", EnterpriseID: "enterprise_a"}

	require.ErrorIs(t, authorizeConfigPrice(price, nil, false), CheckoutPriceForbiddenError)

	other := &repository.GetTenantByIDRow{EnterpriseID: stringPtr("enterprise_b")}
	require.ErrorIs(t, authorizeConfigPrice(price, other, false), CheckoutPriceForbiddenError)

	matching := &repository.GetTenantByIDRow{EnterpriseID: stringPtr("enterprise_a")}
	require.NoError(t, authorizeConfigPrice(price, matching, false))
}

func TestAuthorizeConfigPriceRequiresMatchingEnterpriseTemplate(t *testing.T) {
	price := &stripe_config.Price{ID: "price_template", EnterpriseTemplate: "template_a"}

	other := &repository.GetTenantByIDRow{EnterpriseTemplate: stringPtr("template_b")}
	require.ErrorIs(t, authorizeConfigPrice(price, other, false), CheckoutPriceForbiddenError)

	matching := &repository.GetTenantByIDRow{EnterpriseTemplate: stringPtr("template_a")}
	require.NoError(t, authorizeConfigPrice(price, matching, false))
}

func TestAuthorizeConfigPriceEnterprisePriceStillRequiresTenantForServiceCaller(t *testing.T) {
	price := &stripe_config.Price{ID: "price_enterprise", EnterpriseID: "enterprise_a"}

	err := authorizeConfigPrice(price, nil, true)

	require.ErrorIs(t, err, CheckoutPriceForbiddenError)
}

func TestResolveCheckoutPriceReturnsStripePriceID(t *testing.T) {
	server := stripePriceServer(t, "price_private", "price_stripe_123")
	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(checkoutConfigRow(t), nil).Once()

	service := New(Deps{
		Repo:   repo,
		Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	})

	stripePriceID, err := service.ResolveCheckoutPrice(context.Background(), "price_private", uuid.Nil, true)

	require.NoError(t, err)
	require.Equal(t, "price_stripe_123", stripePriceID)
}

func TestResolveCheckoutPriceRejectsPrivatePriceForSessionCaller(t *testing.T) {
	server := stripePriceServer(t, "price_private", "price_stripe_123")
	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(checkoutConfigRow(t), nil).Once()

	service := New(Deps{
		Repo:   repo,
		Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	})

	_, err := service.ResolveCheckoutPrice(context.Background(), "price_private", uuid.Nil, false)

	require.ErrorIs(t, err, CheckoutPriceForbiddenError)
}

func TestResolveCheckoutPriceRejectsUnknownConfigPrice(t *testing.T) {
	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(checkoutConfigRow(t), nil).Once()

	service := New(Deps{Repo: repo})

	_, err := service.ResolveCheckoutPrice(context.Background(), "price_missing", uuid.Nil, false)

	require.ErrorIs(t, err, CheckoutPriceNotFoundError)
}

func TestResolveCheckoutPriceRejectsWhenNoActiveConfig(t *testing.T) {
	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{}, sql.ErrNoRows).Once()

	service := New(Deps{Repo: repo})

	_, err := service.ResolveCheckoutPrice(context.Background(), "price_public", uuid.Nil, false)

	require.ErrorIs(t, err, CheckoutPriceNotFoundError)
}

func stripePriceServer(t *testing.T, configPriceID, stripePriceID string) *httptest.Server {
	t.Helper()
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]any{
			"object":   "list",
			"has_more": false,
			"data": []any{map[string]any{
				"id":         stripePriceID,
				"object":     "price",
				"active":     true,
				"lookup_key": configPriceID,
			}},
		})
	}))
	t.Cleanup(server.Close)
	return server
}

func checkoutConfigRow(t *testing.T) repository.StripeStripeConfig {
	t.Helper()
	configData := map[string]any{
		"version": "1.0.0",
		"products": []any{map[string]any{
			"id":   "product_a",
			"name": "Product A",
			"prices": []any{
				map[string]any{"id": "price_public", "currency": "usd", "amount": 1000},
				map[string]any{"id": "price_private", "currency": "usd", "amount": 2000, "public": false},
			},
		}},
	}
	raw, err := json.Marshal(configData)
	require.NoError(t, err)
	return repository.StripeStripeConfig{Config: raw}
}

func stringPtr(value string) *string {
	return &value
}

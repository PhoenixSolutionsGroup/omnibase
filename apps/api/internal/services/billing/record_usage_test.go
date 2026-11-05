package billing

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/database/repository"
	repomock "api/internal/mocks/repository"
	"api/internal/services/stripe_client"
)

const (
	usageConfigDefaults = `{"version":"1.0.0","products":[]}`
	usageConfigCustom   = `{"version":"1.0.0","products":[],"meters":[{"id":"m","display_name":"Meter","event_name":"test_meter","default_aggregation":{"formula":"sum"},"customer_mapping":{"event_payload_key":"customer_id","type":"by_id"},"value_settings":{"event_payload_key":"units"}}]}`
)

func TestRecordUsageUsesMeterPayloadKeys(t *testing.T) {
	form, accountHeader := recordUsageForm(t, usageConfigCustom, RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
		IdempotencyKey:   "usage-key-123",
	})

	require.Equal(t, "acct_test", accountHeader)
	require.Equal(t, "usage-key-123", form.Get("identifier"))
	require.Equal(t, "cus_123", form.Get("payload[customer_id]"))
	require.Equal(t, "5", form.Get("payload[units]"))
	require.Empty(t, form.Get("payload[stripe_customer_id]"))
	require.Empty(t, form.Get("payload[value]"))
}

func TestRecordUsageFallsBackToDefaultPayloadKeys(t *testing.T) {
	form, _ := recordUsageForm(t, usageConfigDefaults, RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
	})

	require.Equal(t, "cus_123", form.Get("payload[stripe_customer_id]"))
	require.Equal(t, "5", form.Get("payload[value]"))
	require.Empty(t, form.Get("identifier"))
}

func TestRecordUsageFallsBackToDefaultPayloadKeysWithoutActiveConfig(t *testing.T) {
	form, _ := recordUsageFormWithRepo(t, func(repo *repomock.MockQuerier) {
		repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{}, sql.ErrNoRows).Once()
	}, RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
	})

	require.Equal(t, "cus_123", form.Get("payload[stripe_customer_id]"))
	require.Equal(t, "5", form.Get("payload[value]"))
}

func TestRecordUsageFailsWhenActiveConfigCannotBeLoaded(t *testing.T) {
	stripeCalled := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		stripeCalled = true
		w.WriteHeader(http.StatusInternalServerError)
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{}, errors.New("database unavailable")).Once()

	service := New(Deps{
		Repo:   repo,
		Stripe: stripe_client.New(config.StripeConfig{SecretKey: "sk_test", APIBaseURL: server.URL}),
	})

	err := service.RecordUsage(context.Background(), RecordUsageArgs{
		MeterEventName:   "test_meter",
		StripeCustomerID: "cus_123",
		Value:            "5",
	})

	require.ErrorIs(t, err, RecordUsageError)
	require.False(t, stripeCalled)
}

func recordUsageForm(t *testing.T, configJSON string, args RecordUsageArgs) (url.Values, string) {
	t.Helper()
	return recordUsageFormWithRepo(t, func(repo *repomock.MockQuerier) {
		repo.EXPECT().GetLatestStripeConfig(mock.Anything).Return(repository.StripeStripeConfig{Config: []byte(configJSON)}, nil).Once()
	}, args)
}

func recordUsageFormWithRepo(t *testing.T, expectConfig func(*repomock.MockQuerier), args RecordUsageArgs) (url.Values, string) {
	t.Helper()

	var form url.Values
	var accountHeader string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		require.Equal(t, http.MethodPost, r.Method)
		require.Equal(t, "/v1/billing/meter_events", r.URL.Path)
		require.NoError(t, r.ParseForm())
		form = r.PostForm
		accountHeader = r.Header.Get("Stripe-Account")
		writeJSON(t, w, map[string]any{
			"id":     "bme_123",
			"object": "billing.meter_event",
		})
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	expectConfig(repo)

	service := New(Deps{
		Repo: repo,
		Stripe: stripe_client.New(config.StripeConfig{
			SecretKey:       "sk_test",
			StripeAccountID: "acct_test",
			APIBaseURL:      server.URL,
		}),
	})

	require.NoError(t, service.RecordUsage(context.Background(), args))
	return form, accountHeader
}

package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/database/repository"
	repomock "api/internal/mocks/repository"
)

func TestProcessWebhooksManagedReplacesTheWholeWebhookSet(t *testing.T) {
	var (
		gotMethod  string
		gotPath    string
		gotHeaders http.Header
		gotBody    ReplaceWebhooksRequest
	)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotPath = r.URL.Path
		gotHeaders = r.Header.Clone()
		require.NoError(t, json.NewDecoder(r.Body).Decode(&gotBody))
		w.Header().Set("Content-Type", "application/json")
		_, err := io.WriteString(w, `{"webhooks":[{"id":"reg_1","webhook_id":"invoice-created","secret":"whsec_one","action":"updated"},{"id":"reg_2","webhook_id":"invoice-paid","secret":"whsec_two","action":"created"}],"deleted":1}`)
		require.NoError(t, err)
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	repo.EXPECT().UpsertStripeWebhook(mock.Anything, repository.UpsertStripeWebhookParams{
		StripeID: "reg_1",
		Url:      "https://example.com/hook",
		Secret:   "whsec_one",
		Events:   []string{"invoice.created"},
		Connect:  false,
	}).Return(repository.UpsertStripeWebhookRow{ID: uuid.New(), StripeID: "reg_1"}, nil).Once()
	repo.EXPECT().UpsertStripeWebhook(mock.Anything, repository.UpsertStripeWebhookParams{
		StripeID: "reg_2",
		Url:      "https://example.com/paid",
		Secret:   "whsec_two",
		Events:   []string{"invoice.paid"},
		Connect:  true,
	}).Return(repository.UpsertStripeWebhookRow{ID: uuid.New(), StripeID: "reg_2"}, nil).Once()
	repo.EXPECT().DeleteStaleStripeWebhooks(mock.Anything, []string{"reg_1", "reg_2"}).Return(int64(1), nil).Once()

	service := &Service{
		repo: repo,
		managed: &ManagedHostingClient{
			baseURL:      server.URL,
			serviceToken: "service-token",
			tenantID:     "tenant-id",
			branchID:     "branch-id",
			httpClient:   server.Client(),
		},
	}

	results, err := service.processWebhooksManaged(context.Background(), []WebhookEndpointConfig{
		{ID: "invoice-created", URL: "https://example.com/hook", Events: []string{"invoice.created"}},
		{ID: "invoice-paid", URL: "https://example.com/paid", Events: []string{"invoice.paid"}, Connect: true},
	})
	require.NoError(t, err)

	require.Equal(t, http.MethodPut, gotMethod)
	require.Equal(t, "/api/v1/stripe/webhooks", gotPath)
	require.Equal(t, "service-token", gotHeaders.Get("X-API-Key"))
	require.Equal(t, "tenant-id", gotHeaders.Get("X-Tenant-ID"))
	require.Equal(t, "branch-id", gotHeaders.Get("X-Branch-ID"))
	require.Equal(t, ReplaceWebhooksRequest{Webhooks: []RegisterWebhookRequest{
		{WebhookID: "invoice-created", URL: "https://example.com/hook", Events: []string{"invoice.created"}},
		{WebhookID: "invoice-paid", URL: "https://example.com/paid", Events: []string{"invoice.paid"}, Connect: true},
	}}, gotBody)

	require.Len(t, results, 2)
	require.Equal(t, "reg_1", results[0].StripeID)
	require.Equal(t, "whsec_one", results[0].Secret)
	require.Equal(t, "updated", results[0].Action)
	require.Equal(t, "reg_2", results[1].StripeID)
	require.Equal(t, "created", results[1].Action)
}

func TestProcessWebhooksManagedSurfacesManagedHostingErrors(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, `{"error":"boom"}`, http.StatusInternalServerError)
	}))
	t.Cleanup(server.Close)

	repo := repomock.NewMockQuerier(t)
	service := &Service{
		repo: repo,
		managed: &ManagedHostingClient{
			baseURL:    server.URL,
			httpClient: server.Client(),
		},
	}

	_, err := service.processWebhooksManaged(context.Background(), []WebhookEndpointConfig{
		{ID: "invoice-created", URL: "https://example.com/hook", Events: []string{"invoice.created"}},
	})

	require.Error(t, err)
	require.True(t, errors.Is(err, ProcessWebhooksError))
	require.Contains(t, err.Error(), "500")
}

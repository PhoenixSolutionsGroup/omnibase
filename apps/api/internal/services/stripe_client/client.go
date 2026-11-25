package stripe_client

import (
	"net/http"

	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
)

const managedProxyKey = "managed-hosting-proxy"

type Client struct {
	Stripe    *stripe.Client
	AccountID string
}

func New(cfg config.StripeConfig) *Client {
	if cfg.IsManaged && cfg.ProxyURL != "" && cfg.ProxyToken != "" && cfg.BranchID != "" {
		return newManaged(cfg)
	}
	return newSelfHosted(cfg)
}

func (c *Client) ApplyAccount(params interface{ SetStripeAccount(string) }) {
	if c.AccountID == "" {
		return
	}
	params.SetStripeAccount(c.AccountID)
}

func stripeBackends(baseURL string, httpClient *http.Client) *stripe.Backends {
	if baseURL == "" && httpClient == nil {
		return nil
	}

	cfg := &stripe.BackendConfig{}
	if baseURL != "" {
		cfg.URL = stripe.String(baseURL)
	}
	if httpClient != nil {
		cfg.HTTPClient = httpClient
	}

	return &stripe.Backends{
		API:         stripe.GetBackendWithConfig(stripe.APIBackend, cfg),
		Connect:     stripe.GetBackendWithConfig(stripe.ConnectBackend, cfg),
		Uploads:     stripe.GetBackendWithConfig(stripe.UploadsBackend, cfg),
		MeterEvents: stripe.GetBackendWithConfig(stripe.MeterEventsBackend, cfg),
	}
}

package stripe_client

import (
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
)

type Client struct {
	Stripe    *stripe.Client
	AccountID string
}

func New(cfg config.StripeConfig) *Client {
	opts := []stripe.ClientOption{}
	if cfg.APIBaseURL != "" {
		opts = append(opts, stripe.WithBackends(&stripe.Backends{
			API: stripe.GetBackendWithConfig(stripe.APIBackend, &stripe.BackendConfig{URL: stripe.String(cfg.APIBaseURL)}),
		}))
	}
	return &Client{
		Stripe:    stripe.NewClient(cfg.SecretKey, opts...),
		AccountID: cfg.StripeAccountID,
	}
}

func (c *Client) ApplyAccount(params interface{ SetStripeAccount(string) }) {
	if c.AccountID == "" {
		return
	}
	params.SetStripeAccount(c.AccountID)
}

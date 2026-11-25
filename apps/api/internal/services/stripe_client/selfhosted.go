package stripe_client

import (
	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
)

func newSelfHosted(cfg config.StripeConfig) *Client {
	opts := []stripe.ClientOption{}
	if backends := stripeBackends(cfg.APIBaseURL, nil); backends != nil {
		opts = append(opts, stripe.WithBackends(backends))
	}

	return &Client{
		Stripe:    stripe.NewClient(cfg.SecretKey, opts...),
		AccountID: cfg.StripeAccountID,
	}
}

package stripe_client

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/stripe/stripe-go/v82"

	"api/internal/config"
	"api/internal/logger"
)

type proxyTransport struct {
	base      http.RoundTripper
	proxyURL  *url.URL
	branchKey string
	branchID  string
}

func (t *proxyTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	clone := req.Clone(req.Context())
	clone.URL.Scheme = t.proxyURL.Scheme
	clone.URL.Host = t.proxyURL.Host
	clone.URL.Path = strings.TrimRight(t.proxyURL.Path, "/") + req.URL.Path
	clone.URL.RawPath = ""
	clone.Host = ""

	if clone.Header == nil {
		clone.Header = make(http.Header)
	}
	clone.Header.Set("X-Api-Key", t.branchKey)
	clone.Header.Set("X-Branch-Id", t.branchID)

	base := t.base
	if base == nil {
		base = http.DefaultTransport
	}
	return base.RoundTrip(clone)
}

func newManaged(cfg config.StripeConfig) *Client {
	parsedProxyURL, err := url.Parse(strings.TrimRight(cfg.ProxyURL, "/") + "/api/v1/stripe/proxy")
	if err != nil {
		logger.Logger.Error("stripe_client.invalid_proxy_url", "error", err)
		return newSelfHosted(cfg)
	}

	httpClient := &http.Client{
		Timeout: 60 * time.Second,
		Transport: &proxyTransport{
			base:      http.DefaultTransport,
			proxyURL:  parsedProxyURL,
			branchKey: cfg.ProxyToken,
			branchID:  cfg.BranchID,
		},
	}

	return &Client{
		Stripe:    stripe.NewClient(managedProxyKey, stripe.WithBackends(stripeBackends("", httpClient))),
		AccountID: cfg.StripeAccountID,
	}
}

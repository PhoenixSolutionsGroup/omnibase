package stripe_proxy

import (
	"context"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/services/billing"
)

type fakeResolver struct {
	cfg   *ProxyConfig
	err   error
	calls int
}

func (f *fakeResolver) ProxyConfig(context.Context) (*ProxyConfig, error) {
	f.calls++
	return f.cfg, f.err
}

type fakeTenants struct {
	tenant   Tenant
	err      error
	customer string
	sets     int
}

func (f *fakeTenants) Get(context.Context, uuid.UUID) (Tenant, error) {
	if f.err != nil {
		return Tenant{}, f.err
	}
	return f.tenant, nil
}

func (f *fakeTenants) SetCustomer(_ context.Context, _ uuid.UUID, customerID string) error {
	f.customer = customerID
	f.sets++
	return nil
}

type fakeBilling struct {
	id    string
	err   error
	calls int
	args  billing.CreateCustomerArgs
}

func (f *fakeBilling) CreateCustomer(_ context.Context, args billing.CreateCustomerArgs) (string, error) {
	f.calls++
	f.args = args
	return f.id, f.err
}

type capture struct {
	method     string
	path       string
	query      url.Values
	form       url.Values
	headers    http.Header
	hits       int
	statusCode int
	body       string
}

func newUpstream(t *testing.T, capture *capture) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capture.hits++
		capture.method = r.Method
		capture.path = r.URL.Path
		capture.query = r.URL.Query()
		capture.headers = r.Header.Clone()

		body, err := io.ReadAll(r.Body)
		require.NoError(t, err)
		capture.body = string(body)
		capture.form, err = url.ParseQuery(string(body))
		require.NoError(t, err)

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Stripe-Version", "2025-01-01")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
	}))
}

func newService(upstreamURL string, managed bool, resolver ConfigResolver, tenants TenantStore, bill CustomerCreator) *Service {
	cfg := &config.Config{}
	if managed {
		cfg.StripeConfig = config.StripeConfig{
			IsManaged:  true,
			ProxyURL:   upstreamURL,
			ProxyToken: "branch-token",
			BranchID:   "branch-id",
		}
	} else {
		cfg.StripeConfig = config.StripeConfig{
			SecretKey:  "sk_test",
			APIBaseURL: upstreamURL,
		}
	}

	return New(Deps{
		Config:   cfg,
		Resolver: resolver,
		Tenants:  tenants,
		Billing:  bill,
	})
}

func forward(t *testing.T, svc *Service, req Request) (*http.Response, error) {
	t.Helper()
	req.ResolveIDs = true
	if req.Header == nil {
		req.Header = http.Header{}
	}
	if req.Query == nil {
		req.Query = url.Values{}
	}
	if req.Form == nil {
		req.Form = url.Values{}
	}
	return svc.Forward(context.Background(), req)
}

func TestForward_ResolvesIDsAndInjectsCustomer(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{Prices: map[string]string{"pro_monthly": "price_123"}}}
	tenants := &fakeTenants{tenant: Tenant{Name: "Acme", CustomerID: "cus_123"}}
	svc := newService(upstream.URL, false, resolver, tenants, &fakeBilling{})
	tenantID := uuid.New()

	form := url.Values{
		"line_items[0][price]":    {"pro_monthly"},
		"line_items[0][quantity]": {"1"},
	}
	resp, err := forward(t, svc, Request{
		Method:   http.MethodPost,
		Path:     "/v1/checkout/sessions",
		Header:   http.Header{"X-Service-Key": {"secret"}, "X-Tenant-Id": {tenantID.String()}},
		Form:     form,
		Body:     []byte(form.Encode()),
		IsForm:   true,
		TenantID: tenantID,
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "/v1/checkout/sessions", capture.path)
	assert.Equal(t, "price_123", capture.form.Get("line_items[0][price]"))
	assert.Equal(t, "cus_123", capture.form.Get("customer"))
	assert.Equal(t, "Bearer sk_test", capture.headers.Get("Authorization"))
	assert.Empty(t, capture.headers.Get("X-Service-Key"))
	assert.Empty(t, capture.headers.Get("X-Tenant-Id"))
	assert.Contains(t, resp.Header.Get("Omnibase-Resolved-Ids"), "line_items[0][price]=pro_monthly->price_123")
	assert.Contains(t, resp.Header.Get("Omnibase-Resolved-Ids"), "customer->cus_123")
}

func TestForward_ResolvesPathAndQuery(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{
		Prices:   map[string]string{"pro_monthly": "price_123"},
		Products: map[string]string{"pro_plan": "prod_123"},
	}}
	svc := newService(upstream.URL, false, resolver, &fakeTenants{}, &fakeBilling{})

	resp, err := forward(t, svc, Request{
		Method: http.MethodGet,
		Path:   "/v1/prices/pro_monthly",
		Query:  url.Values{"product": {"pro_plan"}},
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "/v1/prices/price_123", capture.path)
	assert.Equal(t, "prod_123", capture.query.Get("product"))
	assert.Contains(t, resp.Header.Get("Omnibase-Resolved-Ids"), "path:pro_monthly->price_123")
}

func TestForward_BlocksConfigWrites(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	svc := newService(upstream.URL, false, &fakeResolver{}, &fakeTenants{}, &fakeBilling{})

	resp, err := forward(t, svc, Request{Method: http.MethodPost, Path: "/v1/prices"})
	require.Error(t, err)
	var serviceErr *Error
	require.ErrorAs(t, err, &serviceErr)
	assert.Equal(t, http.StatusForbidden, serviceErr.Status)
	assert.Nil(t, resp)
	assert.Equal(t, 0, capture.hits)
}

func TestForward_OptOutSkipsInjection(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{Prices: map[string]string{"pro_monthly": "price_123"}}}
	svc := newService(upstream.URL, false, resolver, &fakeTenants{tenant: Tenant{CustomerID: "cus_123"}}, &fakeBilling{})
	tenantID := uuid.New()
	form := url.Values{
		"line_items[0][price]": {"pro_monthly"},
		"customer":             {tenantID.String()},
	}

	resp, err := svc.Forward(context.Background(), Request{
		Method:     http.MethodPost,
		Path:       "/v1/checkout/sessions",
		Header:     http.Header{"Omnibase-Resolve-Ids": {"false"}, "X-Service-Key": {"secret"}},
		Query:      url.Values{},
		Form:       form,
		Body:       []byte(form.Encode()),
		IsForm:     true,
		TenantID:   tenantID,
		ResolveIDs: false,
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "pro_monthly", capture.form.Get("line_items[0][price]"))
	assert.Equal(t, tenantID.String(), capture.form.Get("customer"))
	assert.Empty(t, resp.Header.Get("Omnibase-Resolved-Ids"))
	assert.Empty(t, capture.headers.Get("X-Service-Key"))
	assert.Empty(t, capture.headers.Get("Omnibase-Resolve-Ids"))
}

func TestForward_CustomerMismatch(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	svc := newService(upstream.URL, false, &fakeResolver{}, &fakeTenants{tenant: Tenant{CustomerID: "cus_123"}}, &fakeBilling{})
	form := url.Values{"customer": {"cus_other"}}

	_, err := forward(t, svc, Request{
		Method:   http.MethodPost,
		Path:     "/v1/subscriptions",
		Form:     form,
		Body:     []byte(form.Encode()),
		IsForm:   true,
		TenantID: uuid.New(),
	})
	require.Error(t, err)
	var serviceErr *Error
	require.ErrorAs(t, err, &serviceErr)
	assert.Equal(t, http.StatusBadRequest, serviceErr.Status)
	assert.Equal(t, 0, capture.hits)
}

func TestForward_MeterEventUsesConfiguredPayloadKey(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{
		MeterCustomerValues: map[string]string{"api_calls": "customer_id"},
	}}
	svc := newService(upstream.URL, false, resolver, &fakeTenants{tenant: Tenant{CustomerID: "cus_123"}}, &fakeBilling{})
	tenantID := uuid.New()
	form := url.Values{
		"event_name":     {"api_calls"},
		"payload[units]": {"1"},
	}

	resp, err := forward(t, svc, Request{
		Method:   http.MethodPost,
		Path:     "/v1/billing/meter_events",
		Form:     form,
		Body:     []byte(form.Encode()),
		IsForm:   true,
		TenantID: tenantID,
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "cus_123", capture.form.Get("payload[customer_id]"))
	assert.Empty(t, capture.form.Get("payload[stripe_customer_id]"))
}

func TestForward_CreatesCustomerLazily(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{Prices: map[string]string{"pro_monthly": "price_123"}}}
	tenants := &fakeTenants{tenant: Tenant{Name: "Acme"}}
	bill := &fakeBilling{id: "cus_new"}
	svc := newService(upstream.URL, false, resolver, tenants, bill)
	tenantID := uuid.New()
	form := url.Values{"line_items[0][price]": {"pro_monthly"}}

	resp, err := forward(t, svc, Request{
		Method:   http.MethodPost,
		Path:     "/v1/checkout/sessions",
		Form:     form,
		Body:     []byte(form.Encode()),
		IsForm:   true,
		TenantID: tenantID,
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "cus_new", capture.form.Get("customer"))
	assert.Equal(t, 1, bill.calls)
	assert.Equal(t, "Acme", bill.args.Name)
	assert.Equal(t, "cus_new", tenants.customer)
	assert.Equal(t, 1, tenants.sets)
}

func TestForward_UnknownConfigID(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	svc := newService(upstream.URL, false, &fakeResolver{cfg: &ProxyConfig{Prices: map[string]string{}}}, &fakeTenants{}, &fakeBilling{})
	form := url.Values{"line_items[0][price]": {"missing"}}

	_, err := forward(t, svc, Request{
		Method: http.MethodPost,
		Path:   "/v1/checkout/sessions",
		Form:   form,
		Body:   []byte(form.Encode()),
		IsForm: true,
	})
	require.Error(t, err)
	var serviceErr *Error
	require.ErrorAs(t, err, &serviceErr)
	assert.Equal(t, http.StatusUnprocessableEntity, serviceErr.Status)
	assert.Contains(t, serviceErr.Message, "line_items[0][price]")
	assert.Equal(t, 0, capture.hits)
}

func TestForward_ManagedUsesBranchProxy(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	resolver := &fakeResolver{cfg: &ProxyConfig{Prices: map[string]string{"pro_monthly": "price_123"}}}
	svc := newService(upstream.URL, true, resolver, &fakeTenants{}, &fakeBilling{})
	form := url.Values{"line_items[0][price]": {"pro_monthly"}}

	resp, err := forward(t, svc, Request{
		Method:   http.MethodPost,
		Path:     "/v1/checkout/sessions",
		Header:   http.Header{"Authorization": {"Bearer caller"}, "X-Tenant-Id": {"tenant"}, "X-Api-Key": {"caller"}},
		Form:     form,
		Body:     []byte(form.Encode()),
		IsForm:   true,
		TenantID: uuid.Nil,
	})
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "/api/v1/stripe/proxy/v1/checkout/sessions", capture.path)
	assert.Equal(t, "branch-token", capture.headers.Get("X-Api-Key"))
	assert.Equal(t, "branch-id", capture.headers.Get("X-Branch-Id"))
	assert.Empty(t, capture.headers.Get("Authorization"))
	assert.Empty(t, capture.headers.Get("X-Tenant-Id"))
}

func TestForward_ReturnsResolverError(t *testing.T) {
	capture := &capture{}
	upstream := newUpstream(t, capture)
	defer upstream.Close()

	svc := newService(upstream.URL, false, &fakeResolver{err: errors.New("config unavailable")}, &fakeTenants{}, &fakeBilling{})
	form := url.Values{"line_items[0][price]": {"pro_monthly"}}

	_, err := forward(t, svc, Request{
		Method: http.MethodPost,
		Path:   "/v1/checkout/sessions",
		Form:   form,
		Body:   []byte(form.Encode()),
		IsForm: true,
	})
	require.Error(t, err)
	var serviceErr *Error
	require.ErrorAs(t, err, &serviceErr)
	assert.Equal(t, http.StatusInternalServerError, serviceErr.Status)
}

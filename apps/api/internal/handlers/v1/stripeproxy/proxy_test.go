package stripeproxy

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/authn"
	"api/internal/config"
	"api/internal/services/billing"
	"api/internal/services/stripe_proxy"
)

type handlerResolver struct {
	cfg *stripe_proxy.ProxyConfig
}

func (r *handlerResolver) ProxyConfig(context.Context) (*stripe_proxy.ProxyConfig, error) {
	return r.cfg, nil
}

type handlerTenants struct {
	tenant stripe_proxy.Tenant
}

func (t *handlerTenants) Get(context.Context, uuid.UUID) (stripe_proxy.Tenant, error) {
	return t.tenant, nil
}

func (t *handlerTenants) SetCustomer(context.Context, uuid.UUID, string) error {
	return nil
}

type handlerBilling struct{}

func (b *handlerBilling) CreateCustomer(context.Context, billing.CreateCustomerArgs) (string, error) {
	return "cus_new", nil
}

func newTestHandler(t *testing.T, upstreamURL string, resolver stripe_proxy.ConfigResolver, tenants stripe_proxy.TenantStore) *Handler {
	t.Helper()
	svc := stripe_proxy.New(stripe_proxy.Deps{
		Config: &config.Config{StripeConfig: config.StripeConfig{
			SecretKey:  "sk_test",
			APIBaseURL: upstreamURL,
		}},
		Resolver: resolver,
		Tenants:  tenants,
		Billing:  &handlerBilling{},
	})
	return New(svc)
}

func TestProxy_ForwardsResolvedRequest(t *testing.T) {
	var gotPath string
	var gotForm url.Values
	var gotServiceKey, gotTenantID string

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotPath = r.URL.Path
		gotServiceKey = r.Header.Get("X-Service-Key")
		gotTenantID = r.Header.Get("X-Tenant-Id")
		body, err := io.ReadAll(r.Body)
		require.NoError(t, err)
		gotForm, err = url.ParseQuery(string(body))
		require.NoError(t, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		_, _ = w.Write([]byte(`{"id":"cs_123"}`))
	}))
	defer upstream.Close()

	resolver := &handlerResolver{cfg: &stripe_proxy.ProxyConfig{
		Prices: map[string]string{"pro_monthly": "price_123"},
	}}
	tenants := &handlerTenants{tenant: stripe_proxy.Tenant{CustomerID: "cus_123"}}
	handler := newTestHandler(t, upstream.URL, resolver, tenants)
	tenantID := uuid.New()

	router := gin.New()
	router.Use(func(c *gin.Context) {
		authn.Set(c, &authn.Principal{Method: authn.AuthServiceKey, TenantID: tenantID})
		c.Next()
	})
	router.Any("/stripe/*path", handler.Proxy)

	form := url.Values{
		"line_items[0][price]":    {"pro_monthly"},
		"line_items[0][quantity]": {"1"},
	}
	req := httptest.NewRequest(http.MethodPost, "/stripe/v1/checkout/sessions", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-Service-Key", "secret")
	req.Header.Set("X-Tenant-Id", tenantID.String())
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusCreated, recorder.Code)
	assert.JSONEq(t, `{"id":"cs_123"}`, recorder.Body.String())
	assert.Equal(t, "/v1/checkout/sessions", gotPath)
	assert.Equal(t, "price_123", gotForm.Get("line_items[0][price]"))
	assert.Equal(t, "cus_123", gotForm.Get("customer"))
	assert.Empty(t, gotServiceKey)
	assert.Empty(t, gotTenantID)
	assert.Contains(t, recorder.Header().Get("Omnibase-Resolved-Ids"), "line_items[0][price]=pro_monthly->price_123")
}

func TestProxy_OptOutLeavesRequestUntouched(t *testing.T) {
	var gotForm url.Values

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		require.NoError(t, err)
		gotForm, err = url.ParseQuery(string(body))
		require.NoError(t, err)
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{}`))
	}))
	defer upstream.Close()

	resolver := &handlerResolver{cfg: &stripe_proxy.ProxyConfig{
		Prices: map[string]string{"pro_monthly": "price_123"},
	}}
	tenants := &handlerTenants{tenant: stripe_proxy.Tenant{CustomerID: "cus_123"}}
	handler := newTestHandler(t, upstream.URL, resolver, tenants)
	tenantID := uuid.New()

	router := gin.New()
	router.Use(func(c *gin.Context) {
		authn.Set(c, &authn.Principal{Method: authn.AuthServiceKey, TenantID: tenantID})
		c.Next()
	})
	router.Any("/stripe/*path", handler.Proxy)

	form := url.Values{
		"line_items[0][price]": {"pro_monthly"},
		"customer":             {tenantID.String()},
	}
	req := httptest.NewRequest(http.MethodPost, "/stripe/v1/checkout/sessions", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Omnibase-Resolve-Ids", "false")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusOK, recorder.Code)
	assert.Equal(t, "pro_monthly", gotForm.Get("line_items[0][price]"))
	assert.Equal(t, tenantID.String(), gotForm.Get("customer"))
	assert.Empty(t, recorder.Header().Get("Omnibase-Resolved-Ids"))
}

func TestProxy_BlocksConfigWrites(t *testing.T) {
	upstreamHits := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		upstreamHits++
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	handler := newTestHandler(t, upstream.URL, &handlerResolver{cfg: &stripe_proxy.ProxyConfig{}}, &handlerTenants{})

	router := gin.New()
	router.Any("/stripe/*path", handler.Proxy)

	req := httptest.NewRequest(http.MethodPost, "/stripe/v1/prices", strings.NewReader("currency=usd"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	assert.Equal(t, http.StatusForbidden, recorder.Code)
	assert.Equal(t, 0, upstreamHits)
}

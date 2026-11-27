package stripe_proxy

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/google/uuid"

	"api/internal/config"
	"api/internal/database/repository"
	"api/internal/logger"
	"api/internal/services/billing"
	"api/internal/services/stripe_config"
)

type Error struct {
	Status  int
	Message string
	Err     error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func (e *Error) Unwrap() error {
	return e.Err
}

type CustomerCreator interface {
	CreateCustomer(ctx context.Context, args billing.CreateCustomerArgs) (string, error)
}

type Request struct {
	Method     string
	Path       string
	Header     http.Header
	Query      url.Values
	Form       url.Values
	Body       []byte
	IsForm     bool
	TenantID   uuid.UUID
	ResolveIDs bool
}

type Deps struct {
	Config        *config.Config
	Repo          repository.Querier
	ConfigService *stripe_config.Service
	Tenants       TenantStore
	Billing       CustomerCreator
	Resolver      ConfigResolver
	Client        *http.Client
}

type Service struct {
	client     *http.Client
	upstream   *url.URL
	managed    bool
	proxyToken string
	branchID   string
	secretKey  string
	resolver   ConfigResolver
	tenants    TenantStore
	billing    CustomerCreator
}

func New(deps Deps) *Service {
	s := &Service{
		client:  deps.Client,
		tenants: deps.Tenants,
		billing: deps.Billing,
	}
	if s.client == nil {
		s.client = &http.Client{Timeout: 60 * time.Second}
	}

	s.resolver = deps.Resolver
	if s.resolver == nil && deps.Repo != nil && deps.ConfigService != nil {
		s.resolver = NewConfigResolver(deps.Repo, deps.ConfigService)
	}

	if deps.Config != nil {
		cfg := deps.Config.StripeConfig
		s.secretKey = cfg.SecretKey
		if cfg.IsManaged && cfg.ProxyURL != "" && cfg.ProxyToken != "" && cfg.BranchID != "" {
			if upstream, err := url.Parse(strings.TrimRight(cfg.ProxyURL, "/") + "/api/v1/stripe/proxy"); err == nil {
				s.upstream = upstream
				s.managed = true
				s.proxyToken = cfg.ProxyToken
				s.branchID = cfg.BranchID
			}
		}
	}

	if s.upstream == nil {
		raw := "https://api.stripe.com"
		if deps.Config != nil && deps.Config.StripeConfig.APIBaseURL != "" {
			raw = deps.Config.StripeConfig.APIBaseURL
		}
		if upstream, err := url.Parse(strings.TrimRight(raw, "/")); err == nil {
			s.upstream = upstream
		} else {
			upstream, _ := url.Parse("https://api.stripe.com")
			s.upstream = upstream
		}
	}

	return s
}

func (s *Service) Forward(ctx context.Context, req Request) (*http.Response, error) {
	path := req.Path
	if !strings.HasPrefix(path, "/v1/") {
		return nil, &Error{Status: http.StatusNotFound, Message: "unknown stripe path"}
	}
	if isBlockedWrite(req.Method, path) {
		return nil, &Error{Status: http.StatusForbidden, Message: "stripe config resources are managed by OmniBase"}
	}

	form := cloneValues(req.Form)
	query := cloneValues(req.Query)

	var cfg *ProxyConfig
	var resolved []string
	if req.ResolveIDs {
		needsIDs := hasIDCandidates(path, form, query)
		needsMeterConfig := isMeterEvent(req.Method, path) && req.TenantID != uuid.Nil
		if needsIDs || needsMeterConfig {
			if s.resolver == nil {
				return nil, &Error{Status: http.StatusInternalServerError, Message: "stripe config resolver is not configured"}
			}
			var err error
			cfg, err = s.resolver.ProxyConfig(ctx)
			if err != nil {
				return nil, &Error{Status: http.StatusInternalServerError, Message: "resolve stripe config", Err: err}
			}
		}
		if needsIDs {
			var err error
			resolved, err = resolveIDs(&path, form, query, cfg)
			if err != nil {
				return nil, err
			}
		}
		customerResolved, err := s.injectCustomer(ctx, req, path, form, query, cfg)
		if err != nil {
			return nil, err
		}
		resolved = append(resolved, customerResolved...)
	}
	sort.Strings(resolved)

	body := req.Body
	if req.ResolveIDs && req.IsForm {
		body = []byte(form.Encode())
	}

	target := *s.upstream
	target.Path = strings.TrimRight(target.Path, "/") + path
	target.RawQuery = query.Encode()

	httpReq, err := http.NewRequestWithContext(ctx, req.Method, target.String(), bytes.NewReader(body))
	if err != nil {
		return nil, &Error{Status: http.StatusInternalServerError, Message: "build stripe request", Err: err}
	}
	copyHeaders(httpReq.Header, req.Header)
	if req.IsForm {
		httpReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	}
	if len(body) == 0 {
		httpReq.Body = http.NoBody
		httpReq.ContentLength = 0
	}

	if s.managed {
		httpReq.Header.Set("X-Api-Key", s.proxyToken)
		httpReq.Header.Set("X-Branch-Id", s.branchID)
	} else {
		httpReq.Header.Set("Authorization", "Bearer "+s.secretKey)
	}

	logger.Logger.Debug("stripe_proxy.request",
		"method", req.Method,
		"path", path,
		"tenant_id", req.TenantID,
		"managed", s.managed,
		"resolved_ids", len(resolved))

	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, &Error{Status: http.StatusInternalServerError, Message: "stripe request failed", Err: err}
	}

	if len(resolved) > 0 {
		resp.Header.Set("Omnibase-Resolved-Ids", strings.Join(resolved, ", "))
	}

	logger.Logger.Debug("stripe_proxy.response",
		"method", req.Method,
		"path", path,
		"status", resp.StatusCode)

	return resp, nil
}

func resolveIDs(path *string, form, query url.Values, cfg *ProxyConfig) ([]string, error) {
	if cfg == nil {
		return nil, &Error{Status: http.StatusInternalServerError, Message: "stripe config resolver is not configured"}
	}

	resolvedPath, pathResolved, err := resolvePath(*path, cfg)
	if err != nil {
		return nil, err
	}
	*path = resolvedPath

	formResolved, err := resolveValues(form, cfg)
	if err != nil {
		return nil, err
	}
	queryResolved, err := resolveValues(query, cfg)
	if err != nil {
		return nil, err
	}

	resolved := make([]string, 0, len(pathResolved)+len(formResolved)+len(queryResolved))
	resolved = append(resolved, pathResolved...)
	resolved = append(resolved, formResolved...)
	resolved = append(resolved, queryResolved...)
	return resolved, nil
}

func (s *Service) injectCustomer(ctx context.Context, req Request, path string, form, query url.Values, cfg *ProxyConfig) ([]string, error) {
	if req.TenantID == uuid.Nil {
		return nil, nil
	}

	location, field := customerTarget(req.Method, path)
	hasFormCustomer := form.Has("customer")
	hasQueryCustomer := query.Has("customer")
	if location == "" && !hasFormCustomer && !hasQueryCustomer {
		return nil, nil
	}
	if s.tenants == nil {
		return nil, &Error{Status: http.StatusInternalServerError, Message: "tenant store is not configured"}
	}

	tenant, err := s.tenants.Get(ctx, req.TenantID)
	if err != nil {
		if errors.Is(err, ErrTenantNotFound) {
			return nil, &Error{Status: http.StatusNotFound, Message: "tenant not found"}
		}
		return nil, &Error{Status: http.StatusInternalServerError, Message: "load tenant", Err: err}
	}
	customerID := tenant.CustomerID

	ensureCustomer := func() (string, error) {
		if customerID != "" {
			return customerID, nil
		}
		if s.billing == nil {
			return "", &Error{Status: http.StatusInternalServerError, Message: "billing is not configured"}
		}
		created, err := s.billing.CreateCustomer(ctx, billing.CreateCustomerArgs{Name: tenant.Name})
		if err != nil {
			return "", &Error{Status: http.StatusInternalServerError, Message: "create stripe customer", Err: err}
		}
		if created == "" {
			return "", &Error{Status: http.StatusInternalServerError, Message: "create stripe customer returned an empty id"}
		}
		if err := s.tenants.SetCustomer(ctx, req.TenantID, created); err != nil {
			return "", &Error{Status: http.StatusInternalServerError, Message: "store stripe customer", Err: err}
		}
		customerID = created
		return created, nil
	}

	var resolved []string

	if hasFormCustomer || hasQueryCustomer {
		values := form
		if !hasFormCustomer {
			values = query
		}
		value := values.Get("customer")
		if value == req.TenantID.String() {
			customer, err := ensureCustomer()
			if err != nil {
				return nil, err
			}
			values.Set("customer", customer)
			resolved = append(resolved, fmt.Sprintf("customer=tenant:%s->%s", req.TenantID, customer))
		} else if customerID == "" || value != customerID {
			return nil, &Error{Status: http.StatusBadRequest, Message: "customer does not belong to tenant"}
		}
	}

	switch location {
	case "form":
		if !req.IsForm {
			return nil, &Error{Status: http.StatusBadRequest, Message: "customer injection requires a form-encoded request"}
		}
		switch field {
		case "customer":
			if !form.Has("customer") {
				customer, err := ensureCustomer()
				if err != nil {
					return nil, err
				}
				form.Set("customer", customer)
				resolved = append(resolved, "customer->"+customer)
			}
		case "meter":
			key := defaultMeterCustomerPayloadKey
			if cfg != nil {
				if configured := cfg.MeterCustomerValues[form.Get("event_name")]; configured != "" {
					key = configured
				}
			}
			payloadKey := "payload[" + key + "]"
			if form.Has(payloadKey) {
				value := form.Get(payloadKey)
				if value == req.TenantID.String() {
					customer, err := ensureCustomer()
					if err != nil {
						return nil, err
					}
					form.Set(payloadKey, customer)
					resolved = append(resolved, fmt.Sprintf("%s=tenant:%s->%s", payloadKey, req.TenantID, customer))
				} else if customerID == "" || value != customerID {
					return nil, &Error{Status: http.StatusBadRequest, Message: "customer does not belong to tenant"}
				}
			} else {
				customer, err := ensureCustomer()
				if err != nil {
					return nil, err
				}
				form.Set(payloadKey, customer)
				resolved = append(resolved, payloadKey+"->"+customer)
			}
		}
	case "query":
		if !query.Has("customer") {
			customer, err := ensureCustomer()
			if err != nil {
				return nil, err
			}
			query.Set("customer", customer)
			resolved = append(resolved, "customer->"+customer)
		}
	}

	return resolved, nil
}

func resolvePath(path string, cfg *ProxyConfig) (string, []string, error) {
	parts := strings.Split(strings.TrimPrefix(path, "/"), "/")
	if len(parts) < 3 || parts[0] != "v1" {
		return path, nil, nil
	}
	kind := pathKind(parts[1])
	if kind == "" {
		return path, nil, nil
	}
	value := parts[2]
	if value == "" || isStripeID(value) {
		return path, nil, nil
	}

	mapped, ok := configMap(cfg, kind)[value]
	if !ok || mapped == "" {
		return "", nil, &Error{
			Status:  http.StatusUnprocessableEntity,
			Message: fmt.Sprintf("unknown %s config id %q", kind, value),
		}
	}

	parts[2] = mapped
	return "/" + strings.Join(parts, "/"), []string{fmt.Sprintf("path:%s->%s", value, mapped)}, nil
}

func resolveValues(values url.Values, cfg *ProxyConfig) ([]string, error) {
	var resolved []string
	for key, vals := range values {
		kind := fieldKind(key)
		if kind == "" {
			continue
		}
		mapping := configMap(cfg, kind)
		for i, value := range vals {
			if value == "" || isStripeID(value) {
				continue
			}
			mapped, ok := mapping[value]
			if !ok || mapped == "" {
				return nil, &Error{
					Status:  http.StatusUnprocessableEntity,
					Message: fmt.Sprintf("unknown %s config id %q in %s", kind, value, key),
				}
			}
			values[key][i] = mapped
			resolved = append(resolved, fmt.Sprintf("%s=%s->%s", key, value, mapped))
		}
	}
	return resolved, nil
}

func configMap(cfg *ProxyConfig, kind string) map[string]string {
	if cfg == nil {
		return nil
	}
	switch kind {
	case "price":
		return cfg.Prices
	case "product":
		return cfg.Products
	case "coupon":
		return cfg.Coupons
	case "promotion_code":
		return cfg.Promos
	}
	return nil
}

func fieldKind(key string) string {
	if strings.HasPrefix(key, "metadata[") {
		return ""
	}
	base := key
	if idx := strings.LastIndex(base, "["); idx >= 0 && strings.HasSuffix(base, "]") {
		base = base[idx+1 : len(base)-1]
	}
	switch base {
	case "price":
		return "price"
	case "product":
		return "product"
	case "coupon":
		return "coupon"
	case "promotion_code":
		return "promotion_code"
	}
	return ""
}

func pathKind(resource string) string {
	switch resource {
	case "prices":
		return "price"
	case "products":
		return "product"
	case "coupons":
		return "coupon"
	case "promotion_codes":
		return "promotion_code"
	}
	return ""
}

func isStripeID(value string) bool {
	for _, prefix := range []string{"price_", "prod_", "promo_", "mtr_"} {
		if strings.HasPrefix(value, prefix) {
			return true
		}
	}
	return false
}

func hasIDCandidates(path string, form, query url.Values) bool {
	parts := strings.Split(strings.TrimPrefix(path, "/"), "/")
	if len(parts) >= 3 && parts[0] == "v1" && pathKind(parts[1]) != "" {
		if parts[2] != "" && !isStripeID(parts[2]) {
			return true
		}
	}
	for _, values := range []url.Values{form, query} {
		for key, vals := range values {
			if fieldKind(key) == "" {
				continue
			}
			for _, value := range vals {
				if value != "" && !isStripeID(value) {
					return true
				}
			}
		}
	}
	return false
}

func isMeterEvent(method, path string) bool {
	return method == http.MethodPost && path == "/v1/billing/meter_events"
}

func customerTarget(method, path string) (string, string) {
	switch method {
	case http.MethodPost:
		switch path {
		case "/v1/checkout/sessions", "/v1/billing_portal/sessions", "/v1/subscriptions", "/v1/invoices", "/v1/invoiceitems":
			return "form", "customer"
		case "/v1/billing/meter_events":
			return "form", "meter"
		}
	case http.MethodGet:
		switch path {
		case "/v1/subscriptions", "/v1/invoices", "/v1/invoiceitems", "/v1/checkout/sessions", "/v1/payment_methods":
			return "query", "customer"
		}
	}
	return "", ""
}

func isBlockedWrite(method, path string) bool {
	if method == http.MethodGet || method == http.MethodHead {
		return false
	}
	for _, prefix := range []string{
		"/v1/products",
		"/v1/prices",
		"/v1/coupons",
		"/v1/promotion_codes",
		"/v1/billing/meters",
	} {
		if path == prefix || strings.HasPrefix(path, prefix+"/") {
			return true
		}
	}
	return false
}

func cloneValues(values url.Values) url.Values {
	out := make(url.Values, len(values))
	for key, vals := range values {
		out[key] = append([]string(nil), vals...)
	}
	return out
}

func copyHeaders(dst, src http.Header) {
	for key, vals := range src {
		if !forwardHeader(key) {
			continue
		}
		for _, value := range vals {
			dst.Add(key, value)
		}
	}
}

func forwardHeader(key string) bool {
	lower := strings.ToLower(key)
	switch lower {
	case "authorization",
		"x-service-key",
		"x-app-key",
		"x-user-id",
		"x-tenant-id",
		"x-session-token",
		"x-api-key",
		"x-branch-id",
		"stripe-account",
		"cookie",
		"accept-encoding",
		"connection",
		"keep-alive",
		"proxy-authenticate",
		"proxy-authorization",
		"te",
		"trailer",
		"transfer-encoding",
		"upgrade",
		"content-length",
		"host":
		return false
	}
	return !strings.HasPrefix(lower, "omnibase-")
}

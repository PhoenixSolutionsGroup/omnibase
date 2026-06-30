package testenv

import (
	"bufio"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"testing"

	"api/internal/config"
	"api/internal/server"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"
)

const SandboxKeyEnv = "STRIPE_TEST_SECRET_KEY"

var (
	sandboxApiOnce sync.Once
	sandboxApiURL  string
)

type Sandbox struct {
	Env          *Env
	Client       *sdk.APIClient
	StripeClient *stripe.Client
	SandboxKey   string
}

func SetupSandbox(t *testing.T, configFixture string) *Sandbox {
	t.Helper()
	key := SkipUnlessSandbox(t)
	env := Start(t)
	StartAPIWithSandbox(t, env, key)
	client := NewSandboxClient(t)
	if configFixture != "" {
		EnsureStripeConfig(t, client, configFixture)
	}
	return &Sandbox{
		Env:          env,
		Client:       client,
		StripeClient: stripe.NewClient(key),
		SandboxKey:   key,
	}
}

func loadDotEnv() {
	if os.Getenv(SandboxKeyEnv) != "" {
		return
	}
	_, thisFile, _, _ := runtime.Caller(0)
	dotenvPath := filepath.Join(filepath.Dir(thisFile), "..", "..", ".env")
	f, err := os.Open(dotenvPath)
	if err != nil {
		return
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		v = strings.Trim(strings.TrimSpace(v), `"'`)
		if os.Getenv(k) == "" {
			os.Setenv(k, v)
		}
	}
	_ = scanner.Err()
}

func SkipUnlessSandbox(t *testing.T) string {
	t.Helper()
	loadDotEnv()
	key := os.Getenv(SandboxKeyEnv)
	if key == "" {
		t.Skipf("sandbox tests require %s env var (set in apps/api/.env or shell)", SandboxKeyEnv)
	}
	if !strings.HasPrefix(key, "sk_test_") {
		t.Fatalf("%s must be a test-mode key (sk_test_...)", SandboxKeyEnv)
	}
	return key
}

func StartAPIWithSandbox(t *testing.T, env *Env, sandboxKey string) string {
	t.Helper()
	sandboxApiOnce.Do(func() {
		envs := map[string]string{
			"DB_HOST":               env.PgbouncerHost,
			"DB_PORT":               env.PgbouncerPort,
			"DB_USER":               "postgres",
			"DB_PASSWORD":           "postgres",
			"DB_NAME":               "db",
			"DB_SSLMODE":            "disable",
			"AUTH_URL":              env.KratosPublic,
			"AUTH_ADMIN_URL":        env.KratosAdmin,
			"PERMISSIONS_READ_URL":  env.KetoRead,
			"PERMISSIONS_WRITE_URL": env.KetoWrite,
			"STRIPE_API_URL":        "",
			"STRIPE_SECRET_KEY":     sandboxKey,
			"STRIPE_WEBHOOK_SECRET": "whsec_test_integration",
			"SMTP_CONNECTION_URI":   "smtp://" + env.MailpitSMTP + "?disable_starttls=true",
			"SMTP_FROM_EMAIL":       "noreply@test.omnibase",
			"FRONTEND_URL":          "http://127.0.0.1:3000",
			"JWT_SIGNING_KEY":       "test-jwt-signing-key-for-integration-tests",
			"JWT_SECRET":            ServiceKey,
			"ENCRYPTION_MASTER_KEY": "integration-test-master-key-32by",
			"S3_ENDPOINT":           env.RustFSURL,
			"S3_PUBLIC_ENDPOINT":    env.RustFSURL,
			"S3_ACCESS_KEY":         "rustfsadmin",
			"S3_SECRET_KEY":         "rustfsadmin123",
			"S3_BUCKET_NAME":        "dev",
			"S3_REGION":             "us-east-1",
			"S3_USE_SSL":            "false",
			"S3_FORCE_PATH_STYLE":   "true",
			"CORS_ALLOWED_ORIGINS":  "*",
			"LOG_LEVEL":             "warn",
		}
		for k, v := range envs {
			os.Setenv(k, v)
		}
		cfg := config.New()
		engine := server.New(cfg)
		srv := httptest.NewServer(engine)
		sandboxApiURL = srv.URL
	})
	return sandboxApiURL
}

func NewSandboxClient(t *testing.T) *sdk.APIClient {
	t.Helper()
	require.NotEmpty(t, sandboxApiURL, "StartAPIWithSandbox must be called before NewSandboxClient")
	cfg := sdk.NewConfiguration()
	cfg.Servers = sdk.ServerConfigurations{sdk.ServerConfiguration{URL: sandboxApiURL}}
	cfg.DefaultHeader["X-Service-Key"] = ServiceKey
	cfg.HTTPClient = &http.Client{Transport: ctxHeaderTransport{rt: http.DefaultTransport}}
	return sdk.NewAPIClient(cfg)
}

func StripeConfigFixturePath(t *testing.T, name string) string {
	t.Helper()
	_, thisFile, _, _ := runtime.Caller(0)
	return filepath.Join(filepath.Dir(thisFile), "..", "fixtures", "stripe", name)
}

func EnsureStripeConfig(t *testing.T, client *sdk.APIClient, fixtureName string) {
	t.Helper()

	data, err := os.ReadFile(StripeConfigFixturePath(t, fixtureName))
	require.NoError(t, err, "read fixture")

	var req map[string]interface{}
	require.NoError(t, json.Unmarshal(data, &req), "parse fixture")

	out, httpResp, err := client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
		Body(req).
		Execute()
	require.NoError(t, err, "update stripe config")
	require.NotNil(t, httpResp)
	require.Equal(t, http.StatusOK, httpResp.StatusCode)
	require.NotNil(t, out)
	t.Logf("seeded stripe config from %s", fixtureName)
}

func FirstConfiguredPlanID(t *testing.T, client *sdk.APIClient) string {
	t.Helper()
	cfg, resp, err := client.V1StripeAPI.GetStripeConfig(context.Background()).Execute()
	require.NoError(t, err)
	require.NotNil(t, resp)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	require.NotNil(t, cfg)
	require.NotEmpty(t, cfg.Config.Products, "config has no products")
	require.NotEmpty(t, cfg.Config.Products[0].Prices, "first product has no prices")
	planID := cfg.Config.Products[0].Prices[0].Id
	require.NotEmpty(t, planID)
	return planID
}

func StripeIDForConfigPrice(t *testing.T, client *sdk.APIClient, configPriceID string) string {
	t.Helper()
	cfg, resp, err := client.V1StripeAPI.GetStripeConfigAdmin(context.Background()).Execute()
	require.NoError(t, err)
	require.NotNil(t, resp)
	require.Equal(t, http.StatusOK, resp.StatusCode)
	require.NotNil(t, cfg)
	for _, p := range cfg.Config.Products {
		for _, pr := range p.Prices {
			if pr.Id == configPriceID {
				require.NotNil(t, pr.StripeId, "config price %s has no stripe_id mapping", configPriceID)
				require.NotEmpty(t, *pr.StripeId)
				return *pr.StripeId
			}
		}
	}
	t.Fatalf("config price %s not found in admin config", configPriceID)
	return ""
}

func AttachVisaCard(t *testing.T, sc *stripe.Client, customerID string) string {
	t.Helper()
	ctx := context.Background()

	pm, err := sc.V1PaymentMethods.Attach(ctx, "pm_card_visa",
		&stripe.PaymentMethodAttachParams{Customer: stripe.String(customerID)})
	require.NoError(t, err, "attach pm_card_visa")
	require.NotEmpty(t, pm.ID)

	_, err = sc.V1Customers.Update(ctx, customerID, &stripe.CustomerUpdateParams{
		InvoiceSettings: &stripe.CustomerUpdateInvoiceSettingsParams{
			DefaultPaymentMethod: stripe.String(pm.ID),
		},
	})
	require.NoError(t, err, "set default payment method")
	return pm.ID
}

func CancelAllSubscriptions(sc *stripe.Client, customerID string) {
	ctx := context.Background()
	iter := sc.V1Subscriptions.List(ctx, &stripe.SubscriptionListParams{
		Customer: stripe.String(customerID),
		Status:   stripe.String("all"),
	})
	for sub, err := range iter {
		if err != nil {
			return
		}
		if sub.Status == "canceled" {
			continue
		}
		_, _ = sc.V1Subscriptions.Cancel(ctx, sub.ID, nil)
	}
}

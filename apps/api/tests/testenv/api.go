package testenv

import (
	"bytes"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"sync"
	"testing"
	"time"

	"api/internal/config"
	"api/internal/server"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
	"github.com/stretchr/testify/require"
)

const ServiceKey = "VERY_SECRET_KEY"

var (
	apiOnce sync.Once
	apiURL  string
	apiSrv  *httptest.Server
)

func NewSDKClient(t *testing.T) *sdk.APIClient {
	t.Helper()
	require.NotEmpty(t, apiURL, "StartAPI must be called before NewSDKClient")

	cfg := sdk.NewConfiguration()
	cfg.Servers = sdk.ServerConfigurations{sdk.ServerConfiguration{URL: apiURL}}
	cfg.DefaultHeader["X-Service-Key"] = ServiceKey
	return sdk.NewAPIClient(cfg)
}

func StartAPI(t *testing.T, env *Env) string {
	t.Helper()

	apiOnce.Do(func() {
		envs := map[string]string{
			"DB_HOST":              env.PgbouncerHost,
			"DB_PORT":              env.PgbouncerPort,
			"DB_USER":              "postgres",
			"DB_PASSWORD":          "postgres",
			"DB_NAME":              "db",
			"DB_SSLMODE":           "disable",
			"AUTH_URL":             env.KratosPublic,
			"AUTH_ADMIN_URL":       env.KratosAdmin,
			"PERMISSIONS_READ_URL":  env.KetoRead,
			"PERMISSIONS_WRITE_URL": env.KetoWrite,
			"STRIPE_API_URL":       env.StripeMockURL,
			"STRIPE_SECRET_KEY":    "sk_test_integration",
			"STRIPE_WEBHOOK_SECRET": "whsec_test_integration",
			"SMTP_CONNECTION_URI":  "smtp://" + env.MailpitSMTP + "?disable_starttls=true",
			"SMTP_FROM_EMAIL":      "noreply@test.omnibase",
			"FRONTEND_URL":         "http://127.0.0.1:3000",
			"JWT_SIGNING_KEY":      "test-jwt-signing-key-for-integration-tests",
			"JWT_SECRET":           ServiceKey,
			"ENCRYPTION_MASTER_KEY": "integration-test-master-key-32by",
			"S3_ENDPOINT":          env.RustFSURL,
			"S3_PUBLIC_ENDPOINT":   env.RustFSURL,
			"S3_ACCESS_KEY":        "rustfsadmin",
			"S3_SECRET_KEY":        "rustfsadmin123",
			"S3_BUCKET_NAME":       "dev",
			"S3_REGION":            "us-east-1",
			"S3_USE_SSL":           "false",
			"S3_FORCE_PATH_STYLE":  "true",
			"CORS_ALLOWED_ORIGINS": "*",
			"LOG_LEVEL":            "warn",
		}
		for k, v := range envs {
			os.Setenv(k, v)
		}

		cfg := config.New()
		engine := server.New(cfg)
		apiSrv = httptest.NewServer(engine)
		apiURL = apiSrv.URL
	})

	return apiURL
}

func APIRequest(t *testing.T, method, path string, body []byte, headers map[string]string) *http.Response {
	t.Helper()
	require.NotEmpty(t, apiURL, "StartAPI must be called before APIRequest")

	var reader io.Reader
	if body != nil {
		reader = bytes.NewReader(body)
	}
	req, err := http.NewRequest(method, apiURL+path, reader)
	require.NoError(t, err)
	req.Header.Set("X-Service-Key", ServiceKey)
	req.Header.Set("Content-Type", "application/json")
	for k, v := range headers {
		req.Header.Set(k, v)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	require.NoError(t, err)
	t.Cleanup(func() {
		if resp.Body != nil {
			resp.Body.Close()
		}
	})
	return resp
}

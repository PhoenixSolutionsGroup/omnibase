package db_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/middleware"
	v1 "api/internal/routes/v1"
	"api/tests/testenv"
)

func startProxy(t *testing.T, env *testenv.Env) string {
	t.Helper()
	gin.SetMode(gin.TestMode)

	cfg := &config.Config{
		PostgRESTURL:  env.PostgRESTURL,
		APIServiceKey: testenv.ServiceKey,
		Database: config.DatabaseConfig{
			SigningKey: "test-jwt-signing-key-for-integration-tests",
		},
		AuthConfig: config.AuthConfig{AuthURL: env.KratosPublic},
	}
	auth := middleware.NewAuthMiddleware(cfg, nil, nil)

	r := gin.New()
	v1.SetUpRestRoutes(r.Group("/api/v1/rest"), v1.Deps{Cfg: cfg, Auth: auth})

	srv := httptest.NewServer(r)
	t.Cleanup(srv.Close)
	return srv.URL
}

func TestPostgRESTProxy_ServiceKey(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	proxyURL := startProxy(t, env)

	req, err := http.NewRequest(http.MethodGet, proxyURL+"/api/v1/rest/", nil)
	require.NoError(t, err)
	req.Header.Set("X-Service-Key", testenv.ServiceKey)
	req.Header.Set("Accept", "application/openapi+json")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestPostgRESTProxy_InvalidSession(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	proxyURL := startProxy(t, env)

	req, err := http.NewRequest(http.MethodGet, proxyURL+"/api/v1/rest/", nil)
	require.NoError(t, err)
	req.AddCookie(&http.Cookie{Name: "ory_kratos_session", Value: "invalid"})

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestPostgRESTProxy_AnonymousAllowed(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	proxyURL := startProxy(t, env)

	req, err := http.NewRequest(http.MethodGet, proxyURL+"/api/v1/rest/", nil)
	require.NoError(t, err)
	req.Header.Set("Accept", "application/openapi+json")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

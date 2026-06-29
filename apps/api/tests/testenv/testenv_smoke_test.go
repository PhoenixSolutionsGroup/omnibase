package testenv_test

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

func TestStart_BringsUpStack(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping testcontainers smoke test in -short")
	}

	env := testenv.Start(t)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	t.Run("postgres reachable", func(t *testing.T) {
		conn, err := pgx.Connect(ctx, env.PostgresDSN)
		require.NoError(t, err)
		defer conn.Close(ctx)

		var one int
		require.NoError(t, conn.QueryRow(ctx, "SELECT 1").Scan(&one))
		assert.Equal(t, 1, one)
	})

	t.Run("migrations ran", func(t *testing.T) {
		conn, err := pgx.Connect(ctx, env.PostgresDSN)
		require.NoError(t, err)
		defer conn.Close(ctx)

		var exists bool
		require.NoError(t, conn.QueryRow(ctx,
			`SELECT EXISTS (SELECT FROM information_schema.tables
				WHERE table_schema = 'auth' AND table_name = 'tenants')`,
		).Scan(&exists))
		assert.True(t, exists, "auth.tenants should exist after migrations")
	})

	t.Run("kratos public health", func(t *testing.T) {
		resp := mustGet(t, env.KratosPublic+"/health/ready")
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("keto read health", func(t *testing.T) {
		resp := mustGet(t, env.KetoRead+"/health/ready")
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("stripe-mock responds", func(t *testing.T) {
		resp := mustGet(t, env.StripeMockURL+"/v1/customers")
		assert.NotEqual(t, 0, resp.StatusCode)
	})

	t.Run("mailpit web", func(t *testing.T) {
		resp := mustGet(t, env.MailpitWeb+"/api/v1/info")
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})
}

func mustGet(t *testing.T, url string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, url, nil)
	require.NoError(t, err)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	require.NoError(t, err)
	t.Cleanup(func() { resp.Body.Close() })
	return resp
}

package auth_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/testenv"
)

func TestWhoAmI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("no auth headers returns 401", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/auth/whoami", nil, nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("service key alone returns 401", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/auth/whoami", nil, map[string]string{
			"X-Service-Key": testenv.ServiceKey,
		})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("invalid session token returns 401", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/auth/whoami", nil, map[string]string{
			"X-Session-Token": "not-a-valid-jwt",
		})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})
}

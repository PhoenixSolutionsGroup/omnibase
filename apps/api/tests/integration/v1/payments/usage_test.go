package payments_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/testenv"
)

func TestRecordUsageAuth(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	body := []byte(`{"meter_event_name":"test_meter","value":"1"}`)

	t.Run("admin key reaches the handler", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/payments/usage", body, nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("app key is rejected", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/payments/usage", body, map[string]string{
			"X-Service-Key": "",
			"X-App-Key":     testenv.ServiceKey,
			"X-User-Id":     "00000000-0000-4000-8000-000000000001",
			"X-Tenant-Id":   "00000000-0000-4000-8000-000000000002",
		})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("session token is rejected", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/payments/usage", body, map[string]string{
			"X-Service-Key":   "",
			"X-Session-Token": "not-a-real-session",
		})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})
}

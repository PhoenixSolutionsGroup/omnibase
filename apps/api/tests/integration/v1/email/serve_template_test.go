package email_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/testenv"
)

func TestEmailServeTemplate(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("invalid type returns 400", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/recovery/bogus", nil, nil)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("unknown app template name returns 404", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/no_such_template_name/body", nil, nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("app templates do not fall back to system static templates", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/recovery/body", nil, nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("unauthenticated app template serve returns 401", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/anything/body", nil,
			map[string]string{"X-Service-Key": ""})
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("system template endpoints require the admin key", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/system-templates/recovery/body", nil,
			map[string]string{"X-Service-Key": ""})
		assert.Equal(t, http.StatusUnauthorized, resp.StatusCode)
	})

	t.Run("unknown system template name returns 404", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/system-templates/no_such_system_template/body", nil, nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

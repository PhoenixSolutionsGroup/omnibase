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
		defer resp.Body.Close()
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})

	t.Run("unknown template name returns 404", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/templates/no_such_template_name/body", nil, nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

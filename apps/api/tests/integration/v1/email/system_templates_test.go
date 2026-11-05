package email_test

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	"api/tests/testenv"
)

func TestEmailSystemTemplates(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	name := "test-system-" + helpers.UniqueID()
	createBody := fmt.Sprintf(`{"name":%q,"subject":"System Subject","html_body":"<p>system body</p>","plaintext_body":"system plain"}`,
		name)

	t.Run("create system template", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/email/system-templates", []byte(createBody), nil)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)
		assert.Contains(t, string(body), name)
	})

	t.Run("list system templates", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/system-templates", nil, nil)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)
		assert.Contains(t, string(body), name)
	})

	t.Run("serve system template files", func(t *testing.T) {
		cases := map[string]string{
			"subject":   "System Subject",
			"body":      "<p>system body</p>",
			"plaintext": "system plain",
		}
		for fileType, want := range cases {
			resp := testenv.APIRequest(t, http.MethodGet,
				fmt.Sprintf("/api/v1/email/system-templates/%s/%s", name, fileType), nil, nil)
			require.Equal(t, http.StatusOK, resp.StatusCode, "type %s", fileType)
			body, err := io.ReadAll(resp.Body)
			require.NoError(t, err)
			assert.True(t, strings.Contains(string(body), want), "type %s body %q", fileType, string(body))
		}
	})

	t.Run("delete system template", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodDelete, "/api/v1/email/system-templates/"+name, nil, nil)
		require.Equal(t, http.StatusOK, resp.StatusCode)
	})

	t.Run("deleted system template no longer serves", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/email/system-templates/"+name+"/body", nil, nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})

	t.Run("delete missing system template returns 404", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodDelete, "/api/v1/email/system-templates/does-not-exist-"+helpers.UniqueID(), nil, nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

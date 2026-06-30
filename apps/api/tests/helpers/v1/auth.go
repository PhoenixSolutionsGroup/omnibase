package v1

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
)

func CreateUser(t *testing.T, client *sdk.APIClient, email, password string) string {
	t.Helper()
	body := map[string]interface{}{
		"email":    email,
		"password": password,
		"name": map[string]interface{}{
			"first": "Test",
			"last":  "User",
		},
	}
	raw, err := json.Marshal(body)
	require.NoError(t, err)

	cfg := client.GetConfig()
	require.NotEmpty(t, cfg.Servers, "client must have at least one server configured")
	base := cfg.Servers[0].URL

	req, err := http.NewRequest(http.MethodPost, base+"/api/v1/auth/users", bytes.NewReader(raw))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	for k, v := range cfg.DefaultHeader {
		req.Header.Set(k, v)
	}

	httpClient := cfg.HTTPClient
	if httpClient == nil {
		httpClient = http.DefaultClient
	}
	resp, err := httpClient.Do(req)
	require.NoError(t, err, "createUser http call")
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	require.Equal(t, http.StatusOK, resp.StatusCode, "createUser status=%d body=%s", resp.StatusCode, respBody)

	var parsed struct {
		Id string `json:"id"`
	}
	require.NoError(t, json.Unmarshal(respBody, &parsed), "parse createUser response: %s", respBody)
	require.NotEmpty(t, parsed.Id, "createUser response missing id: %s", respBody)
	return parsed.Id
}

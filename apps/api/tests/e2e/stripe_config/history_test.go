package stripe_config_test

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	"api/tests/testenv"
)

func pushVariant(t *testing.T, sb *testenv.Sandbox, version string) {
	t.Helper()
	data, err := os.ReadFile(testenv.StripeConfigFixturePath(t, "example.config.json"))
	require.NoError(t, err)

	var body map[string]interface{}
	require.NoError(t, json.Unmarshal(data, &body))
	body["version"] = version

	_, resp, err := sb.Client.V1ConfigurationAPI.UpdateStripeConfig(context.Background()).
		Body(body).
		Execute()
	require.NoError(t, err)
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestStripeConfigHistory(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping e2e test in -short")
	}

	sb := testenv.SetupSandbox(t, "example.config.json")

	pushVariant(t, sb, "hist-"+helpers.UniqueID())
	pushVariant(t, sb, "hist-"+helpers.UniqueID())

	t.Run("no_params_returns_all", func(t *testing.T) {
		out, resp, err := sb.Client.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.NotEmpty(t, out.Configs, "history should be non-empty")
		assert.GreaterOrEqual(t, out.Pagination.Total, int64(3), "expected at least 3 history entries")
	})

	t.Run("limit_caps_results", func(t *testing.T) {
		out, resp, err := sb.Client.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).
			Limit(1).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Len(t, out.Configs, 1, "limit=1 must yield exactly one entry")
		assert.Equal(t, int64(1), out.Pagination.PerPage)
	})

	t.Run("offset_skips_entries", func(t *testing.T) {
		firstPage, resp, err := sb.Client.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).
			Limit(2).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.GreaterOrEqual(t, len(firstPage.Configs), 2)
		firstID := firstPage.Configs[0].Id
		secondID := firstPage.Configs[1].Id

		offsetPage, resp2, err := sb.Client.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).
			Limit(2).
			Offset(1).
			Execute()
		require.NoError(t, err)
		require.Equal(t, http.StatusOK, resp2.StatusCode)
		require.NotEmpty(t, offsetPage.Configs)
		assert.NotEqual(t, firstID, offsetPage.Configs[0].Id, "offset=1 must skip the first entry")
		assert.Equal(t, secondID, offsetPage.Configs[0].Id, "offset=1 head should equal offset=0 second entry")
	})

	t.Run("invalid_limit_returns_400", func(t *testing.T) {
		_, resp, err := sb.Client.V1ConfigurationAPI.GetStripeConfigHistory(context.Background()).
			Limit(-1).
			Execute()
		require.Error(t, err, "handler rejects limit<1 (see get_config_history.go)")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

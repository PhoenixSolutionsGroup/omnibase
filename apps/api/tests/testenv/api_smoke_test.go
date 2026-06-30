package testenv_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

func TestStartAPI_HealthReady(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping testcontainers smoke test in -short")
	}

	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	require.NotEmpty(t, apiURL)

	resp, err := http.Get(apiURL + "/health")
	require.NoError(t, err)
	defer resp.Body.Close()
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	resp2, err := http.Get(apiURL + "/api/v1/does-not-exist")
	require.NoError(t, err)
	defer resp2.Body.Close()
	assert.Equal(t, http.StatusNotFound, resp2.StatusCode)
}

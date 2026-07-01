package auth_test

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

const serviceOnlyPath = "/api/v1/tenants/by-id/00000000-0000-0000-0000-000000000000"

func TestAuthHeaders_MissingServiceKey(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)

	req, err := http.NewRequest(http.MethodGet, apiURL+serviceOnlyPath, nil)
	require.NoError(t, err)

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	require.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestAuthHeaders_InvalidServiceKey(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)

	req, err := http.NewRequest(http.MethodGet, apiURL+serviceOnlyPath, nil)
	require.NoError(t, err)
	req.Header.Set("X-Service-Key", "wrong-key")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	require.Equal(t, http.StatusUnauthorized, resp.StatusCode)
}

func TestAuthHeaders_MissingUserIdOnCreateTenant(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	body := sdk.CreateTenantRequest{
		BillingEmail: "no-user@example.com",
		Name:         "No User Tenant",
		Type:         "personal",
	}

	_, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.Ctx()).CreateTenantRequest(body).Execute()
	require.Error(t, err)
	require.NotNil(t, resp)
	defer resp.Body.Close()

	require.Contains(t, []int{http.StatusBadRequest, http.StatusUnauthorized}, resp.StatusCode)
}

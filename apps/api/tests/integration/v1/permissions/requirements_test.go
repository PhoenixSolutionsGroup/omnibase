package permissions_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

func TestPermissionRequirements(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/permissions/requirements", nil, nil)
	defer resp.Body.Close()
	require.Equal(t, http.StatusOK, resp.StatusCode)

	var out struct {
		Files []struct {
			Name     string `json:"name"`
			Contents string `json:"contents"`
		} `json:"files"`
		Namespaces []struct {
			Namespace string   `json:"namespace"`
			File      string   `json:"file"`
			Relations []string `json:"relations"`
			Permits   []string `json:"permits"`
		} `json:"namespaces"`
	}
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&out))

	require.NotEmpty(t, out.Files)
	byNamespace := map[string]struct {
		relations []string
		permits   []string
	}{}
	for _, namespace := range out.Namespaces {
		byNamespace[namespace.Namespace] = struct {
			relations []string
			permits   []string
		}{relations: namespace.Relations, permits: namespace.Permits}
	}

	tenant, ok := byNamespace["Tenant"]
	require.True(t, ok, "Tenant namespace is required")
	assert.Contains(t, tenant.relations, "can_invite_user")
	assert.Contains(t, tenant.permits, "invite_user")

	storage, ok := byNamespace["StorageObject"]
	require.True(t, ok, "StorageObject namespace is required")
	assert.Contains(t, storage.relations, "owner")
	assert.Contains(t, storage.permits, "read")

	_, ok = byNamespace["User"]
	assert.True(t, ok, "User namespace is required")
}

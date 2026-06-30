package tenants_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestTenantLookupByID(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("test-lookup-id-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	userID := h.CreateUser(t, client, email, pw)
	tenant := h.CreateTenant(t, client, userID, "Lookup By ID "+id, email).Tenant

	t.Run("get by id returns tenant", func(t *testing.T) {
		out, resp, err := h.GetTenantByID(t, client, tenant.Id)
		require.NoError(t, err)
		require.NotNil(t, resp)
		require.Equal(t, http.StatusOK, resp.StatusCode)
		require.NotNil(t, out)
		assert.Equal(t, tenant.Id, out.Id)
		assert.Equal(t, "Lookup By ID "+id, out.Name)
	})

	t.Run("get by invalid uuid returns 400 or 404", func(t *testing.T) {
		_, resp, _ := h.GetTenantByID(t, client, "not-a-valid-uuid")
		require.NotNil(t, resp)
		assert.True(t, resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusNotFound,
			"expected 400 or 404, got %d", resp.StatusCode)
	})

	t.Run("get by non-existent uuid returns 404", func(t *testing.T) {
		_, resp, _ := h.GetTenantByID(t, client, "00000000-0000-0000-0000-000000000000")
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

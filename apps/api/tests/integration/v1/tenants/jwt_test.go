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

func TestTenantJWT_NotMember(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerEmail := fmt.Sprintf("jwt-owner-%s@example.com", id)
	outsiderEmail := fmt.Sprintf("jwt-outsider-%s@example.com", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	outsiderID := h.CreateUser(t, client, outsiderEmail, pw)

	tenant := h.CreateTenant(t, client, ownerID, "JWT Owner Tenant "+id, ownerEmail).Tenant

	t.Run("non-member request returns 403", func(t *testing.T) {
		resp, _ := h.GetTenantJWTRaw(t, client, outsiderID, tenant.Id)
		require.NotNil(t, resp)
		assert.Equal(t, http.StatusForbidden, resp.StatusCode)
	})
}

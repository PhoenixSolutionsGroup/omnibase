package auth_test

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestAppKeyAuth(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	email := fmt.Sprintf("app-key-%s@example.com", id)
	password := fmt.Sprintf("pwd-%s-aZ09!", id)
	userID := h.CreateUser(t, client, email, password)
	tenant := h.CreateTenant(t, client, userID, "App Key "+id, email).Tenant

	request := func(path, userIDHeader, tenantIDHeader string) int {
		resp := testenv.APIRequest(t, http.MethodGet, path, nil, map[string]string{
			"X-Service-Key": "",
			"X-App-Key":     testenv.ServiceKey,
			"X-User-Id":     userIDHeader,
			"X-Tenant-Id":   tenantIDHeader,
		})
		defer resp.Body.Close()
		return resp.StatusCode
	}

	t.Run("valid user and tenant", func(t *testing.T) {
		assert.Equal(t, http.StatusOK, request("/api/v1/auth/active-tenant", userID, tenant.Id))
	})

	t.Run("missing user id", func(t *testing.T) {
		assert.Equal(t, http.StatusUnauthorized, request("/api/v1/auth/active-tenant", "", tenant.Id))
	})

	t.Run("malformed user id", func(t *testing.T) {
		assert.Equal(t, http.StatusUnauthorized, request("/api/v1/auth/active-tenant", "not-a-uuid", tenant.Id))
	})

	t.Run("missing tenant id", func(t *testing.T) {
		assert.Equal(t, http.StatusForbidden, request("/api/v1/auth/active-tenant", userID, ""))
	})

	t.Run("tenant the user does not belong to", func(t *testing.T) {
		otherID := helpers.UniqueID()
		otherEmail := fmt.Sprintf("app-key-other-%s@example.com", otherID)
		otherUserID := h.CreateUser(t, client, otherEmail, fmt.Sprintf("pwd-%s-aZ09!", otherID))
		otherTenant := h.CreateTenant(t, client, otherUserID, "Other "+otherID, otherEmail).Tenant

		assert.Equal(t, http.StatusForbidden, request("/api/v1/auth/active-tenant", userID, otherTenant.Id))
	})

	t.Run("rejected on admin-only routes", func(t *testing.T) {
		assert.Equal(t, http.StatusUnauthorized, request("/api/v1/database/migrations/status", userID, tenant.Id))
	})
}

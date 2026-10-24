package middleware

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"api/internal/authn"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

const testServiceKey = "test-service-key"

func runRequireAuthWith(t *testing.T, m *AuthMiddleware, allowed authn.AuthMethod, headers map[string]string) (int, *authn.Principal) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	r := gin.New()

	var principal *authn.Principal
	r.GET("/", m.RequireAuth(allowed), func(c *gin.Context) {
		principal, _ = authn.Get(c)
		c.Status(http.StatusNoContent)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	r.ServeHTTP(recorder, req)

	return recorder.Code, principal
}

func runRequireAuth(t *testing.T, allowed authn.AuthMethod, headers map[string]string) (int, *authn.Principal) {
	t.Helper()
	return runRequireAuthWith(t, &AuthMiddleware{APIServiceKey: testServiceKey}, allowed, headers)
}

func TestRequireAuth_ServiceKey(t *testing.T) {
	t.Run("allowed and credential present", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthServiceKey, map[string]string{"X-Service-Key": testServiceKey})
		assert.Equal(t, http.StatusNoContent, code)
		if assert.NotNil(t, principal) {
			assert.Equal(t, authn.AuthServiceKey, principal.Method)
		}
	})

	t.Run("allowed but credential absent", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthServiceKey, nil)
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("not allowed but credential present", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthSession, map[string]string{"X-Service-Key": testServiceKey})
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("session or backend mask accepts service key", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthSessionOrBackendKey, map[string]string{"X-Service-Key": testServiceKey})
		assert.Equal(t, http.StatusNoContent, code)
		assert.NotNil(t, principal)
	})
}

func TestRequireAuth_InvalidServiceKey(t *testing.T) {
	code, principal := runRequireAuth(t, authn.AuthServiceKey, map[string]string{"X-Service-Key": "wrong"})
	assert.Equal(t, http.StatusUnauthorized, code)
	assert.Nil(t, principal)
}

func TestRequireAuth_ServiceKeyHeaders(t *testing.T) {
	userID := uuid.New()
	tenantID := uuid.New()

	code, principal := runRequireAuth(t, authn.AuthServiceKey, map[string]string{
		"X-Service-Key": testServiceKey,
		"X-User-Id":     userID.String(),
		"X-Tenant-Id":   tenantID.String(),
	})
	assert.Equal(t, http.StatusNoContent, code)
	if assert.NotNil(t, principal) {
		assert.Equal(t, userID, principal.UserID)
		assert.Equal(t, tenantID, principal.TenantID)
	}

	t.Run("malformed user id", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthServiceKey, map[string]string{
			"X-Service-Key": testServiceKey,
			"X-User-Id":     "not-a-uuid",
		})
		assert.Equal(t, http.StatusBadRequest, code)
		assert.Nil(t, principal)
	})

	t.Run("malformed tenant id", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthServiceKey, map[string]string{
			"X-Service-Key": testServiceKey,
			"X-Tenant-Id":   "not-a-uuid",
		})
		assert.Equal(t, http.StatusBadRequest, code)
		assert.Nil(t, principal)
	})
}

func TestRequireAuth_AppKey(t *testing.T) {
	userID := uuid.New()
	tenantID := uuid.New()

	newAppKeyMiddleware := func(member bool, lookupErr error) *AuthMiddleware {
		return &AuthMiddleware{
			APIServiceKey: testServiceKey,
			tenantMember: func(_ context.Context, gotUser, gotTenant uuid.UUID) (bool, error) {
				assert.Equal(t, userID, gotUser)
				assert.Equal(t, tenantID, gotTenant)
				return member, lookupErr
			},
		}
	}

	validHeaders := map[string]string{
		"X-App-Key":   testServiceKey,
		"X-User-Id":   userID.String(),
		"X-Tenant-Id": tenantID.String(),
	}

	withHeader := func(key, value string) map[string]string {
		headers := make(map[string]string, len(validHeaders)+1)
		for k, v := range validHeaders {
			headers[k] = v
		}
		headers[key] = value
		return headers
	}

	withoutHeader := func(key string) map[string]string {
		headers := make(map[string]string, len(validHeaders))
		for k, v := range validHeaders {
			if k != key {
				headers[k] = v
			}
		}
		return headers
	}

	t.Run("valid user mode", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, validHeaders)
		assert.Equal(t, http.StatusNoContent, code)
		if assert.NotNil(t, principal) {
			assert.Equal(t, authn.AuthAppKey, principal.Method)
			assert.Equal(t, userID, principal.UserID)
			assert.Equal(t, tenantID, principal.TenantID)
		}
	})

	t.Run("missing user id", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withoutHeader("X-User-Id"))
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("malformed user id", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withHeader("X-User-Id", "not-a-uuid"))
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("missing tenant id", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withoutHeader("X-Tenant-Id"))
		assert.Equal(t, http.StatusForbidden, code)
		assert.Nil(t, principal)
	})

	t.Run("malformed tenant id", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withHeader("X-Tenant-Id", "not-a-uuid"))
		assert.Equal(t, http.StatusBadRequest, code)
		assert.Nil(t, principal)
	})

	t.Run("not a member", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(false, nil), authn.AuthSessionOrBackendKey, validHeaders)
		assert.Equal(t, http.StatusForbidden, code)
		assert.Nil(t, principal)
	})

	t.Run("membership lookup fails", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(false, errors.New("db down")), authn.AuthSessionOrBackendKey, validHeaders)
		assert.Equal(t, http.StatusInternalServerError, code)
		assert.Nil(t, principal)
	})

	t.Run("wrong app key", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withHeader("X-App-Key", "wrong"))
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("rejected on admin-only routes", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthServiceKey, validHeaders)
		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Nil(t, principal)
	})

	t.Run("service key wins when both are present", func(t *testing.T) {
		code, principal := runRequireAuthWith(t, newAppKeyMiddleware(true, nil), authn.AuthSessionOrBackendKey, withHeader("X-Service-Key", testServiceKey))
		assert.Equal(t, http.StatusNoContent, code)
		if assert.NotNil(t, principal) {
			assert.Equal(t, authn.AuthServiceKey, principal.Method)
		}
	})
}

func TestRequireAuth_NoCredentials(t *testing.T) {
	code, principal := runRequireAuth(t, authn.AuthSessionOrBackendKey, nil)
	assert.Equal(t, http.StatusUnauthorized, code)
	assert.Nil(t, principal)
}

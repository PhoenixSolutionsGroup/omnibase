package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"api/internal/authn"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

const testServiceKey = "test-service-key"

func runRequireAuth(t *testing.T, allowed authn.AuthMethod, headers map[string]string) (int, *authn.Principal) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	m := &AuthMiddleware{APIServiceKey: testServiceKey}
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

	t.Run("session or service key mask accepts service key", func(t *testing.T) {
		code, principal := runRequireAuth(t, authn.AuthSessionOrServiceKey, map[string]string{"X-Service-Key": testServiceKey})
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

func TestRequireAuth_NoCredentials(t *testing.T) {
	code, principal := runRequireAuth(t, authn.AuthSessionOrServiceKey, nil)
	assert.Equal(t, http.StatusUnauthorized, code)
	assert.Nil(t, principal)
}

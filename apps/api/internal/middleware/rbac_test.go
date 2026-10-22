package middleware

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"api/internal/authn"
	"api/internal/services/permissions"
)

type fakePermissionChecker struct {
	allowed bool
	err     error
	calls   int
	subject permissions.SubjectSet
}

func (f *fakePermissionChecker) Check(_ context.Context, _, _, _ string, subject permissions.SubjectSet) (bool, error) {
	f.calls++
	f.subject = subject
	return f.allowed, f.err
}

func runCheckTenantPermission(t *testing.T, principal *authn.Principal, checker *fakePermissionChecker) (int, *fakePermissionChecker) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		if principal != nil {
			authn.Set(c, principal)
		}
		c.Next()
	})
	r.GET("/", NewRBACMiddleware(checker).CheckTenantPermission("view_users"), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	recorder := httptest.NewRecorder()
	r.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/", nil))

	return recorder.Code, checker
}

func TestCheckTenantPermission(t *testing.T) {
	userID := uuid.New()
	tenantID := uuid.New()

	t.Run("session allowed", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: true}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method:   authn.AuthSession,
			UserID:   userID,
			TenantID: tenantID,
		}, checker)

		assert.Equal(t, http.StatusNoContent, code)
		assert.Equal(t, 1, checker.calls)
		assert.Equal(t, "User", checker.subject.Namespace)
		assert.Equal(t, userID.String(), checker.subject.Object)
	})

	t.Run("app key allowed", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: true}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method:   authn.AuthAppKey,
			UserID:   userID,
			TenantID: tenantID,
		}, checker)

		assert.Equal(t, http.StatusNoContent, code)
		assert.Equal(t, 1, checker.calls)
	})

	t.Run("admin key skips the check", func(t *testing.T) {
		checker := &fakePermissionChecker{}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method: authn.AuthServiceKey,
		}, checker)

		assert.Equal(t, http.StatusNoContent, code)
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("missing principal", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: true}
		code, _ := runCheckTenantPermission(t, nil, checker)

		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("missing user", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: true}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method:   authn.AuthSession,
			TenantID: tenantID,
		}, checker)

		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("missing tenant", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: true}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method: authn.AuthAppKey,
			UserID: userID,
		}, checker)

		assert.Equal(t, http.StatusUnauthorized, code)
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("denied", func(t *testing.T) {
		checker := &fakePermissionChecker{allowed: false}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method:   authn.AuthSession,
			UserID:   userID,
			TenantID: tenantID,
		}, checker)

		assert.Equal(t, http.StatusForbidden, code)
		assert.Equal(t, 1, checker.calls)
	})

	t.Run("permissions backend error", func(t *testing.T) {
		checker := &fakePermissionChecker{err: errors.New("keto unavailable")}
		code, _ := runCheckTenantPermission(t, &authn.Principal{
			Method:   authn.AuthSession,
			UserID:   userID,
			TenantID: tenantID,
		}, checker)

		assert.Equal(t, http.StatusInternalServerError, code)
		assert.Equal(t, 1, checker.calls)
	})
}

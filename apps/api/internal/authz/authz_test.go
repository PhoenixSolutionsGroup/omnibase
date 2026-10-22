package authz

import (
	"context"
	"errors"
	"testing"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"api/internal/authn"
	"api/internal/services/permissions"
)

type fakeChecker struct {
	allowed bool
	err     error
	calls   int
	subject permissions.SubjectSet
}

func (f *fakeChecker) Check(_ context.Context, _, _, _ string, subject permissions.SubjectSet) (bool, error) {
	f.calls++
	f.subject = subject
	return f.allowed, f.err
}

func statusOf(t *testing.T, err error) int {
	t.Helper()
	var statusErr huma.StatusError
	if errors.As(err, &statusErr) {
		return statusErr.GetStatus()
	}
	return 0
}

func TestCheckPermission(t *testing.T) {
	userID := uuid.New()
	tenantID := uuid.New()
	object := tenantID.String()

	t.Run("allowed", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthSession, userID, tenantID, "Tenant", object, "view_users")
		assert.NoError(t, err)
		assert.Equal(t, 1, checker.calls)
		assert.Equal(t, "User", checker.subject.Namespace)
		assert.Equal(t, userID.String(), checker.subject.Object)
	})

	t.Run("app key is checked", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthAppKey, userID, tenantID, "Tenant", object, "view_users")
		assert.NoError(t, err)
		assert.Equal(t, 1, checker.calls)
	})

	t.Run("admin key skips the check", func(t *testing.T) {
		checker := &fakeChecker{}
		err := Check(context.Background(), checker, authn.AuthServiceKey, uuid.Nil, uuid.Nil, "Tenant", object, "view_users")
		assert.NoError(t, err)
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("missing user", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthSession, uuid.Nil, tenantID, "Tenant", object, "view_users")
		assert.Equal(t, 401, statusOf(t, err))
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("missing tenant", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthAppKey, userID, uuid.Nil, "Tenant", object, "view_users")
		assert.Equal(t, 401, statusOf(t, err))
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("no authentication method", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthNone, userID, tenantID, "Tenant", object, "view_users")
		assert.Equal(t, 401, statusOf(t, err))
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("malformed object id", func(t *testing.T) {
		checker := &fakeChecker{allowed: true}
		err := Check(context.Background(), checker, authn.AuthSession, userID, tenantID, "Tenant", "not-a-uuid", "view_users")
		assert.Equal(t, 400, statusOf(t, err))
		assert.Equal(t, 0, checker.calls)
	})

	t.Run("denied", func(t *testing.T) {
		checker := &fakeChecker{allowed: false}
		err := Check(context.Background(), checker, authn.AuthSession, userID, tenantID, "Tenant", object, "view_users")
		assert.Equal(t, 403, statusOf(t, err))
		assert.Equal(t, 1, checker.calls)
	})

	t.Run("permissions backend error", func(t *testing.T) {
		checker := &fakeChecker{err: errors.New("keto unavailable")}
		err := Check(context.Background(), checker, authn.AuthSession, userID, tenantID, "Tenant", object, "view_users")
		assert.Equal(t, 500, statusOf(t, err))
		assert.Equal(t, 1, checker.calls)
	})
}

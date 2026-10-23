package email

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"api/internal/authn"
	"api/internal/database/repository"
	repository_mocks "api/internal/mocks/repository"
)

func TestTenantScope(t *testing.T) {
	tenantID := uuid.New()

	scope, err := tenantScope(authn.AuthServiceKey, tenantID)
	require.NoError(t, err)
	assert.Nil(t, scope, "service key writes app-wide templates")

	scope, err = tenantScope(authn.AuthSession, tenantID)
	require.NoError(t, err)
	require.NotNil(t, scope)
	assert.Equal(t, tenantID.String(), *scope)

	_, err = tenantScope(authn.AuthAppKey, uuid.Nil)
	assert.Error(t, err)
}

func TestAllowSend(t *testing.T) {
	tenantID := uuid.New()
	tenant := tenantID.String()
	window := time.Hour

	newHandler := func(t *testing.T, repo repository.Querier) *Handler {
		t.Helper()
		return New(Deps{Repo: repo, SendLimit: 2, SendWindow: window})
	}

	t.Run("allows sends under the limit", func(t *testing.T) {
		repo := repository_mocks.NewMockQuerier(t)
		repo.EXPECT().
			CountRecentEmailSends(mock.Anything, repository.CountRecentEmailSendsParams{
				TenantID:      &tenant,
				WindowSeconds: window.Seconds(),
			}).
			Return(int64(1), nil)

		allowed, err := newHandler(t, repo).allowSend(context.Background(), tenantID)
		require.NoError(t, err)
		assert.True(t, allowed)
	})

	t.Run("rejects sends at the limit", func(t *testing.T) {
		repo := repository_mocks.NewMockQuerier(t)
		repo.EXPECT().
			CountRecentEmailSends(mock.Anything, repository.CountRecentEmailSendsParams{
				TenantID:      &tenant,
				WindowSeconds: window.Seconds(),
			}).
			Return(int64(2), nil)

		allowed, err := newHandler(t, repo).allowSend(context.Background(), tenantID)
		require.NoError(t, err)
		assert.False(t, allowed)
	})

	t.Run("does not limit admin sends without a tenant", func(t *testing.T) {
		allowed, err := newHandler(t, nil).allowSend(context.Background(), uuid.Nil)
		require.NoError(t, err)
		assert.True(t, allowed)
	})

	t.Run("does not limit when the limit is disabled", func(t *testing.T) {
		h := New(Deps{SendLimit: 0, SendWindow: window})
		allowed, err := h.allowSend(context.Background(), tenantID)
		require.NoError(t, err)
		assert.True(t, allowed)
	})

	t.Run("returns the repository error", func(t *testing.T) {
		repo := repository_mocks.NewMockQuerier(t)
		repo.EXPECT().
			CountRecentEmailSends(mock.Anything, mock.Anything).
			Return(int64(0), errors.New("db down"))

		allowed, err := newHandler(t, repo).allowSend(context.Background(), tenantID)
		require.Error(t, err)
		assert.False(t, allowed)
	})

	t.Run("defaults the window to one hour", func(t *testing.T) {
		h := New(Deps{SendLimit: 2})
		assert.Equal(t, time.Hour, h.sendWindow)
	})
}

func TestValidTemplateName(t *testing.T) {
	for _, name := range []string{"verification", "recovery_invalid", "tenant-user-invite", "A1"} {
		assert.True(t, validTemplateName(name), name)
	}
	for _, name := range []string{"", "../etc/passwd", "a/b", "a b", "template.name"} {
		assert.False(t, validTemplateName(name), name)
	}
}

package tenants_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/database/repository"
	mock "api/internal/mocks/repository"
	"api/internal/services/tenants"
)

const testSigningKey = "test-signing-key-do-not-use-in-prod"

func TestCreateJWT_SignsClaimsForExistingMember(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := tenants.New(tenants.Deps{Repo: repo, SigningKey: testSigningKey})

	userID := uuid.New()
	tenantID := uuid.New()

	repo.EXPECT().
		GetTenantUser(context.Background(), repository.GetTenantUserParams{
			TenantID: tenantID.String(),
			UserID:   userID.String(),
		}).
		Return(repository.AuthTenantUser{
			ID:       uuid.NewString(),
			TenantID: tenantID.String(),
			UserID:   userID.String(),
			Role:     "admin",
			IsActive: true,
			JoinedAt: time.Now(),
		}, nil)

	tok, err := svc.CreateJWT(context.Background(), userID, tenantID)
	require.NoError(t, err)
	require.NotEmpty(t, tok)

	parsed, err := jwt.ParseWithClaims(tok, &tenants.PostgRESTClaims{}, func(*jwt.Token) (any, error) {
		return []byte(testSigningKey), nil
	})
	require.NoError(t, err)
	require.True(t, parsed.Valid)

	claims := parsed.Claims.(*tenants.PostgRESTClaims)
	assert.Equal(t, userID.String(), claims.UserID)
	assert.Equal(t, tenantID.String(), claims.TenantID)
	assert.Equal(t, "admin", claims.UserRole)
	assert.Equal(t, "anon_user", claims.Role)
}

func TestCreateJWT_FailsWhenMemberLookupErrors(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := tenants.New(tenants.Deps{Repo: repo, SigningKey: testSigningKey})

	userID := uuid.New()
	tenantID := uuid.New()

	repo.EXPECT().
		GetTenantUser(context.Background(), repository.GetTenantUserParams{
			TenantID: tenantID.String(),
			UserID:   userID.String(),
		}).
		Return(repository.AuthTenantUser{}, pgx.ErrNoRows)

	tok, err := svc.CreateJWT(context.Background(), userID, tenantID)
	require.Empty(t, tok)
	require.Error(t, err)
	assert.True(t, errors.Is(err, tenants.CreateJWTError))
}

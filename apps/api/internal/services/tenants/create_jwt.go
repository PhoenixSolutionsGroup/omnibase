package tenants

import (
	"context"
	"errors"
	"fmt"
	"time"

	"api/internal/database/repository"
	"api/internal/logger"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var CreateJWTError = errors.New("Failed to create JWT")

type PostgRESTClaims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	UserRole string `json:"user_role"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func (s *Service) CreateJWT(ctx context.Context, userID, tenantID uuid.UUID) (string, error) {
	logger.Logger.Debug("Creating JWT", "user_id", userID, "tenant_id", tenantID)

	tu, err := s.repo.GetTenantUser(ctx, repository.GetTenantUserParams{
		TenantID: tenantID.String(),
		UserID:   userID.String(),
	})
	if err != nil {
		return "", fmt.Errorf("%w: %w", CreateJWTError, err)
	}

	claims := PostgRESTClaims{
		UserID:   userID.String(),
		TenantID: tenantID.String(),
		UserRole: tu.Role,
		Role:     "anon_user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := tok.SignedString([]byte(s.signingKey))
	if err != nil {
		return "", fmt.Errorf("%w: %w", CreateJWTError, err)
	}
	return signed, nil
}

package services_v1

import (
	"api/internal/config"
	"api/internal/models"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	client "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type TenantsService struct {
	db         *gorm.DB
	SigningKey string
	kratos     *client.APIClient
}

func NewTenantsService(db *gorm.DB, cfg *config.Config) *TenantsService {

	kratos := client.NewConfiguration()
	kratos.Servers = client.ServerConfigurations{{
		URL: cfg.AuthConfig.KratosURL,
	}}

	kratosClient := client.NewAPIClient(kratos)

	return &TenantsService{
		db:         db,
		SigningKey: cfg.Database.SigningKey,
		kratos:     kratosClient,
	}
}

type PostgRESTClaims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func (s *TenantsService) CreateJWTToken(userID, tenantID string) (string, error) {
	claims := PostgRESTClaims{
		UserID:   userID,
		TenantID: tenantID,
		Role:     "anon_user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24 hour expiration
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(s.SigningKey))
	if err != nil {
		return "", fmt.Errorf("failed to sign JWT token: %w", err)
	}

	return tokenString, nil
}

func (s *TenantsService) SetActiveTenant(userID, tenantID string) (string, error) {
	if err := s.db.Model(&models.TenantUser{}).
		Where("user_id = ?", userID).
		Update("is_active", false).Error; err != nil {
		return "", fmt.Errorf("failed to deactivate other tenants: %w", err)
	}

	if err := s.db.Model(&models.TenantUser{}).
		Where("user_id = ? AND tenant_id = ?", userID, tenantID).
		Update("is_active", true).Error; err != nil {
		return "", fmt.Errorf("failed to activate tenant: %w", err)
	}

	// Create new JWT with the updated tenant_id
	token, err := s.CreateJWTToken(userID, tenantID)
	if err != nil {
		return "", fmt.Errorf("failed to create JWT token: %w", err)
	}

	return token, nil
}

// handleUserTenantCleanup manages user tenant state after removing them from a tenant
// If user has other tenants, sets active to first one; if no tenants, sets is_in_tenant to false
func (s *TenantsService) HandleUserTenantCleanup(ctx *gin.Context, userID string) error {
	// Get all remaining tenants for this user
	var tenantUsers []models.TenantUser
	if err := s.db.Where("user_id = ?", userID).Find(&tenantUsers).Error; err != nil {
		return fmt.Errorf("failed to get user tenants: %w", err)
	}

	// If user has no tenants left, set metadata to is_in_tenant = false
	if len(tenantUsers) == 0 {
		return s.UpdateUserMetadata(ctx, userID, false)
	}

	// If user has tenants, set active tenant to the first one
	firstTenantID := tenantUsers[0].TenantID
	_, err := s.SetActiveTenant(userID, firstTenantID)
	if err != nil {
		return fmt.Errorf("failed to set active tenant: %w", err)
	}

	return nil
}

func (s *TenantsService) UpdateUserMetadata(ctx *gin.Context, UserID string, is_in_tenant bool) error {
	patchDoc := []client.JsonPatch{
		{
			Op:    "replace",
			Path:  "/metadata_public/is_in_tenant",
			Value: is_in_tenant,
		},
	}
	// _, _, err := s.kratos.IdentityAPI.UpdateIdentity(ctx, UserID).UpdateIdentityBody(updateBody).Execute()
	_, _, err := s.kratos.IdentityAPI.PatchIdentity(ctx, UserID).JsonPatch(patchDoc).Execute()

	if err != nil {
		return fmt.Errorf("failed to update metadata: %w", err)
	}

	return nil
}

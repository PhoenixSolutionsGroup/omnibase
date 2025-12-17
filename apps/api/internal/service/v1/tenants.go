package services_v1

import (
	"api/internal/config"
	"api/internal/logger"
	"api/internal/models"
	"errors"
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
	logger.Logger.Info("Initializing tenants service", "kratosURL", cfg.AuthConfig.AuthURL)

	kratos := client.NewConfiguration()
	kratos.Servers = client.ServerConfigurations{{
		URL: cfg.AuthConfig.AuthURL,
	}}

	kratosClient := client.NewAPIClient(kratos)

	logger.Logger.Info("Tenants service initialized successfully")
	return &TenantsService{
		db:         db,
		SigningKey: cfg.Database.SigningKey,
		kratos:     kratosClient,
	}
}

type PostgRESTClaims struct {
	UserID   string `json:"user_id"`
	TenantID string `json:"tenant_id"`
	UserRole string `json:"user_role"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func (s *TenantsService) CreateJWTToken(userID, tenantID string) (string, error) {
	logger.Logger.Debug("Creating JWT token", "userID", userID, "tenantID", tenantID)

	// Get user's role in this tenant
	var tenantUser models.TenantUser
	if err := s.db.Where("user_id = ? AND tenant_id = ?", userID, tenantID).First(&tenantUser).Error; err != nil {
		logger.Logger.Error("Failed to get user's tenant role", "error", err, "userID", userID, "tenantID", tenantID)
		return "", fmt.Errorf("failed to get user's tenant role: %w", err)
	}

	claims := PostgRESTClaims{
		UserID:   userID,
		TenantID: tenantID,
		UserRole: tenantUser.Role,
		Role:     "anon_user",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)), // 24 hour expiration
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(s.SigningKey))
	if err != nil {
		logger.Logger.Error("Failed to sign JWT token", "error", err, "userID", userID)
		return "", fmt.Errorf("failed to sign JWT token: %w", err)
	}

	logger.Logger.Info("JWT token created successfully", "userID", userID, "tenantID", tenantID)
	return tokenString, nil
}

func (s *TenantsService) SetActiveTenant(userID, tenantID string) (string, error) {
	logger.Logger.Info("Setting active tenant", "userID", userID, "tenantID", tenantID)

	// Verify user has access to this tenant before proceeding
	var checkTenantUser models.TenantUser
	if err := s.db.Where("user_id = ? AND tenant_id = ?", userID, tenantID).First(&checkTenantUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Logger.Warn("User attempted to switch to tenant they don't have access to",
				"userID", userID, "tenantID", tenantID)
			return "", gorm.ErrRecordNotFound
		}
		logger.Logger.Error("Failed to verify tenant access", "error", err, "userID", userID, "tenantID", tenantID)
		return "", err
	}

	if err := s.db.Model(&models.TenantUser{}).
		Where("user_id = ?", userID).
		Update("is_active", false).Error; err != nil {
		logger.Logger.Error("Failed to deactivate other tenants", "error", err, "userID", userID)
		return "", fmt.Errorf("failed to deactivate other tenants: %w", err)
	}
	logger.Logger.Debug("Deactivated all tenants for user", "userID", userID)

	if err := s.db.Model(&models.TenantUser{}).
		Where("user_id = ? AND tenant_id = ?", userID, tenantID).
		Update("is_active", true).Error; err != nil {
		logger.Logger.Error("Failed to activate tenant", "error", err, "userID", userID, "tenantID", tenantID)
		return "", fmt.Errorf("failed to activate tenant: %w", err)
	}
	logger.Logger.Debug("Activated tenant for user", "userID", userID, "tenantID", tenantID)

	// Create new JWT with the updated tenant_id
	token, err := s.CreateJWTToken(userID, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to create JWT token", "error", err, "userID", userID)
		return "", fmt.Errorf("failed to create JWT token: %w", err)
	}

	logger.Logger.Info("Active tenant set successfully", "userID", userID, "tenantID", tenantID)
	return token, nil
}

// handleUserTenantCleanup manages user tenant state after removing them from a tenant
// If user has other tenants, sets active to first one; if no tenants, sets is_in_tenant to false
func (s *TenantsService) HandleUserTenantCleanup(ctx *gin.Context, userID string) error {
	logger.Logger.Info("Handling user tenant cleanup", "userID", userID)

	// Get all remaining tenants for this user
	var tenantUsers []models.TenantUser
	if err := s.db.Where("user_id = ?", userID).Find(&tenantUsers).Error; err != nil {
		logger.Logger.Error("Failed to get user tenants", "error", err, "userID", userID)
		return fmt.Errorf("failed to get user tenants: %w", err)
	}
	logger.Logger.Debug("Found user tenants", "userID", userID, "count", len(tenantUsers))

	// If user has no tenants left, set metadata to is_in_tenant = false
	if len(tenantUsers) == 0 {
		logger.Logger.Info("User has no remaining tenants, setting is_in_tenant to false", "userID", userID)
		return s.UpdateUserMetadata(ctx, userID, false)
	}

	// If user has tenants, set active tenant to the first one
	firstTenantID := tenantUsers[0].TenantID
	logger.Logger.Info("Setting first tenant as active", "userID", userID, "tenantID", firstTenantID)
	_, err := s.SetActiveTenant(userID, firstTenantID)
	if err != nil {
		logger.Logger.Error("Failed to set active tenant", "error", err, "userID", userID, "tenantID", firstTenantID)
		return fmt.Errorf("failed to set active tenant: %w", err)
	}

	logger.Logger.Info("User tenant cleanup completed successfully", "userID", userID)
	return nil
}

func (s *TenantsService) UpdateUserMetadata(ctx *gin.Context, UserID string, is_in_tenant bool) error {
	logger.Logger.Info("Updating user metadata", "userID", UserID, "is_in_tenant", is_in_tenant)

	patchDoc := []client.JsonPatch{
		{
			Op:    "replace",
			Path:  "/metadata_public/is_in_tenant",
			Value: is_in_tenant,
		},
	}

	logger.Logger.Info("Making Kratos API call to update user metadata", "userID", UserID)
	_, resp, err := s.kratos.IdentityAPI.PatchIdentity(ctx, UserID).JsonPatch(patchDoc).Execute()

	if err != nil {
		// Check if user doesn't exist (404) - this can happen in testing scenarios
		// where service keys are used with non-existent user IDs
		if resp != nil && resp.StatusCode == 404 {
			logger.Logger.Warn("User not found in Kratos, skipping metadata update", "userID", UserID)
			return nil // Treat as success - user doesn't exist so no metadata to update
		}
		logger.Logger.Error("Failed to update user metadata", "error", err, "userID", UserID)
		return fmt.Errorf("failed to update metadata: %w", err)
	}

	logger.Logger.Info("User metadata updated successfully", "userID", UserID, "is_in_tenant", is_in_tenant)
	return nil
}

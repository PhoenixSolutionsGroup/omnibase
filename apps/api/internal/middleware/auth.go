package middleware

import (
	"api/internal/authn"
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"context"
	"crypto/subtle"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	kratosClient  *kratos.APIClient
	db            *gorm.DB
	APIServiceKey string
	tenantMember  func(context.Context, uuid.UUID, uuid.UUID) (bool, error)
}

func NewAuthMiddleware(cfg *config.Config, db *gorm.DB) *AuthMiddleware {
	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.AuthURL,
		},
	}

	middleware := &AuthMiddleware{
		kratosClient:  kratos.NewAPIClient(publicConfig),
		db:            db,
		APIServiceKey: cfg.APIServiceKey,
	}
	middleware.tenantMember = middleware.isTenantMember
	return middleware
}

// validateSessionWithToken validates an opaque Kratos session token (ory_st_...)
// by forwarding it to Kratos whoami with the X-Session-Token header
func (m *AuthMiddleware) validateSessionWithToken(ctx context.Context, sessionToken string) (*kratos.Session, error) {
	logger.Logger.Debug("Validating session with Kratos session token")

	toSessionReq := m.kratosClient.FrontendAPI.ToSession(ctx).XSessionToken(sessionToken)
	session, res, err := toSessionReq.Execute()

	if err != nil {
		if res != nil {
			logger.Logger.Error("Error validating session token", "error", err, "http_status", res.StatusCode)
		} else {
			logger.Logger.Error("Error validating session token", "error", err, "http_status", "no_response")
		}
		return nil, fmt.Errorf("invalid or expired session: %w", err)
	}

	if session.Identity == nil {
		return nil, fmt.Errorf("no identity found in session")
	}

	logger.Logger.Debug("Session validated successfully with token", "user_id", session.Identity.GetId())
	return session, nil
}

// validateSessionWithCookie validates a session using cookie header
func (m *AuthMiddleware) validateSessionWithCookie(ctx context.Context, cookieHeader string) (*kratos.Session, error) {
	logger.Logger.Debug("Validating session with cookie")

	toSessionReq := m.kratosClient.FrontendAPI.ToSession(ctx).Cookie(cookieHeader)
	session, res, err := toSessionReq.Execute()

	if err != nil {
		if res != nil {
			logger.Logger.Error("Error validating session with cookie", "error", err, "http_status", res.StatusCode)
		} else {
			logger.Logger.Error("Error validating session with cookie", "error", err, "http_status", "no_response")
		}
		return nil, fmt.Errorf("invalid or expired session: %w", err)
	}

	if session.Identity == nil {
		return nil, fmt.Errorf("no identity found in session")
	}

	logger.Logger.Debug("Session validated successfully with cookie", "user_id", session.Identity.GetId())
	return session, nil
}

func (m *AuthMiddleware) RequireAuth(allowed authn.AuthMethod) gin.HandlerFunc {
	return func(c *gin.Context) {
		if allowed&authn.AuthServiceKey != 0 {
			if serviceKey := c.GetHeader("X-Service-Key"); serviceKey != "" {
				m.authenticateServiceKey(c, serviceKey)
				return
			}
		}

		if allowed&authn.AuthAppKey != 0 {
			if appKey := c.GetHeader("X-App-Key"); appKey != "" {
				m.authenticateAppKey(c, appKey)
				return
			}
		}

		if allowed&authn.AuthSession != 0 {
			cookieHeader := c.GetHeader("Cookie")
			sessionHeader := strings.TrimSpace(c.GetHeader("X-Session-Token"))
			if len(sessionHeader) > 0 && sessionHeader[len(sessionHeader)-1] == '=' {
				sessionHeader = sessionHeader[:len(sessionHeader)-1]
			}
			if cookieHeader != "" || sessionHeader != "" {
				m.authenticateSession(c, cookieHeader, sessionHeader)
				return
			}
		}

		handlers.NewUnauthorizedResponse(c, "Authentication required")
		c.Abort()
	}
}

func (m *AuthMiddleware) authenticateServiceKey(c *gin.Context, serviceKey string) {
	if subtle.ConstantTimeCompare([]byte(serviceKey), []byte(m.APIServiceKey)) != 1 {
		handlers.NewUnauthorizedResponse(c, "Unauthorized: Invalid or missing service key")
		c.Abort()
		return
	}

	principal := &authn.Principal{Method: authn.AuthServiceKey}

	if userIDHeader := c.GetHeader("X-User-Id"); userIDHeader != "" {
		userID, err := uuid.Parse(userIDHeader)
		if err != nil {
			handlers.NewBadRequestResponse(c, "Invalid X-User-Id header")
			c.Abort()
			return
		}
		principal.UserID = userID
	}

	if tenantIDHeader := c.GetHeader("X-Tenant-Id"); tenantIDHeader != "" {
		tenantID, err := uuid.Parse(tenantIDHeader)
		if err != nil {
			handlers.NewBadRequestResponse(c, "Invalid X-Tenant-Id header")
			c.Abort()
			return
		}
		principal.TenantID = tenantID
	}

	logger.Logger.Debug("Service key authentication successful",
		"tenant_id", principal.TenantID,
		"user_id", principal.UserID)
	authn.Set(c, principal)
	c.Next()
}

func (m *AuthMiddleware) authenticateAppKey(c *gin.Context, appKey string) {
	if subtle.ConstantTimeCompare([]byte(appKey), []byte(m.APIServiceKey)) != 1 {
		handlers.NewUnauthorizedResponse(c, "Unauthorized: Invalid or missing app key")
		c.Abort()
		return
	}

	userIDHeader := c.GetHeader("X-User-Id")
	if userIDHeader == "" {
		handlers.NewUnauthorizedResponse(c, "X-User-Id is required for app key authentication")
		c.Abort()
		return
	}

	userID, err := uuid.Parse(userIDHeader)
	if err != nil {
		handlers.NewUnauthorizedResponse(c, "Invalid X-User-Id header")
		c.Abort()
		return
	}

	tenantIDHeader := c.GetHeader("X-Tenant-Id")
	if tenantIDHeader == "" {
		handlers.NewForbiddenResponse(c, "X-Tenant-Id must be a tenant the user belongs to")
		c.Abort()
		return
	}

	tenantID, err := uuid.Parse(tenantIDHeader)
	if err != nil {
		handlers.NewBadRequestResponse(c, "Invalid X-Tenant-Id header")
		c.Abort()
		return
	}

	member, err := m.tenantMember(c.Request.Context(), userID, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to verify tenant membership",
			"user_id", userID,
			"tenant_id", tenantID,
			"error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to verify tenant membership: %w", err))
		c.Abort()
		return
	}
	if !member {
		handlers.NewForbiddenResponse(c, "X-Tenant-Id must be a tenant the user belongs to")
		c.Abort()
		return
	}

	logger.Logger.Debug("App key authentication successful",
		"user_id", userID,
		"tenant_id", tenantID)
	authn.Set(c, &authn.Principal{
		Method:   authn.AuthAppKey,
		UserID:   userID,
		TenantID: tenantID,
	})
	c.Next()
}

func (m *AuthMiddleware) isTenantMember(ctx context.Context, userID, tenantID uuid.UUID) (bool, error) {
	var count int64
	err := m.db.Table("auth.tenant_users").
		Where("user_id = ? AND tenant_id = ? AND is_active = true", userID, tenantID).
		Count(&count).Error
	return count > 0, err
}

func (m *AuthMiddleware) authenticateSession(c *gin.Context, cookieHeader, sessionHeader string) {
	var (
		session *kratos.Session
		err     error
	)

	if sessionHeader != "" {
		logger.Logger.Debug("Session header received", "length", len(sessionHeader))
		session, err = m.validateSessionWithToken(c.Request.Context(), sessionHeader)
	} else {
		logger.Logger.Debug("Using cookie session validation")
		session, err = m.validateSessionWithCookie(c.Request.Context(), cookieHeader)
	}

	if err != nil {
		logger.Logger.Error("Session validation failed", "error", err)
		handlers.NewUnauthorizedResponse(c, "Invalid or expired session")
		c.Abort()
		return
	}

	if session.Identity == nil {
		handlers.NewUnauthorizedResponse(c, "No identity found in session")
		c.Abort()
		return
	}

	userID, err := uuid.Parse(session.Identity.GetId())
	if err != nil {
		logger.Logger.Error("Session identity ID is not a UUID", "error", err)
		handlers.NewUnauthorizedResponse(c, "Invalid session identity")
		c.Abort()
		return
	}

	principal := &authn.Principal{
		Method:   authn.AuthSession,
		UserID:   userID,
		Session:  session,
		Identity: session.Identity,
	}

	var tenantID string
	err = m.db.Table("auth.tenant_users").
		Select("tenant_id").
		Where("user_id = ? AND is_active = true", userID).
		Scan(&tenantID).Error
	if err == nil && tenantID != "" {
		principal.TenantID, _ = uuid.Parse(tenantID)
	}

	authn.Set(c, principal)
	c.Next()
}

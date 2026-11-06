package middleware

import (
	"api/internal/authn"
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/sessioncache"
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"strings"
	"time"

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
	activeTenant  func(context.Context, uuid.UUID) (activeTenant, error)
	sessionCache  *sessioncache.Cache
}

const kratosSessionCookie = "ory_kratos_session"

type activeTenant struct {
	TenantID string
	Role     string
}

func NewAuthMiddleware(cfg *config.Config, db *gorm.DB, cache *sessioncache.Cache) *AuthMiddleware {
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
		sessionCache:  cache,
	}
	middleware.tenantMember = middleware.isTenantMember
	middleware.activeTenant = middleware.lookupActiveTenant
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
		m.authenticate(c, allowed, false)
	}
}

func (m *AuthMiddleware) OptionalAuth(allowed authn.AuthMethod) gin.HandlerFunc {
	return func(c *gin.Context) {
		m.authenticate(c, allowed, true)
	}
}

func (m *AuthMiddleware) authenticate(c *gin.Context, allowed authn.AuthMethod, optional bool) {
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
		hasSession := sessionHeader != "" || hasKratosCookie(c.Request)
		if !optional {
			hasSession = hasSession || cookieHeader != ""
		}
		if hasSession {
			m.authenticateSession(c, cookieHeader, sessionHeader)
			return
		}
	}

	if optional {
		c.Next()
		return
	}

	handlers.NewUnauthorizedResponse(c, "Authentication required")
	c.Abort()
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

func hasKratosCookie(r *http.Request) bool {
	_, err := r.Cookie(kratosSessionCookie)
	return err == nil
}

func sessionCredential(r *http.Request, cookieHeader, sessionHeader string) string {
	if sessionHeader != "" {
		return "token:" + sessionHeader
	}
	if ck, err := r.Cookie(kratosSessionCookie); err == nil {
		return "cookie:" + ck.Value
	}
	return "header:" + cookieHeader
}

func (m *AuthMiddleware) resolveSession(ctx context.Context, r *http.Request, cookieHeader, sessionHeader string) (*kratos.Session, error) {
	key := sessioncache.Key(sessionCredential(r, cookieHeader, sessionHeader))
	if entry, ok := m.sessionCache.Get(key); ok {
		return entry.Session, nil
	}

	var (
		session *kratos.Session
		err     error
	)
	if sessionHeader != "" {
		logger.Logger.Debug("Session header received", "length", len(sessionHeader))
		session, err = m.validateSessionWithToken(ctx, sessionHeader)
	} else {
		logger.Logger.Debug("Using cookie session validation")
		session, err = m.validateSessionWithCookie(ctx, cookieHeader)
	}
	if err != nil {
		return nil, err
	}

	if userID, parseErr := uuid.Parse(session.Identity.GetId()); parseErr == nil {
		var expiresAt time.Time
		if session.ExpiresAt != nil {
			expiresAt = *session.ExpiresAt
		}
		m.sessionCache.Set(key, sessioncache.Entry{UserID: userID, Session: session, ExpiresAt: expiresAt})
	}
	return session, nil
}

func (m *AuthMiddleware) lookupActiveTenant(ctx context.Context, userID uuid.UUID) (activeTenant, error) {
	var t activeTenant
	err := m.db.WithContext(ctx).Table("auth.tenant_users").
		Select("tenant_id, role").
		Where("user_id = ? AND is_active = true", userID).
		Limit(1).
		Scan(&t).Error
	return t, err
}

func (m *AuthMiddleware) authenticateSession(c *gin.Context, cookieHeader, sessionHeader string) {
	session, err := m.resolveSession(c.Request.Context(), c.Request, cookieHeader, sessionHeader)
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

	tenant, err := m.activeTenant(c.Request.Context(), userID)
	if err != nil {
		logger.Logger.Error("Failed to load active tenant", "user_id", userID, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to load active tenant: %w", err))
		c.Abort()
		return
	}
	if tenant.TenantID != "" {
		principal.TenantID, _ = uuid.Parse(tenant.TenantID)
		principal.TenantRole = tenant.Role
	}

	authn.Set(c, principal)
	c.Next()
}

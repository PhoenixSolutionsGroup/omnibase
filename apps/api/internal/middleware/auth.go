package middleware

import (
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type AuthMiddleware struct {
	kratosClient  *kratos.APIClient
	db            *gorm.DB
	JWTSecret     string
	APIServiceKey string
	jwksData      string
}

// JWK represents a JSON Web Key
type JWK struct {
	Kty string `json:"kty"`
	Use string `json:"use"`
	Crv string `json:"crv"`
	Kid string `json:"kid"`
	X   string `json:"x"`
	Y   string `json:"y"`
	Alg string `json:"alg"`
}

// JWKS represents a JSON Web Key Set
type JWKS struct {
	Keys []JWK `json:"keys"`
}

// KratosClaims represents the JWT claims from Kratos session token
type KratosClaims struct {
	SessionID  string          `json:"sid"`
	IdentityID string          `json:"sub"`
	Session    *kratos.Session `json:"session"`
	jwt.RegisteredClaims
}

func NewAuthMiddleware(cfg *config.Config, db *gorm.DB) *AuthMiddleware {
	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.AuthURL,
		},
	}

	return &AuthMiddleware{
		kratosClient:  kratos.NewAPIClient(publicConfig),
		db:            db,
		JWTSecret:     cfg.JWTSecret,
		APIServiceKey: cfg.APIServiceKey,
		jwksData:      cfg.AuthConfig.AuthJWTJWKS,
	}
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

func isJWTToken(sessionToken string) bool {
	return strings.Count(sessionToken, ".") == 2
}

// validateSessionHeader dispatches validation based on the token format:
// JWT-shaped tokens are validated locally against the JWKS, opaque tokens
// are forwarded to Kratos whoami.
func (m *AuthMiddleware) validateSessionHeader(ctx context.Context, sessionToken string) (*kratos.Session, error) {
	if isJWTToken(sessionToken) {
		return m.validateSessionWithJWT(ctx, sessionToken)
	}
	return m.validateSessionWithToken(ctx, sessionToken)
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

// validateSessionWithJWT validates a session using JWT token from X-Session-Token header
func (m *AuthMiddleware) validateSessionWithJWT(ctx context.Context, sessionToken string) (*kratos.Session, error) {
	logger.Logger.Debug("Validating session with JWT token")

	// Parse JWKS
	if m.jwksData == "" {
		return nil, fmt.Errorf("AUTH_JWT_JWKS not configured")
	}

	var jwks JWKS
	if err := json.Unmarshal([]byte(m.jwksData), &jwks); err != nil {
		logger.Logger.Error("Failed to parse JWKS", "error", err)
		return nil, fmt.Errorf("invalid JWKS configuration: %w", err)
	}

	if len(jwks.Keys) == 0 {
		return nil, fmt.Errorf("no keys found in JWKS")
	}

	// Parse and validate JWT
	var claims KratosClaims
	token, err := jwt.ParseWithClaims(sessionToken, &claims, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method
		if _, ok := token.Method.(*jwt.SigningMethodECDSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		// Get the key ID from token header
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("no kid found in token header")
		}

		// Find matching key in JWKS
		var matchingKey *JWK
		for i := range jwks.Keys {
			if jwks.Keys[i].Kid == kid {
				matchingKey = &jwks.Keys[i]
				break
			}
		}

		if matchingKey == nil {
			return nil, fmt.Errorf("no matching key found for kid: %s", kid)
		}

		// Convert JWK to ECDSA public key
		publicKey, err := jwkToECDSAPublicKey(matchingKey)
		if err != nil {
			return nil, fmt.Errorf("failed to convert JWK to public key: %w", err)
		}

		return publicKey, nil
	})

	if err != nil {
		logger.Logger.Error("Failed to parse JWT token", "error", err)
		return nil, fmt.Errorf("invalid JWT token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid JWT token")
	}

	// Use the session data from JWT claims instead of calling Kratos
	if claims.Session == nil {
		logger.Logger.Error("No session found in JWT claims - JWT may not have been issued with the new template")
		return nil, fmt.Errorf("no session found in JWT claims")
	}

	if claims.Session.Identity == nil {
		return nil, fmt.Errorf("no identity found in session")
	}

	logger.Logger.Debug("Session extracted from JWT claims",
		"user_id", claims.Session.Identity.GetId())
	return claims.Session, nil
}

// jwkToECDSAPublicKey converts a JWK to an ECDSA public key
func jwkToECDSAPublicKey(key *JWK) (*ecdsa.PublicKey, error) {
	if key.Kty != "EC" {
		return nil, fmt.Errorf("unsupported key type: %s", key.Kty)
	}

	// Decode base64url encoded coordinates
	xBytes, err := base64urlDecode(key.X)
	if err != nil {
		return nil, fmt.Errorf("failed to decode x coordinate: %w", err)
	}

	yBytes, err := base64urlDecode(key.Y)
	if err != nil {
		return nil, fmt.Errorf("failed to decode y coordinate: %w", err)
	}

	// Determine the curve
	var curve elliptic.Curve
	switch key.Crv {
	case "P-256":
		curve = elliptic.P256()
	case "P-384":
		curve = elliptic.P384()
	case "P-521":
		curve = elliptic.P521()
	default:
		return nil, fmt.Errorf("unsupported curve: %s", key.Crv)
	}

	x := new(big.Int).SetBytes(xBytes)
	y := new(big.Int).SetBytes(yBytes)

	return &ecdsa.PublicKey{
		Curve: curve,
		X:     x,
		Y:     y,
	}, nil
}

// base64urlDecode decodes base64url encoded string
func base64urlDecode(s string) ([]byte, error) {
	// Use the base64 package's RawURLEncoding for base64url
	return base64.RawURLEncoding.DecodeString(s)
}

// RequireAuthHeaders validates that at least one authentication header is present.
// Returns 401 Unauthorized if all authentication headers are missing.
// This middleware should run BEFORE authentication validation middleware.
func (m *AuthMiddleware) RequireAuthHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieHeader := c.GetHeader("Cookie")
		sessionHeader := c.GetHeader("X-Session-Token")
		serviceKey := c.GetHeader("X-Service-Key")

		// Check if at least one auth header is present
		if cookieHeader == "" && sessionHeader == "" && serviceKey == "" {
			handlers.NewUnauthorizedResponse(c, "Authentication required: provide one of Cookie, X-Session-Token, or X-Service-Key")
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireSession validates user session via Cookie or X-Session-Token header.
// Sets context: user_id, session, identity, tenant_id (if user has active tenant)
// Used for: User-facing endpoints that require authentication
func (m *AuthMiddleware) RequireSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieHeader := c.GetHeader("Cookie")
		sessionHeader := c.GetHeader("X-Session-Token")

		// Remove trailing '=' if present in session header
		if len(sessionHeader) > 0 && sessionHeader[len(sessionHeader)-1] == '=' {
			sessionHeader = sessionHeader[:len(sessionHeader)-1]
		}

		// Require at least one authentication method (Cookie OR X-Session-Token)
		if cookieHeader == "" && sessionHeader == "" {
			handlers.NewUnauthorizedResponse(c, "Authentication required")
			c.Abort()
			return
		}

		var session *kratos.Session
		var err error

		if sessionHeader != "" {
			logger.Logger.Debug("Session header received",
				"length", len(sessionHeader),
				"prefix", sessionHeader[:min(10, len(sessionHeader))],
				"is_jwt", isJWTToken(sessionHeader))
			session, err = m.validateSessionHeader(c.Request.Context(), sessionHeader)
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

		userID := session.Identity.GetId()
		c.Set("user_id", userID)
		c.Set("session", session)
		c.Set("identity", session.Identity)

		// Query for active tenant_id
		var tenantID string
		err = m.db.Table("auth.tenant_users").
			Select("tenant_id").
			Where("user_id = ? AND is_active = true", userID).
			Scan(&tenantID).Error

		if err == nil && tenantID != "" {
			c.Set("tenant_id", tenantID)
		}

		c.Next()
	}
}

// RequireServiceKey validates service-to-service authentication via X-Service-Key header.
// Sets context: is_service_auth, tenant_id (optional), user_id (optional)
// Used for: Admin/backend operations with optional tenant context
func (m *AuthMiddleware) RequireServiceKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceKey := c.GetHeader("X-Service-Key")
		tenantIDHeader := c.GetHeader("X-Tenant-Id")
		userIDHeader := c.GetHeader("X-User-Id")

		if serviceKey == "" || subtle.ConstantTimeCompare([]byte(serviceKey), []byte(m.APIServiceKey)) != 1 {
			handlers.NewUnauthorizedResponse(c, "Unauthorized: Invalid or missing service key")
			c.Abort()
			return
		}

		// Validate and set tenant ID if provided
		if tenantIDHeader != "" {
			_, err := uuid.Parse(tenantIDHeader)
			if err != nil {
				handlers.NewBadRequestResponse(c, "Invalid X-Tenant-Id header")
				c.Abort()
				return
			}
			c.Set("tenant_id", tenantIDHeader)
		}

		// Validate and set user ID if provided
		if userIDHeader != "" {
			_, err := uuid.Parse(userIDHeader)
			if err != nil {
				handlers.NewBadRequestResponse(c, "Invalid X-User-Id header")
				c.Abort()
				return
			}
			c.Set("user_id", userIDHeader)
		}

		logger.Logger.Debug("Service key authentication successful", "tenant_id", tenantIDHeader, "user_id", userIDHeader)
		c.Set("is_service_auth", true)
		c.Next()
	}
}

// RequireSessionOrServiceKey validates either session auth OR service key with tenant ID.
// For session auth: Sets user_id, session, identity, tenant_id (from DB)
// For service auth: Sets tenant_id (from header), is_service_auth
// Used for: Tenant-scoped endpoints accessible by users or backend services
func (m *AuthMiddleware) RequireSessionOrServiceKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		serviceKey := c.GetHeader("X-Service-Key")
		tenantIDHeader := c.GetHeader("X-Tenant-Id")
		userIDHeader := c.GetHeader("X-User-Id")

		// Try service key authentication first
		if serviceKey != "" {
			if subtle.ConstantTimeCompare([]byte(serviceKey), []byte(m.APIServiceKey)) != 1 {
				handlers.NewUnauthorizedResponse(c, "Unauthorized: Invalid service key")
				c.Abort()
				return
			}

			_, err := uuid.Parse(userIDHeader)
			if err != nil && userIDHeader != "" {
				handlers.NewBadRequestResponse(c, "Invalid X-User-Id header")
				c.Abort()
				return
			}

			_, err = uuid.Parse(tenantIDHeader)
			if err != nil && tenantIDHeader != "" {
				handlers.NewBadRequestResponse(c, "Invalid X-Tenant-Id header")
				c.Abort()
				return
			}

			logger.Logger.Debug("Service key authentication successful", "tenant_id", tenantIDHeader, "user_id", userIDHeader)
			if tenantIDHeader != "" {
				c.Set("tenant_id", tenantIDHeader)
			}
			if userIDHeader != "" {
				c.Set("user_id", userIDHeader)
			}
			c.Set("is_service_auth", true)
			c.Next()
			return
		}

		// Fallback to session authentication
		cookieHeader := c.GetHeader("Cookie")
		sessionHeader := c.GetHeader("X-Session-Token")

		// Remove trailing '=' if present in session header
		if len(sessionHeader) > 0 && sessionHeader[len(sessionHeader)-1] == '=' {
			sessionHeader = sessionHeader[:len(sessionHeader)-1]
		}

		if cookieHeader == "" && sessionHeader == "" {
			handlers.NewUnauthorizedResponse(c, "Authentication required")
			c.Abort()
			return
		}

		var session *kratos.Session
		var err error

		if sessionHeader != "" {
			logger.Logger.Debug("Session header received",
				"length", len(sessionHeader),
				"prefix", sessionHeader[:min(10, len(sessionHeader))],
				"is_jwt", isJWTToken(sessionHeader))
			session, err = m.validateSessionHeader(c.Request.Context(), sessionHeader)
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

		userID := session.Identity.GetId()
		c.Set("user_id", userID)
		c.Set("session", session)
		c.Set("identity", session.Identity)

		// Query for active tenant_id
		var tenantID string
		err = m.db.Table("auth.tenant_users").
			Select("tenant_id").
			Where("user_id = ? AND is_active = true", userID).
			Scan(&tenantID).Error

		if err == nil && tenantID != "" {
			c.Set("tenant_id", tenantID)
		}

		c.Next()
	}
}

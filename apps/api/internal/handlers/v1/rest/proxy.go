package rest

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"api/internal/authn"
	"api/internal/handlers"
)

var MintTokenError = errors.New("Failed to mint PostgREST token")

type Claims struct {
	UserID   string `json:"user_id,omitempty"`
	TenantID string `json:"tenant_id,omitempty"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

var strippedHeaders = []string{
	"Authorization",
	"Cookie",
	"X-Session-Token",
	"X-Service-Key",
	"X-App-Key",
	"X-User-Id",
	"X-Tenant-Id",
	"X-Postgrest-Token",
	"apikey",
}

func (h *Handler) Proxy(c *gin.Context) {
	principal, _ := authn.Get(c)

	token, err := h.mintToken(principal)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	req := c.Request.Clone(c.Request.Context())
	for _, name := range strippedHeaders {
		req.Header.Del(name)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	path := c.Param("path")
	if path == "" {
		path = "/"
	}
	req.URL.Path = path
	req.URL.RawPath = ""

	h.proxy.ServeHTTP(c.Writer, req)
}

func (h *Handler) mintToken(p *authn.Principal) (string, error) {
	if p == nil {
		return "", nil
	}

	claims := Claims{}
	switch p.Method {
	case authn.AuthServiceKey:
		claims.Role = ServiceRole
	case authn.AuthAppKey, authn.AuthSession:
		claims.Role = AuthenticatedRole
	default:
		return "", nil
	}

	if p.UserID != uuid.Nil {
		claims.UserID = p.UserID.String()
	}
	if p.TenantID != uuid.Nil {
		claims.TenantID = p.TenantID.String()
	}

	now := h.now()
	claims.IssuedAt = jwt.NewNumericDate(now)
	claims.ExpiresAt = jwt.NewNumericDate(now.Add(TokenTTL))

	signed, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(h.signingKey)
	if err != nil {
		return "", fmt.Errorf("%w: %w", MintTokenError, err)
	}
	return signed, nil
}

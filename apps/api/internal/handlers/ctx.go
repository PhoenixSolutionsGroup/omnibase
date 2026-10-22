package handlers

import (
	"api/internal/authn"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Tenant(c *gin.Context) uuid.UUID {
	principal, ok := authn.Get(c)
	if !ok || principal.TenantID == uuid.Nil {
		panic("handlers.Tenant: no tenant in principal")
	}
	return principal.TenantID
}

func User(c *gin.Context) uuid.UUID {
	principal, ok := authn.Get(c)
	if !ok || principal.UserID == uuid.Nil {
		panic("handlers.User: no user in principal")
	}
	return principal.UserID
}

func UserAndTenant(c *gin.Context) (user, tenant uuid.UUID) {
	return User(c), Tenant(c)
}

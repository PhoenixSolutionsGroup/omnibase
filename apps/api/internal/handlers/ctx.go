package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func Tenant(c *gin.Context) uuid.UUID {
	id := c.GetString("tenant_id")
	u, err := uuid.Parse(id)
	if err != nil {
		panic(fmt.Sprintf("handlers.Tenant: invalid tenant_id in context: %q", id))
	}
	return u
}

func User(c *gin.Context) uuid.UUID {
	id := c.GetString("user_id")
	u, err := uuid.Parse(id)
	if err != nil {
		panic(fmt.Sprintf("handlers.User: invalid user_id in context: %q", id))
	}
	return u
}

func UserAndTenant(c *gin.Context) (user, tenant uuid.UUID) {
	return User(c), Tenant(c)
}

package auth

import (
	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/handlers"
)

type WhoAmIResponse struct {
	Authenticated bool   `json:"authenticated" binding:"required" example:"true"`
	UserID        string `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
}

func (h *Handler) WhoAmI(c *gin.Context) {
	session := c.MustGet("session").(*kratos.Session)
	handlers.NewSuccessResponse(c, WhoAmIResponse{
		Authenticated: true,
		UserID:        session.Identity.GetId(),
	})
}

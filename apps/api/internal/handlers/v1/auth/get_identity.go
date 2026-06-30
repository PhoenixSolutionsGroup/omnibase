package auth

import (
	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"

	"api/internal/handlers"
)

func (h *Handler) GetIdentity(c *gin.Context) {
	identity := c.MustGet("identity").(*kratos.Identity)
	handlers.NewSuccessResponse(c, identity)
}

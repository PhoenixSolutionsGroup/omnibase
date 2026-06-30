package lifecycle

import (
	"errors"
	"fmt"

	"api/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

var GetJWTError = errors.New("Failed to create JWT")

type JWTResponse struct {
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIs..."`
}

func (h *Handler) GetJWT(c *gin.Context) {
	userUuid, tenantUuid := handlers.UserAndTenant(c)

	token, err := h.tenants.CreateJWT(c.Request.Context(), userUuid, tenantUuid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			handlers.NewForbiddenResponse(c, "User is not a member of this tenant")
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", GetJWTError, err))
		return
	}

	handlers.NewSuccessResponse(c, JWTResponse{Token: token})
}

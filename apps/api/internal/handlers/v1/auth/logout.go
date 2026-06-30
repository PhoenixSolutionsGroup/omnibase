package auth

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var LogoutError = errors.New("Failed to create logout flow")

type LogoutResponse struct {
	LogoutURL   string `json:"logout_url" binding:"required" example:"http://auth.test.example.com/self-service/logout?token=tok_test_abc123xyz"`
	LogoutToken string `json:"logout_token" binding:"required" example:"tok_test_abc123xyz"`
}

func (h *Handler) Logout(c *gin.Context) {
	cookieHeader := c.GetHeader("Cookie")
	if cookieHeader == "" {
		handlers.NewBadRequestResponse(c, "Cookie header required for logout")
		return
	}

	flow, resp, err := h.kratosPub.FrontendAPI.CreateBrowserLogoutFlow(c.Request.Context()).Cookie(cookieHeader).Execute()
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		logger.Logger.Error("Failed to create logout flow", "error", err, "status", statusCode)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", LogoutError, err))
		return
	}

	handlers.NewSuccessResponse(c, LogoutResponse{
		LogoutURL:   flow.LogoutUrl,
		LogoutToken: flow.LogoutToken,
	})
}

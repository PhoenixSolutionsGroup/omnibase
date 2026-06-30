package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
)

var LogoutError = errors.New("Failed to create logout flow")

type LogoutResponse struct {
	LogoutURL   string `json:"logout_url" required:"true" example:"http://auth.test.example.com/self-service/logout?token=tok_test_abc123xyz"`
	LogoutToken string `json:"logout_token" required:"true" example:"tok_test_abc123xyz"`
}

type LogoutInput struct {
	handlers.AuthCtx
	Cookie string `header:"Cookie"`
}

type LogoutOutput struct {
	Body LogoutResponse
}

func (h *Handler) Logout(ctx context.Context, in *LogoutInput) (*LogoutOutput, error) {
	if in.Cookie == "" {
		return nil, huma.Error400BadRequest("Cookie header required for logout")
	}

	flow, resp, err := h.kratosPub.FrontendAPI.CreateBrowserLogoutFlow(ctx).Cookie(in.Cookie).Execute()
	if err != nil {
		statusCode := 0
		if resp != nil {
			statusCode = resp.StatusCode
		}
		logger.Logger.Error("Failed to create logout flow", "error", err, "status", statusCode)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", LogoutError, err).Error())
	}

	return &LogoutOutput{Body: LogoutResponse{
		LogoutURL:   flow.LogoutUrl,
		LogoutToken: flow.LogoutToken,
	}}, nil
}

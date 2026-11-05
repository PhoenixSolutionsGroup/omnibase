package email

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/jackc/pgx/v5"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
)

var SendError = errors.New("Failed to send email")

type SendTemplateRequest struct {
	To           string         `json:"to" required:"true" example:"user@example.com"`
	TemplateType string         `json:"template_type" required:"true" example:"tenant-user-invite"`
	Data         map[string]any `json:"data,omitempty"`
}

type SendResponse struct {
	Message string `json:"message"`
}

type SendTemplateInput struct {
	handlers.AuthCtx
	Body SendTemplateRequest
}

type SendOutput struct {
	Body SendResponse
}

func (h *Handler) Send(ctx context.Context, in *SendTemplateInput) (*SendOutput, error) {
	if err := h.checkSendAllowed(ctx, in.TenantID); err != nil {
		return nil, err
	}

	if err := h.email.SendWithTemplate(ctx, email.SendWithTemplateRequest{
		To:           in.Body.To,
		TemplateType: in.Body.TemplateType,
		TenantID:     in.TenantID,
		Data:         in.Body.Data,
	}); err != nil {
		logger.Logger.Error("Failed to send templated email",
			"error", err,
			"to", in.Body.To,
			"template", in.Body.TemplateType)
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound("Template not found")
		}
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", SendError, err).Error())
	}

	return &SendOutput{Body: SendResponse{Message: "Email sent successfully"}}, nil
}

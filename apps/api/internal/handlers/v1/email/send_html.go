package email

import (
	"context"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
)

type SendHTMLRequest struct {
	To      string `json:"to" required:"true" example:"user@example.com"`
	Subject string `json:"subject" required:"true" example:"Welcome"`
	Body    string `json:"body" required:"true" example:"<h1>Hello</h1>"`
	Plain   string `json:"plain,omitempty" example:"Hello"`
}

type SendHTMLInput struct {
	handlers.AuthCtx
	Body SendHTMLRequest
}

func (h *Handler) SendHTML(ctx context.Context, in *SendHTMLInput) (*SendOutput, error) {
	if err := h.checkSendAllowed(ctx, in.TenantID); err != nil {
		return nil, err
	}

	if err := h.email.Send(ctx, email.SendArgs{
		To:       in.Body.To,
		Subject:  in.Body.Subject,
		HTML:     in.Body.Body,
		Plain:    in.Body.Plain,
		TenantID: in.TenantID,
	}); err != nil {
		logger.Logger.Error("Failed to send email", "error", err, "to", in.Body.To)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", SendError, err).Error())
	}

	return &SendOutput{Body: SendResponse{Message: "Email sent successfully"}}, nil
}

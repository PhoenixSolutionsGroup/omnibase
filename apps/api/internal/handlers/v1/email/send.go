package email

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
)

var SendError = errors.New("Failed to send email")

type SendRequest struct {
	To      string `json:"to" required:"true" example:"user@example.com"`
	Subject string `json:"subject" required:"true" example:"Welcome"`
	Body    string `json:"body" required:"true" example:"<h1>Hello</h1>"`
	Plain   string `json:"plain,omitempty" example:"Hello"`
}

type SendResponse struct {
	Message string `json:"message"`
}

type SendInput struct {
	handlers.AuthCtx
	Body SendRequest
}

type SendOutput struct {
	Body SendResponse
}

func (h *Handler) Send(ctx context.Context, in *SendInput) (*SendOutput, error) {
	req := in.Body

	if err := h.email.Send(ctx, email.SendArgs{
		To:      req.To,
		Subject: req.Subject,
		HTML:    req.Body,
		Plain:   req.Plain,
	}); err != nil {
		logger.Logger.Error("Failed to send email", "error", err, "to", req.To)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", SendError, err).Error())
	}

	return &SendOutput{Body: SendResponse{Message: "Email sent successfully"}}, nil
}

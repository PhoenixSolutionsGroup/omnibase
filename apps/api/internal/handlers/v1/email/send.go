package email

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/email"
)

var SendError = errors.New("Failed to send email")

type SendRequest struct {
	To      string `json:"to" binding:"required" example:"user@example.com"`
	Subject string `json:"subject" binding:"required" example:"Welcome"`
	Body    string `json:"body" binding:"required" example:"<h1>Hello</h1>"`
	Plain   string `json:"plain" example:"Hello"`
}

type SendResponse struct {
	Message string `json:"message"`
}

func (h *Handler) Send(ctx *gin.Context) {
	var req SendRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request body")
		return
	}

	err := h.email.Send(ctx.Request.Context(), email.SendArgs{
		To:      req.To,
		Subject: req.Subject,
		HTML:    req.Body,
		Plain:   req.Plain,
	})
	if err != nil {
		logger.Logger.Error("Failed to send email", "error", err, "to", req.To)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", SendError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, SendResponse{Message: "Email sent successfully"})
}

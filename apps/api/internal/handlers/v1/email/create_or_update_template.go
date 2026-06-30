package email

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var UpsertTemplateError = errors.New("Failed to upsert template")

type UpsertTemplateRequest struct {
	Type     string `json:"type" binding:"required" example:"test_welcome"`
	Subject  string `json:"subject" binding:"required" example:"Welcome to Test Platform"`
	HTMLBody string `json:"html_body" binding:"required" example:"<h1>Welcome!</h1>"`
}

type UpsertTemplateResponse struct {
	Message  string                   `json:"message"`
	Template repository.EmailTemplate `json:"template"`
}

func (h *Handler) CreateOrUpdateTemplate(ctx *gin.Context) {
	var req UpsertTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	tmpl, err := h.repo.UpsertEmailTemplate(ctx.Request.Context(), repository.UpsertEmailTemplateParams{
		Type:     req.Type,
		Subject:  req.Subject,
		HtmlBody: req.HTMLBody,
	})
	if err != nil {
		logger.Logger.Error("Failed to upsert email template", "type", req.Type, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", UpsertTemplateError, err))
		return
	}

	handlers.NewSuccessResponse(ctx, UpsertTemplateResponse{
		Message:  "Template saved successfully",
		Template: tmpl,
	})
}

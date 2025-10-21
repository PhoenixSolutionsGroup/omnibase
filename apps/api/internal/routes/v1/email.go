package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/models"
	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EmailHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewEmailHandler(cfg *config.Config) *EmailHandler {
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	return &EmailHandler{
		db:  db,
		cfg: cfg,
	}
}

type CreateEmailTemplateRequest struct {
	Type     string `json:"type" binding:"required"`
	Subject  string `json:"subject" binding:"required"`
	HTMLBody string `json:"html_body" binding:"required"`
}

// POST /api/v1/email/templates - Create or update email template
func (h *EmailHandler) CreateOrUpdateTemplate(ctx *gin.Context) {
	var req CreateEmailTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Check if template exists
	var existingTemplate models.EmailTemplate
	err := h.db.Where("type = ?", req.Type).First(&existingTemplate).Error

	if err == gorm.ErrRecordNotFound {
		// Create new template
		template := models.EmailTemplate{
			Type:     req.Type,
			Subject:  req.Subject,
			HTMLBody: req.HTMLBody,
		}

		if err := h.db.Create(&template).Error; err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create template: %w", err))
			return
		}

		handlers.NewSuccessResponse(ctx, gin.H{
			"message":  "Template created successfully",
			"template": template,
		})
	} else if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check existing template: %w", err))
		return
	} else {
		// Update existing template
		existingTemplate.Subject = req.Subject
		existingTemplate.HTMLBody = req.HTMLBody

		if err := h.db.Save(&existingTemplate).Error; err != nil {
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update template: %w", err))
			return
		}

		handlers.NewSuccessResponse(ctx, gin.H{
			"message":  "Template updated successfully",
			"template": existingTemplate,
		})
	}
}

// GET /api/v1/email/templates - Get all email templates
func (h *EmailHandler) GetTemplates(ctx *gin.Context) {
	var templates []models.EmailTemplate

	if err := h.db.Find(&templates).Error; err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch templates: %w", err))
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"templates": templates,
		"count":     len(templates),
	})
}

// GET /api/v1/email/templates/:type - Get specific email template
func (h *EmailHandler) GetTemplateByType(ctx *gin.Context) {
	templateType := ctx.Param("type")

	var template models.EmailTemplate
	if err := h.db.Where("type = ?", templateType).First(&template).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			handlers.NewNotFoundResponse(ctx, "Template not found")
			return
		}
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch template: %w", err))
		return
	}

	handlers.NewSuccessResponse(ctx, template)
}

// DELETE /api/v1/email/templates/:type - Delete email template
func (h *EmailHandler) DeleteTemplate(ctx *gin.Context) {
	templateType := ctx.Param("type")

	result := h.db.Where("type = ?", templateType).Delete(&models.EmailTemplate{})
	if result.Error != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to delete template: %w", result.Error))
		return
	}

	if result.RowsAffected == 0 {
		handlers.NewNotFoundResponse(ctx, "Template not found")
		return
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"message": "Template deleted successfully",
	})
}

func SetUpEmailRoutes(group *gin.RouterGroup) {
	cfg := config.New()
	handler := NewEmailHandler(cfg)

	group.POST("/templates", handler.CreateOrUpdateTemplate)
	group.GET("/templates", handler.GetTemplates)
	group.GET("/templates/:type", handler.GetTemplateByType)
	group.DELETE("/templates/:type", handler.DeleteTemplate)
}

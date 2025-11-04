package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EmailHandler struct {
	db       *gorm.DB
	cfg      *config.Config
	s3Client *s3.Client
}

func NewEmailHandler(cfg *config.Config) *EmailHandler {
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	// Initialize S3 client for R2 bucket access
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
		panic(fmt.Sprintf("Failed to load AWS config: %s", err))
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	return &EmailHandler{
		db:       db,
		cfg:      cfg,
		s3Client: s3Client,
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

// GET /api/v1/email/templates/:template_name/:type - Serve email templates for Kratos
func (h *EmailHandler) ServeTemplate(ctx *gin.Context) {
	templateName := ctx.Param("template_name") // e.g., "verification", "recovery"
	templateType := ctx.Param("type")          // e.g., "body", "plaintext", "subject"

	logger.Logger.Debug("Serving email template",
		"template_name", templateName,
		"type", templateType)

	// Build file name
	var fileName string
	switch templateType {
	case "body":
		fileName = "email.body.gotmpl"
	case "plaintext":
		fileName = "email.body.plaintext.gotmpl"
	case "subject":
		fileName = "email.subject.gotmpl"
	default:
		handlers.NewBadRequestResponse(ctx, "Invalid type. Must be: body, plaintext, or subject")
		return
	}

	// Try R2 bucket first
	r2Key := fmt.Sprintf("email-templates/%s/%s", templateName, fileName)
	result, err := h.s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(h.cfg.S3Config.BucketName),
		Key:    aws.String(r2Key),
	})

	if err == nil {
		defer result.Body.Close()
		body := make([]byte, *result.ContentLength)
		_, readErr := result.Body.Read(body)
		if readErr == nil || readErr.Error() == "EOF" {
			logger.Logger.Info("Serving custom template from R2", "r2_key", r2Key)
			ctx.Header("Content-Type", "text/plain; charset=utf-8")
			ctx.Header("Cache-Control", "public, max-age=3600")
			ctx.String(200, string(body))
			return
		}
	}

	logger.Logger.Debug("Custom template not found in R2, using default",
		"r2_key", r2Key,
		"error", err)

	// Fallback to static default template
	staticPath := filepath.Join("./internal/static/templates", templateName, fileName)
	defaultTemplate, err := os.ReadFile(staticPath)

	if err != nil {
		logger.Logger.Error("Default template not found",
			"path", staticPath,
			"error", err)

		handlers.NewNotFoundResponse(ctx, fmt.Sprintf(
			"Template not found: %s/%s", templateName, templateType))
		return
	}

	logger.Logger.Info("Serving default template from static files", "path", staticPath)

	ctx.Header("Content-Type", "text/plain; charset=utf-8")
	ctx.Header("Cache-Control", "public, max-age=86400")
	ctx.String(200, string(defaultTemplate))
}

func SetUpEmailRoutes(group *gin.RouterGroup) {
	cfg := config.New()
	handler := NewEmailHandler(cfg)

	group.POST("/templates", handler.CreateOrUpdateTemplate)
	group.GET("/templates", handler.GetTemplates)
	group.DELETE("/templates/:type", handler.DeleteTemplate)

	// Kratos template serving route (must be after other routes to avoid conflicts)
	group.GET("/templates/:template_name/:type", handler.ServeTemplate)
}

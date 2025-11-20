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
	logger.Logger.Info("Initializing email handler")

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection in email handler", "error", err)
		panic(err)
	}

	// Initialize S3 client for R2 bucket access
	logger.Logger.Debug("Loading AWS config for S3 client", "region", cfg.S3Config.Region)
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
		logger.Logger.Error("Failed to load AWS config for S3 client", "error", err)
		panic(fmt.Sprintf("Failed to load AWS config: %s", err))
	}

	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	logger.Logger.Info("Email handler initialized successfully")
	return &EmailHandler{
		db:       db,
		cfg:      cfg,
		s3Client: s3Client,
	}
}

// CreateEmailTemplateRequest represents the request body for creating/updating email templates
type CreateEmailTemplateRequest struct {
	// Template type identifier (e.g., "welcome", "password-reset")
	Type string `json:"type" binding:"required" example:"test_welcome"`
	// Email subject line
	Subject string `json:"subject" binding:"required" example:"Welcome to Test Platform"`
	// HTML email body content
	HTMLBody string `json:"html_body" binding:"required" example:"<h1>Welcome!</h1><p>Thanks for joining our test platform.</p>"`
}

// CreateOrUpdateTemplate godoc
// @Summary      Create or update email template
// @Description  Creates a new email template or updates an existing one based on template type.
// @Description
// @Description  ## Template Management
// @Description  - If template type exists: updates subject and HTML body
// @Description  - If template type is new: creates new template entry
// @Description
// @Description  ## Template Types
// @Description  Template types are user-defined identifiers (e.g., "welcome", "password-reset", "invoice").
// @Description
// @Description  ## Use Cases
// @Description  - Store custom email templates for transactional emails
// @Description  - Update email content without code deployments
// @Description  - Maintain versioned email templates
// @Tags         V1 Configuration
// @Accept       json
// @Produce      json
// @Param        body body CreateEmailTemplateRequest true "Email template data"
// @Success      200 {object} handlers.SuccessResponse{data=object{message=string,template=models.EmailTemplate}} "Template created/updated successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body"
// @Failure      401 {object} handlers.UnauthorizedResponse "Not authenticated"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to create/update template"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/email/templates [post]
// @ID           createOrUpdateEmailTemplate
func (h *EmailHandler) CreateOrUpdateTemplate(ctx *gin.Context) {
	logger.Logger.Info("Creating or updating email template")

	var req CreateEmailTemplateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request format for email template", "error", err)
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	// Check if template exists
	var existingTemplate models.EmailTemplate
	err := h.db.Where("type = ?", req.Type).First(&existingTemplate).Error

	if err == gorm.ErrRecordNotFound {
		// Create new template
		logger.Logger.Info("Creating new email template", "type", req.Type)
		template := models.EmailTemplate{
			Type:     req.Type,
			Subject:  req.Subject,
			HTMLBody: req.HTMLBody,
		}

		if err := h.db.Create(&template).Error; err != nil {
			logger.Logger.Error("Failed to create email template", "type", req.Type, "error", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create template: %w", err))
			return
		}

		logger.Logger.Info("Email template created successfully", "type", req.Type)
		handlers.NewSuccessResponse(ctx, gin.H{
			"message":  "Template created successfully",
			"template": template,
		})
	} else if err != nil {
		logger.Logger.Error("Failed to check existing template", "type", req.Type, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to check existing template: %w", err))
		return
	} else {
		// Update existing template
		logger.Logger.Info("Updating existing email template", "type", req.Type)
		existingTemplate.Subject = req.Subject
		existingTemplate.HTMLBody = req.HTMLBody

		if err := h.db.Save(&existingTemplate).Error; err != nil {
			logger.Logger.Error("Failed to update email template", "type", req.Type, "error", err)
			handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to update template: %w", err))
			return
		}

		logger.Logger.Info("Email template updated successfully", "type", req.Type)
		handlers.NewSuccessResponse(ctx, gin.H{
			"message":  "Template updated successfully",
			"template": existingTemplate,
		})
	}
}

// GetTemplates godoc
// @Summary      Get all email templates
// @Description  Retrieves all email templates stored in the database.
// @Description
// @Description  ## Response
// @Description  Returns array of all templates with their type, subject, and HTML body.
// @Description
// @Description  ## Use Cases
// @Description  - List available email templates
// @Description  - Display template management interface
// @Description  - Audit email template inventory
// @Tags         V1 Configuration
// @Produce      json
// @Success      200 {object} handlers.SuccessResponse{data=object{templates=[]models.EmailTemplate,count=int}} "Templates retrieved successfully"
// @Failure      401 {object} handlers.UnauthorizedResponse "Not authenticated"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to fetch templates"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/email/templates [get]
// @ID           getEmailTemplates
func (h *EmailHandler) GetTemplates(ctx *gin.Context) {
	logger.Logger.Info("Fetching all email templates")

	var templates []models.EmailTemplate

	if err := h.db.Find(&templates).Error; err != nil {
		logger.Logger.Error("Failed to fetch email templates", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to fetch templates: %w", err))
		return
	}

	logger.Logger.Info("Successfully fetched email templates", "count", len(templates))
	handlers.NewSuccessResponse(ctx, gin.H{
		"templates": templates,
		"count":     len(templates),
	})
}

// DeleteTemplate godoc
// @Summary      Delete email template
// @Description  Deletes an email template by its type identifier.
// @Description
// @Description  ## Deletion Process
// @Description  - Searches for template by type
// @Description  - Removes template from database if found
// @Description  - Returns 404 if template doesn't exist
// @Description
// @Description  ## Use Cases
// @Description  - Remove deprecated email templates
// @Description  - Clean up test templates
// @Description  - Template lifecycle management
// @Tags         V1 Configuration
// @Produce      json
// @Param        type path string true "Template type identifier"
// @Success      200 {object} handlers.SuccessResponse{data=object{message=string}} "Template deleted successfully"
// @Failure      401 {object} handlers.UnauthorizedResponse "Not authenticated"
// @Failure      404 {object} handlers.NotFoundErrorResponse "Template not found"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to delete template"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/email/templates/{type} [delete]
// @ID           deleteEmailTemplate
func (h *EmailHandler) DeleteTemplate(ctx *gin.Context) {
	templateType := ctx.Param("type")
	logger.Logger.Info("Deleting email template", "type", templateType)

	result := h.db.Where("type = ?", templateType).Delete(&models.EmailTemplate{})
	if result.Error != nil {
		logger.Logger.Error("Failed to delete email template", "type", templateType, "error", result.Error)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to delete template: %w", result.Error))
		return
	}

	if result.RowsAffected == 0 {
		logger.Logger.Warn("Email template not found for deletion", "type", templateType)
		handlers.NewNotFoundResponse(ctx, "Template not found")
		return
	}

	logger.Logger.Info("Email template deleted successfully", "type", templateType)
	handlers.NewSuccessResponse(ctx, gin.H{
		"message": "Template deleted successfully",
	})
}

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

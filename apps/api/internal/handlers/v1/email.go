package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
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
	db           *gorm.DB
	cfg          *config.Config
	s3Client     *s3.Client
	emailService *services_v1.EmailService
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

	// Initialize email service
	emailService, err := services_v1.NewEmailService(cfg.SMTPConfig.ConnectionURI, cfg.SMTPConfig.FromEmail, db)
	if err != nil {
		logger.Logger.Error("Failed to initialize email service", "error", err)
		panic(fmt.Sprintf("Failed to initialize email service: %s", err))
	}

	logger.Logger.Info("Email handler initialized successfully")
	return &EmailHandler{
		db:           db,
		cfg:          cfg,
		s3Client:     s3Client,
		emailService: emailService,
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

// SendEmailRequest represents the request body for sending an email
type SendEmailRequest struct {
	// Recipient email address
	To string `json:"to" binding:"required" example:"user@example.com"`
	// Email subject line
	Subject string `json:"subject" binding:"required" example:"Welcome to Our Platform"`
	// HTML email body content
	Body string `json:"body" binding:"required" example:"<h1>Hello!</h1><p>Welcome to our platform.</p>"`
	// Optional plain text version of the email body
	Plain string `json:"plain" example:"Hello! Welcome to our platform."`
}

func (h *EmailHandler) SendEmail(ctx *gin.Context) {
	var request SendEmailRequest

	if err := ctx.ShouldBindJSON(&request); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request body")
		return
	}

	logger.Logger.Info("Sending email",
		"to", request.To,
		"subject", request.Subject)

	// Send email using the email service
	err := h.emailService.SendEmail(ctx, request.To, request.Subject, request.Body, request.Plain)
	if err != nil {
		logger.Logger.Error("Failed to send email",
			"error", err,
			"to", request.To)

		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("failed to send email: %w", err))
		return
	}

	logger.Logger.Info("Email sent successfully",
		"to", request.To)

	handlers.NewSuccessResponse(ctx, gin.H{
		"message": "Email sent successfully",
	})
}

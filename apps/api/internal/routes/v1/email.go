package v1

import (
	"context"
	"fmt"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/handlers/v1/email"
	"api/internal/logger"
	"api/internal/middleware"
	emailsvc "api/internal/services/email"
)

func SetUpEmailRoutes(group *gin.RouterGroup, api huma.API) {
	logger.Logger.Info("Initializing email routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)

	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
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

	emailService, err := emailsvc.New(emailsvc.Deps{
		Repo:          repo,
		ConnectionURI: cfg.SMTPConfig.ConnectionURI,
		DefaultFrom:   cfg.SMTPConfig.FromEmail,
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize email service: %s", err))
	}

	handler := email.New(email.Deps{
		Repo:       repo,
		Email:      emailService,
		S3:         s3Client,
		BucketName: cfg.S3Config.BucketName,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSessionOrServiceKey()),
	}
	sessionOrServiceSec := []map[string][]string{
		{"SessionTokenAuth": {}},
		{"CookieAuth": {}},
		{"ServiceKeyAuth": {}},
	}

	huma.Register(api, huma.Operation{
		OperationID: "createOrUpdateEmailTemplate",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/templates",
		Summary:     "Create or update email template",
		Tags:        []string{"V1Configuration"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.CreateOrUpdateTemplate)

	huma.Register(api, huma.Operation{
		OperationID: "getEmailTemplates",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/templates",
		Summary:     "Get all email templates",
		Tags:        []string{"V1Configuration"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.ListTemplates)

	huma.Register(api, huma.Operation{
		OperationID: "deleteEmailTemplate",
		Method:      http.MethodDelete,
		Path:        "/api/v1/email/templates/{type}",
		Summary:     "Delete email template",
		Tags:        []string{"V1Configuration"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.DeleteTemplate)

	huma.Register(api, huma.Operation{
		OperationID: "sendEmail",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/send",
		Summary:     "Send an email",
		Tags:        []string{"V1Configuration"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.Send)

	huma.Register(api, huma.Operation{
		OperationID: "serveEmailTemplate",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/templates/{template_name}/{type}",
		Summary:     "Serve an email template file",
		Tags:        []string{"V1Configuration"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.ServeTemplate)

	logger.Logger.Info("Email routes registration completed")
}

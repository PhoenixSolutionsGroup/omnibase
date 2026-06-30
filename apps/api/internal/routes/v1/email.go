package v1

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	"api/internal/handlers/v1/email"
	"api/internal/logger"
	"api/internal/middleware"
	emailsvc "api/internal/services/email"
)

func SetUpEmailRoutes(group *gin.RouterGroup) {
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
	group.Use(authMiddleware.RequireAuthHeaders())
	group.Use(authMiddleware.RequireSessionOrServiceKey())

	group.POST("/templates", handler.CreateOrUpdateTemplate)
	group.GET("/templates", handler.ListTemplates)
	group.DELETE("/templates/:type", handler.DeleteTemplate)
	group.POST("/send", handler.Send)
	group.GET("/templates/:template_name/:type", handler.ServeTemplate)
}

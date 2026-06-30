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
	"api/internal/handlers/v1/storage"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/permissions"
)

func SetUpStorageRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing storage routes")
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

	s3Internal := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})
	s3Public := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.PublicEndpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.PublicEndpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	perms := permissions.New(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)

	handler := storage.New(storage.Deps{
		Repo:       repo,
		Perms:      perms,
		S3:         s3Internal,
		S3Public:   s3Public,
		BucketName: cfg.S3Config.BucketName,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	router.Use(authMiddleware.RequireAuthHeaders())
	router.Use(authMiddleware.RequireSessionOrServiceKey())

	router.POST("/upload", handler.Upload)
	router.POST("/download", handler.Download)
	router.DELETE("/object", handler.DeleteObject)
	router.POST("/make-public", handler.MakePublic)
}

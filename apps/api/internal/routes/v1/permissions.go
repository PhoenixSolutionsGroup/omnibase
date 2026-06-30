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
	v1 "api/internal/handlers/v1"
	"api/internal/handlers/v1/permissions"
	"api/internal/logger"
	"api/internal/middleware"
)

func SetUpPermissionRoutes(router *gin.RouterGroup) {
	logger.Logger.Info("Initializing permission routes")
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

	permissionsHandler := v1.NewPermissionsHandler(cfg)
	namespacesHandler := permissions.New(permissions.Deps{
		Repo:       repo,
		S3:         s3Client,
		BucketName: cfg.S3Config.BucketName,
		TenantID:   cfg.ManagedHostingConfig.TenantID,
		IsManaged:  cfg.ManagedHostingConfig.IsManaged,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)

	sessionOrServiceGroup := router.Group("")
	sessionOrServiceGroup.Use(authMiddleware.RequireAuthHeaders())
	sessionOrServiceGroup.Use(authMiddleware.RequireSessionOrServiceKey())

	sessionOrServiceGroup.POST("/check", permissionsHandler.CheckPermission)
	sessionOrServiceGroup.POST("/relationships", permissionsHandler.CreateRelationship)
	sessionOrServiceGroup.DELETE("/relationships", permissionsHandler.DeleteRelationship)

	router.POST("/namespaces", authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey(), namespacesHandler.DeployNamespaces)
}

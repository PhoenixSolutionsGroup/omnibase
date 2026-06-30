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
	"api/internal/handlers/v1/permissions"
	"api/internal/logger"
	"api/internal/middleware"
	permsvc "api/internal/services/permissions"
)

func SetUpPermissionRoutes(router *gin.RouterGroup, api huma.API) {
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

	perms := permsvc.New(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)

	handler := permissions.New(permissions.Deps{
		Repo:       repo,
		Perms:      perms,
		S3:         s3Client,
		BucketName: cfg.S3Config.BucketName,
		TenantID:   cfg.ManagedHostingConfig.TenantID,
		IsManaged:  cfg.ManagedHostingConfig.IsManaged,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg)
	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSessionOrServiceKey()),
	}
	serviceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey()),
	}
	sessionOrServiceSec := []map[string][]string{
		{"SessionTokenAuth": {}},
		{"CookieAuth": {}},
		{"ServiceKeyAuth": {}},
	}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}

	huma.Register(api, huma.Operation{
		OperationID: "checkPermission",
		Method:      http.MethodPost,
		Path:        "/api/v1/permissions/check",
		Summary:     "Check permission",
		Tags:        []string{"V1Permissions"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.Check)

	huma.Register(api, huma.Operation{
		OperationID: "createRelationship",
		Method:      http.MethodPost,
		Path:        "/api/v1/permissions/relationships",
		Summary:     "Create relationship",
		Tags:        []string{"V1Permissions"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.CreateRelationship)

	huma.Register(api, huma.Operation{
		OperationID: "deleteRelationship",
		Method:      http.MethodDelete,
		Path:        "/api/v1/permissions/relationships",
		Summary:     "Delete relationship",
		Tags:        []string{"V1Permissions"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.DeleteRelationship)

	huma.Register(api, huma.Operation{
		OperationID: "deployPermissionNamespaces",
		Method:      http.MethodPost,
		Path:        "/api/v1/permissions/namespaces",
		Summary:     "Deploy Keto namespace configurations",
		Tags:        []string{"V1Configuration"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, handler.DeployNamespaces)

	logger.Logger.Info("Permission routes registration completed")
}

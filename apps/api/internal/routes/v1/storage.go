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

	"api/internal/database/repository"
	"api/internal/handlers/v1/storage"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/permissions"
)

func SetUpStorageRoutes(router *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing storage routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)

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

	authMiddleware := middleware.NewAuthMiddleware(cfg, d.DB)
	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSessionOrServiceKey()),
	}
	sessionOrServiceSec := []map[string][]string{
		{"SessionTokenAuth": {}},
		{"CookieAuth": {}},
		{"ServiceKeyAuth": {}},
	}

	huma.Register(api, huma.Operation{
		OperationID: "uploadFile",
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/upload",
		Summary:     "Upload file to storage",
		Tags:        []string{"V1Storage"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.Upload)

	huma.Register(api, huma.Operation{
		OperationID: "downloadFile",
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/download",
		Summary:     "Download file from storage",
		Tags:        []string{"V1Storage"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.Download)

	huma.Register(api, huma.Operation{
		OperationID: "deleteObject",
		Method:      http.MethodDelete,
		Path:        "/api/v1/storage/object",
		Summary:     "Delete file from storage",
		Tags:        []string{"V1Storage"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.DeleteObject)

	huma.Register(api, huma.Operation{
		OperationID: "makeFilePublic",
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/make-public",
		Summary:     "Make a file publicly accessible",
		Tags:        []string{"V1Storage"},
		Security:    sessionOrServiceSec,
		Middlewares: sessionOrServiceMW,
	}, handler.MakePublic)

	logger.Logger.Info("Storage routes registration completed")
}

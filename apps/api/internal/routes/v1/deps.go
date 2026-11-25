package v1

import (
	"api/internal/config"
	"api/internal/middleware"
	storagecredentials "api/internal/services/storage/credentials"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jackc/pgx/v5/pgxpool"
	"gorm.io/gorm"
)

type Deps struct {
	Cfg         *config.Config
	Pool        *pgxpool.Pool
	DB          *gorm.DB
	Auth        *middleware.AuthMiddleware
	RBAC        *middleware.RBACMiddleware
	S3          *s3.Client
	S3Public    *s3.Client
	Credentials *storagecredentials.Service
}

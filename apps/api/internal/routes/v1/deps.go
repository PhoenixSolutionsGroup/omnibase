package v1

import (
	"api/internal/config"
	"api/internal/middleware"
	"api/internal/services/sessioncache"

	"github.com/jackc/pgx/v5/pgxpool"
	"gorm.io/gorm"
)

type Deps struct {
	Cfg  *config.Config
	Pool *pgxpool.Pool
	DB   *gorm.DB
	Auth *middleware.AuthMiddleware
	RBAC *middleware.RBACMiddleware

	Revoker *sessioncache.Invalidator
}

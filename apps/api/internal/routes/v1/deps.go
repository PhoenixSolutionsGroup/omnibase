package v1

import (
	"api/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
	"gorm.io/gorm"
)

type Deps struct {
	Cfg  *config.Config
	Pool *pgxpool.Pool
	DB   *gorm.DB
}

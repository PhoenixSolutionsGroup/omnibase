package db

import (
	"github.com/jackc/pgx/v5/pgxpool"

	"api/internal/config"
)

type Handler struct {
	pool         *pgxpool.Pool
	dbCfg        config.DatabaseConfig
	postgRESTURL string
	typegenURL   string
}

type Deps struct {
	Pool         *pgxpool.Pool
	DBConfig     config.DatabaseConfig
	PostgRESTURL string
	TypegenURL   string
}

func New(deps Deps) *Handler {
	return &Handler{
		pool:         deps.Pool,
		dbCfg:        deps.DBConfig,
		postgRESTURL: deps.PostgRESTURL,
		typegenURL:   deps.TypegenURL,
	}
}

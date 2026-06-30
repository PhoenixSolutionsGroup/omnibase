package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/handlers/v1/db"
	"api/internal/logger"
	"api/internal/middleware"
)

func SetUpDBRoutes(_ *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing database routes")
	cfg := d.Cfg

	handler := db.New(db.Deps{
		Pool:         d.Pool,
		DBConfig:     cfg.Database,
		PostgRESTURL: cfg.PostgRESTURL,
		TypegenURL:   cfg.TypegenURL,
	})

	authMiddleware := middleware.NewAuthMiddleware(cfg, d.DB)
	serviceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireServiceKey()),
	}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}

	huma.Register(api, huma.Operation{
		OperationID: "uploadDatabaseMigrations",
		Method:      http.MethodPost,
		Path:        "/api/v1/database/migrations",
		Summary:     "Apply database migrations",
		Tags:        []string{"V1Database"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, handler.ApplyMigrations)

	huma.Register(api, huma.Operation{
		OperationID: "getDatabaseMigrationStatus",
		Method:      http.MethodGet,
		Path:        "/api/v1/database/migrations/status",
		Summary:     "Get the status of applied migrations",
		Tags:        []string{"V1Database"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, handler.MigrationsStatus)

	huma.Register(api, huma.Operation{
		OperationID: "rollbackDatabaseMigrations",
		Method:      http.MethodPost,
		Path:        "/api/v1/database/migrations/down",
		Summary:     "Roll back database migrations",
		Tags:        []string{"V1Database"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, handler.MigrationsDown)

	huma.Register(api, huma.Operation{
		OperationID: "generateDatabaseTypes",
		Method:      http.MethodGet,
		Path:        "/api/v1/database/typegen",
		Summary:     "Generate type definitions for the database schema",
		Tags:        []string{"V1Database"},
		Security:    serviceSec,
		Middlewares: serviceMW,
	}, handler.Typegen)

	logger.Logger.Info("Database routes registration completed")
}

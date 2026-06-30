package db

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"

	"api/internal/handlers"
)

var MigrationsStatusError = errors.New("Failed to fetch migrations status")

type AppliedMigration struct {
	Version int64 `json:"version"`
	Dirty   bool  `json:"dirty"`
}

func (h *Handler) MigrationsStatus(c *gin.Context) {
	ctx := c.Request.Context()

	var exists bool
	if err := h.pool.QueryRow(ctx, `SELECT to_regclass('"migrations"."schema_migrations"') IS NOT NULL`).Scan(&exists); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsStatusError, err))
		return
	}

	if !exists {
		handlers.NewSuccessResponse(c, []AppliedMigration{})
		return
	}

	rows, err := h.pool.Query(ctx, `SELECT version, dirty FROM "migrations"."schema_migrations" ORDER BY version DESC`)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsStatusError, err))
		return
	}
	defer rows.Close()

	out := []AppliedMigration{}
	for rows.Next() {
		var m AppliedMigration
		if err := rows.Scan(&m.Version, &m.Dirty); err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsStatusError, err))
			return
		}
		out = append(out, m)
	}
	if err := rows.Err(); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsStatusError, err))
		return
	}

	handlers.NewSuccessResponse(c, out)
}

package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
)

var MigrationsStatusError = errors.New("Failed to fetch migrations status")

type AppliedMigration struct {
	Version int64 `json:"version"`
	Dirty   bool  `json:"dirty"`
}

type MigrationsStatusInput struct {
	handlers.AuthCtx
}

type MigrationsStatusOutput struct {
	Body []AppliedMigration
}

func (h *Handler) MigrationsStatus(ctx context.Context, _ *MigrationsStatusInput) (*MigrationsStatusOutput, error) {
	var exists bool
	if err := h.pool.QueryRow(ctx, `SELECT to_regclass('"migrations"."schema_migrations"') IS NOT NULL`).Scan(&exists); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsStatusError, err).Error())
	}

	if !exists {
		return &MigrationsStatusOutput{Body: []AppliedMigration{}}, nil
	}

	rows, err := h.pool.Query(ctx, `SELECT version, dirty FROM "migrations"."schema_migrations" ORDER BY version DESC`)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsStatusError, err).Error())
	}
	defer rows.Close()

	out := []AppliedMigration{}
	for rows.Next() {
		var m AppliedMigration
		if err := rows.Scan(&m.Version, &m.Dirty); err != nil {
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsStatusError, err).Error())
		}
		out = append(out, m)
	}
	if err := rows.Err(); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", MigrationsStatusError, err).Error())
	}

	return &MigrationsStatusOutput{Body: out}, nil
}

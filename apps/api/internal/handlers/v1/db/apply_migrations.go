package db

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/golang-migrate/migrate/v4"
	"github.com/jackc/pgx/v5/pgconn"

	"api/internal/handlers"
	"api/internal/logger"
)

var ApplyMigrationsError = errors.New("Failed to apply migrations")

type ApplyMigrationsResponse struct {
	Status  int    `json:"status" required:"true"`
	Message string `json:"message" required:"true"`
}

type ApplyMigrationsInput struct {
	handlers.AuthCtx
	RawBody huma.MultipartFormFiles[struct {
		Migrations huma.FormFile `form:"migrations" required:"true"`
	}]
}

type ApplyMigrationsOutput struct {
	Body ApplyMigrationsResponse
}

func (h *Handler) ApplyMigrations(ctx context.Context, in *ApplyMigrationsInput) (*ApplyMigrationsOutput, error) {
	form := in.RawBody.Data()
	file := form.Migrations
	defer file.Close()

	if file.Size == 0 {
		return nil, huma.Error400BadRequest("Empty file provided")
	}

	dir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-migrations", time.Now().UnixNano()))
	defer os.RemoveAll(dir)

	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyMigrationsError, err).Error())
	}

	if err := extractMigrationZip(file, dir); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyMigrationsError, err).Error())
	}

	if err := h.runMigrations(ctx, dir); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ApplyMigrationsError, err).Error())
	}

	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migrations still applied)", "error", err)
	}

	return &ApplyMigrationsOutput{Body: ApplyMigrationsResponse{
		Status:  200,
		Message: "Migrations applied successfully",
	}}, nil
}

func (h *Handler) runMigrations(ctx context.Context, dir string) error {
	const maxRetries = 5
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			delay := time.Duration(attempt) * time.Second
			logger.Logger.Info("Retrying migration application", "attempt", attempt, "delay", delay)
			select {
			case <-time.After(delay):
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		err := h.runMigrationsOnce(ctx, dir)
		if err == nil {
			return nil
		}

		if !isTransientDBError(err) {
			return err
		}

		lastErr = err
	}

	return fmt.Errorf("migrations failed after %d retries: %w", maxRetries, lastErr)
}

func isTransientDBError(err error) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}
	switch pgErr.SQLState() {
	case "57P01", "08P01":
		logger.Logger.Warn("Transient database error, will retry", "sqlstate", pgErr.SQLState(), "error", err)
		return true
	}
	return false
}

func (h *Handler) runMigrationsOnce(ctx context.Context, dir string) error {
	if _, err := h.pool.Exec(ctx, `CREATE SCHEMA IF NOT EXISTS "migrations"`); err != nil {
		return fmt.Errorf("create migrations schema: %w", err)
	}

	m, err := h.migrateInstance(dir)
	if err != nil {
		return err
	}
	defer m.Close()

	prevVersion, _, prevErr := m.Version()
	hasPrev := prevErr == nil

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		version, dirty, vErr := m.Version()
		if vErr == nil && dirty {
			target := -1
			if hasPrev {
				target = int(prevVersion)
			}
			if forceErr := m.Force(target); forceErr != nil {
				return fmt.Errorf("migration failed and cleanup failed: %w (original: %v)", forceErr, err)
			}
			return fmt.Errorf("migration failed (reverted to version %d): %w", target, err)
		}
		_ = version
		return err
	}

	logger.Logger.Info("Migrations applied")
	return nil
}

package db

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"

	"api/internal/handlers"
	"api/internal/logger"
)

var MigrationsDownError = errors.New("Failed to roll back migrations")

func (h *Handler) MigrationsDown(c *gin.Context) {
	stepsStr := c.PostForm("steps")
	if stepsStr == "" {
		handlers.NewBadRequestResponse(c, "steps is required and must be >= 1")
		return
	}
	steps, err := strconv.Atoi(stepsStr)
	if err != nil || steps < 1 {
		handlers.NewBadRequestResponse(c, "steps must be a positive integer")
		return
	}

	dir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-down-migrations", time.Now().UnixNano()))
	defer os.RemoveAll(dir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsDownError, err))
		return
	}

	fileHeader, err := c.FormFile("migrations")
	if err != nil {
		handlers.NewBadRequestResponse(c, "No migrations zip file provided")
		return
	}
	if fileHeader.Size == 0 {
		handlers.NewBadRequestResponse(c, "Empty file provided")
		return
	}

	zipFile, err := fileHeader.Open()
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsDownError, err))
		return
	}
	defer zipFile.Close()

	if err := extractMigrationZip(zipFile, dir); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsDownError, err))
		return
	}

	m, err := h.migrateInstance(dir)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsDownError, err))
		return
	}
	defer m.Close()

	if err := m.Steps(-steps); err != nil {
		if err == migrate.ErrNoChange {
			handlers.NewSuccessResponse(c, map[string]any{"message": "No migration changes applied"})
			return
		}
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("%w: %w", MigrationsDownError, err))
		return
	}

	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migration down still applied)", "error", err)
	}

	handlers.NewSuccessResponse(c, map[string]any{
		"message": fmt.Sprintf("Rolled back %d migration(s)", steps),
	})
}

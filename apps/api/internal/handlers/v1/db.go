package v1

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"gorm.io/gorm"

	"api/internal/config"
	"api/internal/database"
	"api/internal/logger"
)

type MigrationHandler struct {
	db *gorm.DB
}

func NewMigrationHandler(cfg *config.Config) *MigrationHandler {
	logger.Logger.Trace("Creating new migration handler")
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to connect to database for migrations", "error", err)
		panic(err)
	}

	logger.Logger.Info("Migration handler initialized successfully")
	return &MigrationHandler{
		db: db,
	}
}

// MigrationSuccessResponse represents a successful migration response
type MigrationSuccessResponse struct {
	// HTTP status code
	Status int `json:"status" binding:"required" example:"200"`
	// Success message
	Message string `json:"message" binding:"required" example:"Migrations applied successfully"`
}

// MigrationErrorResponse represents a migration error response
type MigrationErrorResponse struct {
	// HTTP status code
	Status int `json:"status" binding:"required" example:"400"`
	// Error message
	Message string `json:"message" binding:"required" example:"No migrations zip file provided"`
}

// HandleMigrations uploads and applies database migrations
// @Summary      Upload database migrations
// @Description  Uploads SQL migration files and applies them to the user's PostgreSQL database.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token (typically used by CLI tools, not browser sessions).
// @Description
// @Description  ## Migration Format
// @Description  Upload a zip file containing SQL files named like: `001-seed.sql`, `002-rls.sql`, etc.
// @Description  Files are automatically renamed to golang-migrate format: `001_seed.up.sql`, `002_rls.up.sql`.
// @Description
// @Description  ## Use Cases
// @Description  - CLI migration uploads via `omnibase db migration push`
// @Description  - CI/CD pipeline integrations
// @Description  - Programmatic schema management
// @Tags         V1 Configuration
// @Accept       multipart/form-data
// @Produce      json
// @Param        migrations formData file true "Zip file containing SQL migration files"
// @Success      200 {object} MigrationSuccessResponse "Migrations applied successfully"
// @Failure      400 {object} MigrationErrorResponse "No migrations zip file provided"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Migration execution failed"
// @Security     ServiceKeyAuth
// @Router       /api/v1/database/migrations [post]
// @ID           uploadDatabaseMigrations
func (h *MigrationHandler) HandleMigrations(c *gin.Context) {
	logger.Logger.Info("Starting migration upload and application process")

	// Create temporary migration directory with timestamp in system temp directory
	timestamp := time.Now().UnixNano()
	migrationsDir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-migrations", timestamp))
	logger.Logger.Debug("Created temporary migration directory path", "path", migrationsDir)

	// Ensure cleanup happens regardless of success or failure
	defer func() {
		logger.Logger.Debug("Cleaning up temporary migration directory", "path", migrationsDir)
		os.RemoveAll(migrationsDir)
	}()

	// Create the temporary directory
	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		logger.Logger.Error("Failed to create migrations directory", "path", migrationsDir, "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Failed to create migrations directory: %v", err),
		})
		return
	}

	// Get zip file
	fileHeader, err := c.FormFile("migrations")
	if err != nil {
		logger.Logger.Warn("No migrations zip file provided in request", "error", err)
		c.JSON(http.StatusBadRequest, MigrationErrorResponse{
			Status:  http.StatusBadRequest,
			Message: "No migrations zip file provided",
		})
		return
	}
	logger.Logger.Info("Received migration zip file", "filename", fileHeader.Filename, "size", fileHeader.Size)

	// Validate that file is not empty
	if fileHeader.Size == 0 {
		logger.Logger.Warn("Empty file provided", "filename", fileHeader.Filename)
		c.JSON(http.StatusBadRequest, MigrationErrorResponse{
			Status:  http.StatusBadRequest,
			Message: "Empty file provided",
		})
		return
	}

	zipFile, err := fileHeader.Open()
	if err != nil {
		logger.Logger.Error("Failed to open zip file", "filename", fileHeader.Filename, "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: "Failed to open zip file",
		})
		return
	}
	defer zipFile.Close()

	// Extract zip to migrations directory
	logger.Logger.Info("Extracting migration files from zip")
	if err := h.extractZip(zipFile, migrationsDir); err != nil {
		logger.Logger.Error("Failed to extract zip file", "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Failed to extract zip: %v", err),
		})
		return
	}
	logger.Logger.Info("Successfully extracted migration files")

	// Apply migrations
	logger.Logger.Info("Applying migrations to database")
	if err := h.applyMigrations(migrationsDir); err != nil {
		logger.Logger.Error("Migration application failed", "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Migration failed: %v", err),
		})
		return
	}

	logger.Logger.Info("Migrations applied successfully")
	c.JSON(http.StatusOK, MigrationSuccessResponse{
		Status:  http.StatusOK,
		Message: "Migrations applied successfully",
	})
}

func (h *MigrationHandler) extractZip(zipFile io.Reader, migrationsDir string) error {
	logger.Logger.Trace("Starting zip extraction")

	// Save zip to temp file
	tempFile, err := os.CreateTemp("", "migrations-*.zip")
	if err != nil {
		logger.Logger.Error("Failed to create temporary file for zip", "error", err)
		return err
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()
	logger.Logger.Trace("Created temporary zip file", "path", tempFile.Name())

	if _, err := io.Copy(tempFile, zipFile); err != nil {
		logger.Logger.Error("Failed to copy zip data to temp file", "error", err)
		return err
	}
	logger.Logger.Trace("Copied zip data to temporary file")

	// Open and extract zip
	zipReader, err := zip.OpenReader(tempFile.Name())
	if err != nil {
		logger.Logger.Error("Failed to open zip reader", "error", err)
		return err
	}
	defer zipReader.Close()

	fileCount := 0
	// Extract each .sql file
	for _, file := range zipReader.File {
		if !strings.HasSuffix(file.Name, ".sql") || file.FileInfo().IsDir() {
			logger.Logger.Trace("Skipping non-SQL file or directory", "name", file.Name)
			continue
		}

		// Open file in zip
		rc, err := file.Open()
		if err != nil {
			logger.Logger.Error("Failed to open file in zip", "filename", file.Name, "error", err)
			return err
		}

		// Read content
		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			logger.Logger.Error("Failed to read file content", "filename", file.Name, "error", err)
			return err
		}

		// Save to migrations directory with golang-migrate naming convention
		// Convert "001-seed.sql" to "001_seed.up.sql"
		filename := filepath.Base(file.Name)

		// Remove .sql extension and split on hyphen
		nameWithoutExt := strings.TrimSuffix(filename, ".sql")
		parts := strings.SplitN(nameWithoutExt, "-", 2)

		// Reconstruct with underscore and .up.sql suffix
		var newFilename string
		if len(parts) == 2 {
			// Format: version_description.up.sql (e.g., "001_seed.up.sql")
			newFilename = fmt.Sprintf("%s_%s.up.sql", parts[0], parts[1])
		} else {
			// Fallback if no hyphen found, just add .up.sql
			newFilename = nameWithoutExt + ".up.sql"
		}

		destPath := filepath.Join(migrationsDir, newFilename)
		if err := os.WriteFile(destPath, content, 0644); err != nil {
			logger.Logger.Error("Failed to write migration file", "dest_path", destPath, "error", err)
			return err
		}
		logger.Logger.Debug("Extracted migration file", "original", filename, "renamed", newFilename, "size", len(content))
		fileCount++
	}

	logger.Logger.Info("Extraction complete", "files_extracted", fileCount)
	return nil
}

func (h *MigrationHandler) applyMigrations(migrationsDir string) error {
	logger.Logger.Trace("Getting database connection for migrations")

	// Get the underlying *sql.DB from GORM
	sqlDB, err := h.db.DB()
	if err != nil {
		logger.Logger.Error("Failed to get underlying sql.DB from GORM", "error", err)
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	logger.Logger.Debug("Creating postgres driver instance for migrations")
	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		logger.Logger.Error("Failed to create postgres driver instance", "error", err)
		return err
	}

	sourceURL := fmt.Sprintf("file://%s", migrationsDir)
	logger.Logger.Debug("Creating migration instance", "source_url", sourceURL)
	m, err := migrate.NewWithDatabaseInstance(sourceURL, "postgres", driver)
	if err != nil {
		logger.Logger.Error("Failed to create migration instance", "source_url", sourceURL, "error", err)
		return err
	}

	// Apply migrations
	logger.Logger.Info("Executing database migrations")
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		logger.Logger.Error("Migration execution failed", "error", err)

		version, dirty, vErr := m.Version()
		if vErr == nil && dirty {
			logger.Logger.Warn("Detected dirty migration state, forcing cleanup",
				"version", version,
				"original_error", err)

			if forceErr := m.Force(int(version)); forceErr != nil {
				logger.Logger.Error("Failed to force clean dirty migration",
					"version", version,
					"error", forceErr)
				return fmt.Errorf("migration failed and cleanup failed: %w (original: %v)", forceErr, err)
			}

			logger.Logger.Info("Auto-cleaned dirty migration state", "version", version)
			// Return original error so caller knows migration failed
			return fmt.Errorf("migration failed (dirty state cleaned for retry): %w", err)
		}

		return err
	}

	if err == migrate.ErrNoChange {
		logger.Logger.Info("No new migrations to apply")
	} else {
		logger.Logger.Info("All migrations applied successfully")
	}

	return nil
}

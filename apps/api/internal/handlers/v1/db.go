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

// POST /migrations - Upload zip and apply migrations
// The endpoint expects a multipart/form-data request with a "migrations" field containing a zip file
// The zip file should contain .sql files named like: 001-seed.sql, 002-rls.sql, etc.
// These will be automatically renamed to golang-migrate format: 001_seed.up.sql, 002_rls.up.sql, etc.
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
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Failed to create migrations directory: %v", err),
		})
		return
	}

	// Get zip file
	fileHeader, err := c.FormFile("migrations")
	if err != nil {
		logger.Logger.Warn("No migrations zip file provided in request", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  http.StatusBadRequest,
			"message": "No migrations zip file provided",
		})
		return
	}
	logger.Logger.Info("Received migration zip file", "filename", fileHeader.Filename, "size", fileHeader.Size)

	zipFile, err := fileHeader.Open()
	if err != nil {
		logger.Logger.Error("Failed to open zip file", "filename", fileHeader.Filename, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": "Failed to open zip file",
		})
		return
	}
	defer zipFile.Close()

	// Extract zip to migrations directory
	logger.Logger.Info("Extracting migration files from zip")
	if err := h.extractZip(zipFile, migrationsDir); err != nil {
		logger.Logger.Error("Failed to extract zip file", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Failed to extract zip: %v", err),
		})
		return
	}
	logger.Logger.Info("Successfully extracted migration files")

	// Apply migrations
	logger.Logger.Info("Applying migrations to database")
	if err := h.applyMigrations(migrationsDir); err != nil {
		logger.Logger.Error("Migration application failed", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Migration failed: %v", err),
		})
		return
	}

	logger.Logger.Info("Migrations applied successfully")
	c.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Migrations applied successfully",
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
		return err
	}

	if err == migrate.ErrNoChange {
		logger.Logger.Info("No new migrations to apply")
	} else {
		logger.Logger.Info("All migrations applied successfully")
	}

	return nil
}

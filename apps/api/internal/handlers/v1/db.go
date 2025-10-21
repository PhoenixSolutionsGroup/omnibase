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
)

type MigrationHandler struct {
	db *gorm.DB
}

func NewMigrationHandler(cfg *config.Config) *MigrationHandler {
	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		panic(err)
	}

	return &MigrationHandler{
		db: db,
	}
}

// POST /migrations - Upload zip and apply migrations
// The endpoint expects a multipart/form-data request with a "migrations" field containing a zip file
// The zip file should contain .sql files named like: 001-seed.sql, 002-rls.sql, etc.
// These will be automatically renamed to golang-migrate format: 001_seed.up.sql, 002_rls.up.sql, etc.
func (h *MigrationHandler) HandleMigrations(c *gin.Context) {
	// Create temporary migration directory with timestamp in system temp directory
	timestamp := time.Now().UnixNano()
	migrationsDir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-migrations", timestamp))

	// Ensure cleanup happens regardless of success or failure
	defer func() {
		os.RemoveAll(migrationsDir)
	}()

	// Create the temporary directory
	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Failed to create migrations directory: %v", err),
		})
		return
	}

	// Get zip file
	fileHeader, err := c.FormFile("migrations")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  http.StatusBadRequest,
			"message": "No migrations zip file provided",
		})
		return
	}

	zipFile, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": "Failed to open zip file",
		})
		return
	}
	defer zipFile.Close()

	// Extract zip to migrations directory
	if err := h.extractZip(zipFile, migrationsDir); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Failed to extract zip: %v", err),
		})
		return
	}

	// Apply migrations
	if err := h.applyMigrations(migrationsDir); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"message": fmt.Sprintf("Migration failed: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  http.StatusOK,
		"message": "Migrations applied successfully",
	})
}

func (h *MigrationHandler) extractZip(zipFile io.Reader, migrationsDir string) error {
	// Save zip to temp file
	tempFile, err := os.CreateTemp("", "migrations-*.zip")
	if err != nil {
		return err
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, zipFile); err != nil {
		return err
	}

	// Open and extract zip
	zipReader, err := zip.OpenReader(tempFile.Name())
	if err != nil {
		return err
	}
	defer zipReader.Close()

	// Extract each .sql file
	for _, file := range zipReader.File {
		if !strings.HasSuffix(file.Name, ".sql") || file.FileInfo().IsDir() {
			continue
		}

		// Open file in zip
		rc, err := file.Open()
		if err != nil {
			return err
		}

		// Read content
		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
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
			return err
		}
	}

	return nil
}

func (h *MigrationHandler) applyMigrations(migrationsDir string) error {
	// Get the underlying *sql.DB from GORM
	sqlDB, err := h.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	driver, err := postgres.WithInstance(sqlDB, &postgres.Config{})
	if err != nil {
		fmt.Printf("Migration failed: %v\n", err)

		return err
	}

	sourceURL := fmt.Sprintf("file://%s", migrationsDir)
	m, err := migrate.NewWithDatabaseInstance(sourceURL, "postgres", driver)
	if err != nil {
		fmt.Printf("Migration failed: %v\n", err)

		return err
	}

	// Apply migrations
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		fmt.Printf("Migration failed: %v\n", err)
		return err
	}

	return nil
}

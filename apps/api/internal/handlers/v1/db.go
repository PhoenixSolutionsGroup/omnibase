package v1

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"gorm.io/gorm"

	"api/internal/config"
	"api/internal/database"
	"api/internal/logger"
)

type MigrationHandler struct {
	db  *gorm.DB
	cfg *config.Config
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
		db:  db,
		cfg: cfg,
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

// HandleMigrationsReset drops all tables and re-applies migrations from scratch
// This is intended for development use only
func (h *MigrationHandler) HandleMigrationsReset(c *gin.Context) {
	logger.Logger.Info("Starting database reset and migration process")

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

	// Drop all tables and reset migration state
	logger.Logger.Info("Dropping all tables in public schema")
	if err := h.dropAllTables(); err != nil {
		logger.Logger.Error("Failed to drop tables", "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: fmt.Sprintf("Failed to drop tables: %v", err),
		})
		return
	}

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

	logger.Logger.Info("Database reset and migrations applied successfully")
	c.JSON(http.StatusOK, MigrationSuccessResponse{
		Status:  http.StatusOK,
		Message: "Database reset and migrations applied successfully",
	})
}

// dropUserTables drops only user-created tables in the public schema and the migration tracking table
// System tables (Ory Kratos, Keto, etc.) in other schemas are preserved
func (h *MigrationHandler) dropAllTables() error {
	logger.Logger.Trace("Starting user table drop process (public schema only)")

	// Drop migration tracking table first
	logger.Logger.Debug("Dropping migration tracking table")
	if err := h.db.Exec(`DROP TABLE IF EXISTS "migrations"."schema_migrations" CASCADE`).Error; err != nil {
		logger.Logger.Error("Failed to drop migration tracking table", "error", err)
		return fmt.Errorf("failed to drop migration tracking table: %w", err)
	}

	// Drop migrations schema if it exists
	if err := h.db.Exec(`DROP SCHEMA IF EXISTS "migrations" CASCADE`).Error; err != nil {
		logger.Logger.Error("Failed to drop migrations schema", "error", err)
		return fmt.Errorf("failed to drop migrations schema: %w", err)
	}

	// Get all user tables ONLY in public schema (excludes system schemas like kratos, keto, etc.)
	var tables []string
	query := `
		SELECT tablename
		FROM pg_tables
		WHERE schemaname = 'public'
		AND tableowner = current_user
	`
	if err := h.db.Raw(query).Scan(&tables).Error; err != nil {
		logger.Logger.Error("Failed to list tables in public schema", "error", err)
		return fmt.Errorf("failed to list tables: %w", err)
	}

	logger.Logger.Info("Found user tables to drop in public schema", "count", len(tables), "tables", tables)

	// Drop each table in public schema only
	for _, table := range tables {
		dropSQL := fmt.Sprintf(`DROP TABLE IF EXISTS "public"."%s" CASCADE`, table)
		logger.Logger.Debug("Dropping table from public schema", "table", table)
		if err := h.db.Exec(dropSQL).Error; err != nil {
			logger.Logger.Error("Failed to drop table", "table", table, "error", err)
			return fmt.Errorf("failed to drop table %s: %w", table, err)
		}
	}

	// Drop any custom enum types ONLY in public schema
	var types []string
	typeQuery := `
		SELECT t.typname
		FROM pg_type t
		JOIN pg_namespace n ON t.typnamespace = n.oid
		WHERE n.nspname = 'public'
		AND t.typtype = 'e'
		AND t.typowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
	`
	if err := h.db.Raw(typeQuery).Scan(&types).Error; err != nil {
		logger.Logger.Warn("Failed to list custom types in public schema", "error", err)
	} else {
		for _, typeName := range types {
			dropTypeSQL := fmt.Sprintf(`DROP TYPE IF EXISTS "public"."%s" CASCADE`, typeName)
			logger.Logger.Debug("Dropping type from public schema", "type", typeName)
			if err := h.db.Exec(dropTypeSQL).Error; err != nil {
				logger.Logger.Warn("Failed to drop type", "type", typeName, "error", err)
			}
		}
	}

	logger.Logger.Info("Successfully dropped all user tables and types in public schema")
	return nil
}

// HandleTypegen proxies the typegen request to postgres-meta and returns generated types
func (h *MigrationHandler) HandleTypegen(c *gin.Context) {
	schemas := c.DefaultQuery("schemas", "public")
	language := c.DefaultQuery("language", "typescript")

	supportedLanguages := map[string]bool{
		"typescript": true,
		"go":         true,
		"swift":      true,
	}

	if !supportedLanguages[language] {
		logger.Logger.Warn("Unsupported language requested", "language", language)
		c.JSON(http.StatusBadRequest, MigrationErrorResponse{
			Status:  http.StatusBadRequest,
			Message: fmt.Sprintf("Unsupported language: %s. Supported: typescript, go, swift", language),
		})
		return
	}

	logger.Logger.Info("Generating types", "language", language, "schemas", schemas)

	typegenURL := fmt.Sprintf("%s/generators/%s?included_schemas=%s", h.cfg.TypegenURL, language, schemas)

	resp, err := http.Get(typegenURL)
	if err != nil {
		logger.Logger.Error("Failed to connect to typegen service", "error", err)
		c.JSON(http.StatusBadGateway, MigrationErrorResponse{
			Status:  http.StatusBadGateway,
			Message: "Failed to connect to typegen service",
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		logger.Logger.Error("Typegen service returned error", "status", resp.StatusCode, "body", string(body))
		c.JSON(resp.StatusCode, MigrationErrorResponse{
			Status:  resp.StatusCode,
			Message: fmt.Sprintf("Typegen service error: %s", string(body)),
		})
		return
	}

	types, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Logger.Error("Failed to read typegen response", "error", err)
		c.JSON(http.StatusInternalServerError, MigrationErrorResponse{
			Status:  http.StatusInternalServerError,
			Message: "Failed to read typegen response",
		})
		return
	}

	logger.Logger.Info("Successfully generated types", "language", language)
	c.Data(http.StatusOK, "text/plain; charset=utf-8", types)
}

func (h *MigrationHandler) applyMigrations(migrationsDir string) error {
	logger.Logger.Trace("Ensuring migrations schema exists")

	// Ensure migrations schema exists for tracking table
	if err := h.db.Exec(`CREATE SCHEMA IF NOT EXISTS "migrations"`).Error; err != nil {
		logger.Logger.Error("Failed to create migrations schema", "error", err)
		return fmt.Errorf("failed to create migrations schema: %w", err)
	}

	logger.Logger.Trace("Building migration DSN")

	// Build DSN with x-no-lock=true to disable advisory locks
	// Advisory locks don't work with connection poolers like PgBouncer
	// Use migrations schema to keep migration tracking out of public schema
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&x-no-lock=true&x-migrations-table=%s&x-migrations-table-quoted=true",
		url.QueryEscape(h.cfg.Database.User),
		url.QueryEscape(h.cfg.Database.Password),
		h.cfg.Database.Host,
		h.cfg.Database.Port,
		h.cfg.Database.Name,
		h.cfg.Database.SSLMode,
		url.QueryEscape(`"migrations"."schema_migrations"`))

	sourceURL := fmt.Sprintf("file://%s", migrationsDir)
	logger.Logger.Debug("Creating migration instance", "source_url", sourceURL)
	m, err := migrate.New(sourceURL, dsn)
	if err != nil {
		logger.Logger.Error("Failed to create migration instance", "source_url", sourceURL, "error", err)
		return err
	}
	defer m.Close()

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

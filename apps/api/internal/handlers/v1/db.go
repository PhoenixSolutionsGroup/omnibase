package v1

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
	"gorm.io/gorm"

	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
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

	logger.Logger.Info("Migrations applied successfully, reloading PostgREST schema cache")
	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migrations still applied)", "error", err)
	}

	c.JSON(http.StatusOK, MigrationSuccessResponse{
		Status:  http.StatusOK,
		Message: "Migrations applied successfully",
	})
}

func (h *MigrationHandler) reloadPostgREST() error {
	payload := fmt.Sprintf(`{"role":"authenticated","exp":%d}`, time.Now().Add(time.Minute).Unix())
	header := `{"alg":"HS256","typ":"JWT"}`
	seg1 := base64.RawURLEncoding.EncodeToString([]byte(header))
	seg2 := base64.RawURLEncoding.EncodeToString([]byte(payload))
	mac := hmac.New(sha256.New, []byte(h.cfg.Database.SigningKey))
	mac.Write([]byte(seg1 + "." + seg2))
	seg3 := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	token := seg1 + "." + seg2 + "." + seg3

	req, err := http.NewRequest("POST", h.cfg.PostgRESTURL+"/rpc/pgrst_reload", nil)
	if err != nil {
		return fmt.Errorf("failed to create reload request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call pgrst_reload: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("pgrst_reload returned status %d", resp.StatusCode)
	}
	return nil
}

func (h *MigrationHandler) extractZip(zipFile io.Reader, migrationsDir string) error {
	logger.Logger.Trace("Starting zip extraction")

	tempFile, err := os.CreateTemp("", "migrations-*.zip")
	if err != nil {
		logger.Logger.Error("Failed to create temporary file for zip", "error", err)
		return err
	}
	defer os.Remove(tempFile.Name())
	defer tempFile.Close()

	if _, err := io.Copy(tempFile, zipFile); err != nil {
		logger.Logger.Error("Failed to copy zip data to temp file", "error", err)
		return err
	}

	zipReader, err := zip.OpenReader(tempFile.Name())
	if err != nil {
		logger.Logger.Error("Failed to open zip reader", "error", err)
		return err
	}
	defer zipReader.Close()

	fileCount := 0
	for _, file := range zipReader.File {
		if file.FileInfo().IsDir() {
			continue
		}

		base := filepath.Base(file.Name)
		if base != "migration.sql" && base != "down.sql" {
			logger.Logger.Warn("Skipping non-migration file in zip", "name", file.Name)
			continue
		}

		rc, err := file.Open()
		if err != nil {
			logger.Logger.Error("Failed to open file in zip", "filename", file.Name, "error", err)
			return err
		}

		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			logger.Logger.Error("Failed to read file content", "filename", file.Name, "error", err)
			return err
		}

		dir := filepath.Base(filepath.Dir(file.Name))
		var newFilename string
		if base == "migration.sql" {
			newFilename = dir + ".up.sql"
		} else {
			newFilename = dir + ".down.sql"
		}

		destPath := filepath.Join(migrationsDir, newFilename)
		if err := os.WriteFile(destPath, content, 0644); err != nil {
			logger.Logger.Error("Failed to write migration file", "dest_path", destPath, "error", err)
			return err
		}
		logger.Logger.Debug("Extracted migration file", "original", file.Name, "renamed", newFilename, "size", len(content))
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

	logger.Logger.Info("Database reset and migrations applied successfully, reloading PostgREST schema cache")
	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migrations still applied)", "error", err)
	}

	c.JSON(http.StatusOK, MigrationSuccessResponse{
		Status:  http.StatusOK,
		Message: "Database reset and migrations applied successfully",
	})
}

// dropAllTables drops all user tables and infra schemas for a clean reset
func (h *MigrationHandler) dropAllTables() error {
	logger.Logger.Trace("Starting user table drop process (public schema only)")

	// Drop migration tracking table first
	logger.Logger.Debug("Dropping migration tracking table")
	if err := h.db.Exec(`DROP TABLE IF EXISTS "migrations"."schema_migrations" CASCADE`).Error; err != nil {
		logger.Logger.Error("Failed to drop migration tracking table", "error", err)
		return fmt.Errorf("failed to drop migration tracking table: %w", err)
	}

	// Drop infra schemas (recreated by migrations)
	for _, schema := range []string{"migrations", "auth", "storage", "stripe", "email", "permissions"} {
		if err := h.db.Exec(fmt.Sprintf(`DROP SCHEMA IF EXISTS "%s" CASCADE`, schema)).Error; err != nil {
			logger.Logger.Error("Failed to drop schema", "schema", schema, "error", err)
			return fmt.Errorf("failed to drop schema %s: %w", schema, err)
		}
	}

	// Drop user tables in public schema
	var tables []string
	if err := h.db.Raw(`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`).Scan(&tables).Error; err != nil {
		logger.Logger.Error("Failed to list tables in public schema", "error", err)
		return fmt.Errorf("failed to list tables: %w", err)
	}

	for _, table := range tables {
		if err := h.db.Exec(fmt.Sprintf(`DROP TABLE IF EXISTS "public"."%s" CASCADE`, table)).Error; err != nil {
			logger.Logger.Error("Failed to drop table", "table", table, "error", err)
			return fmt.Errorf("failed to drop table %s: %w", table, err)
		}
	}

	// Drop enum types in public schema
	var types []string
	if err := h.db.Raw(`SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e'`).Scan(&types).Error; err != nil {
		logger.Logger.Warn("Failed to list custom types in public schema", "error", err)
	} else {
		for _, typeName := range types {
			if err := h.db.Exec(fmt.Sprintf(`DROP TYPE IF EXISTS "public"."%s" CASCADE`, typeName)).Error; err != nil {
				logger.Logger.Warn("Failed to drop type", "type", typeName, "error", err)
			}
		}
	}

	logger.Logger.Info("Successfully dropped all user tables and infra schemas")
	return nil
}

// HandleTypegen proxies the typegen request to postgres-meta and returns generated types
// AppliedMigration represents a row in the migration tracking table
type AppliedMigration struct {
	Version int64 `json:"version"`
	Dirty   bool  `json:"dirty"`
}

// HandleMigrationsStatus returns the list of applied migrations
func (h *MigrationHandler) HandleMigrationsStatus(c *gin.Context) {
	var migrations []AppliedMigration
	if err := h.db.Raw(`SELECT version, dirty FROM "migrations"."schema_migrations" ORDER BY version DESC`).Scan(&migrations).Error; err != nil {
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	if migrations == nil {
		migrations = []AppliedMigration{}
	}

	handlers.NewSuccessResponse(c, migrations)
}


// HandleMigrationsDown rolls back N migrations
func (h *MigrationHandler) HandleMigrationsDown(c *gin.Context) {
	stepsStr := c.PostForm("steps")
	if stepsStr == "" {
		handlers.NewBadRequestResponse(c, "steps is required and must be >= 1")
		return
	}

	var steps int
	if _, err := fmt.Sscanf(stepsStr, "%d", &steps); err != nil || steps < 1 {
		handlers.NewBadRequestResponse(c, "steps must be a positive integer")
		return
	}

	timestamp := time.Now().UnixNano()
	migrationsDir := filepath.Join(os.TempDir(), fmt.Sprintf("%d-down-migrations", timestamp))
	defer os.RemoveAll(migrationsDir)

	if err := os.MkdirAll(migrationsDir, 0755); err != nil {
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	// Get zip file
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
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	defer zipFile.Close()

	if err := h.extractZip(zipFile, migrationsDir); err != nil {
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&x-no-lock=true&x-migrations-table=%s&x-migrations-table-quoted=true",
		url.QueryEscape(h.cfg.Database.User),
		url.QueryEscape(h.cfg.Database.Password),
		h.cfg.Database.Host,
		h.cfg.Database.Port,
		h.cfg.Database.Name,
		h.cfg.Database.SSLMode,
		url.QueryEscape(`"migrations"."schema_migrations"`))

	sourceURL := fmt.Sprintf("file://%s", migrationsDir)
	m, err := migrate.New(sourceURL, dsn)
	if err != nil {
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	defer m.Close()

	if err := m.Steps(-steps); err != nil {
		if err == migrate.ErrNoChange {
			handlers.NewSuccessResponse(c, map[string]any{"message": "No migration changes applied"})
			return
		}
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	if err := h.reloadPostgREST(); err != nil {
		logger.Logger.Warn("PostgREST schema reload failed (migration down still applied)", "error", err)
	}

	handlers.NewSuccessResponse(c, map[string]any{"message": fmt.Sprintf("Rolled back %d migration(s)", steps)})
}

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

	// Capture current version before attempting migrations
	// This is needed to rollback dirty state on failure
	prevVersion, _, prevErr := m.Version()
	hasPreviousVersion := prevErr == nil

	// Apply migrations
	logger.Logger.Info("Executing database migrations")
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		logger.Logger.Error("Migration execution failed", "error", err)

		version, dirty, vErr := m.Version()
		if vErr == nil && dirty {
			// Force back to the PREVIOUS version, not the failed version
			// Using the failed version would mark it as "applied" and skip it on retry
			targetVersion := -1 // NilVersion - no migrations applied
			if hasPreviousVersion {
				targetVersion = int(prevVersion)
			}

			logger.Logger.Warn("Detected dirty migration state, reverting to previous version",
				"failed_version", version,
				"reverting_to", targetVersion,
				"original_error", err)

			if forceErr := m.Force(targetVersion); forceErr != nil {
				logger.Logger.Error("Failed to revert dirty migration state",
					"failed_version", version,
					"target_version", targetVersion,
					"error", forceErr)
				return fmt.Errorf("migration failed and cleanup failed: %w (original: %v)", forceErr, err)
			}

			logger.Logger.Info("Reverted to previous migration state", "version", targetVersion)
			// Return original error so caller knows migration failed
			return fmt.Errorf("migration failed (reverted to version %d for retry): %w", targetVersion, err)
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

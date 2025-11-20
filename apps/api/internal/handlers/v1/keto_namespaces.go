package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

type KetoNamespacesHandler struct {
	config   *config.Config
	s3Client *s3.Client
}

func NewKetoNamespacesHandler(cfg *config.Config) (*KetoNamespacesHandler, error) {
	logger.Logger.Info("Initializing KetoNamespacesHandler")

	// Validate required configuration
	if cfg.S3Config.Endpoint == "" {
		logger.Logger.Error("S3_ENDPOINT is required for namespace deployment")
		panic("S3_ENDPOINT is required for namespace deployment")
	}
	if cfg.S3Config.AccessKey == "" {
		logger.Logger.Error("S3_ACCESS_KEY is required for namespace deployment")
		panic("S3_ACCESS_KEY is required for namespace deployment")
	}
	if cfg.S3Config.SecretKey == "" {
		logger.Logger.Error("S3_SECRET_KEY is required for namespace deployment")
		panic("S3_SECRET_KEY is required for namespace deployment")
	}

	// Initialize AWS S3 client
	logger.Logger.Debug("Loading AWS config", "region", cfg.S3Config.Region)
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
		logger.Logger.Error("Failed to load AWS config", "error", err)
		log.Panicf("Failed to load AWS config: %s", err)
	}

	// S3 client for internal server operations
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	logger.Logger.Info("KetoNamespacesHandler initialized successfully")
	return &KetoNamespacesHandler{
		config:   cfg,
		s3Client: s3Client,
	}, nil
}

// NamespaceDeploymentResponse represents a successful namespace deployment response
type NamespaceDeploymentResponse struct {
	// Success message
	Message string `json:"message" binding:"required" example:"Namespaces deployed successfully"`
	// Tenant ID
	TenantID string `json:"tenant_id" binding:"required" example:"tenant_test_123"`
	// S3 storage path
	Path string `json:"path" binding:"required" example:"tenant_test_123/latest.zip"`
	// Whether managed mode is enabled
	ManagedMode bool `json:"managed_mode" binding:"required" example:"true"`
	// Number of system roles synced (optional)
	RolesSynced *int `json:"roles_synced,omitempty" example:"5"`
}

// DeployNamespaces handles uploading and deploying Keto namespace configurations
// @Summary      Deploy Keto namespace configurations
// @Description  Uploads and deploys permission namespace configurations as a zip file.
// @Description
// @Description  ## Authentication
// @Description  Requires JWT token with appropriate permissions.
// @Description
// @Description  ## File Format
// @Description  Upload a zip file containing namespace definition files and optionally a roles.config.json file.
// @Description  The namespace files are stored in S3 and parsed to extract permission definitions.
// @Description
// @Description  ## Managed Mode
// @Description  If managed hosting is enabled, this endpoint will also trigger a restart of the Keto service.
// @Description
// @Description  ## Use Cases
// @Description  - CLI namespace deployment via `omnibase permissions push`
// @Description  - CI/CD pipeline integrations
// @Description  - Programmatic permission management
// @Tags         V1 Configuration
// @Accept       multipart/form-data
// @Produce      json
// @Param        namespaces formData file true "Zip file containing namespace configuration files"
// @Success      200 {object} handlers.SuccessResponse{data=NamespaceDeploymentResponse} "Namespaces deployed successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid file or missing tenant ID"
// @Failure      401 {object} handlers.UnauthorizedResponse "Invalid or missing JWT token"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to deploy namespaces"
// @Security     ServiceKeyAuth
// @Router       /api/v1/permissions/namespaces [post]
// @ID           deployPermissionNamespaces
func (h *KetoNamespacesHandler) DeployNamespaces(c *gin.Context) {
	logger.Logger.Info("DeployNamespaces handler started")
	tenantID := h.config.ManagedHostingConfig.TenantID

	if tenantID == "" {
		logger.Logger.Warn("Missing tenant ID in deploy namespaces request")
		handlers.NewBadRequestResponse(c, "Missing tenant ID")
		return
	}

	logger.Logger.Debug("Processing namespace deployment", "tenant_id", tenantID)

	// Get uploaded file with form field name "namespaces"
	file, header, err := c.Request.FormFile("namespaces")
	if err != nil {
		logger.Logger.Error("Failed to get form file 'namespaces'", "error", err)
		handlers.NewBadRequestResponse(c, fmt.Sprintf("No file uploaded or form field 'namespaces' not found: %v", err))
		return
	}
	defer file.Close()

	logger.Logger.Debug("Received namespace file", "filename", header.Filename, "size", header.Size, "content_type", header.Header.Get("Content-Type"))

	// Validate it's a zip file
	if header.Header.Get("Content-Type") != "application/zip" &&
		!strings.HasSuffix(header.Filename, ".zip") {
		logger.Logger.Warn("Invalid file type", "content_type", header.Header.Get("Content-Type"), "filename", header.Filename)
		handlers.NewBadRequestResponse(c, "File must be a zip archive")
		return
	}

	// Upload to R2/MinIO
	bucketName := "permission-namespaces"
	objectKey := fmt.Sprintf("%s/latest.zip", tenantID)

	// Ensure bucket exists
	ctx := context.Background()
	logger.Logger.Debug("Checking if bucket exists", "bucket", bucketName)
	_, err = h.s3Client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		// Bucket doesn't exist, create it
		logger.Logger.Info("Bucket does not exist, creating", "bucket", bucketName)
		_, err = h.s3Client.CreateBucket(ctx, &s3.CreateBucketInput{
			Bucket: aws.String(bucketName),
		})
		if err != nil {
			logger.Logger.Error("Failed to create bucket", "bucket", bucketName, "error", err)
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to create bucket: %w", err))
			return
		}
		logger.Logger.Info("Bucket created successfully", "bucket", bucketName)
	}

	// Upload file to S3
	logger.Logger.Info("Uploading namespace file to S3", "bucket", bucketName, "key", objectKey, "size", header.Size)
	_, err = h.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectKey),
		Body:        file,
		ContentType: aws.String("application/zip"),
	})
	if err != nil {
		logger.Logger.Error("S3 upload failed", "bucket", bucketName, "key", objectKey, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to store namespaces: %w", err))
		return
	}
	logger.Logger.Info("Successfully uploaded namespace file to S3", "bucket", bucketName, "key", objectKey)

	// Parse uploaded namespace files and store definitions
	logger.Logger.Debug("Parsing namespace files")
	parser := services_v1.NewNamespaceParserService()

	// Read file content for parsing (reset file pointer first)
	file.Seek(0, 0)
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		logger.Logger.Warn("Failed to read file for parsing", "error", err)
	} else {
		definitions, err := parser.ParseNamespaceFiles(fileBytes)
		if err != nil {
			logger.Logger.Warn("Failed to parse namespace definitions", "error", err)
		} else {
			logger.Logger.Info("Parsed namespace definitions", "count", len(definitions))
			// Store definitions in database
			if err := h.storeDefinitions(definitions); err != nil {
				logger.Logger.Warn("Failed to store definitions", "error", err)
			} else {
				logger.Logger.Info("Successfully stored namespace definitions in database")
			}
		}

		// Parse and store roles config
		rolesConfig, err := parser.ParseRolesConfig(fileBytes)
		if err != nil {
			logger.Logger.Warn("Failed to parse roles config", "error", err)
		} else if rolesConfig != nil {
			logger.Logger.Info("Parsed system roles from roles.config.json", "count", len(rolesConfig.Roles))
			rolesCount, err := h.storeRolesConfig(rolesConfig)
			if err != nil {
				logger.Logger.Warn("Failed to store roles config", "error", err)
			} else {
				logger.Logger.Info("Successfully synced system roles to database", "count", rolesCount)
				// Store count in context for response
				c.Set("roles_synced", rolesCount)
			}
		}
	}

	// If managed mode, trigger Cloud Run service restart
	isManaged := h.config.ManagedHostingConfig.IsManaged
	if isManaged {
		logger.Logger.Info("Triggering managed Keto service restart", "tenant_id", tenantID)
		err := h.triggerManagedKetoRestart(tenantID)
		if err != nil {
			logger.Logger.Error("Failed to restart Keto service", "tenant_id", tenantID, "error", err)
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to restart Keto service: %w", err))
			return
		}
		logger.Logger.Info("Keto service restart triggered successfully", "tenant_id", tenantID)
	}

	response := NamespaceDeploymentResponse{
		Message:     "Namespaces deployed successfully",
		TenantID:    tenantID,
		Path:        objectKey,
		ManagedMode: isManaged,
	}

	// Add roles_synced if present
	if rolesSynced, exists := c.Get("roles_synced"); exists {
		if count, ok := rolesSynced.(int); ok {
			response.RolesSynced = &count
		}
	}

	logger.Logger.Info("Namespaces deployed successfully", "tenant_id", tenantID, "managed_mode", isManaged)
	handlers.NewSuccessResponse(c, response)
}

// triggerManagedKetoRestart calls managed-hosting API to restart permissions service
func (h *KetoNamespacesHandler) triggerManagedKetoRestart(tenantID string) error {
	logger.Logger.Debug("Preparing managed Keto restart request", "tenant_id", tenantID)
	managedAPIURL := h.config.ManagedHostingConfig.ManagedHostingAPIURL

	// Use new generic service restart endpoint
	requestBody := map[string]string{
		"service_name": "permissions",
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		logger.Logger.Error("Failed to marshal request body", "error", err)
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	restartURL := fmt.Sprintf("%s/internal/services/restart", managedAPIURL)
	logger.Logger.Debug("Sending restart request", "url", restartURL, "tenant_id", tenantID)
	req, err := http.NewRequest("POST", restartURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		logger.Logger.Error("Failed to create restart request", "error", err)
		return err
	}

	// Service-to-service authentication
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Token", h.config.ManagedHostingConfig.InternalServiceToken)
	req.Header.Set("X-Tenant-ID", tenantID)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to execute restart request", "error", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
		body, _ := io.ReadAll(resp.Body)
		logger.Logger.Error("Managed API returned error", "status", resp.StatusCode, "response", string(body))
		return fmt.Errorf("managed API returned status %d: %s", resp.StatusCode, string(body))
	}

	logger.Logger.Debug("Restart request completed successfully", "status", resp.StatusCode)
	return nil
}

// storeDefinitions stores parsed namespace definitions in database
func (h *KetoNamespacesHandler) storeDefinitions(definitions []services_v1.ParsedNamespaceDefinition) error {
	logger.Logger.Debug("Storing namespace definitions", "count", len(definitions))
	db, err := database.GetConnection(h.config.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		return err
	}

	for _, def := range definitions {
		logger.Logger.Trace("Processing namespace definition", "namespace", def.Namespace, "relations_count", len(def.Relations))
		dbDef := models.NamespaceDefinition{
			Namespace: def.Namespace,
			Relations: pq.StringArray(def.Relations),
		}

		// Upsert
		result := db.Where("namespace = ?", def.Namespace).FirstOrCreate(&dbDef)
		if result.Error != nil {
			logger.Logger.Error("Failed to upsert namespace definition", "namespace", def.Namespace, "error", result.Error)
			return result.Error
		}

		// Update relations if record already exists
		if result.RowsAffected == 0 {
			logger.Logger.Debug("Updating existing namespace definition", "namespace", def.Namespace)
			dbDef.Relations = pq.StringArray(def.Relations)
			if err := db.Save(&dbDef).Error; err != nil {
				logger.Logger.Error("Failed to update namespace definition", "namespace", def.Namespace, "error", err)
				return err
			}
		} else {
			logger.Logger.Debug("Created new namespace definition", "namespace", def.Namespace)
		}
	}

	logger.Logger.Debug("All namespace definitions stored successfully")
	return nil
}

// storeRolesConfig stores role templates from roles.config.json
func (h *KetoNamespacesHandler) storeRolesConfig(config *services_v1.RolesConfig) (int, error) {
	logger.Logger.Debug("Storing role templates", "count", len(config.Roles))
	db, err := database.GetConnection(h.config.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		return 0, err
	}

	count := 0
	for _, roleConfig := range config.Roles {
		logger.Logger.Trace("Processing role template", "role_name", roleConfig.Role, "permissions_count", len(roleConfig.Permissions))
		template := models.RoleTemplate{
			RoleName:    roleConfig.Role,
			Permissions: pq.StringArray(roleConfig.Permissions),
			Description: "System role template",
		}

		// Upsert template
		result := db.Where("role_name = ?", roleConfig.Role).FirstOrCreate(&template)
		if result.Error != nil {
			logger.Logger.Error("Failed to upsert role template", "role_name", roleConfig.Role, "error", result.Error)
			return count, result.Error
		}

		// Update permissions if template already exists
		if result.RowsAffected == 0 {
			logger.Logger.Debug("Updating existing role template", "role_name", roleConfig.Role)
			template.Permissions = pq.StringArray(roleConfig.Permissions)
			if err := db.Save(&template).Error; err != nil {
				logger.Logger.Error("Failed to update role template", "role_name", roleConfig.Role, "error", err)
				return count, err
			}
		} else {
			logger.Logger.Debug("Created new role template", "role_name", roleConfig.Role)
		}

		count++
	}

	logger.Logger.Debug("All role templates stored successfully", "count", count)
	return count, nil
}

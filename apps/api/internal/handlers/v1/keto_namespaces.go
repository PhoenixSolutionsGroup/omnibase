package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	services_v1 "api/internal/service/v1"
	"context"
	"fmt"
	"io"
	"log"
	"strings"

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
	bucketName := h.config.S3Config.BucketName
	objectKey := "internal/permissions.zip"
	ctx := context.Background()

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

	isManaged := h.config.ManagedHostingConfig.IsManaged
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

// storeDefinitions stores parsed namespace definitions in database
func (h *KetoNamespacesHandler) storeDefinitions(definitions []services_v1.ParsedNamespaceDefinition) error {
	logger.Logger.Debug("Storing namespace definitions", "count", len(definitions))
	db, err := database.GetConnection(h.config.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection", "error", err)
		return err
	}

	for _, def := range definitions {
		logger.Logger.Trace("Processing namespace definition",
			"namespace", def.Namespace,
			"relations_count", len(def.Relations),
			"metadata_count", len(def.RelationsMetadata),
			"subject_count", len(def.SubjectRelations))

		// Convert RelationsMetadata from service type to model type
		var relationsMetadata models.RelationsMetadataData
		for _, rm := range def.RelationsMetadata {
			relationsMetadata = append(relationsMetadata, models.RelationMetadata{
				Name:        rm.Name,
				DisplayName: rm.DisplayName,
				Group:       rm.Group,
				SubGroup:    rm.SubGroup,
				Roles:       rm.Roles,
				Subjects:    rm.Subjects,
			})
		}

		dbDef := models.NamespaceDefinition{
			Namespace:         def.Namespace,
			Relations:         pq.StringArray(def.Relations),
			RelationsMetadata: relationsMetadata,
			SubjectRelations:  models.SubjectRelationsData(def.SubjectRelations),
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
			dbDef.RelationsMetadata = relationsMetadata
			dbDef.SubjectRelations = models.SubjectRelationsData(def.SubjectRelations)
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

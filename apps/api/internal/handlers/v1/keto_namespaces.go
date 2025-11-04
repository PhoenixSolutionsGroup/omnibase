package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
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
	// Validate required configuration
	if cfg.S3Config.Endpoint == "" {
		panic("S3_ENDPOINT is required for namespace deployment")
	}
	if cfg.S3Config.AccessKey == "" {
		panic("S3_ACCESS_KEY is required for namespace deployment")
	}
	if cfg.S3Config.SecretKey == "" {
		panic("S3_SECRET_KEY is required for namespace deployment")
	}

	// Initialize AWS S3 client
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
		log.Panicf("Failed to load AWS config: %s", err)
	}

	// S3 client for internal server operations
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	return &KetoNamespacesHandler{
		config:   cfg,
		s3Client: s3Client,
	}, nil
}

// DeployNamespaces handles uploading and deploying Keto namespace configurations
func (h *KetoNamespacesHandler) DeployNamespaces(c *gin.Context) {
	tenantID := h.config.ManagedHostingConfig.TenantID

	if tenantID == "" {
		handlers.NewBadRequestResponse(c, "Missing tenant ID")
		return
	}

	// Get uploaded file with form field name "namespaces"
	file, header, err := c.Request.FormFile("namespaces")
	if err != nil {
		log.Printf("Failed to get form file 'namespaces': %v", err)
		handlers.NewBadRequestResponse(c, fmt.Sprintf("No file uploaded or form field 'namespaces' not found: %v", err))
		return
	}
	defer file.Close()

	// Validate it's a zip file
	if header.Header.Get("Content-Type") != "application/zip" &&
		!strings.HasSuffix(header.Filename, ".zip") {
		handlers.NewBadRequestResponse(c, "File must be a zip archive")
		return
	}

	// Upload to R2/MinIO
	bucketName := "permission-namespaces"
	objectKey := fmt.Sprintf("%s/latest.zip", tenantID)

	// Ensure bucket exists
	ctx := context.Background()
	_, err = h.s3Client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(bucketName),
	})
	if err != nil {
		// Bucket doesn't exist, create it
		_, err = h.s3Client.CreateBucket(ctx, &s3.CreateBucketInput{
			Bucket: aws.String(bucketName),
		})
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to create bucket: %w", err))
			return
		}
	}

	// Upload file to S3
	log.Printf("Uploading namespace file to S3: bucket=%s, key=%s, size=%d", bucketName, objectKey, header.Size)
	_, err = h.s3Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(bucketName),
		Key:         aws.String(objectKey),
		Body:        file,
		ContentType: aws.String("application/zip"),
	})
	if err != nil {
		log.Printf("S3 upload failed: %v", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to store namespaces: %w", err))
		return
	}
	log.Printf("Successfully uploaded namespace file to S3")

	// Parse uploaded namespace files and store definitions
	parser := services_v1.NewNamespaceParserService()

	// Read file content for parsing (reset file pointer first)
	file.Seek(0, 0)
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Warning: Failed to read file for parsing: %v", err)
	} else {
		definitions, err := parser.ParseNamespaceFiles(fileBytes)
		if err != nil {
			log.Printf("Warning: Failed to parse namespace definitions: %v", err)
		} else {
			log.Printf("Parsed %d namespace definition(s)", len(definitions))
			// Store definitions in database
			if err := h.storeDefinitions(definitions); err != nil {
				log.Printf("Warning: Failed to store definitions: %v", err)
			} else {
				log.Printf("Successfully stored namespace definitions in database")
			}
		}

		// Parse and store roles config
		rolesConfig, err := parser.ParseRolesConfig(fileBytes)
		if err != nil {
			log.Printf("Warning: Failed to parse roles config: %v", err)
		} else if rolesConfig != nil {
			log.Printf("Parsed %d system role(s) from roles.config.json", len(rolesConfig.Roles))
			rolesCount, err := h.storeRolesConfig(rolesConfig)
			if err != nil {
				log.Printf("Warning: Failed to store roles config: %v", err)
			} else {
				log.Printf("Successfully synced %d system role(s) to database", rolesCount)
				// Store count in context for response
				c.Set("roles_synced", rolesCount)
			}
		}
	}

	// If managed mode, trigger Cloud Run service restart
	isManaged := h.config.ManagedHostingConfig.IsManaged
	if isManaged {
		err := h.triggerManagedKetoRestart(tenantID)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to restart Keto service: %w", err))
			return
		}
	}

	response := gin.H{
		"message":      "Namespaces deployed successfully",
		"tenant_id":    tenantID,
		"path":         objectKey,
		"managed_mode": isManaged,
	}

	// Add roles_synced if present
	if rolesSynced, exists := c.Get("roles_synced"); exists {
		response["roles_synced"] = rolesSynced
	}

	handlers.NewSuccessResponse(c, response)
}

// triggerManagedKetoRestart calls managed-hosting API to restart permissions service
func (h *KetoNamespacesHandler) triggerManagedKetoRestart(tenantID string) error {
	managedAPIURL := h.config.ManagedHostingConfig.ManagedHostingAPIURL

	// Use new generic service restart endpoint
	requestBody := map[string]string{
		"service_name": "permissions",
	}

	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/internal/services/restart", managedAPIURL), bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}

	// Service-to-service authentication
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Internal-Token", h.config.ManagedHostingConfig.InternalServiceToken)
	req.Header.Set("X-Tenant-ID", tenantID)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("managed API returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

// storeDefinitions stores parsed namespace definitions in database
func (h *KetoNamespacesHandler) storeDefinitions(definitions []services_v1.ParsedNamespaceDefinition) error {
	db, err := database.GetConnection(h.config.Database)
	if err != nil {
		return err
	}

	for _, def := range definitions {
		dbDef := models.NamespaceDefinition{
			Namespace: def.Namespace,
			Relations: pq.StringArray(def.Relations),
		}

		// Upsert
		result := db.Where("namespace = ?", def.Namespace).FirstOrCreate(&dbDef)
		if result.Error != nil {
			return result.Error
		}

		// Update relations if record already exists
		if result.RowsAffected == 0 {
			dbDef.Relations = pq.StringArray(def.Relations)
			if err := db.Save(&dbDef).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// storeRolesConfig stores system roles from roles.config.json
func (h *KetoNamespacesHandler) storeRolesConfig(config *services_v1.RolesConfig) (int, error) {
	db, err := database.GetConnection(h.config.Database)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, roleConfig := range config.Roles {
		role := models.Role{
			TenantID:    nil, // System roles have NULL tenant_id
			RoleName:    roleConfig.Role,
			Permissions: pq.StringArray(roleConfig.Permissions),
			UserIDs:     pq.StringArray{},
		}

		// Upsert system role
		result := db.Where("tenant_id IS NULL AND role_name = ?", roleConfig.Role).FirstOrCreate(&role)
		if result.Error != nil {
			return count, result.Error
		}

		// Update permissions if role already exists
		if result.RowsAffected == 0 {
			role.Permissions = pq.StringArray(roleConfig.Permissions)
			if err := db.Save(&role).Error; err != nil {
				return count, err
			}
		}

		count++
	}

	return count, nil
}

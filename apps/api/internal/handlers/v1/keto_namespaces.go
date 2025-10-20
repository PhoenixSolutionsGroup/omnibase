package v1

import (
	"api/internal/config"
	"api/internal/handlers"
	"context"
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

	// If managed mode, trigger Cloud Run service restart
	isManaged := h.config.ManagedHostingConfig.IsManaged
	if isManaged {
		err := h.triggerManagedKetoRestart(tenantID)
		if err != nil {
			handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to restart Keto service: %w", err))
			return
		}
	}

	handlers.NewSuccessResponse(c, gin.H{
		"message":      "Namespaces deployed successfully",
		"tenant_id":    tenantID,
		"path":         objectKey,
		"managed_mode": isManaged,
	})
}

// triggerManagedKetoRestart calls managed-hosting API to restart Keto service
func (h *KetoNamespacesHandler) triggerManagedKetoRestart(tenantID string) error {
	managedAPIURL := h.config.ManagedHostingConfig.ManagedHostingAPIURL

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/internal/permissions/restart", managedAPIURL), nil)
	if err != nil {
		return err
	}

	// Service-to-service authentication
	req.Header.Set("X-Internal-Token", h.config.ManagedHostingConfig.InternalServiceToken)
	req.Header.Set("X-Tenant-ID", tenantID)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("managed API returned status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
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
	"gorm.io/gorm"
)

type StorageHandler struct {
	s3Client       *s3.Client
	s3PublicClient *s3.Client // Client configured with public endpoint for presigned URLs
	db             *gorm.DB
	postgrestURL   string
	bucketName     string // Single bucket name for this project/tenant
}

func NewStorageHandler(cfg *config.Config) *StorageHandler {
	logger.Logger.Info("Initializing StorageHandler", "bucket_name", cfg.S3Config.BucketName, "region", cfg.S3Config.Region)
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
		logger.Logger.Error("Failed to load AWS config", "error", err)
		log.Panicf("Failed to load AWS config: %s", err)
	}

	// S3 client for internal server operations (uses internal endpoint)
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.Endpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.Endpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	// S3 client for presigned URLs (uses public endpoint accessible from browser)
	s3PublicClient := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if cfg.S3Config.PublicEndpoint != "" {
			o.BaseEndpoint = aws.String(cfg.S3Config.PublicEndpoint)
		}
		o.UsePathStyle = cfg.S3Config.ForcePathStyle
	})

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to connect to database", "error", err)
		log.Panicf("Failed to connect to database: %s", err)
	}

	logger.Logger.Info("StorageHandler initialized successfully", "postgrest_url", cfg.PostgRESTURL)
	return &StorageHandler{
		s3Client:       s3Client,
		s3PublicClient: s3PublicClient,
		db:             db,
		postgrestURL:   cfg.PostgRESTURL,
		bucketName:     cfg.S3Config.BucketName,
	}
}

// Helper: Extract JWT from cookie header
func extractJWTFromCookie(cookieHeader string) string {
	cookies := strings.Split(cookieHeader, "; ")
	for _, cookie := range cookies {
		parts := strings.SplitN(cookie, "=", 2)
		if len(parts) == 2 && parts[0] == "omnibase_postgrest_jwt" {
			return parts[1]
		}
	}
	return ""
}

// Upload generates a presigned URL for uploading files to storage
// @Summary      Upload file to storage
// @Description  Generates a presigned S3 upload URL with Row-Level Security (RLS) enforcement.
// @Description
// @Description  ## RLS Policy
// @Description  Upload permission is checked via PostgREST against the `storage.objects` table.
// @Description  Users must have INSERT permission based on their custom RLS policies.
// @Description
// @Description  ## Upload Process
// @Description  1. Request presigned URL from this endpoint
// @Description  2. Upload file directly to S3 using returned URL (PUT request)
// @Description  3. File metadata is automatically stored in database
// @Description
// @Description  ## URL Expiration
// @Description  Presigned URLs are valid for 15 minutes after generation.
// @Tags         V1 Storage
// @Accept       json
// @Produce      json
// @Param        request body models.UploadRequest true "Upload configuration with path and optional metadata"
// @Success      200 {object} object{status=int,data=models.UploadResponse} "Upload URL generated successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body or missing required fields"
// @Failure      401 {object} handlers.UnauthorizedResponse "Missing authentication session"
// @Failure      403 {object} handlers.ForbiddenResponse "RLS policy denied upload access for this path"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to generate presigned URL or store metadata"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/storage/upload [post]
func (h *StorageHandler) Upload(c *gin.Context) {
	logger.Logger.Info("Upload handler started")
	var req models.UploadRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")
	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		logger.Logger.Warn("Missing JWT token")
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	logger.Logger.Debug("Processing upload request", "user_id", userID, "tenant_id", tenantID, "path", req.Path)

	// User controls the full path - they define their own directory structure
	fullPath := req.Path

	// Always check RLS permission via PostgREST
	// Users define their own policies based on path patterns (e.g., split_part(path, '/', 1) = 'public')
	logger.Logger.Debug("Checking RLS permission for upload", "bucket", h.bucketName, "path", fullPath)
	canUpload, err := h.checkRLSPermission(jwt, h.bucketName, fullPath, "INSERT")
	if err != nil || !canUpload {
		logger.Logger.Warn("Access denied for upload", "user_id", userID, "path", fullPath, "error", err)
		handlers.NewUnauthorizedResponse(c, "Access denied")
		return
	}

	logger.Logger.Debug("RLS permission check passed")

	// Generate pre-signed upload URL (use public client for browser access)
	logger.Logger.Debug("Generating presigned upload URL", "bucket", h.bucketName, "key", fullPath)
	presignClient := s3.NewPresignClient(h.s3PublicClient)
	presignedReq, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(fullPath),
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		logger.Logger.Error("Failed to generate presigned URL", "bucket", h.bucketName, "key", fullPath, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to generate presigned URL: %w", err))
		return
	}

	// Insert metadata via PostgREST
	metadataRecord := map[string]interface{}{
		"bucket_name": h.bucketName,
		"path":        fullPath,
		"tenant_id":   tenantID,
		"user_id":     userID,
		"metadata":    req.Metadata,
	}

	logger.Logger.Debug("Inserting file metadata")
	if err := h.insertFileMetadata(jwt, metadataRecord); err != nil {
		logger.Logger.Error("Failed to insert metadata", "path", fullPath, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to insert metadata: %w", err))
		return
	}

	logger.Logger.Info("Upload URL generated successfully", "user_id", userID, "path", fullPath)
	handlers.NewSuccessResponse(c, gin.H{
		"upload_url": presignedReq.URL,
		"path":       fullPath,
	})
}

// Download generates a presigned URL for downloading files from storage
// @Summary      Download file from storage
// @Description  Generates a presigned S3 download URL with Row-Level Security (RLS) enforcement.
// @Description
// @Description  ## RLS Policy
// @Description  Download permission is checked via PostgREST against the `storage.objects` table.
// @Description  Users must have SELECT permission based on their custom RLS policies.
// @Description
// @Description  ## Download Process
// @Description  1. Request presigned URL from this endpoint
// @Description  2. Download file directly from S3 using returned URL (GET request)
// @Description
// @Description  ## URL Expiration
// @Description  Presigned URLs are valid for 15 minutes after generation.
// @Tags         V1 Storage
// @Accept       json
// @Produce      json
// @Param        request body models.DownloadRequest true "Path of file to download"
// @Success      200 {object} object{status=int,data=models.DownloadResponse} "Download URL generated successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body or missing path"
// @Failure      401 {object} handlers.UnauthorizedResponse "Missing authentication session"
// @Failure      403 {object} handlers.ForbiddenResponse "RLS policy denied download access for this path"
// @Failure      404 {object} handlers.NotFoundErrorResponse "File not found in storage"
// @Failure      500 {object} handlers.InternalServerErrorResponse "Failed to generate presigned URL"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/storage/download [post]
func (h *StorageHandler) Download(c *gin.Context) {
	logger.Logger.Info("Download handler started")
	var req models.DownloadRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Processing download request", "path", req.Path)

	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		logger.Logger.Warn("Missing JWT token")
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	// Check RLS via PostgREST SELECT
	logger.Logger.Debug("Checking RLS permission for download", "bucket", h.bucketName, "path", req.Path)
	canAccess, err := h.checkRLSPermission(jwt, h.bucketName, req.Path, "SELECT")
	if err != nil || !canAccess {
		logger.Logger.Warn("Access denied for download", "path", req.Path, "error", err)
		handlers.NewUnauthorizedResponse(c, "Access denied")
		return
	}

	// Generate pre-signed download URL (use public client for browser access)
	logger.Logger.Debug("Generating presigned download URL", "bucket", h.bucketName, "key", req.Path)
	presignClient := s3.NewPresignClient(h.s3PublicClient)
	presignedReq, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		logger.Logger.Error("Failed to generate presigned URL", "bucket", h.bucketName, "key", req.Path, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to generate presigned URL: %w", err))
		return
	}

	logger.Logger.Info("Download URL generated successfully", "path", req.Path)
	handlers.NewSuccessResponse(c, gin.H{
		"download_url": presignedReq.URL,
	})
}

// DeleteObject deletes a file from storage
// @Summary      Delete file from storage
// @Description  Deletes a file from S3 storage with Row-Level Security (RLS) enforcement.
// @Description
// @Description  ## RLS Policy
// @Description  Delete permission is checked via PostgREST against the `storage.objects` table.
// @Description  Users must have DELETE permission based on their custom RLS policies.
// @Description
// @Description  ## Deletion Process
// @Description  1. Metadata is deleted from database (with RLS check)
// @Description  2. File is deleted from S3 storage
// @Description  3. If S3 deletion fails, metadata is already removed (eventual consistency)
// @Tags         V1 Storage
// @Accept       json
// @Produce      json
// @Param        request body models.DeleteObjectRequest true "Path of file to delete"
// @Success      200 {object} object{status=int,data=models.MessageResponse} "File deleted successfully"
// @Failure      400 {object} handlers.BadRequestResponse "Invalid request body or missing path"
// @Failure      401 {object} handlers.UnauthorizedResponse "Missing authentication session"
// @Failure      403 {object} handlers.ForbiddenResponse "RLS policy denied delete access for this path"
// @Failure      404 {object} handlers.NotFoundErrorResponse "File not found or already deleted"
// @Security     CookieAuth,SessionTokenAuth
// @Router       /api/v1/storage/object [delete]
func (h *StorageHandler) DeleteObject(c *gin.Context) {
	logger.Logger.Info("DeleteObject handler started")
	var req models.DeleteObjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Processing delete request", "path", req.Path)

	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		logger.Logger.Warn("Missing JWT token")
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	// Delete metadata via PostgREST (RLS enforced)
	logger.Logger.Debug("Deleting file metadata", "bucket", h.bucketName, "path", req.Path)
	if err := h.deleteFileMetadata(jwt, h.bucketName, req.Path); err != nil {
		logger.Logger.Warn("Failed to delete file metadata", "path", req.Path, "error", err)
		handlers.NewUnauthorizedResponse(c, "Access denied or not found")
		return
	}

	// Delete from S3 (only after metadata deletion succeeds)
	logger.Logger.Debug("Deleting file from S3", "bucket", h.bucketName, "key", req.Path)
	_, err := h.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	})
	if err != nil {
		// Log error but don't fail - metadata already deleted
		logger.Logger.Warn("S3 deletion failed", "bucket", h.bucketName, "key", req.Path, "error", err)
	}

	logger.Logger.Info("File deleted successfully", "path", req.Path)
	handlers.NewSuccessResponse(c, gin.H{
		"message": "file deleted",
	})
}

// Helper: Check RLS permission via PostgREST
func (h *StorageHandler) checkRLSPermission(jwt, bucket, path, operation string) (bool, error) {
	url := fmt.Sprintf("%s/objects?bucket_name=eq.%s&path=eq.%s",
		h.postgrestURL, bucket, path)

	logger.Logger.Trace("Checking RLS permission via PostgREST", "url", url, "operation", operation)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		logger.Logger.Error("Failed to create RLS check request", "error", err)
		return false, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Accept-Profile", "storage")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to execute RLS check request", "error", err)
		return false, err
	}
	defer resp.Body.Close()

	allowed := resp.StatusCode == 200
	logger.Logger.Trace("RLS permission check result", "allowed", allowed, "status", resp.StatusCode)
	return allowed, nil
}

// Helper: Insert metadata via PostgREST
func (h *StorageHandler) insertFileMetadata(jwt string, data map[string]interface{}) error {
	url := fmt.Sprintf("%s/objects", h.postgrestURL)

	logger.Logger.Trace("Inserting file metadata via PostgREST", "url", url)
	body, _ := json.Marshal(data)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		logger.Logger.Error("Failed to create metadata insert request", "error", err)
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Content-Profile", "storage")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to execute metadata insert request", "error", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		logger.Logger.Error("PostgREST insert failed", "status", resp.StatusCode, "response", string(bodyBytes))
		return fmt.Errorf("postgrest insert failed: %s", string(bodyBytes))
	}

	logger.Logger.Trace("File metadata inserted successfully")
	return nil
}

// Helper: Delete metadata via PostgREST (RLS enforced)
func (h *StorageHandler) deleteFileMetadata(jwt, bucket, path string) error {
	url := fmt.Sprintf("%s/objects?bucket_name=eq.%s&path=eq.%s",
		h.postgrestURL, bucket, path)

	logger.Logger.Trace("Deleting file metadata via PostgREST", "url", url)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		logger.Logger.Error("Failed to create metadata delete request", "error", err)
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Content-Profile", "storage")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to execute metadata delete request", "error", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 204 {
		logger.Logger.Error("PostgREST delete failed", "status", resp.StatusCode)
		return fmt.Errorf("delete failed: status %d", resp.StatusCode)
	}

	logger.Logger.Trace("File metadata deleted successfully")
	return nil
}

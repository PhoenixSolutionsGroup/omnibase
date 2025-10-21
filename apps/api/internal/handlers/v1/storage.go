package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
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
	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(cfg.S3Config.Region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.S3Config.AccessKey, cfg.S3Config.SecretKey, "")),
	)
	if err != nil {
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
		log.Panicf("Failed to connect to database: %s", err)
	}

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

// POST /api/v1/storage/upload
func (h *StorageHandler) Upload(c *gin.Context) {
	var req struct {
		Path     string                 `json:"path" binding:"required"` // User-controlled path (e.g., "public/images/avatar.png")
		Metadata map[string]interface{} `json:"metadata"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")
	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	// User controls the full path - they define their own directory structure
	fullPath := req.Path

	// Always check RLS permission via PostgREST
	// Users define their own policies based on path patterns (e.g., split_part(path, '/', 1) = 'public')
	canUpload, err := h.checkRLSPermission(jwt, h.bucketName, fullPath, "INSERT")
	if err != nil || !canUpload {
		handlers.NewUnauthorizedResponse(c, "Access denied")
		return
	}

	// Generate pre-signed upload URL (use public client for browser access)
	presignClient := s3.NewPresignClient(h.s3PublicClient)
	presignedReq, err := presignClient.PresignPutObject(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(fullPath),
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
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

	if err := h.insertFileMetadata(jwt, metadataRecord); err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to insert metadata: %w", err))
		return
	}

	handlers.NewSuccessResponse(c, gin.H{
		"upload_url": presignedReq.URL,
		"path":       fullPath,
	})
}

// POST /api/v1/storage/download
func (h *StorageHandler) Download(c *gin.Context) {
	var req struct {
		Path string `json:"path" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	// Check RLS via PostgREST SELECT
	canAccess, err := h.checkRLSPermission(jwt, h.bucketName, req.Path, "SELECT")
	if err != nil || !canAccess {
		handlers.NewUnauthorizedResponse(c, "Access denied")
		return
	}

	// Generate pre-signed download URL (use public client for browser access)
	presignClient := s3.NewPresignClient(h.s3PublicClient)
	presignedReq, err := presignClient.PresignGetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to generate presigned URL: %w", err))
		return
	}

	handlers.NewSuccessResponse(c, gin.H{
		"download_url": presignedReq.URL,
	})
}

// DELETE /api/v1/storage/object
func (h *StorageHandler) DeleteObject(c *gin.Context) {
	var req struct {
		Path string `json:"path" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	cookieHeader := c.GetHeader("Cookie")
	jwt := extractJWTFromCookie(cookieHeader)

	if jwt == "" {
		handlers.NewUnauthorizedResponse(c, "Missing JWT token")
		return
	}

	// Delete metadata via PostgREST (RLS enforced)
	if err := h.deleteFileMetadata(jwt, h.bucketName, req.Path); err != nil {
		handlers.NewUnauthorizedResponse(c, "Access denied or not found")
		return
	}

	// Delete from S3 (only after metadata deletion succeeds)
	_, err := h.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	})
	if err != nil {
		// Log error but don't fail - metadata already deleted
		log.Printf("S3 deletion failed: %v", err)
	}

	handlers.NewSuccessResponse(c, gin.H{
		"message": "file deleted",
	})
}

// Helper: Check RLS permission via PostgREST
func (h *StorageHandler) checkRLSPermission(jwt, bucket, path, operation string) (bool, error) {
	url := fmt.Sprintf("%s/objects?bucket_name=eq.%s&path=eq.%s",
		h.postgrestURL, bucket, path)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Accept-Profile", "storage")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	return resp.StatusCode == 200, nil
}

// Helper: Insert metadata via PostgREST
func (h *StorageHandler) insertFileMetadata(jwt string, data map[string]interface{}) error {
	url := fmt.Sprintf("%s/objects", h.postgrestURL)

	body, _ := json.Marshal(data)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Content-Profile", "storage")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 201 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("postgrest insert failed: %s", string(bodyBytes))
	}

	return nil
}

// Helper: Delete metadata via PostgREST (RLS enforced)
func (h *StorageHandler) deleteFileMetadata(jwt, bucket, path string) error {
	url := fmt.Sprintf("%s/objects?bucket_name=eq.%s&path=eq.%s",
		h.postgrestURL, bucket, path)

	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", jwt))
	req.Header.Set("Content-Profile", "storage")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 204 {
		return fmt.Errorf("delete failed: status %d", resp.StatusCode)
	}

	return nil
}

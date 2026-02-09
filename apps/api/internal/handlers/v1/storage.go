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
	"log"
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
	keto           *services_v1.KetoService
	bucketName     string // Single bucket name for this project/tenant
}

func NewStorageHandler(cfg *config.Config, keto *services_v1.KetoService) *StorageHandler {
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

	logger.Logger.Info("StorageHandler initialized successfully")
	return &StorageHandler{
		s3Client:       s3Client,
		s3PublicClient: s3PublicClient,
		db:             db,
		keto:           keto,
		bucketName:     cfg.S3Config.BucketName,
	}
}

// /api/v1/storage/upload [post]
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

	logger.Logger.Debug("Processing upload request", "user_id", userID, "tenant_id", tenantID, "path", req.Path)

	// User controls the full path - they define their own directory structure
	fullPath := req.Path

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

	obj := models.StorageObject{
		BucketName: h.bucketName,
		Path:       fullPath,
		TenantID:   &tenantID,
		UserID:     userID,
		Metadata:   models.StorageMetadata(req.Metadata),
	}

	logger.Logger.Debug("Inserting file metadata")
	if err := h.db.Create(&obj).Error; err != nil {
		logger.Logger.Error("Failed to insert metadata", "path", fullPath, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to insert metadata: %w", err))
		return
	}

	objectID := obj.ID.String()

	// Create Keto tuples: owner + tenant
	ctx := c.Request.Context()
	userSubject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}

	if err := h.keto.CreateRelationTuple(ctx, "StorageObject", objectID, "owner", userSubject); err != nil {
		logger.Logger.Error("Failed to create owner tuple, rolling back metadata", "object_id", objectID, "error", err)
		// Roll back the GORM insert
		h.db.Delete(&models.StorageObject{}, "id = ?", obj.ID)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to create owner permission: %w", err))
		return
	}

	tenantSubject := services_v1.SubjectSet{Namespace: "Tenant", Object: tenantID, Relation: ""}
	if err := h.keto.CreateRelationTuple(ctx, "StorageObject", objectID, "tenant", tenantSubject); err != nil {
		logger.Logger.Warn("Failed to create tenant tuple (non-fatal)", "object_id", objectID, "error", err)
		// Tenant tuple is optional — don't roll back for this
	}

	logger.Logger.Info("Upload URL generated successfully", "user_id", userID, "path", fullPath, "object_id", objectID)
	handlers.NewSuccessResponse(c, gin.H{
		"upload_url": presignedReq.URL,
		"path":       fullPath,
		"id":         objectID,
	})
}

// /api/v1/storage/download [post]
func (h *StorageHandler) Download(c *gin.Context) {
	logger.Logger.Info("Download handler started")
	var req models.DownloadRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Processing download request", "path", req.Path)

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")

	// Look up file — first in current tenant, then fall back to public files globally
	obj, err := h.getFileByPath(h.bucketName, req.Path, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to look up file", "path", req.Path, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	if obj == nil {
		// Not found in current tenant — check if a public file exists with this path
		obj, err = h.getPublicFileByPath(h.bucketName, req.Path)
		if err != nil {
			logger.Logger.Error("Failed to look up public file", "path", req.Path, "error", err)
			handlers.NewInternalServerErrorResponse(c, err)
			return
		}
	}
	if obj == nil {
		logger.Logger.Info("File not found", "path", req.Path)
		handlers.NewNotFoundResponse(c, "File not found")
		return
	}

	// Public files skip Keto — any authenticated user can download
	if !obj.IsPublic {
		ctx := c.Request.Context()
		subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
		allowed, err := h.keto.CheckPermission(ctx, "StorageObject", obj.ID.String(), "read", subject)
		if err != nil {
			logger.Logger.Error("Failed to check read permission", "object_id", obj.ID, "error", err)
			handlers.NewInternalServerErrorResponse(c, err)
			return
		}
		if !allowed {
			logger.Logger.Warn("Access denied for download", "user_id", userID, "path", req.Path)
			handlers.NewForbiddenResponse(c, "Access denied")
			return
		}
	} else {
		logger.Logger.Debug("Skipping Keto check for public file", "path", req.Path, "object_id", obj.ID)
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

// /api/v1/storage/object [delete]
func (h *StorageHandler) DeleteObject(c *gin.Context) {
	logger.Logger.Info("DeleteObject handler started")
	var req models.DeleteObjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Processing delete request", "path", req.Path)

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")

	// Look up file via GORM (bypasses RLS - we check Keto separately)
	obj, err := h.getFileByPath(h.bucketName, req.Path, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to look up file", "path", req.Path, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	if obj == nil {
		handlers.NewNotFoundResponse(c, "File not found")
		return
	}

	// Check Keto permission (evaluates full OPL permit logic: owner OR can_delete)
	ctx := c.Request.Context()
	subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
	allowed, err := h.keto.CheckPermission(ctx, "StorageObject", obj.ID.String(), "delete", subject)
	if err != nil {
		logger.Logger.Error("Failed to check delete permission", "object_id", obj.ID, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	if !allowed {
		logger.Logger.Warn("Delete denied by Keto", "user_id", userID, "path", req.Path)
		handlers.NewForbiddenResponse(c, "You do not have permission to delete this file")
		return
	}

	// Delete metadata via GORM
	objectID := obj.ID.String()
	logger.Logger.Debug("Deleting file metadata", "object_id", objectID)
	if err := h.db.Delete(&models.StorageObject{}, "id = ?", obj.ID).Error; err != nil {
		logger.Logger.Error("Failed to delete file metadata", "object_id", objectID, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	// Delete from S3 (only after metadata deletion succeeds)
	logger.Logger.Debug("Deleting file from S3", "bucket", h.bucketName, "key", req.Path)
	_, err = h.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(req.Path),
	})
	if err != nil {
		// Log error but don't fail - metadata already deleted
		logger.Logger.Warn("S3 deletion failed", "bucket", h.bucketName, "key", req.Path, "error", err)
	}

	// Cleanup Keto tuples (best-effort)
	h.cleanupObjectTuples(ctx, objectID)

	logger.Logger.Info("File deleted successfully", "path", req.Path)
	handlers.NewSuccessResponse(c, gin.H{
		"message": "file deleted",
	})
}

// /api/v1/storage/make-public [post]
func (h *StorageHandler) MakePublic(c *gin.Context) {
	logger.Logger.Info("MakePublic handler started")
	var req models.MakePublicRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid request payload", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Processing make-public request", "path", req.Path)

	userID := c.GetString("user_id")
	tenantID := c.GetString("tenant_id")

	obj, err := h.getFileByPath(h.bucketName, req.Path, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to look up file", "path", req.Path, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	if obj == nil {
		handlers.NewNotFoundResponse(c, "File not found")
		return
	}

	if obj.IsPublic {
		logger.Logger.Info("File is already public", "path", req.Path)
		handlers.NewSuccessResponse(c, gin.H{
			"message": "file is already public",
			"path":    req.Path,
		})
		return
	}

	// Check Keto permission (evaluates full OPL permit logic: owner OR can_make_public)
	ctx := c.Request.Context()
	subject := services_v1.SubjectSet{Namespace: "User", Object: userID, Relation: ""}
	allowed, err := h.keto.CheckPermission(ctx, "StorageObject", obj.ID.String(), "make_public", subject)
	if err != nil {
		logger.Logger.Error("Failed to check make_public permission", "object_id", obj.ID, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}
	if !allowed {
		logger.Logger.Warn("Make public denied by Keto", "user_id", userID, "path", req.Path)
		handlers.NewForbiddenResponse(c, "You do not have permission to make this file public")
		return
	}

	if err := h.db.Model(&models.StorageObject{}).Where("id = ?", obj.ID).Update("is_public", true).Error; err != nil {
		logger.Logger.Error("Failed to update is_public", "object_id", obj.ID, "error", err)
		handlers.NewInternalServerErrorResponse(c, fmt.Errorf("failed to make file public: %w", err))
		return
	}

	logger.Logger.Info("File made public successfully", "path", req.Path, "object_id", obj.ID.String())
	handlers.NewSuccessResponse(c, gin.H{
		"message": "file is now public",
		"path":    req.Path,
	})
}

// Helper: Get file by path via GORM (bypasses RLS for Keto-based checks)
func (h *StorageHandler) getFileByPath(bucket, path, tenantID string) (*models.StorageObject, error) {
	var obj models.StorageObject
	result := h.db.Where("bucket_name = ? AND path = ? AND tenant_id = ?", bucket, path, tenantID).First(&obj)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &obj, nil
}

// Helper: Get public file by path (no tenant filter — public files are globally accessible)
func (h *StorageHandler) getPublicFileByPath(bucket, path string) (*models.StorageObject, error) {
	var obj models.StorageObject
	result := h.db.Where("bucket_name = ? AND path = ? AND is_public = ?", bucket, path, true).First(&obj)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &obj, nil
}

// Helper: Cleanup all Keto tuples for a storage object (best-effort)
func (h *StorageHandler) cleanupObjectTuples(ctx context.Context, objectID string) {
	tuples, err := h.keto.ListRelationTuples(ctx, "StorageObject", objectID, "", nil)
	if err != nil {
		logger.Logger.Warn("Failed to list object tuples for cleanup", "object_id", objectID, "error", err)
		return
	}

	for _, tuple := range tuples {
		subject := services_v1.SubjectSet{}
		if tuple.SubjectSet != nil {
			subject = *tuple.SubjectSet
		}
		if err := h.keto.DeleteRelationTuple(ctx, tuple.Namespace, tuple.Object, tuple.Relation, subject); err != nil {
			logger.Logger.Warn("Failed to delete tuple during cleanup", "object_id", objectID, "relation", tuple.Relation, "error", err)
		}
	}

	logger.Logger.Debug("Cleaned up Keto tuples for deleted object", "object_id", objectID, "count", len(tuples))
}

package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// UploadRequest represents file upload configuration
type UploadRequest struct {
	// Path where file will be stored (e.g., "public/images/avatar.png")
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`

	// Optional metadata to attach to the file
	Metadata map[string]interface{} `json:"metadata,omitempty" example:"{\"category\":\"avatar\",\"size\":\"medium\"}"`
}

// UploadResponse contains the presigned upload URL
type UploadResponse struct {
	// Presigned URL for uploading the file (valid for 15 minutes)
	UploadURL string `json:"upload_url" example:"https://storage.test.example.com/bucket/path?signature=..."`

	// Confirmed storage path
	Path string `json:"path" example:"test/avatars/user-123.png"`
}

// DownloadRequest represents file download configuration
type DownloadRequest struct {
	// Path of the file to download
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

// DownloadResponse contains the presigned download URL
type DownloadResponse struct {
	// Presigned URL for downloading the file (valid for 15 minutes)
	DownloadURL string `json:"download_url" example:"https://storage.test.example.com/bucket/path?signature=..."`
}

// DeleteObjectRequest represents file deletion request
type DeleteObjectRequest struct {
	// Path of the file to delete
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

// MakePublicRequest represents a request to make a file publicly accessible
type MakePublicRequest struct {
	// Path of the file to make public
	Path string `json:"path" binding:"required" example:"test/avatars/user-123.png"`
}

// MessageResponse represents a simple message response
type MessageResponse struct {
	// Status message
	Message string `json:"message" example:"file deleted"`
}

type StorageMetadata map[string]interface{}

func (m StorageMetadata) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	return json.Marshal(m)
}

func (m *StorageMetadata) Scan(value interface{}) error {
	if value == nil {
		*m = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, m)
}

type StorageObject struct {
	ID         uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()" binding:"required"`
	BucketName string          `json:"bucket_name" gorm:"not null" binding:"required"` // Now stores project/tenant bucket name from config
	Path       string          `json:"path" gorm:"not null" binding:"required"`        // User-controlled full path (e.g., "public/images/avatar.png")
	TenantID   *string         `json:"tenant_id,omitempty"`
	UserID     string          `json:"user_id" gorm:"not null" binding:"required"`
	Metadata   StorageMetadata `json:"metadata,omitempty" gorm:"type:jsonb;default:'{}'"`
	IsPublic   bool            `json:"is_public" gorm:"not null;default:false"`
	CreatedAt  time.Time       `json:"created_at" binding:"required"`
	UpdatedAt  time.Time       `json:"updated_at" binding:"required"`
}

func (StorageObject) TableName() string {
	return "storage.objects"
}

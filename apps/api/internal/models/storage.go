package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

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

type Bucket struct {
	Name             string    `json:"name" gorm:"primary_key"`
	IsPublic         bool      `json:"is_public" gorm:"default:false"`
	MaxFileSize      int64     `json:"max_file_size" gorm:"default:10485760"`
	AllowedMimeTypes []string  `json:"allowed_mime_types" gorm:"type:text[]"`
	CreatedAt        time.Time `json:"created_at"`
}

func (Bucket) TableName() string {
	return "storage.buckets"
}

type StorageObject struct {
	ID         uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BucketName string          `json:"bucket_name" gorm:"not null"`
	Path       string          `json:"path" gorm:"not null"`
	TenantID   *string         `json:"tenant_id,omitempty"`
	UserID     string          `json:"user_id" gorm:"not null"`
	Metadata   StorageMetadata `json:"metadata,omitempty" gorm:"type:jsonb;default:'{}'"`
	IsPublic   bool            `json:"is_public" gorm:"default:false"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

func (StorageObject) TableName() string {
	return "storage.objects"
}

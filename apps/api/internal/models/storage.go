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

type StorageObject struct {
	ID         uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BucketName string          `json:"bucket_name" gorm:"not null"` // Now stores project/tenant bucket name from config
	Path       string          `json:"path" gorm:"not null"`        // User-controlled full path (e.g., "public/images/avatar.png")
	TenantID   *string         `json:"tenant_id,omitempty"`
	UserID     string          `json:"user_id" gorm:"not null"`
	Metadata   StorageMetadata `json:"metadata,omitempty" gorm:"type:jsonb;default:'{}'"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

func (StorageObject) TableName() string {
	return "storage.objects"
}

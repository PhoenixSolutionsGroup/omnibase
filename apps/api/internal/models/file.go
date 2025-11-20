package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type FileMetadata map[string]interface{}

func (m FileMetadata) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	return json.Marshal(m)
}

func (m *FileMetadata) Scan(value interface{}) error {
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

type File struct {
	ID          uuid.UUID    `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()" binding:"required"`
	UserID      uuid.UUID    `json:"user_id" gorm:"type:uuid;not null;index" binding:"required"`
	Filename    string       `json:"filename" gorm:"not null" binding:"required"`
	Size        int64        `json:"size" gorm:"not null" binding:"required"`
	S3Key       string       `json:"s3_key" gorm:"not null" binding:"required"`
	CreatedAt   time.Time    `json:"created_at" binding:"required"`
	Metadata    FileMetadata `json:"metadata,omitempty" gorm:"type:jsonb"`
	ContentType string       `json:"content_type"`
}

func (File) TableName() string {
	return "storage.objects"
}

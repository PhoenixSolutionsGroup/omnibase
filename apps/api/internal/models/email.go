package models

import (
	"time"

	"github.com/google/uuid"
)

type EmailTemplate struct {
	ID        uuid.UUID `json:"id" db:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey" binding:"required"`
	Type      string    `json:"type" db:"type" gorm:"type:varchar(100);uniqueIndex;not null" binding:"required"`
	Subject   string    `json:"subject" db:"subject" gorm:"type:text;not null" binding:"required"`
	HTMLBody  string    `json:"html_body" db:"html_body" gorm:"type:text;not null" binding:"required"`
	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"not null;default:now()" binding:"required"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"not null;default:now()" binding:"required"`
}

func (EmailTemplate) TableName() string {
	return "email.templates"
}

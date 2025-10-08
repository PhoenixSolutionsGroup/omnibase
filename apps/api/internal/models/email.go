package models

import (
	"time"

	"github.com/google/uuid"
)

type EmailTemplate struct {
	ID        uuid.UUID `json:"id" db:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Type      string    `json:"type" db:"type" gorm:"type:varchar(100);uniqueIndex;not null"`
	Subject   string    `json:"subject" db:"subject" gorm:"type:text;not null"`
	HTMLBody  string    `json:"html_body" db:"html_body" gorm:"type:text;not null"`
	CreatedAt time.Time `json:"created_at" db:"created_at" gorm:"not null;default:now()"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at" gorm:"not null;default:now()"`
}

func (EmailTemplate) TableName() string {
	return "email.templates"
}

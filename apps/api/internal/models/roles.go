package models

import (
	"time"

	"github.com/lib/pq"
)

type Role struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TenantID    *string        `gorm:"type:uuid" json:"tenant_id"` // NULL for system roles
	RoleName    string         `gorm:"type:text;not null" json:"role_name"`
	Permissions pq.StringArray `gorm:"type:text[]" json:"permissions"`
	UserIDs     pq.StringArray `gorm:"type:uuid[]" json:"user_ids"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (Role) TableName() string {
	return "permissions.roles"
}

type NamespaceDefinition struct {
	ID        string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Namespace string         `gorm:"type:text;unique;not null" json:"namespace"`
	Relations pq.StringArray `gorm:"type:text[]" json:"relations"`
	UpdatedAt time.Time      `json:"updated_at"`
}

func (NamespaceDefinition) TableName() string {
	return "permissions.definitions"
}

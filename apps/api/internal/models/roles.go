package models

import (
	"time"

	"github.com/lib/pq"
)

type Role struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id" binding:"required" example:"7bde7bd1-9be9-42f5-bc4b-be9f24cde432"`
	TenantID    *string        `gorm:"type:uuid" json:"tenant_id" swaggertype:"string" extensions:"x-nullable"` // NULL for system roles
	RoleName    string         `gorm:"type:text;not null" json:"role_name" binding:"required" example:"member"`
	Permissions pq.StringArray `gorm:"type:text[]" json:"permissions" binding:"required" example:"tenant#invite_user,tenant#remove_user"`
	UserIDs     pq.StringArray `gorm:"type:uuid[]" json:"user_ids" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001"`
	CreatedAt   time.Time      `json:"created_at" binding:"required" example:"2025-11-10T00:18:19.653645Z"`
	UpdatedAt   time.Time      `json:"updated_at" binding:"required" example:"2025-11-10T00:33:08.726632Z"`
}

func (Role) TableName() string {
	return "permissions.roles"
}

type NamespaceDefinition struct {
	ID        string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id" binding:"required" example:"bfab650b-f834-4904-a4e8-41343fea86bc"`
	Namespace string         `gorm:"type:text;unique;not null" json:"namespace" binding:"required" example:"Tenant"`
	Relations pq.StringArray `gorm:"type:text[]" json:"relations" binding:"required" example:"can_delete_tenant,can_invite_user,can_update_user_role"`
	UpdatedAt time.Time      `json:"updated_at" binding:"required" example:"2025-11-10T00:33:08.720326Z"`
}

func (NamespaceDefinition) TableName() string {
	return "permissions.definitions"
}

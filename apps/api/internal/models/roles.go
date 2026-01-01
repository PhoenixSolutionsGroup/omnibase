package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/lib/pq"
)

// SubjectRelationsData maps subject types to their allowed relations
// e.g. {"User": ["can_delete", "can_invite"], "ApiKey": ["can_rotate_keys"]}
type SubjectRelationsData map[string][]string

func (s SubjectRelationsData) Value() (driver.Value, error) {
	if s == nil {
		return nil, nil
	}
	return json.Marshal(s)
}

func (s *SubjectRelationsData) Scan(value interface{}) error {
	if value == nil {
		*s = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, s)
}

type RoleTemplate struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id" binding:"required" example:"7bde7bd1-9be9-42f5-bc4b-be9f24cde432"`
	RoleName    string         `gorm:"type:text;unique;not null" json:"role_name" binding:"required" example:"owner"`
	Permissions pq.StringArray `gorm:"type:text[]" json:"permissions" binding:"required" example:"tenant#delete_tenant,tenant#invite_user"`
	Description string         `gorm:"type:text" json:"description" example:"Full administrative access"`
	CreatedAt   time.Time      `json:"created_at" binding:"required" example:"2025-11-10T00:18:19.653645Z"`
	UpdatedAt   time.Time      `json:"updated_at" binding:"required" example:"2025-11-10T00:33:08.726632Z"`
}

func (RoleTemplate) TableName() string {
	return "permissions.role_templates"
}

type Role struct {
	ID          string         `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id" binding:"required" example:"7bde7bd1-9be9-42f5-bc4b-be9f24cde432"`
	TenantID    string         `gorm:"type:uuid;not null" json:"tenant_id"` // Never NULL
	RoleName    string         `gorm:"type:text;not null" json:"role_name" binding:"required" example:"member"`
	Permissions pq.StringArray `gorm:"type:text[]" json:"permissions" binding:"required" example:"tenant#invite_user,tenant#remove_user"`
	TemplateID  *string        `gorm:"type:uuid" json:"template_id" swaggertype:"string" extensions:"x-nullable"` // NULL = custom role
	Template    *RoleTemplate  `gorm:"foreignKey:TemplateID" json:"-"`                                            // Preload support
	UserIDs     pq.StringArray `gorm:"type:uuid[]" json:"user_ids" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001"`
	CreatedAt   time.Time      `json:"created_at" binding:"required" example:"2025-11-10T00:18:19.653645Z"`
	UpdatedAt   time.Time      `json:"updated_at" binding:"required" example:"2025-11-10T00:33:08.726632Z"`
}

// GetEffectivePermissions returns permissions from template if linked, otherwise own permissions
func (r *Role) GetEffectivePermissions() []string {
	if r.TemplateID != nil && r.Template != nil {
		return r.Template.Permissions
	}
	return r.Permissions
}

func (Role) TableName() string {
	return "permissions.roles"
}

type NamespaceDefinition struct {
	ID               string               `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id" binding:"required" example:"bfab650b-f834-4904-a4e8-41343fea86bc"`
	Namespace        string               `gorm:"type:text;unique;not null" json:"namespace" binding:"required" example:"Tenant"`
	Relations        pq.StringArray       `gorm:"type:text[]" json:"relations" binding:"required" example:"can_delete_tenant,can_invite_user,can_update_user_role"`
	SubjectRelations SubjectRelationsData `gorm:"type:jsonb" json:"subject_relations,omitempty" example:"{\"User\":[\"can_delete_tenant\"],\"ApiKey\":[\"can_rotate_keys\"]}"`
	UpdatedAt        time.Time            `json:"updated_at" binding:"required" example:"2025-11-10T00:33:08.720326Z"`
}

func (NamespaceDefinition) TableName() string {
	return "permissions.definitions"
}

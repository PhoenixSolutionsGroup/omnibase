package models

import (
	"time"
)

type TenantSettings struct {
	TenantID         string `json:"tenant_id" db:"tenant_id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	AllowUserInvites bool   `json:"allow_user_invites" db:"allow_user_invites" binding:"required" example:"true"`
	MaxMembers       int    `json:"max_members" db:"max_members" binding:"required" example:"10"`
}

func (TenantSettings) TableName() string {
	return "auth.tenant_settings"
}

type Tenant struct {
	ID               string    `json:"id" db:"id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	Name             string    `json:"name" db:"name" binding:"required" example:"Test Organization"`
	StripeCustomerID   *string `json:"stripe_customer_id" db:"stripe_customer_id" example:"cus_TOWEstcga5ou7a"` // Nullable initially
	EnterpriseTemplate *string `json:"enterprise_template,omitempty" db:"enterprise_template"`                  // e.g., "tier1_10pct_off"
	EnterpriseID       *string `json:"enterprise_id,omitempty" db:"enterprise_id"`                              // e.g., "acme_corp"
	Type               string  `json:"type" db:"type" binding:"required" example:"organization"`
	CreatedAt        time.Time `json:"created_at" db:"created_at" binding:"required" example:"2025-11-10T00:42:29.440300124Z"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at" binding:"required" example:"2025-11-10T00:42:29.440300172Z"`

	// Optional joined fields
	Settings *TenantSettings `json:"settings,omitempty" db:"-"`
}

func (Tenant) TableName() string {
	return "auth.tenants"
}

type TenantUser struct {
	ID       string    `json:"id" db:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	TenantID string    `json:"tenant_id" db:"tenant_id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	UserID   string    `json:"user_id" db:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"` // References auth.identities.id
	Role     string    `json:"role" db:"role" binding:"required" example:"member"`
	IsActive bool      `json:"is_active" db:"is_active" binding:"required" example:"true"`
	JoinedAt time.Time `json:"joined_at" db:"joined_at" binding:"required" example:"2025-11-10T00:42:29.440300124Z"`

	Tenant *Tenant `json:"tenant,omitempty" db:"-"`
}

func (TenantUser) TableName() string {
	return "auth.tenant_users"
}

type TenantInvite struct {
	ID        string     `json:"id" db:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
	TenantID  string     `json:"tenant_id" db:"tenant_id" binding:"required" example:"7d5da463-8351-4abe-870c-8ccdefc4d78c"`
	Email     string     `json:"email" db:"email" binding:"required" example:"test@example.com"`
	Role      string     `json:"role" db:"role" binding:"required" example:"member"`
	Token     string     `json:"token" db:"token" binding:"required" example:"tok_test_abc123xyz"`
	InviterID string     `json:"inviter_id" db:"inviter_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"` // References auth.identities.id
	ExpiresAt time.Time  `json:"expires_at" db:"expires_at" binding:"required" example:"2025-11-17T00:42:29.440300124Z"`
	UsedAt    *time.Time `json:"used_at" db:"used_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at" binding:"required" example:"2025-11-10T00:42:29.440300124Z"`

	// Optional joined fields
	Tenant *Tenant `json:"tenant,omitempty" db:"-"`
}

func (TenantInvite) TableName() string {
	return "auth.tenant_invites"
}

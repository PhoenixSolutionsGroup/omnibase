package models

import (
	"time"
)

type TenantSettings struct {
	TenantID         string `json:"tenant_id" db:"tenant_id"`
	AllowUserInvites bool   `json:"allow_user_invites" db:"allow_user_invites"`
	MaxMembers       int    `json:"max_members" db:"max_members"`
}

func (TenantSettings) TableName() string {
	return "auth.tenant_settings"
}

type Tenant struct {
	ID               string    `json:"id" db:"id"`
	Name             string    `json:"name" db:"name"`
	StripeCustomerID *string   `json:"stripe_customer_id" db:"stripe_customer_id"` // Nullable initially
	Type             string    `json:"type" db:"type"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`

	// Optional joined fields
	Settings *TenantSettings `json:"settings,omitempty" db:"-"`
}

func (Tenant) TableName() string {
	return "auth.tenants"
}

type TenantUser struct {
	ID       string    `json:"id" db:"id"`
	TenantID string    `json:"tenant_id" db:"tenant_id"`
	UserID   string    `json:"user_id" db:"user_id"` // References auth.identities.id
	Role     string    `json:"role" db:"role"`
	IsActive bool      `json:"is_active" db:"is_active"`
	JoinedAt time.Time `json:"joined_at" db:"joined_at"`

	Tenant *Tenant `json:"tenant,omitempty" db:"-"`
}

func (TenantUser) TableName() string {
	return "auth.tenant_users"
}

type TenantInvite struct {
	ID        string     `json:"id" db:"id"`
	TenantID  string     `json:"tenant_id" db:"tenant_id"`
	Email     string     `json:"email" db:"email"`
	Role      string     `json:"role" db:"role"`
	Token     string     `json:"token" db:"token"`
	InviterID string     `json:"inviter_id" db:"inviter_id"` // References auth.identities.id
	ExpiresAt time.Time  `json:"expires_at" db:"expires_at"`
	UsedAt    *time.Time `json:"used_at" db:"used_at"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`

	// Optional joined fields
	Tenant *Tenant `json:"tenant,omitempty" db:"-"`
}

func (TenantInvite) TableName() string {
	return "auth.tenant_invites"
}

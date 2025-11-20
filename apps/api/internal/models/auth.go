package models

import (
	kratos "github.com/ory/kratos-client-go"
)

// IdentityTraits represents the traits from the identity schema
type IdentityTraits struct {
	Email string       `json:"email" binding:"required" example:"test@example.com"`
	Name  IdentityName `json:"name" binding:"required"`
}

// IdentityName represents the name object in identity traits
type IdentityName struct {
	First string `json:"first" binding:"required" example:"John"`
	Last  string `json:"last" binding:"required" example:"Doe"`
}

// SessionResponse represents the full session response
type SessionResponse struct {
	Session  *kratos.Session  `json:"session" binding:"required"`
	Identity *kratos.Identity `json:"identity" binding:"required"`
	Tenant   *Tenant          `json:"tenant,omitempty"`
}

// WhoAmIResponse represents the authentication status response
type WhoAmIResponse struct {
	Authenticated bool   `json:"authenticated" binding:"required" example:"true"`
	UserID        string `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
}

// LogoutResponse represents the logout flow response
type LogoutResponse struct {
	LogoutURL   string `json:"logout_url" binding:"required" example:"http://auth.test.example.com/self-service/logout?token=tok_test_abc123xyz"`
	LogoutToken string `json:"logout_token" binding:"required" example:"tok_test_abc123xyz"`
}

// ActiveTenantResponse represents the active tenant response
// @Description Response containing the user's active tenant information
type ActiveTenantResponse struct {
	Tenant *Tenant `json:"tenant,omitempty"`
}

// UserTenantListItem represents a single tenant membership item
type UserTenantListItem struct {
	IsActive bool   `json:"is_active" binding:"required" example:"true"`
	Tenant   Tenant `json:"tenant" binding:"required"`
}

// ListTenantsResponse represents the list of tenants for a user
type ListTenantsResponse struct {
	Tenants []UserTenantListItem `json:"tenants" binding:"required"`
}

// CreateUserRequest represents the request to create a new user
type CreateUserRequest struct {
	Email    string       `json:"email" binding:"required,email" example:"user@example.com"`
	Password string       `json:"password" binding:"required,min=8" example:"securepassword123"`
	Name     IdentityName `json:"name" binding:"required"`
}

// CreateUserResponse represents the response after creating a user
type CreateUserResponse struct {
	ID     string         `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Email  string         `json:"email" example:"user@example.com"`
	Name   IdentityName   `json:"name"`
	Traits IdentityTraits `json:"traits"`
}

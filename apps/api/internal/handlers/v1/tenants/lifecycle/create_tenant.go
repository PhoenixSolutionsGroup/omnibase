package lifecycle

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var CreateTenantError = errors.New("Failed to create tenant")

type CreateTenantRequest struct {
	Name         string `json:"name" required:"true" minLength:"1" example:"Test Organization"`
	BillingEmail string `json:"billing_email" example:"billing@test.example.com"`
	Type         string `json:"type" example:"organization"`
}

type CreateTenantResponse struct {
	Tenant  TenantPayload `json:"tenant"`
	Token   string        `json:"token"`
	Message string        `json:"message"`
}

type TenantPayload struct {
	ID                 string    `json:"id"`
	Name               string    `json:"name"`
	StripeCustomerID   *string   `json:"stripe_customer_id,omitempty"`
	Type               string    `json:"type"`
	EnterpriseTemplate *string   `json:"enterprise_template,omitempty"`
	EnterpriseID       *string   `json:"enterprise_id,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type CreateTenantInput struct {
	handlers.AuthCtx
	Body CreateTenantRequest
}

type CreateTenantOutput struct {
	Body CreateTenantResponse
}

func (h *Handler) CreateTenant(ctx context.Context, in *CreateTenantInput) (*CreateTenantOutput, error) {
	req := in.Body

	if in.UserID == uuid.Nil {
		return nil, huma.Error401Unauthorized("User not authenticated")
	}
	userID := in.UserID
	userIDStr := userID.String()

	tenantType := req.Type
	if tenantType == "" {
		tenantType = "organization"
	}
	if tenantType != "organization" && tenantType != "individual" {
		return nil, huma.Error400BadRequest("Invalid tenant type. Must be 'organization' or 'individual'")
	}

	var stripeCustomerID *string
	if req.BillingEmail != "" {
		id, err := h.billing.CreateCustomer(ctx, billing.CreateCustomerArgs{
			Email: req.BillingEmail,
			Name:  req.Name,
		})
		if err != nil {
			if e := handlers.StripeError(err); e != nil {
				return nil, e
			}
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
		}
		stripeCustomerID = &id
	}

	tenantID := uuid.New()
	row, err := h.repo.CreateTenant(ctx, repository.CreateTenantParams{
		ID:               tenantID.String(),
		Name:             req.Name,
		StripeCustomerID: stripeCustomerID,
		Type:             tenantType,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	if err := h.repo.CreateTenantSettings(ctx, repository.CreateTenantSettingsParams{
		TenantID:         tenantID.String(),
		AllowUserInvites: true,
		MaxMembers:       10,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	if _, err := h.repo.CreateTenantUser(ctx, repository.CreateTenantUserParams{
		ID:       uuid.NewString(),
		TenantID: tenantID.String(),
		UserID:   userIDStr,
		Role:     "owner",
		IsActive: true,
	}); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	if err := h.rbac.CloneTemplatesIntoTenant(ctx, tenantID); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	if err := h.rbac.Assign(ctx, userID, tenantID, "owner"); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	token, err := h.tenants.SetActive(ctx, userID, tenantID)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	if err := h.auth.SetInTenant(ctx, userIDStr, true); err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateTenantError, err).Error())
	}

	logger.Logger.Info("tenant created", "tenant_id", tenantID, "user_id", userID)
	return &CreateTenantOutput{Body: CreateTenantResponse{
		Tenant: TenantPayload{
			ID:                 row.ID,
			Name:               row.Name,
			StripeCustomerID:   row.StripeCustomerID,
			Type:               row.Type,
			EnterpriseTemplate: row.EnterpriseTemplate,
			EnterpriseID:       row.EnterpriseID,
			CreatedAt:          row.CreatedAt,
			UpdatedAt:          row.UpdatedAt,
		},
		Token:   token,
		Message: "Tenant created successfully",
	}}, nil
}

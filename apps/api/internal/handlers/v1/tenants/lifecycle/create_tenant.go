package lifecycle

import (
	"errors"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/billing"
)

var CreateTenantError = errors.New("Failed to create tenant")

type CreateTenantRequest struct {
	Name         string `json:"name" binding:"required,min=1" example:"Test Organization"`
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

func (h *Handler) CreateTenant(ctx *gin.Context) {
	var req CreateTenantRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid request format")
		return
	}

	userIDStr := ctx.GetString("user_id")
	if userIDStr == "" {
		handlers.NewUnauthorizedResponse(ctx, "User not authenticated")
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		handlers.NewBadRequestResponse(ctx, "Invalid user_id in context")
		return
	}

	tenantType := req.Type
	if tenantType == "" {
		tenantType = "organization"
	}
	if tenantType != "organization" && tenantType != "individual" {
		handlers.NewBadRequestResponse(ctx, "Invalid tenant type. Must be 'organization' or 'individual'")
		return
	}

	var stripeCustomerID *string
	if req.BillingEmail != "" {
		id, err := h.billing.CreateCustomer(ctx.Request.Context(), billing.CreateCustomerArgs{
			Email: req.BillingEmail,
			Name:  req.Name,
		})
		if err != nil {
			if !handlers.HandleStripeError(ctx, err) {
				handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
			}
			return
		}
		stripeCustomerID = &id
	}

	tenantID := uuid.New()
	row, err := h.repo.CreateTenant(ctx.Request.Context(), repository.CreateTenantParams{
		ID:               tenantID.String(),
		Name:             req.Name,
		StripeCustomerID: stripeCustomerID,
		Type:             tenantType,
	})
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	if err := h.repo.CreateTenantSettings(ctx.Request.Context(), repository.CreateTenantSettingsParams{
		TenantID:         tenantID.String(),
		AllowUserInvites: true,
		MaxMembers:       10,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	if _, err := h.repo.CreateTenantUser(ctx.Request.Context(), repository.CreateTenantUserParams{
		ID:       uuid.NewString(),
		TenantID: tenantID.String(),
		UserID:   userIDStr,
		Role:     "owner",
		IsActive: true,
	}); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	if err := h.rbac.CloneTemplatesIntoTenant(ctx.Request.Context(), tenantID); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	if err := h.rbac.Assign(ctx.Request.Context(), userID, tenantID, "owner"); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	token, err := h.tenants.SetActive(ctx.Request.Context(), userID, tenantID)
	if err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	if err := h.auth.SetInTenant(ctx.Request.Context(), userIDStr, true); err != nil {
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("%w: %w", CreateTenantError, err))
		return
	}

	logger.Logger.Info("tenant created", "tenant_id", tenantID, "user_id", userID)
	handlers.NewSuccessResponse(ctx, CreateTenantResponse{
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
	})
}

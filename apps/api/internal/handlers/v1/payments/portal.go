package payments

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/services/billing"
)

var CreatePortalError = errors.New("Failed to create customer portal session")

type CreatePortalRequest struct {
	ReturnURL string `json:"return_url" required:"true" minLength:"1"`
}

type CreatePortalResponse struct {
	URL string `json:"url" required:"true"`
}

type CreatePortalInput struct {
	PaymentsCtx
	Body CreatePortalRequest
}

type CreatePortalOutput struct {
	Body CreatePortalResponse
}

func (h *Handler) CreateCustomerPortal(ctx context.Context, in *CreatePortalInput) (*CreatePortalOutput, error) {
	if in.StripeCustomerID == "" {
		return nil, huma.Error400BadRequest("stripe_customer_id not found in context")
	}

	session, err := h.billing.CreatePortalSession(ctx, billing.CreatePortalSessionArgs{
		StripeCustomerID: in.StripeCustomerID,
		ReturnURL:        in.Body.ReturnURL,
	})
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreatePortalError, err).Error())
	}
	return &CreatePortalOutput{Body: CreatePortalResponse{URL: session.URL}}, nil
}

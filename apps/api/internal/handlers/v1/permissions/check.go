package permissions

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/services/permissions"
)

var CheckError = errors.New("Failed to check permission")

type SubjectSetRequest struct {
	Namespace string `json:"namespace" required:"true" example:"User"`
	Object    string `json:"object" required:"true" example:"550e8400-e29b-41d4-a716-446655440000"`
	Relation  string `json:"relation,omitempty"`
}

type CheckRequest struct {
	Namespace  string            `json:"namespace" required:"true" minLength:"1" example:"Tenant"`
	Object     string            `json:"object" required:"true" minLength:"1" example:"tenant_test_123"`
	Relation   string            `json:"relation" required:"true" minLength:"1" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" required:"true"`
}

type CheckResponse struct {
	Allowed bool `json:"allowed"`
}

type CheckInput struct {
	handlers.AuthCtx
	Body CheckRequest
}

type CheckOutput struct {
	Body CheckResponse
}

func (h *Handler) Check(ctx context.Context, in *CheckInput) (*CheckOutput, error) {
	req := in.Body

	allowed, err := h.perms.Check(ctx, req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		logger.Logger.Error("Failed to check permission", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CheckError, err).Error())
	}

	return &CheckOutput{Body: CheckResponse{Allowed: allowed}}, nil
}

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

var CreateRelationshipError = errors.New("Failed to create relationship")

type CreateRelationshipRequest struct {
	Namespace  string            `json:"namespace" required:"true" example:"Tenant"`
	Object     string            `json:"object" required:"true" example:"tenant_test_123"`
	Relation   string            `json:"relation" required:"true" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" required:"true"`
}

type CreateRelationshipResponse struct {
	Message string `json:"message"`
}

type CreateRelationshipInput struct {
	handlers.AuthCtx
	Body CreateRelationshipRequest
}

type CreateRelationshipOutput struct {
	Body CreateRelationshipResponse
}

func (h *Handler) CreateRelationship(ctx context.Context, in *CreateRelationshipInput) (*CreateRelationshipOutput, error) {
	req := in.Body

	err := h.perms.Create(ctx, req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		if errors.Is(err, permissions.CreateNotFound) {
			return nil, huma.Error404NotFound("Namespace or object not found")
		}
		logger.Logger.Error("Failed to create relationship", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", CreateRelationshipError, err).Error())
	}

	return &CreateRelationshipOutput{Body: CreateRelationshipResponse{
		Message: "Relationship created successfully",
	}}, nil
}

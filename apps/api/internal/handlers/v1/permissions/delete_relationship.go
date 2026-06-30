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

var DeleteRelationshipError = errors.New("Failed to delete relationship")

type DeleteRelationshipRequest struct {
	Namespace  string            `json:"namespace" required:"true" example:"Tenant"`
	Object     string            `json:"object" required:"true" example:"tenant_test_123"`
	Relation   string            `json:"relation" required:"true" example:"can_invite_user"`
	SubjectSet SubjectSetRequest `json:"subject_set" required:"true"`
}

type DeleteRelationshipResponse struct {
	Message string `json:"message"`
}

type DeleteRelationshipInput struct {
	handlers.AuthCtx
	Body DeleteRelationshipRequest
}

type DeleteRelationshipOutput struct {
	Body DeleteRelationshipResponse
}

func (h *Handler) DeleteRelationship(ctx context.Context, in *DeleteRelationshipInput) (*DeleteRelationshipOutput, error) {
	req := in.Body

	err := h.perms.Delete(ctx, req.Namespace, req.Object, req.Relation, permissions.SubjectSet{
		Namespace: req.SubjectSet.Namespace,
		Object:    req.SubjectSet.Object,
		Relation:  req.SubjectSet.Relation,
	})
	if err != nil {
		if errors.Is(err, permissions.DeleteNotFound) {
			return nil, huma.Error404NotFound("Relationship not found")
		}
		logger.Logger.Error("Failed to delete relationship", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeleteRelationshipError, err).Error())
	}

	return &DeleteRelationshipOutput{Body: DeleteRelationshipResponse{
		Message: "Relationship deleted successfully",
	}}, nil
}

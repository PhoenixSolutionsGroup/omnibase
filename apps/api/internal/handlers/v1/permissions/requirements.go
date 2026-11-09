package permissions

import (
	"context"

	"github.com/danielgtaylor/huma/v2"

	namespaces "api/permissions"
)

type RequirementsOutput struct {
	Body namespaces.Requirements
}

func (h *Handler) Requirements(ctx context.Context, _ *struct{}) (*RequirementsOutput, error) {
	requirements, err := namespaces.Load()
	if err != nil {
		return nil, huma.Error500InternalServerError("Failed to load namespace requirements")
	}
	return &RequirementsOutput{Body: *requirements}, nil
}

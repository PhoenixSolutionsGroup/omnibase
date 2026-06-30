package stripe

import (
	"context"
	"errors"
	"fmt"

	"github.com/danielgtaylor/huma/v2"

	"api/internal/handlers"
)

var ArchiveAllConfigError = errors.New("Failed to archive all stripe resources")

type ArchiveAllResponse struct {
	Message       string   `json:"message" required:"true"`
	ArchivedItems []string `json:"archived_items" required:"true"`
	ArchiveErrors []string `json:"archive_errors" required:"true"`
	TotalArchived int      `json:"total_archived" required:"true"`
	TotalErrors   int      `json:"total_errors" required:"true"`
	Warning       *string  `json:"warning,omitempty"`
}

type ArchiveAllInput struct {
	handlers.AuthCtx
}

type ArchiveAllOutput struct {
	Body ArchiveAllResponse
}

func (h *Handler) ArchiveAllConfig(ctx context.Context, _ *ArchiveAllInput) (*ArchiveAllOutput, error) {
	result, err := h.stripeConfig.ArchiveAll(ctx)
	if err != nil {
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ArchiveAllConfigError, err).Error())
	}
	if result.Archived == nil {
		result.Archived = []string{}
	}
	if result.Errors == nil {
		result.Errors = []string{}
	}
	resp := ArchiveAllResponse{
		Message:       "Successfully archived all Stripe resources and cleared local config",
		ArchivedItems: result.Archived,
		ArchiveErrors: result.Errors,
		TotalArchived: len(result.Archived),
		TotalErrors:   len(result.Errors),
	}
	if len(result.Errors) > 0 {
		w := "Some items failed to archive - see archive_errors for details"
		resp.Warning = &w
	}
	return &ArchiveAllOutput{Body: resp}, nil
}

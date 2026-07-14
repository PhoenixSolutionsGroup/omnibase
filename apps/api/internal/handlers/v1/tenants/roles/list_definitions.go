package roles

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/handlers"
	"api/internal/logger"
)

var ListDefinitionsError = errors.New("Failed to fetch definitions")

type RelationMetadataResponse struct {
	Name        string  `json:"name"`
	DisplayName string  `json:"display_name"`
	Group       *string `json:"group"`
	SubGroup    *string `json:"sub_group"`
}

type NamespaceDefinitionResponse struct {
	ID                uuid.UUID                  `json:"id"`
	Namespace         string                     `json:"namespace"`
	Relations         []string                   `json:"relations"`
	RelationsMetadata []RelationMetadataResponse `json:"relations_metadata"`
	SubjectRelations  map[string][]string        `json:"subject_relations"`
	UpdatedAt         time.Time                  `json:"updated_at"`
}

type ListDefinitionsInput struct {
	handlers.AuthCtx
	Subject string `query:"subject"`
}

type ListDefinitionsOutput struct {
	Body []NamespaceDefinitionResponse
}

func (h *Handler) ListDefinitions(ctx context.Context, in *ListDefinitionsInput) (*ListDefinitionsOutput, error) {
	subjectFilter := in.Subject
	logger.Logger.Debug("Fetching namespace definitions", "subject_filter", subjectFilter)

	rows, err := h.repo.ListNamespaceDefinitions(ctx)
	if err != nil {
		logger.Logger.Error("Failed to fetch namespace definitions", "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", ListDefinitionsError, err).Error())
	}

	defs := make([]NamespaceDefinitionResponse, 0, len(rows))
	for _, r := range rows {
		sr := map[string][]string{}
		if len(r.SubjectRelations) > 0 {
			if err := json.Unmarshal(r.SubjectRelations, &sr); err != nil {
				logger.Logger.Warn("Failed to unmarshal subject_relations", "namespace", r.Namespace, "error", err)
			}
		}

		relations := r.Relations
		if subjectFilter != "" {
			if filtered, ok := sr[subjectFilter]; ok {
				relations = filtered
			} else {
				relations = []string{}
			}
			if len(relations) == 0 {
				continue
			}
		}

		metadata := []RelationMetadataResponse{}
		if len(r.RelationsMetadata) > 0 {
			if err := json.Unmarshal(r.RelationsMetadata, &metadata); err != nil {
				logger.Logger.Warn("Failed to unmarshal relations_metadata", "namespace", r.Namespace, "error", err)
				metadata = []RelationMetadataResponse{}
			}
		}
		if subjectFilter != "" {
			allowed := map[string]struct{}{}
			for _, rel := range relations {
				allowed[rel] = struct{}{}
			}
			filteredMeta := metadata[:0]
			for _, m := range metadata {
				if _, ok := allowed[m.Name]; ok {
					filteredMeta = append(filteredMeta, m)
				}
			}
			metadata = filteredMeta
		}

		defs = append(defs, NamespaceDefinitionResponse{
			ID:                r.ID,
			Namespace:         r.Namespace,
			Relations:         relations,
			RelationsMetadata: metadata,
			SubjectRelations:  sr,
			UpdatedAt:         r.UpdatedAt,
		})
	}

	logger.Logger.Debug("Successfully fetched namespace definitions", "count", len(defs), "subject_filter", subjectFilter)
	return &ListDefinitionsOutput{Body: defs}, nil
}

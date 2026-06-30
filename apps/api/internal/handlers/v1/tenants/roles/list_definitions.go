package roles

import (
	"encoding/json"
	"time"

	"api/internal/handlers"
	"api/internal/logger"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NamespaceDefinitionResponse struct {
	ID               uuid.UUID           `json:"id"`
	Namespace        string              `json:"namespace"`
	Relations        []string            `json:"relations"`
	SubjectRelations map[string][]string `json:"subject_relations"`
	UpdatedAt        time.Time           `json:"updated_at"`
}

func (h *Handler) ListDefinitions(c *gin.Context) {
	subjectFilter := c.Query("subject")
	logger.Logger.Debug("Fetching namespace definitions", "subject_filter", subjectFilter)

	rows, err := h.repo.ListNamespaceDefinitions(c.Request.Context())
	if err != nil {
		logger.Logger.Error("Failed to fetch namespace definitions", "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
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

		defs = append(defs, NamespaceDefinitionResponse{
			ID:               r.ID,
			Namespace:        r.Namespace,
			Relations:        relations,
			SubjectRelations: sr,
			UpdatedAt:        r.UpdatedAt,
		})
	}

	logger.Logger.Debug("Successfully fetched namespace definitions", "count", len(defs), "subject_filter", subjectFilter)
	handlers.NewSuccessResponse(c, defs)
}

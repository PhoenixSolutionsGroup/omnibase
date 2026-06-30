package permissions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"api/internal/logger"
)

var ListError = errors.New("Failed to list relation tuples")

type RelationTuple struct {
	Namespace  string      `json:"namespace"`
	Object     string      `json:"object"`
	Relation   string      `json:"relation"`
	SubjectSet *SubjectSet `json:"subject_set,omitempty"`
}

type listResponse struct {
	RelationTuples []RelationTuple `json:"relation_tuples"`
}

func (s *Service) List(ctx context.Context, namespace, object, relation string, subject *SubjectSet) ([]RelationTuple, error) {
	logger.Logger.Debug("Listing relation tuples", "namespace", namespace, "object", object, "relation", relation)

	params := url.Values{}
	if namespace != "" {
		params.Add("namespace", namespace)
	}
	if object != "" {
		params.Add("object", object)
	}
	if relation != "" {
		params.Add("relation", relation)
	}
	if subject != nil {
		params.Add("subject_set.namespace", subject.Namespace)
		params.Add("subject_set.object", subject.Object)
		params.Add("subject_set.relation", subject.Relation)
	}

	listURL := fmt.Sprintf("%s/relation-tuples?%s", s.readURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "GET", listURL, nil)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ListError, err)
	}

	resp, err := s.readClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ListError, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("%w: HTTP %d", ListError, resp.StatusCode)
	}

	var body listResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("%w: %w", ListError, err)
	}

	logger.Logger.Debug("Relation tuples listed", "count", len(body.RelationTuples))
	return body.RelationTuples, nil
}

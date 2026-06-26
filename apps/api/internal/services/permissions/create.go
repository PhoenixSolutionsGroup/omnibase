package permissions

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"api/internal/logger"
)

var CreateError = errors.New("Failed to create relation tuple")

type createPayload struct {
	Namespace  string         `json:"namespace"`
	Object     string         `json:"object"`
	Relation   string         `json:"relation"`
	SubjectSet createSubject `json:"subject_set"`
}

type createSubject struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}

func (s *Service) Create(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	logger.Logger.Debug("Creating relation tuple",
		"namespace", namespace,
		"object", object,
		"relation", relation,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)

	payload, err := json.Marshal(createPayload{
		Namespace: namespace,
		Object:    object,
		Relation:  relation,
		SubjectSet: createSubject{
			Namespace: subject.Namespace,
			Object:    subject.Object,
			Relation:  subject.Relation,
		},
	})
	if err != nil {
		return fmt.Errorf("%w: %w", CreateError, err)
	}

	createURL := fmt.Sprintf("%s/admin/relation-tuples", s.writeURL)
	req, err := http.NewRequestWithContext(ctx, "PUT", createURL, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("%w: %w", CreateError, err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.writeClient.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %w", CreateError, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("%w: HTTP %d", CreateError, resp.StatusCode)
	}

	logger.Logger.Debug("Relation tuple created", "namespace", namespace, "object", object, "subject_object", subject.Object)
	return nil
}

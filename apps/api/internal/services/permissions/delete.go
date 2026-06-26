package permissions

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"api/internal/logger"
)

var DeleteError = errors.New("Failed to delete relation tuple")

func (s *Service) Delete(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	logger.Logger.Debug("Deleting relation tuple",
		"namespace", namespace,
		"object", object,
		"relation", relation,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)

	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("object", object)
	params.Add("relation", relation)
	params.Add("subject_set.namespace", subject.Namespace)
	params.Add("subject_set.object", subject.Object)
	params.Add("subject_set.relation", subject.Relation)

	deleteURL := fmt.Sprintf("%s/admin/relation-tuples?%s", s.writeURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "DELETE", deleteURL, nil)
	if err != nil {
		return fmt.Errorf("%w: %w", DeleteError, err)
	}

	resp, err := s.writeClient.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %w", DeleteError, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("%w: HTTP %d", DeleteError, resp.StatusCode)
	}

	logger.Logger.Debug("Relation tuple deleted", "namespace", namespace, "object", object, "subject_object", subject.Object)
	return nil
}

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

var CheckError = errors.New("Failed to check permission")

type checkResponse struct {
	Allowed bool `json:"allowed"`
}

func (s *Service) Check(ctx context.Context, namespace, object, relation string, subject SubjectSet) (bool, error) {
	logger.Logger.Debug("Checking permission",
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

	checkURL := fmt.Sprintf("%s/relation-tuples/check?%s", s.readURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", checkURL, nil)
	if err != nil {
		return false, fmt.Errorf("%w: %w", CheckError, err)
	}

	resp, err := s.readClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("%w: %w", CheckError, err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		var body checkResponse
		if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
			return false, fmt.Errorf("%w: %w", CheckError, err)
		}
		logger.Logger.Debug("Permission check completed", "allowed", body.Allowed, "subject_object", subject.Object)
		return body.Allowed, nil
	case http.StatusForbidden:
		logger.Logger.Debug("Permission denied", "subject_object", subject.Object, "object", object)
		return false, nil
	default:
		return false, fmt.Errorf("%w: HTTP %d", CheckError, resp.StatusCode)
	}
}

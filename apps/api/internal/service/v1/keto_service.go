package services_v1

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type KetoService struct {
	readURL  string
	writeURL string
	client   *http.Client
}

func NewKetoService(readURL, writeURL string) *KetoService {
	return &KetoService{
		readURL:  readURL,
		writeURL: writeURL,
		client:   &http.Client{},
	}
}

// CheckPermission checks if a subject has a relation to an object
func (k *KetoService) CheckPermission(ctx context.Context, namespace, object, relation, subject string) (bool, error) {
	// Build query parameters
	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("object", object)
	params.Add("relation", relation)
	params.Add("subject_id", subject)

	// Make request to Keto read API - using the correct endpoint from docs
	checkURL := fmt.Sprintf("%s/relation-tuples/check?%s", k.readURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", checkURL, nil)
	if err != nil {
		return false, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := k.client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to check permission: %w", err)
	}
	defer resp.Body.Close()

	// Check if request was successful
	if resp.StatusCode == 200 {
		var result struct {
			Allowed bool `json:"allowed"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return false, fmt.Errorf("failed to decode response: %w", err)
		}
		return result.Allowed, nil
	} else if resp.StatusCode == 403 {
		// 403 means permission denied (not allowed)
		return false, nil
	} else {
		return false, fmt.Errorf("permission check failed with status %d", resp.StatusCode)
	}
}

// CreateRelationTuple creates a new relation tuple
func (k *KetoService) CreateRelationTuple(ctx context.Context, namespace, object, relation, subject string) error {
	relationTuple := map[string]string{
		"namespace":  namespace,
		"object":     object,
		"relation":   relation,
		"subject_id": subject,
	}

	payload, err := json.Marshal(relationTuple)
	if err != nil {
		return fmt.Errorf("failed to marshal relation tuple: %w", err)
	}

	// Using correct endpoint from docs
	createURL := fmt.Sprintf("%s/admin/relation-tuples", k.writeURL)
	req, err := http.NewRequestWithContext(ctx, "PUT", createURL, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := k.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to create relation tuple: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		return nil
	} else {
		return fmt.Errorf("failed to create relation tuple: HTTP %d", resp.StatusCode)
	}
}

// DeleteRelationTuple deletes a relation tuple
func (k *KetoService) DeleteRelationTuple(ctx context.Context, namespace, object, relation, subject string) error {
	// Build query parameters
	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("object", object)
	params.Add("relation", relation)
	params.Add("subject_id", subject)

	deleteURL := fmt.Sprintf("%s/admin/relation-tuples?%s", k.writeURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "DELETE", deleteURL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := k.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to delete relation tuple: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("failed to delete relation tuple: HTTP %d", resp.StatusCode)
	}

	return nil
}

// RelationTuple represents a Keto relation tuple
type RelationTuple struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
	SubjectID string `json:"subject_id"`
}

// ListRelationTuples lists relation tuples with optional filters
func (k *KetoService) ListRelationTuples(ctx context.Context, namespace, object, relation, subject string) ([]RelationTuple, error) {
	// Build query parameters - namespace is required according to docs
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
	if subject != "" {
		params.Add("subject_id", subject)
	}

	// Using correct endpoint from docs
	listURL := fmt.Sprintf("%s/relation-tuples?%s", k.readURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "GET", listURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := k.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to list relation tuples: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("failed to list relation tuples: HTTP %d", resp.StatusCode)
	}

	var result struct {
		RelationTuples []RelationTuple `json:"relation_tuples"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result.RelationTuples, nil
}

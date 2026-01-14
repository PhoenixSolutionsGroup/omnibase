package services_v1

import (
	"api/internal/logger"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"

	"google.golang.org/api/idtoken"
)

type KetoService struct {
	readURL     string
	writeURL    string
	readClient  *http.Client
	writeClient *http.Client
}

// SubjectSet represents a Keto subject set (namespace + object + optional relation)
type SubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}

func NewKetoService(readURL, writeURL string) *KetoService {
	logger.Logger.Info("Initializing Keto service", "readURL", readURL, "writeURL", writeURL)

	readClient := &http.Client{}
	writeClient := &http.Client{}

	// On Cloud Run, use identity tokens for service-to-service auth
	if os.Getenv("K_SERVICE") != "" {
		var err error
		readClient, err = idtoken.NewClient(context.Background(), readURL)
		if err != nil {
			logger.Logger.Error("Failed to create identity token client for Keto read", "error", err)
			panic(err)
		}
		writeClient, err = idtoken.NewClient(context.Background(), writeURL)
		if err != nil {
			logger.Logger.Error("Failed to create identity token client for Keto write", "error", err)
			panic(err)
		}
		logger.Logger.Info("Using identity token clients for Keto service")
	}

	return &KetoService{
		readURL:     readURL,
		writeURL:    writeURL,
		readClient:  readClient,
		writeClient: writeClient,
	}
}

// CheckPermission checks if a subject has a relation to an object
func (k *KetoService) CheckPermission(ctx context.Context, namespace, object, relation string, subject SubjectSet) (bool, error) {
	logger.Logger.Debug("Checking permission",
		"namespace", namespace,
		"object", object,
		"relation", relation,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)

	// Build query parameters with subject_set
	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("object", object)
	params.Add("relation", relation)
	params.Add("subject_set.namespace", subject.Namespace)
	params.Add("subject_set.object", subject.Object)
	params.Add("subject_set.relation", subject.Relation)

	// Make request to Keto read API - using the correct endpoint from docs
	checkURL := fmt.Sprintf("%s/relation-tuples/check?%s", k.readURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, "GET", checkURL, nil)
	if err != nil {
		logger.Logger.Error("Failed to create permission check request", "error", err)
		return false, fmt.Errorf("failed to create request: %w", err)
	}

	logger.Logger.Info("Making Keto permission check API call", "url", checkURL)
	resp, err := k.readClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to check permission", "error", err, "url", checkURL)
		return false, fmt.Errorf("failed to check permission: %w", err)
	}
	defer resp.Body.Close()

	// Check if request was successful
	if resp.StatusCode == 200 {
		var result struct {
			Allowed bool `json:"allowed"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			logger.Logger.Error("Failed to decode permission check response", "error", err)
			return false, fmt.Errorf("failed to decode response: %w", err)
		}
		logger.Logger.Info("Permission check completed", "allowed", result.Allowed, "subject_object", subject.Object)
		return result.Allowed, nil
	} else if resp.StatusCode == 403 {
		// 403 means permission denied (not allowed)
		logger.Logger.Debug("Permission denied by Keto", "subject_object", subject.Object, "object", object)
		return false, nil
	} else {
		logger.Logger.Error("Permission check failed", "statusCode", resp.StatusCode)
		return false, fmt.Errorf("permission check failed with status %d", resp.StatusCode)
	}
}

// CreateRelationTuple creates a new relation tuple with subject_set
func (k *KetoService) CreateRelationTuple(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	logger.Logger.Info("Creating relation tuple",
		"namespace", namespace,
		"object", object,
		"relation", relation,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)

	relationTuple := map[string]interface{}{
		"namespace": namespace,
		"object":    object,
		"relation":  relation,
		"subject_set": map[string]string{
			"namespace": subject.Namespace,
			"object":    subject.Object,
			"relation":  subject.Relation,
		},
	}

	payload, err := json.Marshal(relationTuple)
	if err != nil {
		logger.Logger.Error("Failed to marshal relation tuple", "error", err)
		return fmt.Errorf("failed to marshal relation tuple: %w", err)
	}

	// Using correct endpoint from docs
	createURL := fmt.Sprintf("%s/admin/relation-tuples", k.writeURL)
	req, err := http.NewRequestWithContext(ctx, "PUT", createURL, bytes.NewBuffer(payload))
	if err != nil {
		logger.Logger.Error("Failed to create relation tuple request", "error", err)
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	logger.Logger.Info("Making Keto create relation tuple API call", "url", createURL)
	resp, err := k.writeClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to create relation tuple", "error", err, "url", createURL)
		return fmt.Errorf("failed to create relation tuple: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		logger.Logger.Info("Relation tuple created successfully",
			"namespace", namespace,
			"object", object,
			"subject_namespace", subject.Namespace,
			"subject_object", subject.Object)
		return nil
	} else {
		logger.Logger.Error("Failed to create relation tuple", "statusCode", resp.StatusCode)
		return fmt.Errorf("failed to create relation tuple: HTTP %d", resp.StatusCode)
	}
}

// DeleteRelationTuple deletes a relation tuple
func (k *KetoService) DeleteRelationTuple(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	logger.Logger.Info("Deleting relation tuple",
		"namespace", namespace,
		"object", object,
		"relation", relation,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)

	// Build query parameters with subject_set
	params := url.Values{}
	params.Add("namespace", namespace)
	params.Add("object", object)
	params.Add("relation", relation)
	params.Add("subject_set.namespace", subject.Namespace)
	params.Add("subject_set.object", subject.Object)
	params.Add("subject_set.relation", subject.Relation)

	deleteURL := fmt.Sprintf("%s/admin/relation-tuples?%s", k.writeURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "DELETE", deleteURL, nil)
	if err != nil {
		logger.Logger.Error("Failed to create delete relation tuple request", "error", err)
		return fmt.Errorf("failed to create request: %w", err)
	}

	logger.Logger.Info("Making Keto delete relation tuple API call", "url", deleteURL)
	resp, err := k.writeClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to delete relation tuple", "error", err, "url", deleteURL)
		return fmt.Errorf("failed to delete relation tuple: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		logger.Logger.Error("Failed to delete relation tuple", "statusCode", resp.StatusCode)
		return fmt.Errorf("failed to delete relation tuple: HTTP %d", resp.StatusCode)
	}

	logger.Logger.Info("Relation tuple deleted successfully",
		"namespace", namespace,
		"object", object,
		"subject_namespace", subject.Namespace,
		"subject_object", subject.Object)
	return nil
}

// RelationTuple represents a Keto relation tuple
type RelationTuple struct {
	Namespace  string      `json:"namespace"`
	Object     string      `json:"object"`
	Relation   string      `json:"relation"`
	SubjectSet *SubjectSet `json:"subject_set,omitempty"`
}

// ListRelationTuples lists relation tuples with optional filters
func (k *KetoService) ListRelationTuples(ctx context.Context, namespace, object, relation string, subject *SubjectSet) ([]RelationTuple, error) {
	logger.Logger.Debug("Listing relation tuples",
		"namespace", namespace,
		"object", object,
		"relation", relation)

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
	if subject != nil {
		params.Add("subject_set.namespace", subject.Namespace)
		params.Add("subject_set.object", subject.Object)
		params.Add("subject_set.relation", subject.Relation)
	}

	// Using correct endpoint from docs
	listURL := fmt.Sprintf("%s/relation-tuples?%s", k.readURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, "GET", listURL, nil)
	if err != nil {
		logger.Logger.Error("Failed to create list relation tuples request", "error", err)
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	logger.Logger.Info("Making Keto list relation tuples API call", "url", listURL)
	resp, err := k.readClient.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to list relation tuples", "error", err, "url", listURL)
		return nil, fmt.Errorf("failed to list relation tuples: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		logger.Logger.Error("Failed to list relation tuples", "statusCode", resp.StatusCode)
		return nil, fmt.Errorf("failed to list relation tuples: HTTP %d", resp.StatusCode)
	}

	var result struct {
		RelationTuples []RelationTuple `json:"relation_tuples"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		logger.Logger.Error("Failed to decode relation tuples response", "error", err)
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	logger.Logger.Info("Relation tuples listed successfully", "count", len(result.RelationTuples))
	return result.RelationTuples, nil
}

package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Config holds the configuration needed by the storage client
type Config struct {
	API_URL string
}

// Client provides access to storage operations
type OmnibaseStorageClient struct {
	config *Config
}

// NewClient creates a new storage client
func NewClient(cfg *Config) *OmnibaseStorageClient {
	return &OmnibaseStorageClient{
		config: cfg,
	}
}

// Bucket returns a bucket reference for file operations
func (c *OmnibaseStorageClient) Bucket(name string) *Bucket {
	return &Bucket{
		client: c,
		name:   name,
	}
}

// Bucket represents a storage bucket for file operations
type Bucket struct {
	client *OmnibaseStorageClient
	name   string
}

// Upload uploads a file to the bucket
//
// Example:
//
//	result, err := storage.Bucket("user-uploads").Upload(
//	    ctx,
//	    "documents/report.pdf",
//	    file,
//	    &storage.UploadOptions{
//	        Metadata: map[string]any{
//	            "department": "engineering",
//	            "project": "Q4-review",
//	            "tags": []string{"important", "quarterly"},
//	        },
//	    },
//	)
func (b *Bucket) Upload(ctx context.Context, path string, file io.Reader, opts *UploadOptions) (*UploadResult, error) {
	// Build metadata object with custom metadata
	metadata := make(map[string]any)
	if opts != nil && opts.Metadata != nil {
		for k, v := range opts.Metadata {
			metadata[k] = v
		}
	}
	metadata["uploaded_at"] = time.Now().UTC().Format(time.RFC3339)

	// Request pre-signed upload URL from API
	reqBody := UploadRequest{
		Bucket:   b.name,
		Path:     path,
		Metadata: metadata,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal upload request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", b.client.config.API_URL+"/api/v1/storage/upload", bytes.NewReader(reqJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create upload request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to request upload URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return nil, fmt.Errorf("upload request failed with status %d", resp.StatusCode)
		}
		return nil, fmt.Errorf("upload request failed: %s", errResp.Error)
	}

	var response struct {
		Data UploadResult `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode upload response: %w", err)
	}

	// Upload file to S3 using pre-signed URL
	uploadReq, err := http.NewRequestWithContext(ctx, "PUT", response.Data.UploadURL, file)
	if err != nil {
		return nil, fmt.Errorf("failed to create S3 upload request: %w", err)
	}

	uploadResp, err := http.DefaultClient.Do(uploadReq)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}
	defer uploadResp.Body.Close()

	if uploadResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to upload file to storage: status %d", uploadResp.StatusCode)
	}

	return &response.Data, nil
}

// Download downloads a file from the bucket
//
// Example:
//
//	result, err := storage.Bucket("user-uploads").Download(
//	    ctx,
//	    "tenant-123/documents/report.pdf",
//	)
//
//	// Download the file
//	resp, err := http.Get(result.DownloadURL)
//	data, err := io.ReadAll(resp.Body)
func (b *Bucket) Download(ctx context.Context, path string) (*DownloadResult, error) {
	reqBody := DownloadRequest{
		Bucket: b.name,
		Path:   path,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal download request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", b.client.config.API_URL+"/api/v1/storage/download", bytes.NewReader(reqJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create download request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to request download URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return nil, fmt.Errorf("download request failed with status %d", resp.StatusCode)
		}
		return nil, fmt.Errorf("download request failed: %s", errResp.Error)
	}

	var response struct {
		Data DownloadResult `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode download response: %w", err)
	}

	return &response.Data, nil
}

// Delete deletes a file from the bucket
//
// Example:
//
//	err := storage.Bucket("user-uploads").Delete(
//	    ctx,
//	    "tenant-123/documents/report.pdf",
//	)
func (b *Bucket) Delete(ctx context.Context, path string) error {
	reqBody := DeleteRequest{
		Bucket: b.name,
		Path:   path,
	}

	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal delete request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "DELETE", b.client.config.API_URL+"/api/v1/storage/object", bytes.NewReader(reqJSON))
	if err != nil {
		return fmt.Errorf("failed to create delete request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return fmt.Errorf("delete request failed with status %d", resp.StatusCode)
		}
		return fmt.Errorf("delete request failed: %s", errResp.Error)
	}

	return nil
}

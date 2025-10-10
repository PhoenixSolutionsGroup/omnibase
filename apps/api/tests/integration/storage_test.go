package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func getAPIURL() string {
	if url := os.Getenv("TEST_API_URL"); url != "" {
		return url
	}
	return "http://localhost:8080"
}

// Test Upload endpoint - should reject without auth
func TestStorageUpload_NoAuth(t *testing.T) {
	requestBody := map[string]interface{}{
		"path": "public/images/test.png",
	}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/upload", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode, "Should return 401 without authentication")
}

func TestStorageUpload_MissingPath(t *testing.T) {
	requestBody := map[string]interface{}{
		"metadata": map[string]interface{}{"test": "value"},
	}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/upload", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for missing path or 401 for bad auth")
}

func TestStorageUpload_PathStructures(t *testing.T) {
	testCases := []struct {
		name string
		path string
	}{
		{"Public file", "public/images/avatar.png"},
		{"User private file", "users/123/private/document.pdf"},
		{"Team shared file", "teams/456/shared/data.json"},
		{"Nested structure", "projects/789/public/assets/logo.svg"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			requestBody := map[string]interface{}{
				"path": tc.path,
			}

			body, _ := json.Marshal(requestBody)
			req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/upload", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			client := &http.Client{}
			resp, err := client.Do(req)

			require.NoError(t, err)
			assert.Equal(t, 401, resp.StatusCode, "Should return 401 without authentication")
		})
	}
}

// Test Download endpoint - should reject without auth
func TestStorageDownload_NoAuth(t *testing.T) {
	requestBody := map[string]interface{}{
		"path": "public/images/test.png",
	}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/download", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode, "Should return 401 without authentication")
}

func TestStorageDownload_MissingPath(t *testing.T) {
	requestBody := map[string]interface{}{}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/download", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for missing path or 401 for bad auth")
}

// Test Delete endpoint - should reject without auth
func TestStorageDelete_NoAuth(t *testing.T) {
	requestBody := map[string]interface{}{
		"path": "public/images/test.png",
	}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("DELETE", getAPIURL()+"/api/v1/storage/object", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Equal(t, 401, resp.StatusCode, "Should return 401 without authentication")
}

func TestStorageDelete_MissingPath(t *testing.T) {
	requestBody := map[string]interface{}{}

	body, _ := json.Marshal(requestBody)
	req, _ := http.NewRequest("DELETE", getAPIURL()+"/api/v1/storage/object", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for missing path or 401 for bad auth")
}

// Test malformed JSON
func TestStorageUpload_MalformedJSON(t *testing.T) {
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/upload", bytes.NewBufferString("{invalid json"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for malformed JSON or 401 for bad auth")
}

func TestStorageDownload_MalformedJSON(t *testing.T) {
	req, _ := http.NewRequest("POST", getAPIURL()+"/api/v1/storage/download", bytes.NewBufferString("{invalid json"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for malformed JSON or 401 for bad auth")
}

func TestStorageDelete_MalformedJSON(t *testing.T) {
	req, _ := http.NewRequest("DELETE", getAPIURL()+"/api/v1/storage/object", bytes.NewBufferString("{invalid json"))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cookie", "test_session=valid")

	client := &http.Client{}
	resp, err := client.Do(req)

	require.NoError(t, err)
	assert.Contains(t, []int{400, 401}, resp.StatusCode, "Should return 400 for malformed JSON or 401 for bad auth")
}

package v1

import (
	"api/internal/config"
	"api/internal/handlers"
	"api/internal/logger"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type PermissionsHandler struct {
	readURL  string
	writeURL string
}

func NewPermissionsHandler(cfg *config.Config) *PermissionsHandler {
	logger.Logger.Info("Initializing PermissionsHandler", "read_url", cfg.PermissionsConfig.ReadURL, "write_url", cfg.PermissionsConfig.WriteURL)
	return &PermissionsHandler{
		readURL:  cfg.PermissionsConfig.ReadURL,  // Keto read API
		writeURL: cfg.PermissionsConfig.WriteURL, // Keto write API
	}
}

// ProxyRead forwards read requests to Keto read API
func (h *PermissionsHandler) ProxyRead(ctx *gin.Context) {
	logger.Logger.Debug("ProxyRead handler started", "path", ctx.Request.URL.Path, "method", ctx.Request.Method)
	h.proxyRequest(ctx, h.readURL, "read")
}

// ProxyWrite forwards write requests to Keto write API
func (h *PermissionsHandler) ProxyWrite(ctx *gin.Context) {
	logger.Logger.Debug("ProxyWrite handler started", "path", ctx.Request.URL.Path, "method", ctx.Request.Method)
	h.proxyRequest(ctx, h.writeURL, "write")
}

// proxyRequest handles the actual proxying logic
func (h *PermissionsHandler) proxyRequest(ctx *gin.Context, targetURL, apiType string) {
	// Extract the path after /api/v1/permissions/{read|write}

	originalPath := ctx.Request.URL.Path
	pathPrefix := fmt.Sprintf("/api/v1/permissions/%s", apiType)

	// Remove the prefix to get the path for Keto
	ketoPath := strings.TrimPrefix(originalPath, pathPrefix)
	if ketoPath == "" {
		ketoPath = "/"
	}

	// Construct the full target URL
	fullURL := targetURL + ketoPath
	if ctx.Request.URL.RawQuery != "" {
		fullURL += "?" + ctx.Request.URL.RawQuery
	}

	logger.Logger.Trace("Proxying request to Keto", "api_type", apiType, "original_path", originalPath, "keto_path", ketoPath, "full_url", fullURL)

	// Read the request body
	var bodyBytes []byte
	if ctx.Request.Body != nil {
		bodyBytes, _ = io.ReadAll(ctx.Request.Body)
		ctx.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	}

	// Create the proxy request
	proxyReq, err := http.NewRequest(ctx.Request.Method, fullURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		logger.Logger.Error("Failed to create proxy request", "url", fullURL, "method", ctx.Request.Method, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to create proxy request: %s", err))
		return
	}

	// Copy headers (excluding host and connection headers)
	for key, values := range ctx.Request.Header {
		// Skip hop-by-hop headers
		if strings.ToLower(key) == "host" ||
			strings.ToLower(key) == "connection" ||
			strings.ToLower(key) == "proxy-connection" ||
			strings.ToLower(key) == "te" ||
			strings.ToLower(key) == "trailer" ||
			strings.ToLower(key) == "upgrade" {
			continue
		}
		for _, value := range values {
			proxyReq.Header.Add(key, value)
		}
	}

	// Set content type if body exists
	if len(bodyBytes) > 0 && proxyReq.Header.Get("Content-Type") == "" {
		proxyReq.Header.Set("Content-Type", "application/json")
	}

	// Execute the proxy request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		logger.Logger.Error("Failed to proxy request to Keto", "url", fullURL, "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to proxy request to Keto: %s", err))
		return
	}
	defer resp.Body.Close()

	logger.Logger.Debug("Received response from Keto", "status", resp.StatusCode, "api_type", apiType)

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Logger.Error("Failed to read Keto response", "error", err)
		handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("Failed to read Keto response: %s", err))
		return
	}

	// Copy response headers
	for key, values := range resp.Header {
		for _, value := range values {
			ctx.Header(key, value)
		}
	}

	// Set the status code and return the response
	logger.Logger.Trace("Returning proxied response", "status", resp.StatusCode, "content_length", len(respBody))
	ctx.Status(resp.StatusCode)
	ctx.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
}

// Health check endpoint for permissions service
func (h *PermissionsHandler) Health(ctx *gin.Context) {
	logger.Logger.Debug("Health check started")
	// Check if both Keto APIs are accessible
	readHealth := h.checkHealth(h.readURL + "/health/ready")
	writeHealth := h.checkHealth(h.writeURL + "/health/ready")

	status := "healthy"
	if !readHealth || !writeHealth {
		status = "unhealthy"
		logger.Logger.Warn("Permissions service unhealthy", "read_health", readHealth, "write_health", writeHealth)
	} else {
		logger.Logger.Debug("Permissions service healthy")
	}

	handlers.NewSuccessResponse(ctx, gin.H{
		"status": status,
		"services": gin.H{
			"keto_read":  readHealth,
			"keto_write": writeHealth,
		},
	})
}

// checkHealth performs a health check on the given URL
func (h *PermissionsHandler) checkHealth(url string) bool {
	logger.Logger.Trace("Checking health", "url", url)
	resp, err := http.Get(url)
	if err != nil {
		logger.Logger.Debug("Health check failed", "url", url, "error", err)
		return false
	}
	defer resp.Body.Close()
	healthy := resp.StatusCode == http.StatusOK
	if !healthy {
		logger.Logger.Debug("Health check returned non-OK status", "url", url, "status", resp.StatusCode)
	}
	return healthy
}

// checkPermission checks if a user has a specific permission on a tenant using Keto
func (h *PermissionsHandler) checkPermission(userID, tenantID, relation string) (bool, error) {
	logger.Logger.Debug("Checking permission", "user_id", userID, "tenant_id", tenantID, "relation", relation)
	// Construct Keto check request
	checkURL := h.readURL + "/relation-tuples/check"

	checkRequest := map[string]interface{}{
		"namespace":  "Tenant",
		"object":     tenantID,
		"relation":   relation,
		"subject_id": userID,
	}

	requestBody, err := json.Marshal(checkRequest)
	if err != nil {
		logger.Logger.Error("Failed to marshal check request", "error", err)
		return false, fmt.Errorf("failed to marshal check request: %w", err)
	}

	// Make request to Keto
	req, err := http.NewRequest("POST", checkURL, bytes.NewBuffer(requestBody))
	if err != nil {
		logger.Logger.Error("Failed to create check request", "error", err)
		return false, fmt.Errorf("failed to create check request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		logger.Logger.Error("Failed to execute check request", "error", err)
		return false, fmt.Errorf("failed to execute check request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		logger.Logger.Error("Failed to read check response", "error", err)
		return false, fmt.Errorf("failed to read check response: %w", err)
	}

	// Parse response
	var checkResponse struct {
		Allowed bool `json:"allowed"`
	}

	if err := json.Unmarshal(respBody, &checkResponse); err != nil {
		logger.Logger.Error("Failed to parse check response", "error", err)
		return false, fmt.Errorf("failed to parse check response: %w", err)
	}

	logger.Logger.Debug("Permission check completed", "user_id", userID, "tenant_id", tenantID, "relation", relation, "allowed", checkResponse.Allowed)
	return checkResponse.Allowed, nil
}

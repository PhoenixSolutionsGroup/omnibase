package proxy

import (
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"

	"api/internal/logger"
)

func (h *Handler) ProxyPublic(c *gin.Context) {
	h.doProxy(c, h.publicURL, c.Param("path"))
}

func (h *Handler) ProxyAdmin(c *gin.Context) {
	h.doProxy(c, h.adminURL, c.Param("path"))
}

func (h *Handler) ProxyPublicWithPrefix(prefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h.doProxy(c, h.publicURL, prefix+c.Param("path"))
	}
}

func (h *Handler) doProxy(c *gin.Context, targetURL *url.URL, path string) {
	logger.Logger.Debug("Proxying auth request",
		"target", targetURL.String(),
		"path", path,
		"method", c.Request.Method)

	proxyURL := *targetURL
	proxyURL.Path = path
	proxyURL.RawQuery = c.Request.URL.RawQuery

	req, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, proxyURL.String(), c.Request.Body)
	if err != nil {
		logger.Logger.Error("Failed to create proxy request", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create proxy request"})
		return
	}

	for key, values := range c.Request.Header {
		if shouldForwardHeader(key) {
			for _, value := range values {
				req.Header.Add(key, value)
			}
		}
	}

	req.Header.Set("X-Forwarded-For", c.ClientIP())
	req.Header.Set("X-Forwarded-Proto", c.Request.URL.Scheme)
	if req.Header.Get("X-Forwarded-Proto") == "" {
		if c.Request.TLS != nil {
			req.Header.Set("X-Forwarded-Proto", "https")
		} else {
			req.Header.Set("X-Forwarded-Proto", "http")
		}
	}

	resp, err := h.client.Do(req)
	if err != nil {
		logger.Logger.Error("Proxy request failed", "error", err, "target", proxyURL.String())
		c.JSON(http.StatusBadGateway, gin.H{"error": "Upstream service unavailable"})
		return
	}
	defer resp.Body.Close()

	for key, values := range resp.Header {
		for _, value := range values {
			c.Header(key, rewriteResponseHeader(key, value))
		}
	}

	c.Status(resp.StatusCode)

	if _, err := io.Copy(c.Writer, resp.Body); err != nil {
		logger.Logger.Error("Failed to copy response body", "error", err)
	}

	logger.Logger.Debug("Proxy request completed",
		"target", proxyURL.String(),
		"status", resp.StatusCode)
}

func rewriteResponseHeader(key, value string) string {
	switch strings.ToLower(key) {
	case "location":
		return rewriteLocationHeader(value)
	case "set-cookie":
		return rewriteSetCookieHeader(value)
	}
	return value
}

func rewriteLocationHeader(location string) string {
	locURL, err := url.Parse(location)
	if err != nil {
		logger.Logger.Warn("Failed to parse Location header", "location", location, "error", err)
		return location
	}

	if !isKratosPath(locURL.Path) {
		return location
	}

	rewritten := "/api/v1/auth/proxy" + locURL.Path
	if locURL.RawQuery != "" {
		rewritten += "?" + locURL.RawQuery
	}
	return rewritten
}

func isKratosPath(path string) bool {
	prefixes := []string{"/self-service/", "/sessions/", "/schemas/", "/.well-known/"}
	for _, p := range prefixes {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}

func rewriteSetCookieHeader(cookie string) string {
	parts := strings.Split(cookie, ";")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if strings.HasPrefix(strings.ToLower(trimmed), "domain=") {
			continue
		}
		out = append(out, trimmed)
	}
	return strings.Join(out, "; ")
}

func shouldForwardHeader(header string) bool {
	skip := map[string]bool{
		"connection":          true,
		"keep-alive":          true,
		"proxy-authenticate":  true,
		"proxy-authorization": true,
		"te":                  true,
		"trailers":            true,
		"transfer-encoding":   true,
		"upgrade":             true,
		"x-service-key":       true,
	}
	return !skip[strings.ToLower(header)]
}

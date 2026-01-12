package v1

import (
	"api/internal/config"
	"api/internal/logger"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthProxyHandler struct {
	publicURL *url.URL
	adminURL  *url.URL
	client    *http.Client
}

func NewAuthProxyHandler(cfg *config.Config) *AuthProxyHandler {
	logger.Logger.Info("Initializing AuthProxyHandler",
		"public_url", cfg.AuthConfig.AuthURL,
		"admin_url", cfg.AuthConfig.AuthAdminURL)

	publicURL, err := url.Parse(cfg.AuthConfig.AuthURL)
	if err != nil {
		logger.Logger.Error("Failed to parse auth public URL", "error", err, "url", cfg.AuthConfig.AuthURL)
		panic(err)
	}

	adminURL, err := url.Parse(cfg.AuthConfig.AuthAdminURL)
	if err != nil {
		logger.Logger.Error("Failed to parse auth admin URL", "error", err, "url", cfg.AuthConfig.AuthAdminURL)
		panic(err)
	}

	return &AuthProxyHandler{
		publicURL: publicURL,
		adminURL:  adminURL,
		client: &http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

func (h *AuthProxyHandler) ProxyPublic(c *gin.Context) {
	h.proxy(c, h.publicURL, "")
}

func (h *AuthProxyHandler) ProxyAdmin(c *gin.Context) {
	h.proxy(c, h.adminURL, "")
}

func (h *AuthProxyHandler) ProxyPublicWithPrefix(prefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h.proxyWithPrefix(c, h.publicURL, prefix)
	}
}

func (h *AuthProxyHandler) proxyWithPrefix(c *gin.Context, targetURL *url.URL, prefix string) {
	path := prefix + c.Param("path")
	h.doProxy(c, targetURL, path)
}

func (h *AuthProxyHandler) proxy(c *gin.Context, targetURL *url.URL, stripPrefix string) {
	path := c.Param("path")
	h.doProxy(c, targetURL, path)
}

func (h *AuthProxyHandler) doProxy(c *gin.Context, targetURL *url.URL, path string) {

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
			rewritten := h.rewriteResponseHeader(key, value, targetURL)
			c.Header(key, rewritten)
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

func (h *AuthProxyHandler) rewriteResponseHeader(key, value string, targetURL *url.URL) string {
	headerLower := strings.ToLower(key)

	if headerLower == "location" {
		return h.rewriteLocationHeader(value, targetURL)
	}

	if headerLower == "set-cookie" {
		return h.rewriteSetCookieHeader(value, targetURL)
	}

	return value
}

func (h *AuthProxyHandler) rewriteLocationHeader(location string, targetURL *url.URL) string {
	locURL, err := url.Parse(location)
	if err != nil {
		logger.Logger.Warn("Failed to parse Location header", "location", location, "error", err)
		return location
	}

	if !h.isKratosPath(locURL.Path) {
		return location
	}

	proxyPath := "/api/v1/auth/proxy"
	rewritten := proxyPath + locURL.Path
	if locURL.RawQuery != "" {
		rewritten += "?" + locURL.RawQuery
	}

	logger.Logger.Debug("Rewrote Location header",
		"original", location,
		"rewritten", rewritten)

	return rewritten
}

func (h *AuthProxyHandler) isKratosPath(path string) bool {
	kratosPaths := []string{
		"/self-service/",
		"/sessions/",
		"/schemas/",
		"/.well-known/",
	}

	for _, prefix := range kratosPaths {
		if strings.HasPrefix(path, prefix) {
			return true
		}
	}

	return false
}

func (h *AuthProxyHandler) rewriteSetCookieHeader(cookie string, targetURL *url.URL) string {
	parts := strings.Split(cookie, ";")
	var rewrittenParts []string

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		lowerPart := strings.ToLower(trimmed)

		if strings.HasPrefix(lowerPart, "domain=") {
			continue
		}

		rewrittenParts = append(rewrittenParts, trimmed)
	}

	rewritten := strings.Join(rewrittenParts, "; ")

	if rewritten != cookie {
		logger.Logger.Debug("Rewrote Set-Cookie header",
			"original", cookie,
			"rewritten", rewritten)
	}

	return rewritten
}

func shouldForwardHeader(header string) bool {
	header = strings.ToLower(header)

	skipHeaders := map[string]bool{
		"connection":        true,
		"keep-alive":        true,
		"proxy-authenticate": true,
		"proxy-authorization": true,
		"te":                true,
		"trailers":          true,
		"transfer-encoding": true,
		"upgrade":           true,
		"x-service-key":     true,
	}

	return !skipHeaders[header]
}

package handlers

import (
	"api/internal/config"
	"api/internal/logger"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type HealthHandler struct {
	cfg *config.Config
	db  *gorm.DB
}

func NewHealthHandler(cfg *config.Config, db *gorm.DB) *HealthHandler {
	return &HealthHandler{
		cfg: cfg,
		db:  db,
	}
}

type ServiceHealth struct {
	Ready   bool   `json:"ready"`
	Latency int64  `json:"latency_ms"`
	Error   string `json:"error,omitempty"`
}

type HealthResponse struct {
	Status   string                   `json:"status"`
	Ready    bool                     `json:"ready"`
	Services map[string]ServiceHealth `json:"services"`
}

func (h *HealthHandler) HealthLive(c *gin.Context) {
	logger.Logger.Trace("Health live endpoint called")
	c.JSON(http.StatusOK, gin.H{
		"status": "healthy",
	})
}

func (h *HealthHandler) HealthReady(c *gin.Context) {
	logger.Logger.Debug("Health ready endpoint called")

	services := make(map[string]ServiceHealth)
	allReady := true

	// Check database
	dbHealth := h.checkDatabase()
	services["database"] = dbHealth
	if !dbHealth.Ready {
		allReady = false
	}

	// Check auth service
	authHealth := h.checkHTTPService(h.cfg.AuthConfig.AuthURL, "/health/ready")
	services["auth"] = authHealth
	if !authHealth.Ready {
		allReady = false
	}

	// Check permissions service
	permHealth := h.checkHTTPService(h.cfg.PermissionsConfig.ReadURL, "/health/ready")
	services["permissions"] = permHealth
	if !permHealth.Ready {
		allReady = false
	}

	// Check PostgREST service
	postgrestHealth := h.checkHTTPService(h.cfg.PostgRESTURL, "/")
	services["postgrest"] = postgrestHealth
	if !postgrestHealth.Ready {
		allReady = false
	}

	// Check typegen (postgres-meta) service
	typegenHealth := h.checkHTTPService(h.cfg.TypegenURL, "/health")
	services["typegen"] = typegenHealth
	if !typegenHealth.Ready {
		allReady = false
	}

	status := "ready"
	statusCode := http.StatusOK
	if !allReady {
		status = "not_ready"
		statusCode = http.StatusServiceUnavailable
	}

	c.JSON(statusCode, HealthResponse{
		Status:   status,
		Ready:    allReady,
		Services: services,
	})
}

func (h *HealthHandler) checkDatabase() ServiceHealth {
	start := time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	sqlDB, err := h.db.DB()
	if err != nil {
		latency := time.Since(start).Milliseconds()
		logger.Logger.Warn("Failed to get underlying DB connection", "error", err, "latency_ms", latency)
		return ServiceHealth{
			Ready:   false,
			Latency: latency,
			Error:   err.Error(),
		}
	}

	err = sqlDB.PingContext(ctx)
	latency := time.Since(start).Milliseconds()

	if err != nil {
		logger.Logger.Warn("Database health check failed", "error", err, "latency_ms", latency)
		return ServiceHealth{
			Ready:   false,
			Latency: latency,
			Error:   err.Error(),
		}
	}

	logger.Logger.Trace("Database health check passed", "latency_ms", latency)
	return ServiceHealth{
		Ready:   true,
		Latency: latency,
	}
}

func (h *HealthHandler) checkHTTPService(baseURL string, path string) ServiceHealth {
	if baseURL == "" {
		return ServiceHealth{
			Ready:   false,
			Latency: 0,
			Error:   "service URL not configured",
		}
	}

	start := time.Now()
	url := fmt.Sprintf("%s%s", baseURL, path)

	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get(url)
	latency := time.Since(start).Milliseconds()

	if err != nil {
		logger.Logger.Warn("HTTP service health check failed", "url", url, "error", err, "latency_ms", latency)
		return ServiceHealth{
			Ready:   false,
			Latency: latency,
			Error:   err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		logger.Logger.Warn("HTTP service health check returned non-200", "url", url, "status", resp.StatusCode, "latency_ms", latency)
		return ServiceHealth{
			Ready:   false,
			Latency: latency,
			Error:   fmt.Sprintf("status code %d", resp.StatusCode),
		}
	}

	logger.Logger.Trace("HTTP service health check passed", "url", url, "latency_ms", latency)
	return ServiceHealth{
		Ready:   true,
		Latency: latency,
	}
}

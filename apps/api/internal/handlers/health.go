package handlers

import (
	"api/internal/config"
	"api/internal/logger"
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const healthCheckTimeout = 15 * time.Second

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

	type namedHealth struct {
		name   string
		health ServiceHealth
	}

	checks := []struct {
		name string
		fn   func() ServiceHealth
	}{
		{"database", h.checkDatabase},
		{"auth", func() ServiceHealth {
			return h.checkHTTPService(h.cfg.AuthConfig.AuthURL, "/health/ready", http.StatusOK)
		}},
		{"permissions", func() ServiceHealth {
			return h.checkHTTPService(h.cfg.PermissionsConfig.ReadURL, "/health/ready", http.StatusOK)
		}},
		// PostgREST: a 404 on an unknown table means the process is up with its
		// schema cache loaded. A 503 means no DB connection. Avoid GET "/" which
		// generates the full OpenAPI spec and is slow.
		{"postgrest", func() ServiceHealth {
			return h.checkHTTPService(h.cfg.PostgRESTURL, "/__health_check", http.StatusOK, http.StatusNotFound)
		}},
	}
	if h.cfg.S3Config.Endpoint != "" {
		checks = append(checks, struct {
			name string
			fn   func() ServiceHealth
		}{"storage", h.checkStorage})
	}

	results := make(chan namedHealth, len(checks))
	for _, chk := range checks {
		go func(name string, fn func() ServiceHealth) {
			results <- namedHealth{name: name, health: fn()}
		}(chk.name, chk.fn)
	}

	services := make(map[string]ServiceHealth, len(checks))
	allReady := true
	for range checks {
		r := <-results
		services[r.name] = r.health
		if !r.health.Ready {
			allReady = false
		}
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

	ctx, cancel := context.WithTimeout(context.Background(), healthCheckTimeout)
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

func (h *HealthHandler) checkHTTPService(baseURL string, path string, okStatuses ...int) ServiceHealth {
	if baseURL == "" {
		return ServiceHealth{
			Ready:   false,
			Latency: 0,
			Error:   "service URL not configured",
		}
	}
	if len(okStatuses) == 0 {
		okStatuses = []int{http.StatusOK}
	}

	start := time.Now()
	url := fmt.Sprintf("%s%s", baseURL, path)

	client := &http.Client{
		Timeout: healthCheckTimeout,
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

	for _, ok := range okStatuses {
		if resp.StatusCode == ok {
			logger.Logger.Trace("HTTP service health check passed", "url", url, "status", resp.StatusCode, "latency_ms", latency)
			return ServiceHealth{
				Ready:   true,
				Latency: latency,
			}
		}
	}

	logger.Logger.Warn("HTTP service health check returned unexpected status", "url", url, "status", resp.StatusCode, "latency_ms", latency)
	return ServiceHealth{
		Ready:   false,
		Latency: latency,
		Error:   fmt.Sprintf("status code %d", resp.StatusCode),
	}
}

func (h *HealthHandler) checkStorage() ServiceHealth {
	start := time.Now()
	s3cfg := h.cfg.S3Config

	// R2 ignores region but the SDK needs one set; an empty region makes it try
	// EC2 IMDS for a region lookup, which hangs off-EC2. Default to "auto".
	region := s3cfg.Region
	if region == "" {
		region = "auto"
	}

	awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			s3cfg.AccessKey, s3cfg.SecretKey, "")),
	)
	if err != nil {
		latency := time.Since(start).Milliseconds()
		logger.Logger.Warn("Storage health check failed to load AWS config", "error", err, "latency_ms", latency)
		return ServiceHealth{Ready: false, Latency: latency, Error: err.Error()}
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		if s3cfg.Endpoint != "" {
			o.BaseEndpoint = aws.String(s3cfg.Endpoint)
		}
		o.UsePathStyle = s3cfg.ForcePathStyle
	})

	ctx, cancel := context.WithTimeout(context.Background(), healthCheckTimeout)
	defer cancel()

	_, err = client.HeadBucket(ctx, &s3.HeadBucketInput{Bucket: aws.String(s3cfg.BucketName)})
	latency := time.Since(start).Milliseconds()

	if err != nil {
		logger.Logger.Warn("Storage health check failed", "bucket", s3cfg.BucketName, "error", err, "latency_ms", latency)
		return ServiceHealth{Ready: false, Latency: latency, Error: err.Error()}
	}

	logger.Logger.Trace("Storage health check passed", "bucket", s3cfg.BucketName, "latency_ms", latency)
	return ServiceHealth{Ready: true, Latency: latency}
}

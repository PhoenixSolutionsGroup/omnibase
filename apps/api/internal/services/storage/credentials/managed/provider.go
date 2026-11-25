package managed

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"

	"api/internal/config"
	"api/internal/logger"
)

var (
	MissingConfigError = errors.New("managed storage credentials are not configured")
	MintError          = errors.New("managed hosting credential mint failed")
)

type Provider struct {
	baseURL    string
	branchKey  string
	branchID   string
	httpClient *http.Client
}

func New(cfg *config.ManagedHostingConfig) (*Provider, error) {
	if cfg.ManagedHostingAPIURL == "" {
		return nil, fmt.Errorf("%w: MANAGED_HOSTING_API_URL is empty", MissingConfigError)
	}
	if cfg.InternalServiceToken == "" {
		return nil, fmt.Errorf("%w: INTERNAL_SERVICE_TOKEN is empty", MissingConfigError)
	}
	if cfg.BranchID == "" {
		return nil, fmt.Errorf("%w: MANAGED_BRANCH_ID is empty", MissingConfigError)
	}

	return &Provider{
		baseURL:   cfg.ManagedHostingAPIURL,
		branchKey: cfg.InternalServiceToken,
		branchID:  cfg.BranchID,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}, nil
}

type tempCredentialsResponse struct {
	AccessKey    string    `json:"access_key"`
	SecretKey    string    `json:"secret_key"`
	SessionToken string    `json:"session_token"`
	Expiration   time.Time `json:"expiration"`
}

func (p *Provider) Retrieve(ctx context.Context) (aws.Credentials, error) {
	logger.Logger.Debug("storage.credentials.managed.mint", "branch_id", p.branchID)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, p.baseURL+"/api/v1/storage/temp-credentials", bytes.NewReader(nil))
	if err != nil {
		return aws.Credentials{}, fmt.Errorf("%w: %w", MintError, err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", p.branchKey)
	req.Header.Set("X-Branch-Id", p.branchID)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return aws.Credentials{}, fmt.Errorf("%w: %w", MintError, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return aws.Credentials{}, fmt.Errorf("%w: status %d: %s", MintError, resp.StatusCode, bytes.TrimSpace(body))
	}

	var parsed tempCredentialsResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return aws.Credentials{}, fmt.Errorf("%w: decode response: %w", MintError, err)
	}
	if parsed.AccessKey == "" || parsed.SecretKey == "" || parsed.Expiration.IsZero() {
		return aws.Credentials{}, fmt.Errorf("%w: incomplete response", MintError)
	}

	return aws.Credentials{
		AccessKeyID:     parsed.AccessKey,
		SecretAccessKey: parsed.SecretKey,
		SessionToken:    parsed.SessionToken,
		CanExpire:       true,
		Expires:         parsed.Expiration,
	}, nil
}

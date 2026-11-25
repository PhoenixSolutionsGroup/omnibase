package storage

import (
	"context"
	"time"

	"github.com/danielgtaylor/huma/v2"
)

type GetStorageCredentialsResponse struct {
	AccessKey    string     `json:"access_key" example:"..." doc:"S3 access key ID."`
	SecretKey    string     `json:"secret_key" example:"..." doc:"S3 secret access key."`
	SessionToken string     `json:"session_token,omitempty" example:"jwt/..." doc:"Session token required with temporary credentials."`
	Expiration   *time.Time `json:"expiration,omitempty" doc:"Credential expiration time."`
	BucketName   string     `json:"bucket_name" example:"project-branch"`
	Endpoint     string     `json:"endpoint" example:"https://account.r2.cloudflarestorage.com"`
	Region       string     `json:"region" example:"auto"`
}

type GetStorageCredentialsInput struct{}

type GetStorageCredentialsOutput struct {
	CacheControl string `header:"Cache-Control"`
	Body         GetStorageCredentialsResponse
}

func (h *Handler) GetCredentials(ctx context.Context, _ *GetStorageCredentialsInput) (*GetStorageCredentialsOutput, error) {
	creds, err := h.credentials.Get(ctx)
	if err != nil {
		return nil, huma.Error503ServiceUnavailable("storage credentials unavailable")
	}

	resp := GetStorageCredentialsResponse{
		AccessKey:    creds.AccessKey,
		SecretKey:    creds.SecretKey,
		SessionToken: creds.SessionToken,
		BucketName:   creds.BucketName,
		Endpoint:     creds.Endpoint,
		Region:       creds.Region,
	}
	if !creds.Expiration.IsZero() {
		expiration := creds.Expiration
		resp.Expiration = &expiration
	}

	return &GetStorageCredentialsOutput{
		CacheControl: "no-store",
		Body:         resp,
	}, nil
}

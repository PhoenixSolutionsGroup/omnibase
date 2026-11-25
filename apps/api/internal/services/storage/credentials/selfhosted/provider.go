package selfhosted

import (
	"context"
	"errors"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"

	"api/internal/config"
)

var MissingCredentialsError = errors.New("static S3 credentials are not configured")

type Provider struct {
	accessKey string
	secretKey string
}

func New(cfg config.S3Config) *Provider {
	return &Provider{
		accessKey: cfg.AccessKey,
		secretKey: cfg.SecretKey,
	}
}

func (p *Provider) Retrieve(_ context.Context) (aws.Credentials, error) {
	if p.accessKey == "" || p.secretKey == "" {
		return aws.Credentials{}, fmt.Errorf("%w: S3_ACCESS_KEY and S3_SECRET_KEY are empty", MissingCredentialsError)
	}

	return aws.Credentials{
		AccessKeyID:     p.accessKey,
		SecretAccessKey: p.secretKey,
	}, nil
}

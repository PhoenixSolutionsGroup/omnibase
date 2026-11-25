package credentials

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
)

type Credentials struct {
	AccessKey    string
	SecretKey    string
	SessionToken string
	Expiration   time.Time
	BucketName   string
	Endpoint     string
	Region       string
}

type Provider interface {
	Retrieve(ctx context.Context) (aws.Credentials, error)
}

type Options struct {
	ExpiryWindow time.Duration
}

type Service struct {
	cache    *aws.CredentialsCache
	bucket   string
	endpoint string
	region   string
}

func NewService(provider Provider, bucket, endpoint, region string, opts Options) *Service {
	cacheOpts := []func(*aws.CredentialsCacheOptions){}
	if opts.ExpiryWindow > 0 {
		cacheOpts = append(cacheOpts, func(o *aws.CredentialsCacheOptions) {
			o.ExpiryWindow = opts.ExpiryWindow
		})
	}

	return &Service{
		cache:    aws.NewCredentialsCache(provider, cacheOpts...),
		bucket:   bucket,
		endpoint: endpoint,
		region:   region,
	}
}

func (s *Service) Retrieve(ctx context.Context) (aws.Credentials, error) {
	return s.cache.Retrieve(ctx)
}

func (s *Service) Get(ctx context.Context) (Credentials, error) {
	creds, err := s.cache.Retrieve(ctx)
	if err != nil {
		return Credentials{}, err
	}

	return Credentials{
		AccessKey:    creds.AccessKeyID,
		SecretKey:    creds.SecretAccessKey,
		SessionToken: creds.SessionToken,
		Expiration:   creds.Expires,
		BucketName:   s.bucket,
		Endpoint:     s.endpoint,
		Region:       s.region,
	}, nil
}

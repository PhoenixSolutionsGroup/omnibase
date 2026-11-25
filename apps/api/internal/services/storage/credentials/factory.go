package credentials

import (
	"time"

	"api/internal/config"

	"api/internal/services/storage/credentials/managed"
	"api/internal/services/storage/credentials/selfhosted"
)

const defaultExpiryWindow = 20 * time.Minute

func New(cfg *config.Config) (*Service, error) {
	var provider Provider

	if cfg.ManagedHostingConfig.IsManaged {
		managedProvider, err := managed.New(&cfg.ManagedHostingConfig)
		if err != nil {
			return nil, err
		}
		provider = managedProvider
	} else {
		provider = selfhosted.New(cfg.S3Config)
	}

	region := cfg.S3Config.Region
	if region == "" {
		region = "auto"
	}

	return NewService(provider, cfg.S3Config.BucketName, cfg.S3Config.Endpoint, region, Options{
		ExpiryWindow: defaultExpiryWindow,
	}), nil
}

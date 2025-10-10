package omnibase

import (
	"github.com/omnibase/core-go/storage"
)

// Client is the main entry point for the Omnibase SDK
type OmnibaseClient struct {
	config *Config

	// Storage provides access to storage operations
	Storage *storage.OmnibaseStorageClient
}

// NewClient creates a new Omnibase client with the given API URL and options
func NewClient(cfg *Config) (*OmnibaseClient, error) {
	return &OmnibaseClient{
		config: cfg,
		Storage: storage.NewClient(&storage.Config{
			API_URL: cfg.API_URL,
		}),
	}, nil
}

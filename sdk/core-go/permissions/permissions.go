package permissions

import (
	"net/http"

	keto "github.com/ory/keto-client-go"
)

// Config holds the configuration needed by the permissions client
type Config struct {
	API_URL      string
	SessionToken string
}

// OmnibasePermissionsClient provides access to Ory Keto permissions and relationships
//
// This client wraps the Ory Keto Go SDK and configures it to use Omnibase's
// permission proxy endpoints for both read and write operations.
//
// Example:
//
//	client := permissions.NewClient(&permissions.Config{
//	    API_URL: "https://api.example.com",
//	})
//
//	// Check a permission
//	result, _, err := client.Permissions.CheckPermission(ctx).
//	    Namespace("Tenant").
//	    Object("tenant_123").
//	    Relation("view").
//	    SubjectId("user_456").
//	    Execute()
type OmnibasePermissionsClient struct {
	config *Config

	// Permissions provides methods for checking permissions
	// Uses the read endpoint at /api/v1/permissions/read
	Permissions keto.PermissionApi

	// Relationships provides methods for managing relationships
	// Uses the write endpoint at /api/v1/permissions/write
	Relationships keto.RelationshipApi
}

// NewClient creates a new permissions client
//
// The client automatically configures separate endpoints for read and write operations:
// - Read operations (permission checks): ${API_URL}/api/v1/permissions/read
// - Write operations (relationship management): ${API_URL}/api/v1/permissions/write
//
// This separation follows Ory Keto's recommended architecture for optimal
// performance and security.
//
// Example:
//
//	client := permissions.NewClient(&permissions.Config{
//	    API_URL: "https://api.example.com",
//	})
func NewClient(cfg *Config) *OmnibasePermissionsClient {
	// Configure the read endpoint for permission checks
	readConfig := keto.NewConfiguration()
	readConfig.Servers = keto.ServerConfigurations{
		keto.ServerConfiguration{
			URL: cfg.API_URL + "/api/v1/permissions/read",
		},
	}

	// Configure the write endpoint for relationship management
	writeConfig := keto.NewConfiguration()
	writeConfig.Servers = keto.ServerConfigurations{
		keto.ServerConfiguration{
			URL: cfg.API_URL + "/api/v1/permissions/write",
		},
	}

	if cfg.SessionToken != "" {
		writeConfig.HTTPClient = &http.Client{
			Transport: &sessionTransport{
				base:         http.DefaultTransport,
				sessionToken: cfg.SessionToken,
			},
		}
	}

	return &OmnibasePermissionsClient{
		config:        cfg,
		Permissions:   keto.NewAPIClient(readConfig).PermissionApi,
		Relationships: keto.NewAPIClient(writeConfig).RelationshipApi,
	}
}

type sessionTransport struct {
	base         http.RoundTripper
	sessionToken string
}

func (t *sessionTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("X-Session-Token", t.sessionToken)
	return t.base.RoundTrip(req)
}

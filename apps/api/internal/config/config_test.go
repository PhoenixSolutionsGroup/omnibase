package config

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestValidateRequiresCORSOrigins(t *testing.T) {
	cfg := &Config{APIServiceKey: "secret"}

	err := cfg.Validate()

	require.EqualError(t, err, "CORS_ALLOWED_ORIGINS environment variable must be set")
}

func TestValidateRequiresServiceKey(t *testing.T) {
	for _, key := range []string{"", "   "} {
		t.Run("key="+key, func(t *testing.T) {
			cfg := &Config{
				CORSAllowedOrigins: []string{"https://example.com"},
				APIServiceKey:      key,
			}

			err := cfg.Validate()

			require.EqualError(t, err, "API_SERVICE_KEY environment variable must be set")
		})
	}
}

func TestValidateRejectsComposeDefaultSecretOutsideLocal(t *testing.T) {
	cfg := &Config{
		Environment:        "production",
		CORSAllowedOrigins: []string{"https://example.com"},
		APIServiceKey:      defaultComposeSecret,
	}

	err := cfg.Validate()

	require.ErrorContains(t, err, "compose default")
}

func TestValidateAllowsComposeDefaultSecretLocally(t *testing.T) {
	for _, environment := range []string{"local", "development", "dev", "test"} {
		t.Run(environment, func(t *testing.T) {
			cfg := &Config{
				Environment:        environment,
				CORSAllowedOrigins: []string{"https://example.com"},
				APIServiceKey:      defaultComposeSecret,
			}

			require.NoError(t, cfg.Validate())
		})
	}
}

func TestValidateAllowsConfiguredOriginsAndSecret(t *testing.T) {
	cfg := &Config{
		Environment:        "production",
		CORSAllowedOrigins: []string{"https://example.com"},
		APIServiceKey:      "a-real-secret",
	}

	require.NoError(t, cfg.Validate())
}

func TestValidateAllowsWildcardCORS(t *testing.T) {
	cfg := &Config{
		Environment:        "production",
		CORSAllowedOrigins: []string{"*"},
		APIServiceKey:      "a-real-secret",
	}

	require.NoError(t, cfg.Validate())
}

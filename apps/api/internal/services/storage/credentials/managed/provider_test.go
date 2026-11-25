package managed

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"api/internal/config"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNew_RequiresManagedConfig(t *testing.T) {
	_, err := New(&config.ManagedHostingConfig{})
	assert.ErrorIs(t, err, MissingConfigError)
}

func TestRetrieve(t *testing.T) {
	expiration := time.Now().Add(time.Hour).UTC().Truncate(time.Second)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, http.MethodPost, r.Method)
		assert.Equal(t, "/api/v1/storage/temp-credentials", r.URL.Path)
		assert.Equal(t, "branch-key", r.Header.Get("X-API-Key"))
		assert.Equal(t, "branch-id", r.Header.Get("X-Branch-Id"))

		w.Header().Set("Content-Type", "application/json")
		require.NoError(t, json.NewEncoder(w).Encode(tempCredentialsResponse{
			AccessKey:    "access",
			SecretKey:    "secret",
			SessionToken: "session",
			Expiration:   expiration,
		}))
	}))
	defer server.Close()

	provider, err := New(&config.ManagedHostingConfig{
		ManagedHostingAPIURL: server.URL,
		InternalServiceToken: "branch-key",
		BranchID:             "branch-id",
	})
	require.NoError(t, err)

	creds, err := provider.Retrieve(context.Background())
	require.NoError(t, err)
	assert.Equal(t, "access", creds.AccessKeyID)
	assert.Equal(t, "secret", creds.SecretAccessKey)
	assert.Equal(t, "session", creds.SessionToken)
	assert.True(t, creds.CanExpire)
	assert.Equal(t, expiration, creds.Expires)
}

func TestRetrieve_NonOK(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "nope", http.StatusInternalServerError)
	}))
	defer server.Close()

	provider, err := New(&config.ManagedHostingConfig{
		ManagedHostingAPIURL: server.URL,
		InternalServiceToken: "branch-key",
		BranchID:             "branch-id",
	})
	require.NoError(t, err)

	_, err = provider.Retrieve(context.Background())
	assert.ErrorIs(t, err, MintError)
}

func TestRetrieve_IncompleteResponse(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		require.NoError(t, json.NewEncoder(w).Encode(tempCredentialsResponse{AccessKey: "access"}))
	}))
	defer server.Close()

	provider, err := New(&config.ManagedHostingConfig{
		ManagedHostingAPIURL: server.URL,
		InternalServiceToken: "branch-key",
		BranchID:             "branch-id",
	})
	require.NoError(t, err)

	_, err = provider.Retrieve(context.Background())
	assert.ErrorIs(t, err, MintError)
}

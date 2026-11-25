package selfhosted

import (
	"context"
	"testing"

	"api/internal/config"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRetrieve(t *testing.T) {
	provider := New(config.S3Config{AccessKey: "access", SecretKey: "secret"})

	creds, err := provider.Retrieve(context.Background())
	require.NoError(t, err)
	assert.Equal(t, "access", creds.AccessKeyID)
	assert.Equal(t, "secret", creds.SecretAccessKey)
	assert.False(t, creds.CanExpire)
}

func TestRetrieve_MissingCredentials(t *testing.T) {
	provider := New(config.S3Config{})

	_, err := provider.Retrieve(context.Background())
	assert.ErrorIs(t, err, MissingCredentialsError)
}

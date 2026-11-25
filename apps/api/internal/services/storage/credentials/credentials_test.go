package credentials

import (
	"context"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type fakeProvider struct {
	creds aws.Credentials
	calls int
}

func (f *fakeProvider) Retrieve(_ context.Context) (aws.Credentials, error) {
	f.calls++
	return f.creds, nil
}

func TestService_CachesCredentials(t *testing.T) {
	provider := &fakeProvider{creds: aws.Credentials{
		AccessKeyID:     "access",
		SecretAccessKey: "secret",
		SessionToken:    "session",
		CanExpire:       true,
		Expires:         time.Now().Add(time.Hour),
	}}
	service := NewService(provider, "bucket", "endpoint", "auto", Options{})

	creds, err := service.Get(context.Background())
	require.NoError(t, err)
	assert.Equal(t, "access", creds.AccessKey)
	assert.Equal(t, "secret", creds.SecretKey)
	assert.Equal(t, "session", creds.SessionToken)
	assert.Equal(t, "bucket", creds.BucketName)
	assert.Equal(t, "endpoint", creds.Endpoint)
	assert.Equal(t, "auto", creds.Region)

	_, err = service.Get(context.Background())
	require.NoError(t, err)
	assert.Equal(t, 1, provider.calls)
}

func TestService_StaticCredentialsDoNotExpire(t *testing.T) {
	provider := &fakeProvider{creds: aws.Credentials{
		AccessKeyID:     "access",
		SecretAccessKey: "secret",
	}}
	service := NewService(provider, "bucket", "endpoint", "auto", Options{})

	creds, err := service.Get(context.Background())
	require.NoError(t, err)
	assert.True(t, creds.Expiration.IsZero())
}

package invites

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateInviteURL(t *testing.T) {
	allowed := []string{"https://app.example.com", "http://127.0.0.1:3000/"}

	t.Run("allows origin with path", func(t *testing.T) {
		assert.NoError(t, validateInviteURL("https://app.example.com/accept-invite", allowed))
	})

	t.Run("allows allowed origin with port and trailing slash", func(t *testing.T) {
		assert.NoError(t, validateInviteURL("http://127.0.0.1:3000/accept-invite", allowed))
	})

	t.Run("allows scheme and host case differences", func(t *testing.T) {
		assert.NoError(t, validateInviteURL("HTTPS://APP.EXAMPLE.COM/accept-invite", allowed))
	})

	t.Run("rejects unlisted origin", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("https://evil.example.com/accept-invite", allowed), InvalidInviteURLError)
	})

	t.Run("rejects different port", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("https://app.example.com:8443/accept-invite", allowed), InvalidInviteURLError)
	})

	t.Run("rejects non-http scheme", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("javascript://app.example.com/accept-invite", allowed), InvalidInviteURLError)
	})

	t.Run("rejects relative url", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("/accept-invite", allowed), InvalidInviteURLError)
	})

	t.Run("rejects when allowlist is empty", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("https://app.example.com/accept-invite", nil), InvalidInviteURLError)
	})

	t.Run("does not treat wildcard as allow-all", func(t *testing.T) {
		assert.ErrorIs(t, validateInviteURL("https://app.example.com/accept-invite", []string{"*"}), InvalidInviteURLError)
	})
}

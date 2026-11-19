package rest

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/authn"
)

func testHandler(t *testing.T, upstream string) *Handler {
	t.Helper()
	h := New(Deps{PostgRESTURL: upstream, SigningKey: "test-signing-key"})
	h.now = func() time.Time { return time.Now().Truncate(time.Second) }
	return h
}

func parseClaims(t *testing.T, token string) Claims {
	t.Helper()
	var claims Claims
	parsed, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (any, error) {
		return []byte("test-signing-key"), nil
	})
	require.NoError(t, err)
	require.True(t, parsed.Valid)
	return claims
}

func TestMintToken_Claims(t *testing.T) {
	h := testHandler(t, "http://127.0.0.1:1")
	user := uuid.New()
	tenant := uuid.New()

	t.Run("no principal is anonymous", func(t *testing.T) {
		token, err := h.mintToken(nil)
		require.NoError(t, err)
		assert.Empty(t, token)
	})

	t.Run("service key is super_user", func(t *testing.T) {
		token, err := h.mintToken(&authn.Principal{Method: authn.AuthServiceKey, UserID: user, TenantID: tenant})
		require.NoError(t, err)
		claims := parseClaims(t, token)
		assert.Equal(t, ServiceRole, claims.Role)
		assert.Equal(t, user.String(), claims.UserID)
		assert.Equal(t, tenant.String(), claims.TenantID)
	})

	t.Run("session is authenticated", func(t *testing.T) {
		token, err := h.mintToken(&authn.Principal{Method: authn.AuthSession, UserID: user, TenantID: tenant})
		require.NoError(t, err)
		claims := parseClaims(t, token)
		assert.Equal(t, AuthenticatedRole, claims.Role)
		assert.Equal(t, user.String(), claims.UserID)
		assert.Equal(t, tenant.String(), claims.TenantID)
		assert.WithinDuration(t, time.Now().Add(TokenTTL), claims.ExpiresAt.Time, 2*time.Second)
	})

	t.Run("app key is authenticated", func(t *testing.T) {
		token, err := h.mintToken(&authn.Principal{Method: authn.AuthAppKey, UserID: user, TenantID: tenant})
		require.NoError(t, err)
		assert.Equal(t, AuthenticatedRole, parseClaims(t, token).Role)
	})
}

func TestProxy_StripsClientCredentials(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]string{
			"path":          r.URL.Path,
			"authorization": r.Header.Get("Authorization"),
			"cookie":        r.Header.Get("Cookie"),
			"session":       r.Header.Get("X-Session-Token"),
			"apikey":        r.Header.Get("apikey"),
			"prefer":        r.Header.Get("Prefer"),
		})
	}))
	defer upstream.Close()

	h := testHandler(t, upstream.URL)
	user := uuid.New()

	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Any("/api/v1/rest/*path", func(c *gin.Context) {
		authn.Set(c, &authn.Principal{Method: authn.AuthSession, UserID: user})
		h.Proxy(c)
	})
	gateway := httptest.NewServer(r)
	defer gateway.Close()

	req, err := http.NewRequest(http.MethodGet, gateway.URL+"/api/v1/rest/users?select=id", nil)
	require.NoError(t, err)
	req.Header.Set("Authorization", "Bearer attacker")
	req.Header.Set("Cookie", "ory_kratos_session=secret")
	req.Header.Set("X-Session-Token", "secret")
	req.Header.Set("apikey", "anon-key")
	req.Header.Set("Prefer", "return=representation")
	resp, err := gateway.Client().Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode)
	var got map[string]string
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&got))
	assert.Equal(t, "/users", got["path"])
	assert.Empty(t, got["cookie"])
	assert.Empty(t, got["session"])
	assert.Empty(t, got["apikey"])
	assert.Equal(t, "return=representation", got["prefer"])
	assert.True(t, jwtHasRole(t, got["authorization"], AuthenticatedRole))
}

func jwtHasRole(t *testing.T, header, role string) bool {
	t.Helper()
	token, ok := strings.CutPrefix(header, "Bearer ")
	require.True(t, ok, "authorization header missing bearer token")
	require.NotEmpty(t, token)
	return parseClaims(t, token).Role == role
}

type stubTransport struct {
	calls int
	resp  func(int) *http.Response
	err   error
}

func (s *stubTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	s.calls++
	if s.err != nil {
		return nil, s.err
	}
	return s.resp(s.calls), nil
}

func TestRetryTransport_RetriesServiceUnavailable(t *testing.T) {
	stub := &stubTransport{resp: func(call int) *http.Response {
		if call < 3 {
			return &http.Response{StatusCode: http.StatusServiceUnavailable, Body: http.NoBody, Header: http.Header{}}
		}
		return &http.Response{StatusCode: http.StatusOK, Body: http.NoBody, Header: http.Header{}}
	}}
	rt := &retryTransport{base: stub, retry: retryConfig{delays: []time.Duration{0, 0, 0}}}

	req := httptest.NewRequest(http.MethodGet, "http://postgrest/users", nil)
	resp, err := rt.RoundTrip(req)
	require.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, 3, stub.calls)
}

func TestRetryTransport_DoesNotRetryWritesWithBodies(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "http://postgrest/users", http.NoBody)
	req.Body = http.NoBody
	assert.False(t, canRetry(req))

	get := httptest.NewRequest(http.MethodGet, "http://postgrest/users", nil)
	assert.True(t, canRetry(get))
}

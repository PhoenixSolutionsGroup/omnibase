package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"api/internal/authn"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	kratos "github.com/ory/kratos-client-go"
	"github.com/stretchr/testify/require"
)

func newTestKratosClient(t *testing.T, handler http.HandlerFunc) *kratos.APIClient {
	t.Helper()

	server := httptest.NewServer(handler)
	t.Cleanup(server.Close)

	cfg := kratos.NewConfiguration()
	cfg.Servers = []kratos.ServerConfiguration{{URL: server.URL}}
	return kratos.NewAPIClient(cfg)
}

func writeKratosSession(t *testing.T, w http.ResponseWriter, userID uuid.UUID) {
	t.Helper()

	w.Header().Set("Content-Type", "application/json")
	require.NoError(t, json.NewEncoder(w).Encode(map[string]any{
		"id":     "session_1",
		"active": true,
		"identity": map[string]any{
			"id":         userID.String(),
			"schema_id":  "default",
			"schema_url": "http://localhost/schemas/default",
			"traits":     map[string]any{},
		},
	}))
}

func runSessionAuth(t *testing.T, m *AuthMiddleware, headers map[string]string) (int, *authn.Principal) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	r := gin.New()

	var principal *authn.Principal
	r.GET("/", m.RequireAuth(authn.AuthSession), func(c *gin.Context) {
		principal, _ = authn.Get(c)
		c.Status(http.StatusNoContent)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	recorder := httptest.NewRecorder()
	r.ServeHTTP(recorder, req)

	return recorder.Code, principal
}

func TestRequireAuth_ValidatesOmnibaseSessionTokenCookie(t *testing.T) {
	userID := uuid.New()
	var gotToken, gotCookie string

	m := &AuthMiddleware{
		kratosClient: newTestKratosClient(t, func(w http.ResponseWriter, r *http.Request) {
			gotToken = r.Header.Get("X-Session-Token")
			gotCookie = r.Header.Get("Cookie")
			writeKratosSession(t, w, userID)
		}),
		activeTenant: func(context.Context, uuid.UUID) (activeTenant, error) {
			return activeTenant{}, nil
		},
	}

	code, principal := runSessionAuth(t, m, map[string]string{
		"Cookie": "omnibase_session_token=ory_st_cookie",
	})

	require.Equal(t, http.StatusNoContent, code)
	require.Equal(t, "ory_st_cookie", gotToken)
	require.Empty(t, gotCookie)
	require.NotNil(t, principal)
	require.Equal(t, authn.AuthSession, principal.Method)
	require.Equal(t, userID, principal.UserID)
}

func TestRequireAuth_RejectsKratosSessionCookie(t *testing.T) {
	kratosHits := 0

	m := &AuthMiddleware{
		kratosClient: newTestKratosClient(t, func(w http.ResponseWriter, r *http.Request) {
			kratosHits++
			writeKratosSession(t, w, uuid.New())
		}),
		activeTenant: func(context.Context, uuid.UUID) (activeTenant, error) {
			return activeTenant{}, nil
		},
	}

	code, principal := runSessionAuth(t, m, map[string]string{
		"Cookie": "ory_kratos_session=kratos_cookie",
	})

	require.Equal(t, http.StatusUnauthorized, code)
	require.Nil(t, principal)
	require.Zero(t, kratosHits)
}

func TestRequireAuth_SessionTokenHeaderWinsOverCookie(t *testing.T) {
	userID := uuid.New()
	var gotToken string

	m := &AuthMiddleware{
		kratosClient: newTestKratosClient(t, func(w http.ResponseWriter, r *http.Request) {
			gotToken = r.Header.Get("X-Session-Token")
			writeKratosSession(t, w, userID)
		}),
		activeTenant: func(context.Context, uuid.UUID) (activeTenant, error) {
			return activeTenant{}, nil
		},
	}

	code, _ := runSessionAuth(t, m, map[string]string{
		"X-Session-Token": "ory_st_header",
		"Cookie":          "omnibase_session_token=ory_st_cookie",
	})

	require.Equal(t, http.StatusNoContent, code)
	require.Equal(t, "ory_st_header", gotToken)
}

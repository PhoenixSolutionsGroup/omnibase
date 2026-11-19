package v1

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/config"
	"api/internal/middleware"
)

func TestSetUpRestRoutes_RegistersBareAndWildcardPaths(t *testing.T) {
	gin.SetMode(gin.TestMode)

	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer upstream.Close()

	cfg := &config.Config{PostgRESTURL: upstream.URL}
	d := Deps{Cfg: cfg, Auth: middleware.NewAuthMiddleware(cfg, nil, nil)}

	r := gin.New()
	SetUpRestRoutes(r.Group("/api/v1/rest"), d)

	gateway := httptest.NewServer(r)
	defer gateway.Close()

	for _, path := range []string{"/api/v1/rest", "/api/v1/rest/", "/api/v1/rest/users"} {
		resp, err := gateway.Client().Get(gateway.URL + path)
		require.NoError(t, err)
		resp.Body.Close()
		assert.Equal(t, http.StatusOK, resp.StatusCode, path)
	}
}

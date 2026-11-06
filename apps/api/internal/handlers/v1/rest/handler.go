package rest

import (
	"context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"api/internal/logger"
)

const (
	AnonRole    = "anon_user"
	ServiceRole = "super_user"
	TokenTTL    = 60 * time.Second
)

type Handler struct {
	proxy      *httputil.ReverseProxy
	signingKey []byte
	tenantRole func(context.Context, uuid.UUID, uuid.UUID) (string, error)
	now        func() time.Time
}

type Deps struct {
	PostgRESTURL string
	SigningKey   string
	DB           *gorm.DB
}

func New(deps Deps) *Handler {
	target, err := url.Parse(deps.PostgRESTURL)
	if err != nil {
		logger.Logger.Error("Failed to parse PostgREST URL", "error", err, "url", deps.PostgRESTURL)
		panic(err)
	}

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConnsPerHost = 256

	h := &Handler{
		signingKey: []byte(deps.SigningKey),
		now:        time.Now,
	}
	h.tenantRole = func(ctx context.Context, userID, tenantID uuid.UUID) (string, error) {
		var role string
		err := deps.DB.WithContext(ctx).Table("auth.tenant_users").
			Select("role").
			Where("user_id = ? AND tenant_id = ? AND is_active = true", userID, tenantID).
			Limit(1).
			Scan(&role).Error
		return role, err
	}
	h.proxy = &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(target)
			r.Out.URL.Path = r.In.URL.Path
			r.Out.URL.RawPath = r.In.URL.RawPath
			r.SetXForwarded()
		},
		Transport: transport,
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.Logger.Error("PostgREST proxy request failed", "error", err, "path", r.URL.Path)
			w.WriteHeader(http.StatusBadGateway)
		},
	}
	return h
}

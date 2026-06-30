package proxy

import (
	"net/http"
	"net/url"

	"api/internal/logger"
)

type Handler struct {
	publicURL *url.URL
	adminURL  *url.URL
	client    *http.Client
}

type Deps struct {
	PublicURL string
	AdminURL  string
}

func New(deps Deps) *Handler {
	publicURL, err := url.Parse(deps.PublicURL)
	if err != nil {
		logger.Logger.Error("Failed to parse auth public URL", "error", err, "url", deps.PublicURL)
		panic(err)
	}

	adminURL, err := url.Parse(deps.AdminURL)
	if err != nil {
		logger.Logger.Error("Failed to parse auth admin URL", "error", err, "url", deps.AdminURL)
		panic(err)
	}

	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	return &Handler{
		publicURL: publicURL,
		adminURL:  adminURL,
		client:    client,
	}
}

package rest

import (
	"context"
	"io"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"api/internal/logger"
)

const (
	ServiceRole       = "super_user"
	AuthenticatedRole = "authenticated"
	TokenTTL          = 60 * time.Second
)

type Handler struct {
	proxy      *httputil.ReverseProxy
	signingKey []byte
	now        func() time.Time
}

type Deps struct {
	PostgRESTURL string
	SigningKey   string
}

func New(deps Deps) *Handler {
	target, err := url.Parse(deps.PostgRESTURL)
	if err != nil {
		logger.Logger.Error("Failed to parse PostgREST URL", "error", err, "url", deps.PostgRESTURL)
		panic(err)
	}

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.MaxIdleConns = 256
	transport.MaxIdleConnsPerHost = 256

	h := &Handler{
		signingKey: []byte(deps.SigningKey),
		now:        time.Now,
	}
	h.proxy = &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(target)
			r.Out.Host = r.In.Host
			r.Out.URL.Path = r.In.URL.Path
			r.Out.URL.RawPath = ""
		},
		Transport:     &retryTransport{base: transport},
		FlushInterval: -1,
		ModifyResponse: func(resp *http.Response) error {
			for key := range resp.Header {
				if strings.HasPrefix(strings.ToLower(key), "access-control-") {
					resp.Header.Del(key)
				}
			}
			return nil
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.Logger.Error("PostgREST proxy request failed", "error", err, "path", r.URL.Path)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte(`{"error":"PostgREST unavailable"}`))
		},
	}
	return h
}

type retryConfig struct {
	delays []time.Duration
}

var defaultRetry = retryConfig{
	delays: []time.Duration{
		50 * time.Millisecond,
		100 * time.Millisecond,
		200 * time.Millisecond,
		400 * time.Millisecond,
		800 * time.Millisecond,
		1500 * time.Millisecond,
	},
}

type retryTransport struct {
	base  http.RoundTripper
	retry retryConfig
}

func (t *retryTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	if !canRetry(req) {
		return t.base.RoundTrip(req)
	}

	delays := t.retry.delays
	if len(delays) == 0 {
		delays = defaultRetry.delays
	}

	for attempt := 0; ; attempt++ {
		if attempt > 0 {
			if err := wait(req.Context(), delays[attempt-1]); err != nil {
				return nil, err
			}
			if req.GetBody != nil {
				body, err := req.GetBody()
				if err != nil {
					return nil, err
				}
				req.Body = body
			}
		}

		resp, err := t.base.RoundTrip(req)
		if err == nil && resp.StatusCode != http.StatusServiceUnavailable {
			return resp, nil
		}
		if err != nil && req.Context().Err() != nil {
			return nil, err
		}
		if attempt == len(delays) {
			return resp, err
		}
		if resp != nil {
			_, _ = io.Copy(io.Discard, resp.Body)
			_ = resp.Body.Close()
		}
	}
}

func canRetry(req *http.Request) bool {
	if req.Context().Err() != nil {
		return false
	}
	if req.Body != nil && req.Body != http.NoBody && req.GetBody == nil {
		return false
	}
	switch req.Method {
	case http.MethodGet, http.MethodHead, http.MethodOptions, http.MethodDelete:
		return true
	}
	return req.GetBody != nil
}

func wait(ctx context.Context, d time.Duration) error {
	timer := time.NewTimer(d)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return nil
	}
}

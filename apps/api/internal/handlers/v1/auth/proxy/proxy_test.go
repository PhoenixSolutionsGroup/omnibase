package proxy

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRewriteResponseHeader(t *testing.T) {
	cases := []struct {
		name string
		key  string
		in   string
		want string
	}{
		{
			name: "set-cookie keeps kratos domain",
			key:  "Set-Cookie",
			in:   "csrf_token_abc=xyz; Path=/; Domain=.omnibase.tech; HttpOnly; Secure; SameSite=Lax",
			want: "csrf_token_abc=xyz; Path=/; Domain=.omnibase.tech; HttpOnly; Secure; SameSite=Lax",
		},
		{
			name: "location kratos path rewritten to proxy",
			key:  "Location",
			in:   "http://auth-pub:4433/self-service/registration?flow=abc",
			want: "/api/v1/auth/proxy/self-service/registration?flow=abc",
		},
		{
			name: "location non-kratos path untouched",
			key:  "Location",
			in:   "https://dashboard.omnibase.tech/auth/registration?flow=abc",
			want: "https://dashboard.omnibase.tech/auth/registration?flow=abc",
		},
		{
			name: "absolute location already on proxy path rewritten to relative proxy path",
			key:  "Location",
			in:   "http://127.0.0.1:8080/api/v1/auth/proxy/self-service/login/browser?return_to=http%3A%2F%2Flocalhost%3A3000%2Fprojects",
			want: "/api/v1/auth/proxy/self-service/login/browser?return_to=http%3A%2F%2Flocalhost%3A3000%2Fprojects",
		},
		{
			name: "relative location on proxy path rewritten",
			key:  "Location",
			in:   "/api/v1/auth/proxy/self-service/login/browser?return_to=%2Fprojects",
			want: "/api/v1/auth/proxy/self-service/login/browser?return_to=%2Fprojects",
		},
		{
			name: "proxy path outside kratos routes untouched",
			key:  "Location",
			in:   "http://127.0.0.1:8080/api/v1/auth/proxy/unknown",
			want: "http://127.0.0.1:8080/api/v1/auth/proxy/unknown",
		},
		{
			name: "unrelated header untouched",
			key:  "Content-Type",
			in:   "application/json",
			want: "application/json",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := rewriteResponseHeader(tc.key, tc.in); got != tc.want {
				t.Fatalf("rewriteResponseHeader(%q, %q) = %q, want %q", tc.key, tc.in, got, tc.want)
			}
		})
	}
}

func TestSessionTokenFromRequest(t *testing.T) {
	cases := []struct {
		name   string
		header string
		cookie string
		want   string
	}{
		{
			name:   "session token header preferred",
			header: "header-token",
			cookie: "cookie-token",
			want:   "header-token",
		},
		{
			name:   "falls back to session token cookie",
			cookie: "cookie-token",
			want:   "cookie-token",
		},
		{
			name: "empty when no credentials",
			want: "",
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/self-service/settings/browser", nil)
			if tc.header != "" {
				req.Header.Set("X-Session-Token", tc.header)
			}
			if tc.cookie != "" {
				req.AddCookie(&http.Cookie{Name: omnibaseSessionTokenCookie, Value: tc.cookie})
			}
			if got := sessionTokenFromRequest(req); got != tc.want {
				t.Fatalf("sessionTokenFromRequest() = %q, want %q", got, tc.want)
			}
		})
	}
}

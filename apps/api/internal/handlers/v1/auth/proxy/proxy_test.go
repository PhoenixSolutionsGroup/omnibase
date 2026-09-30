package proxy

import "testing"

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

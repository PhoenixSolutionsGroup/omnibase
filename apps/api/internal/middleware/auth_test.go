package middleware

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestIsJWTToken(t *testing.T) {
	tests := []struct {
		name  string
		token string
		isJWT bool
	}{
		{
			name:  "kratos opaque session token is not a JWT",
			token: "ory_st_HqxkCJnkwQOcywdPNCqBZWiV2EqfhhjT",
			isJWT: false,
		},
		{
			name:  "three segment token is a JWT",
			token: "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIxMjMifQ.SflKxwRJSMeKKF2QT4",
			isJWT: true,
		},
		{
			name:  "empty token is not a JWT",
			token: "",
			isJWT: false,
		},
		{
			name:  "two segments is not a JWT",
			token: "header.payload",
			isJWT: false,
		},
		{
			name:  "four segments is not a JWT",
			token: "a.b.c.d",
			isJWT: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.isJWT, isJWTToken(tt.token))
		})
	}
}

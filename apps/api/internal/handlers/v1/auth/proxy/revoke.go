package proxy

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"

	"api/internal/logger"
)

type Revoker interface {
	RevokeCredential(ctx context.Context, credential string) error
	RevokeUser(ctx context.Context, userID uuid.UUID) error
}

const kratosSessionCookie = "ory_kratos_session"

type revocation struct {
	credentials []string
	userID      uuid.UUID
}

func planPublicRevocation(r *http.Request, path string) revocation {
	var rv revocation
	switch {
	case path == "/self-service/logout/api" && r.Method == http.MethodDelete:
		if r.Body == nil {
			return rv
		}
		body, err := io.ReadAll(r.Body)
		r.Body = io.NopCloser(bytes.NewReader(body))
		if err != nil {
			return rv
		}
		var in struct {
			SessionToken string `json:"session_token"`
		}
		if json.Unmarshal(body, &in) == nil && in.SessionToken != "" {
			rv.credentials = append(rv.credentials, "token:"+in.SessionToken)
		}
	case path == "/self-service/logout" || (strings.HasPrefix(path, "/sessions") && r.Method == http.MethodDelete):
		if tok := strings.TrimSpace(r.Header.Get("X-Session-Token")); tok != "" {
			rv.credentials = append(rv.credentials, "token:"+tok)
		}
		if ck, err := r.Cookie(kratosSessionCookie); err == nil {
			rv.credentials = append(rv.credentials, "cookie:"+ck.Value)
		}
	}
	return rv
}

func planAdminRevocation(r *http.Request, path string) revocation {
	var rv revocation
	if r.Method != http.MethodDelete && r.Method != http.MethodPatch && r.Method != http.MethodPut {
		return rv
	}
	rest, ok := strings.CutPrefix(path, "/admin/identities/")
	if !ok {
		return rv
	}
	id, _, _ := strings.Cut(rest, "/")
	if parsed, err := uuid.Parse(id); err == nil {
		rv.userID = parsed
	}
	return rv
}

func (h *Handler) applyRevocation(ctx context.Context, rv revocation, status int) {
	if h.revoker == nil || status >= http.StatusBadRequest {
		return
	}
	for _, cred := range rv.credentials {
		if err := h.revoker.RevokeCredential(ctx, cred); err != nil {
			logger.Logger.Warn("Failed to revoke cached session", "error", err)
		}
	}
	if rv.userID != uuid.Nil {
		if err := h.revoker.RevokeUser(ctx, rv.userID); err != nil {
			logger.Logger.Warn("Failed to revoke cached sessions for user", "user_id", rv.userID, "error", err)
		}
	}
}

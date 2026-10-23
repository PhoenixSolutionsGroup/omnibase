package email

import (
	"context"
	"regexp"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/authn"
	"api/internal/database/repository"
	"api/internal/logger"
	"api/internal/services/email"
)

var templateNamePattern = regexp.MustCompile(`^[A-Za-z0-9_-]{1,100}$`)

func validTemplateName(name string) bool {
	return templateNamePattern.MatchString(name)
}

type Handler struct {
	repo       repository.Querier
	email      *email.Service
	sendLimit  int
	sendWindow time.Duration
}

type Deps struct {
	Repo       repository.Querier
	Email      *email.Service
	SendLimit  int
	SendWindow time.Duration
}

func New(deps Deps) *Handler {
	window := deps.SendWindow
	if window <= 0 {
		window = time.Hour
	}
	return &Handler{
		repo:       deps.Repo,
		email:      deps.Email,
		sendLimit:  deps.SendLimit,
		sendWindow: window,
	}
}

func tenantScope(method authn.AuthMethod, tenantID uuid.UUID) (*string, error) {
	if method == authn.AuthServiceKey {
		return nil, nil
	}
	if tenantID == uuid.Nil {
		return nil, huma.Error403Forbidden("Tenant context required")
	}
	id := tenantID.String()
	return &id, nil
}

func (h *Handler) allowSend(ctx context.Context, tenantID uuid.UUID) (bool, error) {
	if tenantID == uuid.Nil || h.sendLimit <= 0 {
		return true, nil
	}

	id := tenantID.String()
	count, err := h.repo.CountRecentEmailSends(ctx, repository.CountRecentEmailSendsParams{
		TenantID:      &id,
		WindowSeconds: h.sendWindow.Seconds(),
	})
	if err != nil {
		return false, err
	}
	return count < int64(h.sendLimit), nil
}

func (h *Handler) checkSendAllowed(ctx context.Context, tenantID uuid.UUID) error {
	allowed, err := h.allowSend(ctx, tenantID)
	if err != nil {
		logger.Logger.Error("Failed to check email send limit", "tenant_id", tenantID, "error", err)
		return huma.Error500InternalServerError("Failed to check email send limit")
	}
	if !allowed {
		logger.Logger.Warn("Email send rate limit exceeded",
			"tenant_id", tenantID,
			"limit", h.sendLimit,
			"window", h.sendWindow.String())
		return huma.Error429TooManyRequests("Email send rate limit exceeded")
	}
	return nil
}

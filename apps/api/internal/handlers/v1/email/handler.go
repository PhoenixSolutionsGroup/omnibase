package email

import (
	"regexp"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/google/uuid"

	"api/internal/authn"
	"api/internal/database/repository"
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

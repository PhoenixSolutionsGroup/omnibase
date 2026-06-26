package auth

import (
	"api/internal/logger"

	kratos "github.com/ory/kratos-client-go"
)

type Service struct {
	admin *kratos.APIClient
}

type Identity struct {
	ID        string
	Email     string
	FirstName string
	LastName  string
}

type Deps struct {
	AdminURL string
	Client   *kratos.APIClient
}

func New(deps Deps) *Service {
	if deps.Client != nil {
		return &Service{admin: deps.Client}
	}

	logger.Logger.Debug("Initializing auth service", "admin_url", deps.AdminURL)
	cfg := kratos.NewConfiguration()
	cfg.Servers = []kratos.ServerConfiguration{{URL: deps.AdminURL}}

	return &Service{admin: kratos.NewAPIClient(cfg)}
}

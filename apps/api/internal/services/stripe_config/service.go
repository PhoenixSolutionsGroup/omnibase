package stripe_config

import (
	"api/internal/database/repository"
	"api/internal/services"
	"api/internal/services/stripe_client"
)

type Service struct {
	repo       repository.Querier
	stripe     *stripe_client.Client
	encryption *services.EncryptionService
	managed    *ManagedHostingClient
	validator  *Validator
	differ     *Differ
}

type Deps struct {
	Repo       repository.Querier
	Stripe     *stripe_client.Client
	Encryption *services.EncryptionService
	Managed    *ManagedHostingClient
}

func New(deps Deps) *Service {
	return &Service{
		repo:       deps.Repo,
		stripe:     deps.Stripe,
		encryption: deps.Encryption,
		managed:    deps.Managed,
		validator:  NewValidator(),
		differ:     NewDiffer(),
	}
}

func (s *Service) ParseAndValidate(configData ConfigData) (*StripeConfiguration, error) {
	return s.validator.ParseAndValidateConfig(configData)
}

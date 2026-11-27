package stripe

import (
	"context"
	"encoding/json"
	"fmt"

	"api/internal/database/repository"
	"api/internal/services/stripe_client"
	"api/internal/services/stripe_config"
)

type Handler struct {
	repo         repository.Querier
	stripeConfig *stripe_config.Service
	stripe       *stripe_client.Client
}

type Deps struct {
	Repo         repository.Querier
	StripeConfig *stripe_config.Service
	Stripe       *stripe_client.Client
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:         deps.Repo,
		stripeConfig: deps.StripeConfig,
		stripe:       deps.Stripe,
	}
}

func (h *Handler) latestParsedConfig(ctx context.Context) (*stripe_config.StripeConfiguration, error) {
	row, err := h.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get latest config: %w", err)
	}
	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, fmt.Errorf("failed to decode config: %w", err)
	}
	return h.stripeConfig.ParseAndValidate(raw)
}

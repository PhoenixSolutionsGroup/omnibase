package stripe_proxy

import (
	"context"
	"encoding/json"
	"fmt"

	"api/internal/database/repository"
	"api/internal/services/stripe_config"
)

const defaultMeterCustomerPayloadKey = "stripe_customer_id"

type ProxyConfig struct {
	Prices              map[string]string
	Products            map[string]string
	Coupons             map[string]string
	Promos              map[string]string
	MeterCustomerValues map[string]string
}

type ConfigResolver interface {
	ProxyConfig(ctx context.Context) (*ProxyConfig, error)
}

type configResolver struct {
	repo   repository.Querier
	config *stripe_config.Service
}

func NewConfigResolver(repo repository.Querier, config *stripe_config.Service) ConfigResolver {
	return &configResolver{repo: repo, config: config}
}

func (r *configResolver) ProxyConfig(ctx context.Context) (*ProxyConfig, error) {
	row, err := r.repo.GetLatestStripeConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("load stripe config: %w", err)
	}

	var raw stripe_config.ConfigData
	if err := json.Unmarshal(row.Config, &raw); err != nil {
		return nil, fmt.Errorf("decode stripe config: %w", err)
	}

	parsed, err := r.config.ParseAndValidate(raw)
	if err != nil {
		return nil, fmt.Errorf("validate stripe config: %w", err)
	}

	identity, err := r.config.LoadStripeIdentity(ctx, parsed)
	if err != nil {
		return nil, fmt.Errorf("load stripe identity: %w", err)
	}

	meters := make(map[string]string, len(parsed.Meters))
	for _, meter := range parsed.Meters {
		key := defaultMeterCustomerPayloadKey
		if meter.CustomerMapping != nil && meter.CustomerMapping.EventPayloadKey != "" {
			key = meter.CustomerMapping.EventPayloadKey
		}
		meters[meter.EventName] = key
	}

	return &ProxyConfig{
		Prices:              identity.Prices,
		Products:            identity.Products,
		Coupons:             identity.Coupons,
		Promos:              identity.Promos,
		MeterCustomerValues: meters,
	}, nil
}

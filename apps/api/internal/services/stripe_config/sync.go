package stripe_config

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"api/internal/database/repository"
)

var SyncError = errors.New("Failed to sync stripe configuration")

type SyncArgs struct {
	Config ConfigData
}

func (s *Service) Sync(ctx context.Context, args SyncArgs) (*ConfigResponse, error) {
	config, err := s.validator.ParseAndValidateConfig(args.Config)
	if err != nil {
		return &ConfigResponse{
			Message: "StripeConfiguration validation failed",
			Errors:  []string{err.Error()},
		}, nil
	}

	state := newReconcileState()
	changes, err := s.reconcile(ctx, config, state)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", SyncError, err)
	}

	newConfig, err := s.saveConfig(ctx, args.Config, config.Version)
	if err != nil {
		return nil, err
	}
	if err := s.flushMappings(ctx, newConfig.ID, state.mappings); err != nil {
		return nil, err
	}

	return &ConfigResponse{
		Message: "StripeConfiguration updated successfully",
		Changes: changes,
		Config:  config,
	}, nil
}

func (s *Service) saveConfig(ctx context.Context, raw ConfigData, version string) (*repository.StripeStripeConfig, error) {
	configBytes, err := json.Marshal(raw)
	if err != nil {
		return nil, fmt.Errorf("%w: failed to marshal config: %w", SyncError, err)
	}
	row, err := s.repo.CreateStripeConfig(ctx, repository.CreateStripeConfigParams{
		Config:  configBytes,
		Version: version,
	})
	if err != nil {
		return nil, fmt.Errorf("%w: failed to save config: %w", SyncError, err)
	}
	return &row, nil
}

func (s *Service) flushMappings(ctx context.Context, configID uuid.UUID, intents []mappingIntent) error {
	for _, intent := range intents {
		if err := s.SaveMapping(ctx, configID, intent.configItemID, intent.stripeID, intent.itemType); err != nil {
			return err
		}
	}
	return nil
}

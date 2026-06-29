package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
)

var (
	SaveMappingError = errors.New("Failed to save stripe id mapping")
	GetMappingError  = errors.New("Failed to get stripe id mapping")
)

type Mapping struct {
	ID              uuid.UUID
	ConfigID        uuid.UUID
	ConfigItemID    string
	StripeID        string
	ItemType        string
	StripeIDHistory []string
}

func (s *Service) SaveMapping(ctx context.Context, configID uuid.UUID, configItemID, stripeID, itemType string) error {
	existing, err := s.GetMapping(ctx, configItemID, itemType)
	if err != nil {
		return err
	}
	if existing == nil {
		_, err := s.repo.CreateMapping(ctx, repository.CreateMappingParams{
			ConfigID:        configID,
			ConfigItemID:    configItemID,
			StripeID:        stripeID,
			ItemType:        itemType,
			StripeIDHistory: []string{stripeID},
		})
		if err != nil {
			return fmt.Errorf("%w: %w", SaveMappingError, err)
		}
		return nil
	}
	history := append(existing.StripeIDHistory, stripeID)
	if err := s.repo.UpdateMappingStripeID(ctx, repository.UpdateMappingStripeIDParams{
		ConfigItemID:    configItemID,
		StripeID:        stripeID,
		StripeIDHistory: history,
		ConfigID:        configID,
		ItemType:        itemType,
	}); err != nil {
		return fmt.Errorf("%w: %w", SaveMappingError, err)
	}
	return nil
}

func (s *Service) GetMapping(ctx context.Context, configItemID, itemType string) (*Mapping, error) {
	row, err := s.repo.GetMappingByConfigItemID(ctx, repository.GetMappingByConfigItemIDParams{
		ConfigItemID: configItemID,
		ItemType:     itemType,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("%w: %w", GetMappingError, err)
	}
	return &Mapping{
		ID:              row.ID,
		ConfigID:        row.ConfigID,
		ConfigItemID:    row.ConfigItemID,
		StripeID:        row.StripeID,
		ItemType:        row.ItemType,
		StripeIDHistory: row.StripeIDHistory,
	}, nil
}

func (s *Service) GetStripeIDByConfigItemID(ctx context.Context, configItemID, itemType string) (string, error) {
	m, err := s.GetMapping(ctx, configItemID, itemType)
	if err != nil {
		return "", err
	}
	if m == nil {
		return "", nil
	}
	return m.StripeID, nil
}

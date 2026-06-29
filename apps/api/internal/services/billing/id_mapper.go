package billing

import (
	"context"
	"errors"
	"fmt"

	"api/internal/database/repository"
)

var (
	GetMappingByConfigIDError = errors.New("Failed to get stripe id mapping by config id")
	GetMappingByStripeIDError = errors.New("Failed to get stripe id mapping by stripe id")
	UpsertMappingError        = errors.New("Failed to upsert stripe id mapping")
)

type Mapping struct {
	ConfigID     string
	ConfigItemID string
	StripeID     string
	ItemType     string
	IsLegacy     bool
}

func (s *Service) GetMappingByConfigID(ctx context.Context, configItemID, itemType string) (*Mapping, error) {
	row, err := s.repo.GetMappingByConfigItemID(ctx, repository.GetMappingByConfigItemIDParams{
		ConfigItemID: configItemID,
		ItemType:     itemType,
	})
	if err != nil {
		return nil, fmt.Errorf("%w: %w", GetMappingByConfigIDError, err)
	}
	return &Mapping{
		ConfigID:     row.ConfigID.String(),
		ConfigItemID: row.ConfigItemID,
		StripeID:     row.StripeID,
		ItemType:     row.ItemType,
	}, nil
}

func (s *Service) GetMappingByStripeID(ctx context.Context, stripeID string) (*Mapping, error) {
	row, err := s.repo.GetMappingByStripeID(ctx, stripeID)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", GetMappingByStripeIDError, err)
	}
	return &Mapping{
		ConfigID:     row.ConfigID.String(),
		ConfigItemID: row.ConfigItemID,
		StripeID:     row.StripeID,
		ItemType:     row.ItemType,
		IsLegacy:     row.StripeID != stripeID,
	}, nil
}

package billing_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/internal/database/repository"
	mock "api/internal/mocks/repository"
	"api/internal/services/billing"
)

func TestGetMappingByConfigID_ReturnsMappingWhenFound(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := billing.New(billing.Deps{Repo: repo})

	configID := uuid.New()
	repo.EXPECT().
		GetMappingByConfigItemID(context.Background(), repository.GetMappingByConfigItemIDParams{
			ConfigItemID: "price_basic_monthly",
			ItemType:     "price",
		}).
		Return(repository.GetMappingByConfigItemIDRow{
			ID:           uuid.New(),
			ConfigID:     configID,
			ConfigItemID: "price_basic_monthly",
			StripeID:     "price_stripe_abc",
			ItemType:     "price",
			CreatedAt:    time.Now(),
		}, nil)

	got, err := svc.GetMappingByConfigID(context.Background(), "price_basic_monthly", "price")
	require.NoError(t, err)
	assert.Equal(t, "price_basic_monthly", got.ConfigItemID)
	assert.Equal(t, "price_stripe_abc", got.StripeID)
	assert.Equal(t, "price", got.ItemType)
	assert.False(t, got.IsLegacy)
}

func TestGetMappingByConfigID_WrapsRepoError(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := billing.New(billing.Deps{Repo: repo})

	repo.EXPECT().
		GetMappingByConfigItemID(context.Background(), repository.GetMappingByConfigItemIDParams{
			ConfigItemID: "missing",
			ItemType:     "price",
		}).
		Return(repository.GetMappingByConfigItemIDRow{}, errors.New("no rows"))

	_, err := svc.GetMappingByConfigID(context.Background(), "missing", "price")
	require.Error(t, err)
	assert.ErrorIs(t, err, billing.GetMappingByConfigIDError)
}

func TestGetMappingByStripeID_FlagsLegacyWhenHistoryMatch(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := billing.New(billing.Deps{Repo: repo})

	repo.EXPECT().
		GetMappingByStripeID(context.Background(), "price_stripe_old").
		Return(repository.GetMappingByStripeIDRow{
			ID:              uuid.New(),
			ConfigID:        uuid.New(),
			ConfigItemID:    "price_basic_monthly",
			StripeID:        "price_stripe_new",
			StripeIDHistory: []string{"price_stripe_old", "price_stripe_new"},
			ItemType:        "price",
		}, nil)

	got, err := svc.GetMappingByStripeID(context.Background(), "price_stripe_old")
	require.NoError(t, err)
	assert.Equal(t, "price_basic_monthly", got.ConfigItemID)
	assert.True(t, got.IsLegacy, "history-only match should be flagged legacy")
}

func TestGetMappingByStripeID_DoesNotFlagLegacyWhenCurrentMatch(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := billing.New(billing.Deps{Repo: repo})

	repo.EXPECT().
		GetMappingByStripeID(context.Background(), "price_stripe_current").
		Return(repository.GetMappingByStripeIDRow{
			ID:           uuid.New(),
			ConfigID:     uuid.New(),
			ConfigItemID: "price_basic_monthly",
			StripeID:     "price_stripe_current",
			ItemType:     "price",
		}, nil)

	got, err := svc.GetMappingByStripeID(context.Background(), "price_stripe_current")
	require.NoError(t, err)
	assert.False(t, got.IsLegacy)
}

func TestGetMappingByStripeID_WrapsRepoError(t *testing.T) {
	repo := mock.NewMockQuerier(t)
	svc := billing.New(billing.Deps{Repo: repo})

	repo.EXPECT().
		GetMappingByStripeID(context.Background(), "missing").
		Return(repository.GetMappingByStripeIDRow{}, errors.New("no rows"))

	_, err := svc.GetMappingByStripeID(context.Background(), "missing")
	require.Error(t, err)
	assert.ErrorIs(t, err, billing.GetMappingByStripeIDError)
}

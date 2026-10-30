package stripe_config

import (
	"testing"

	"github.com/stretchr/testify/require"
	"github.com/stripe/stripe-go/v82"
)

func TestPriceConfigID(t *testing.T) {
	require.Equal(t, "", PriceConfigID(nil))
	require.Equal(t, "price_meta", PriceConfigID(&stripe.Price{
		LookupKey: "price_lookup",
		Metadata:  map[string]string{MetadataKeyConfigID: "price_meta"},
	}))
	require.Equal(t, "price_lookup", PriceConfigID(&stripe.Price{LookupKey: "price_lookup"}))
}

func TestIsLegacyPrice(t *testing.T) {
	require.False(t, IsLegacyPrice(nil))
	require.False(t, IsLegacyPrice(&stripe.Price{
		Active:    true,
		LookupKey: "price_a",
		Metadata:  map[string]string{MetadataKeyConfigID: "price_a"},
	}))
	require.True(t, IsLegacyPrice(&stripe.Price{
		Active:    true,
		LookupKey: "price_old",
		Metadata:  map[string]string{MetadataKeyConfigID: "price_a"},
	}))
	require.True(t, IsLegacyPrice(&stripe.Price{
		Active:    false,
		LookupKey: "price_a",
		Metadata:  map[string]string{MetadataKeyConfigID: "price_a"},
	}))
	require.False(t, IsLegacyPrice(&stripe.Price{Active: true, LookupKey: "price_a"}))
}

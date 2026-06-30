package billing

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var (
	SwapSubscriptionItemError     = errors.New("Failed to swap subscription item price")
	SwapSubscriptionItemNotFound  = errors.New("Subscription item not found for price")
	EnterpriseSwapNoMatchingPrice = errors.New("No enterprise price matches subscription product")
)

// SwapSubscriptionItemPrice replaces one item's price with a new stripe price ID.
// Caller provides oldConfigPriceID — the swap finds the item by mapping each item's
// stripe price back to its config id.
func (s *Service) SwapSubscriptionItemPrice(ctx context.Context, subscriptionID, oldConfigPriceID, newStripePriceID string) error {
	sub, err := s.stripe.Stripe.V1Subscriptions.Retrieve(ctx, subscriptionID, withAccount(s, &stripe.SubscriptionRetrieveParams{}))
	if err != nil {
		return fmt.Errorf("%w: %w", SwapSubscriptionItemError, err)
	}

	var targetItemID string
	for _, item := range sub.Items.Data {
		mapping, mErr := s.GetMappingByStripeID(ctx, item.Price.ID)
		if mErr != nil {
			continue
		}
		if mapping.ConfigItemID == oldConfigPriceID {
			targetItemID = item.ID
			break
		}
	}
	if targetItemID == "" {
		return fmt.Errorf("%w: %s", SwapSubscriptionItemNotFound, oldConfigPriceID)
	}

	updateParams := &stripe.SubscriptionUpdateParams{
		Items: []*stripe.SubscriptionUpdateItemParams{
			{
				ID:    stripe.String(targetItemID),
				Price: stripe.String(newStripePriceID),
			},
		},
		ProrationBehavior: stripe.String("none"),
	}
	s.stripe.ApplyAccount(updateParams)

	if _, err := s.stripe.Stripe.V1Subscriptions.Update(ctx, subscriptionID, updateParams); err != nil {
		return fmt.Errorf("%w: %w", SwapSubscriptionItemError, err)
	}
	return nil
}

// EnterprisePriceCandidate is what the handler passes in when applying a template
// or custom enterprise pricing. The service decides which (if any) subscription
// items each candidate replaces based on shared Stripe product.
type EnterprisePriceCandidate struct {
	ConfigPriceID string
	StripePriceID string
	StripeProduct string
}

type ApplyEnterprisePricingArgs struct {
	StripeCustomerID string
	Candidates       []EnterprisePriceCandidate
}

type ApplyEnterprisePricingResult struct {
	SwappedCount int
	Swaps        []ApplyEnterprisePricingSwap
}

type ApplyEnterprisePricingSwap struct {
	SubscriptionID  string
	SubscriptionItemID string
	OldStripePrice  string
	NewStripePrice  string
}

// ApplyEnterprisePricing walks every active subscription for the customer and
// swaps any item whose Stripe product matches a candidate. Replaces the legacy
// `shouldSwapPrice` stub that always returned false.
func (s *Service) ApplyEnterprisePricing(ctx context.Context, args ApplyEnterprisePricingArgs) (*ApplyEnterprisePricingResult, error) {
	listParams := &stripe.SubscriptionListParams{Customer: stripe.String(args.StripeCustomerID)}
	s.stripe.ApplyAccount(listParams)

	result := &ApplyEnterprisePricingResult{}
	iter := s.stripe.Stripe.V1Subscriptions.List(ctx, listParams)
	for sub, err := range iter {
		if err != nil {
			return nil, fmt.Errorf("%w: %w", SwapSubscriptionItemError, err)
		}
		if sub.Status != "active" && sub.Status != "trialing" && sub.Status != "past_due" {
			continue
		}
		for _, item := range sub.Items.Data {
			currentProduct := ""
			if item.Price != nil && item.Price.Product != nil {
				currentProduct = item.Price.Product.ID
			}
			candidate := matchByProduct(currentProduct, args.Candidates)
			if candidate == nil {
				continue
			}
			if item.Price != nil && item.Price.ID == candidate.StripePriceID {
				continue
			}
			updateParams := &stripe.SubscriptionUpdateParams{
				Items: []*stripe.SubscriptionUpdateItemParams{
					{
						ID:    stripe.String(item.ID),
						Price: stripe.String(candidate.StripePriceID),
					},
				},
				ProrationBehavior: stripe.String("none"),
			}
			s.stripe.ApplyAccount(updateParams)
			if _, err := s.stripe.Stripe.V1Subscriptions.Update(ctx, sub.ID, updateParams); err != nil {
				return nil, fmt.Errorf("%w: %w", SwapSubscriptionItemError, err)
			}
			swap := ApplyEnterprisePricingSwap{
				SubscriptionID:     sub.ID,
				SubscriptionItemID: item.ID,
				NewStripePrice:     candidate.StripePriceID,
			}
			if item.Price != nil {
				swap.OldStripePrice = item.Price.ID
			}
			result.Swaps = append(result.Swaps, swap)
			result.SwappedCount++
		}
	}
	return result, nil
}

func matchByProduct(currentProductID string, candidates []EnterprisePriceCandidate) *EnterprisePriceCandidate {
	if currentProductID == "" {
		return nil
	}
	for i, c := range candidates {
		if c.StripeProduct == currentProductID {
			return &candidates[i]
		}
	}
	return nil
}

func withAccount[T interface{ SetStripeAccount(string) }](s *Service, params T) T {
	s.stripe.ApplyAccount(params)
	return params
}

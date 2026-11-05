package billing

import (
	"context"
	"fmt"
	"math"

	"github.com/stripe/stripe-go/v82"
)

func checkoutLineAmount(price *stripe.Price, quantity int64) int64 {
	if quantity <= 0 {
		return 0
	}
	if price.BillingScheme == stripe.PriceBillingSchemeTiered {
		return tieredLineAmount(price, quantity)
	}
	if price.UnitAmountDecimal > 0 {
		return int64(math.Round(price.UnitAmountDecimal * float64(quantity)))
	}
	return price.UnitAmount * quantity
}

func tieredLineAmount(price *stripe.Price, quantity int64) int64 {
	if len(price.Tiers) == 0 || quantity <= 0 {
		return 0
	}
	if price.TiersMode == stripe.PriceTiersModeVolume {
		tier := volumeTier(price.Tiers, quantity)
		if tier == nil {
			return 0
		}
		return int64(math.Round(tierUnitAmount(tier)*float64(quantity) + tierFlatAmount(tier)))
	}

	var total float64
	lower := int64(1)
	for i, tier := range price.Tiers {
		if lower > quantity {
			break
		}
		upper := tier.UpTo
		if i == len(price.Tiers)-1 {
			upper = quantity
		} else if upper == 0 {
			continue
		}
		if upper < lower {
			continue
		}
		if upper > quantity {
			upper = quantity
		}
		units := upper - lower + 1
		total += tierUnitAmount(tier)*float64(units) + tierFlatAmount(tier)
		lower = upper + 1
	}
	return int64(math.Round(total))
}

func volumeTier(tiers []*stripe.PriceTier, quantity int64) *stripe.PriceTier {
	for i, tier := range tiers {
		if i == len(tiers)-1 || tier.UpTo >= quantity {
			return tier
		}
	}
	return nil
}

func tierUnitAmount(tier *stripe.PriceTier) float64 {
	if tier.UnitAmountDecimal > 0 {
		return tier.UnitAmountDecimal
	}
	return float64(tier.UnitAmount)
}

func tierFlatAmount(tier *stripe.PriceTier) float64 {
	if tier.FlatAmountDecimal > 0 {
		return tier.FlatAmountDecimal
	}
	return float64(tier.FlatAmount)
}

func (s *Service) promotionCodeDiscountAmount(ctx context.Context, price *stripe.Price, promotionCodeID string, amount int64) (int64, error) {
	params := &stripe.PromotionCodeRetrieveParams{
		Expand: []*string{stripe.String("coupon")},
	}
	s.stripe.ApplyAccount(params)

	promotionCode, err := s.stripe.Stripe.V1PromotionCodes.Retrieve(ctx, promotionCodeID, params)
	if err != nil {
		return 0, fmt.Errorf("%w: failed to fetch promotion code: %w", CreateCheckoutSessionError, err)
	}
	if promotionCode.Coupon == nil {
		return 0, nil
	}

	coupon := promotionCode.Coupon
	if coupon.AppliesTo != nil && len(coupon.AppliesTo.Products) > 0 {
		if price.Product == nil || !containsString(coupon.AppliesTo.Products, price.Product.ID) {
			return 0, nil
		}
	}

	var discount int64
	switch {
	case coupon.PercentOff > 0:
		discount = int64(math.Round(float64(amount) * coupon.PercentOff / 100))
	case coupon.AmountOff > 0 && coupon.Currency == price.Currency:
		discount = coupon.AmountOff
	}
	if discount > amount {
		return amount, nil
	}
	return discount, nil
}

func containsString(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}

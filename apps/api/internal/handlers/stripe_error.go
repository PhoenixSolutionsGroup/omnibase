package handlers

import (
	"errors"
	"strings"

	"github.com/danielgtaylor/huma/v2"
	"github.com/stripe/stripe-go/v82"
)

func StripeError(err error) error {
	var stripeErr *stripe.Error
	if !errors.As(err, &stripeErr) {
		return nil
	}

	if stripeErr.HTTPStatusCode == 429 {
		return huma.Error429TooManyRequests(stripeErr.Msg)
	}

	switch stripeErr.Type {
	case stripe.ErrorTypeInvalidRequest:
		if strings.HasPrefix(stripeErr.Msg, "No such") {
			return huma.Error404NotFound(stripeErr.Msg)
		}
		return huma.Error400BadRequest(stripeErr.Msg)
	case stripe.ErrorTypeCard:
		return huma.Error400BadRequest(stripeErr.Msg)
	case stripe.ErrorTypeIdempotency:
		return huma.Error409Conflict(stripeErr.Msg)
	case stripe.ErrorTypeAPI:
		return nil
	default:
		return huma.Error400BadRequest(stripeErr.Msg)
	}
}

package payments

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"

	"api/internal/handlers"
)

type PaymentsCtx struct {
	handlers.AuthCtx
	StripeCustomerID string
}

func (p *PaymentsCtx) Resolve(ctx huma.Context) []error {
	errs := p.AuthCtx.Resolve(ctx)
	gc := humagin.Unwrap(ctx)
	p.StripeCustomerID = gc.GetString("stripe_customer_id")
	return errs
}

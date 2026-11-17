package subscriptions

import (
	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humagin"

	"api/internal/handlers"
)

type Ctx struct {
	handlers.AuthCtx
	StripeCustomerID string
}

func (c *Ctx) Resolve(ctx huma.Context) []error {
	errs := c.AuthCtx.Resolve(ctx)
	gc := humagin.Unwrap(ctx)
	c.StripeCustomerID = gc.GetString("stripe_customer_id")
	return errs
}

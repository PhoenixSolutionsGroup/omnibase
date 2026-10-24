package middleware

import (
	"api/internal/authn"
	"api/internal/handlers"
	"api/internal/logger"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentsMiddleware struct {
	db *gorm.DB
}

func NewPaymentsMiddleware(db *gorm.DB) *PaymentsMiddleware {
	return &PaymentsMiddleware{db: db}
}

func (m *PaymentsMiddleware) ResolveStripeCustomer() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		principal, ok := authn.Get(ctx)
		if !ok {
			ctx.Next()
			return
		}

		tenantCustomerID := ""
		if principal.TenantID != uuid.Nil {
			var customerID *string
			err := m.db.Table("auth.tenants").
				Select("stripe_customer_id").
				Where("id = ?", principal.TenantID).
				Scan(&customerID).Error
			if err != nil {
				logger.Logger.Error("Error querying tenant for stripe_customer_id",
					"tenant_id", principal.TenantID,
					"error", err)
				handlers.NewInternalServerErrorResponse(ctx, fmt.Errorf("database error: %w", err))
				ctx.Abort()
				return
			}
			if customerID != nil {
				tenantCustomerID = *customerID
			}
		}

		headerCustomerID := ctx.GetHeader("X-Stripe-Customer-Id")
		customerID := tenantCustomerID
		if principal.Method == authn.AuthServiceKey && headerCustomerID != "" {
			if tenantCustomerID != "" && tenantCustomerID != headerCustomerID {
				handlers.NewBadRequestResponse(ctx, "X-Stripe-Customer-Id does not match the tenant's Stripe customer")
				ctx.Abort()
				return
			}
			customerID = headerCustomerID
		}

		if customerID == "" {
			ctx.Next()
			return
		}

		logger.Logger.Debug("Stripe customer ID resolved",
			"tenant_id", principal.TenantID,
			"stripe_customer_id", customerID)
		ctx.Set("stripe_customer_id", customerID)
		ctx.Next()
	}
}

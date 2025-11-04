package services_v1

import (
	"api/internal/config"
	"api/internal/logger"
	"api/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/billing/meter"
	"github.com/stripe/stripe-go/v82/billing/meterevent"
	portalsession "github.com/stripe/stripe-go/v82/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/customer"
	"github.com/stripe/stripe-go/v82/price"
	"github.com/stripe/stripe-go/v82/product"
	"github.com/stripe/stripe-go/v82/subscription"
	"gorm.io/gorm"
)

type StripeService struct {
	accountID string
	feePct    float64
	db        *gorm.DB
}

func NewStripeService(cfg *config.Config, db *gorm.DB) *StripeService {
	stripe.Key = cfg.StripeConfig.SecretKey

	return &StripeService{
		accountID: cfg.StripeConfig.StripeAccountID,
		feePct:    cfg.StripeConfig.PlatformFeePercent,
		db:        db,
	}
}

func (s *StripeService) CreateStripeCustomer(email, name string) (string, error) {
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(name),
	}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	customer, err := customer.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create Stripe customer: %w", err)
	}

	return customer.ID, nil
}

func (s *StripeService) ArchiveStripeCustomer(customerID string) error {
	if customerID == "" {
		return nil // No customer to archive
	}

	params := &stripe.CustomerParams{}
	params.AddMetadata("archived", "true")

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	_, err := customer.Update(customerID, params)
	if err != nil {
		return fmt.Errorf("failed to archive Stripe customer: %w", err)
	}

	return nil
}

func (s *StripeService) CreateCheckoutSession(
	priceID string,
	successURL string,
	cancelURL string,
	customerID string,
	trialPeriodDays *int64,
	promotionCode *string,
	allowPromotionCodes *bool,
) (*stripe.CheckoutSession, error) {

	// Fetch the price to determine the mode
	priceObj, err := s.getPrice(priceID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch price: %w", err)
	}

	// Determine mode based on whether the price has a recurring interval
	mode := "payment"
	if priceObj.Recurring != nil {
		mode = "subscription"
	}

	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(mode),
		SuccessURL: stripe.String(successURL),
		CancelURL:  stripe.String(cancelURL),
	}

	// Add customer if provided
	if customerID != "" {
		params.Customer = stripe.String(customerID)
	} else {
		params.CustomerCreation = stripe.String("always")
	}

	// Add trial period for subscriptions
	if mode == "subscription" && trialPeriodDays != nil && *trialPeriodDays > 0 {
		if params.SubscriptionData == nil {
			params.SubscriptionData = &stripe.CheckoutSessionSubscriptionDataParams{}
		}
		params.SubscriptionData.TrialPeriodDays = trialPeriodDays
	}

	// Add promotion code
	if promotionCode != nil && *promotionCode != "" {
		params.Discounts = []*stripe.CheckoutSessionDiscountParams{
			{PromotionCode: promotionCode},
		}
	}

	// Allow user to enter promo codes
	if allowPromotionCodes != nil && *allowPromotionCodes {
		params.AllowPromotionCodes = allowPromotionCodes
	}

	// Add platform fee if in Connect mode (managed hosting)
	if s.accountID != "" && s.feePct > 0 {
		params.SetStripeAccount(s.accountID)

		if mode == "subscription" {
			// For subscriptions - use percentage
			params.SubscriptionData = &stripe.CheckoutSessionSubscriptionDataParams{
				ApplicationFeePercent: stripe.Float64(s.feePct),
			}
		} else if mode == "payment" {
			// For one-time payments - calculate fixed fee amount
			feeAmount := int64(float64(priceObj.UnitAmount) * (s.feePct / 100))

			params.PaymentIntentData = &stripe.CheckoutSessionPaymentIntentDataParams{
				ApplicationFeeAmount: stripe.Int64(feeAmount),
			}
		}
	}

	return checkoutsession.New(params)
}

func (s *StripeService) RecordUsage(meterEventName string, customerID string, value string) error {
	params := &stripe.BillingMeterEventParams{
		EventName: stripe.String(meterEventName),
		Payload: map[string]string{
			"stripe_customer_id": customerID,
			"value":              value,
		},
		Timestamp: stripe.Int64(time.Now().Unix()),
	}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	_, err := meterevent.New(params)
	return err
}

func (s *StripeService) CreatePortalSession(customerID string, returnURL string) (*stripe.BillingPortalSession, error) {
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}

	// Add Connect account if in managed mode
	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	return portalsession.New(params)
}

// GetStripeIDByConfigID maps a config ID to its corresponding Stripe ID
// Returns the most recently created Stripe ID for the given config ID
func (s *StripeService) GetStripeIDByConfigID(configID string) (string, error) {
	var mapping models.StripeIDMapping
	err := s.db.Where("config_item_id = ?", configID).
		Order("created_at DESC").
		First(&mapping).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", fmt.Errorf("no Stripe ID mapping found for config ID: %s", configID)
		}
		return "", fmt.Errorf("failed to query Stripe ID mapping: %w", err)
	}

	return mapping.StripeID, nil
}

func (s *StripeService) getPrice(priceID string) (*stripe.Price, error) {
	params := &stripe.PriceParams{}
	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}
	return price.Get(priceID, params)
}

// ArchiveStripeProduct archives a Stripe product by ID
func (s *StripeService) ArchiveStripeProduct(productID string) error {
	params := &stripe.ProductParams{
		Active: stripe.Bool(false),
	}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	_, err := product.Update(productID, params)
	if err != nil {
		return fmt.Errorf("failed to archive Stripe product %s: %w", productID, err)
	}

	return nil
}

// ArchiveStripePrice archives a Stripe price by ID
func (s *StripeService) ArchiveStripePrice(priceID string) error {
	params := &stripe.PriceParams{
		Active: stripe.Bool(false),
	}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	_, err := price.Update(priceID, params)
	if err != nil {
		return fmt.Errorf("failed to archive Stripe price %s: %w", priceID, err)
	}

	return nil
}

// ArchiveStripeMeter deactivates a Stripe billing meter by ID
func (s *StripeService) ArchiveStripeMeter(meterID string) error {
	params := &stripe.BillingMeterDeactivateParams{}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	_, err := meter.Deactivate(meterID, params)
	if err != nil {
		return fmt.Errorf("failed to deactivate Stripe meter %s: %w", meterID, err)
	}

	return nil
}

// GetTenantActiveSubscriptions retrieves active subscriptions for a tenant
// Returns subscriptions with config_price_id instead of stripe_price_id
func (s *StripeService) GetTenantActiveSubscriptions(stripeCustomerID string) ([]models.SubscriptionResponse, error) {
	// Remove status filter to get ALL subscriptions, then filter manually
	// Stripe's status filter doesn't include trialing when set to "active"
	params := &stripe.SubscriptionListParams{
		Customer: stripe.String(stripeCustomerID),
	}

	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	logger.Logger.Debug("Fetching subscriptions from Stripe",
		"customer_id", stripeCustomerID,
		"account_id", s.accountID)

	iter := subscription.List(params)
	var results []models.SubscriptionResponse
	subscriptionCount := 0
	skippedCount := 0
	unmappedCount := 0

	for iter.Next() {
		sub := iter.Subscription()
		subscriptionCount++

		logger.Logger.Log(context.TODO(), logger.LevelTrace, "Processing subscription from Stripe",
			"subscription_id", sub.ID,
			"status", sub.Status,
			"items_count", len(sub.Items.Data))

		// Skip non-active subscriptions (active, trialing, past_due are considered active)
		if sub.Status != "active" && sub.Status != "trialing" && sub.Status != "past_due" {
			logger.Logger.Debug("Skipping subscription with non-active status",
				"subscription_id", sub.ID,
				"status", sub.Status)
			skippedCount++
			continue
		}

		// Map each subscription item's stripe_price_id to config_price_id
		for _, item := range sub.Items.Data {
			logger.Logger.Log(context.TODO(), logger.LevelTrace, "Mapping subscription item price",
				"subscription_id", sub.ID,
				"stripe_price_id", item.Price.ID)

			configPriceID, isLegacy, err := s.GetConfigIDByStripeID(item.Price.ID)
			if err != nil {
				logger.Logger.Warn("Failed to map Stripe price ID to config ID, skipping item",
					"subscription_id", sub.ID,
					"stripe_price_id", item.Price.ID,
					"error", err)
				unmappedCount++
				continue
			}

			logger.Logger.Debug("Successfully mapped subscription item",
				"subscription_id", sub.ID,
				"config_price_id", configPriceID,
				"is_legacy", isLegacy,
				"status", sub.Status)

			results = append(results, models.SubscriptionResponse{
				SubscriptionID: sub.ID,
				ConfigPriceID:  configPriceID,
				Status:         string(sub.Status),
				IsLegacyPrice:  isLegacy,
			})
		}
	}

	if err := iter.Err(); err != nil {
		logger.Logger.Error("Failed to iterate subscriptions from Stripe",
			"error", err,
			"customer_id", stripeCustomerID)
		return nil, fmt.Errorf("failed to list subscriptions: %w", err)
	}

	logger.Logger.Info("Completed fetching tenant subscriptions",
		"customer_id", stripeCustomerID,
		"total_subscriptions_from_stripe", subscriptionCount,
		"active_subscriptions_returned", len(results),
		"skipped_non_active", skippedCount,
		"unmapped_prices", unmappedCount)

	return results, nil
}

// GetConfigIDByStripeID maps Stripe ID to config ID (checks current stripe_id + stripe_id_history)
func (s *StripeService) GetConfigIDByStripeID(stripeID string) (string, bool, error) {
	var mapping models.StripeIDMapping

	// Try current stripe_id first
	err := s.db.Where("stripe_id = ?", stripeID).First(&mapping).Error
	if err == nil {
		return mapping.ConfigItemID, false, nil
	}

	// Search stripe_id_history if not found in current stripe_id
	err = s.db.Raw("SELECT * FROM stripe.stripe_id_mappings WHERE ? = ANY(stripe_id_history)", stripeID).
		Scan(&mapping).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return "", false, fmt.Errorf("no mapping found for stripe_id: %s", stripeID)
		}
		return "", false, fmt.Errorf("database error: %w", err)
	}

	return mapping.ConfigItemID, true, nil // is_legacy = true
}

// CheckBillingStatus checks if customer has valid payment method attached
func (s *StripeService) CheckBillingStatus(stripeCustomerID string) (bool, error) {
	params := &stripe.CustomerParams{}
	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}

	cust, err := customer.Get(stripeCustomerID, params)
	if err != nil {
		return false, fmt.Errorf("failed to retrieve customer: %w", err)
	}

	// Check if default payment method or invoice settings exist
	hasPaymentMethod := cust.DefaultSource != nil ||
		(cust.InvoiceSettings != nil && cust.InvoiceSettings.DefaultPaymentMethod != nil)

	return hasPaymentMethod, nil
}

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
	"github.com/stripe/stripe-go/v82/invoice"
	"github.com/stripe/stripe-go/v82/invoiceitem"
	"github.com/stripe/stripe-go/v82/paymentmethod"
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

// applyConnectAccount sets the Connect account ID on Stripe params if configured
func (s *StripeService) applyConnectAccount(params interface{ SetStripeAccount(string) }) {
	if s.accountID != "" {
		params.SetStripeAccount(s.accountID)
	}
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
	s.applyConnectAccount(params)

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
	s.applyConnectAccount(params)

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
		s.applyConnectAccount(params)

		if mode == "subscription" {
			if params.SubscriptionData == nil {
				params.SubscriptionData = &stripe.CheckoutSessionSubscriptionDataParams{}
			}
			params.SubscriptionData.ApplicationFeePercent = stripe.Float64(s.feePct)
		} else if mode == "payment" {
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
	s.applyConnectAccount(params)

	_, err := meterevent.New(params)
	return err
}

func (s *StripeService) CreatePortalSession(customerID string, returnURL string) (*stripe.BillingPortalSession, error) {
	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(returnURL),
	}
	s.applyConnectAccount(params)

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
	s.applyConnectAccount(params)
	return price.Get(priceID, params)
}

// ArchiveStripeProduct archives a Stripe product by ID
func (s *StripeService) ArchiveStripeProduct(productID string) error {
	params := &stripe.ProductParams{
		Active: stripe.Bool(false),
	}
	s.applyConnectAccount(params)

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
	s.applyConnectAccount(params)

	_, err := price.Update(priceID, params)
	if err != nil {
		return fmt.Errorf("failed to archive Stripe price %s: %w", priceID, err)
	}

	return nil
}

// ArchiveStripeMeter deactivates a Stripe billing meter by ID
// Idempotent: returns success if meter is already deactivated
func (s *StripeService) ArchiveStripeMeter(meterID string) error {
	params := &stripe.BillingMeterDeactivateParams{}
	s.applyConnectAccount(params)

	_, err := meter.Deactivate(meterID, params)
	if err != nil {
		// Check if meter is already deactivated - treat as success (idempotent)
		if stripeErr, ok := err.(*stripe.Error); ok {
			logger.Logger.Debug("Stripe error detected",
				"meter_id", meterID,
				"code", stripeErr.Code,
				"msg", stripeErr.Msg,
				"type", stripeErr.Type)

			// Check Code, Msg, and Type fields for meter_already_deactivated
			if stripeErr.Code == "meter_already_deactivated" ||
				stripeErr.Msg == "meter_already_deactivated" ||
				stripeErr.Type == stripe.ErrorTypeInvalidRequest {
				// For invalid_request_error type, also check the message content
				errStr := err.Error()
				if stripeErr.Type == stripe.ErrorTypeInvalidRequest &&
					(stripeErr.Msg == "meter_already_deactivated" ||
						stripeErr.Code == "meter_already_deactivated") {
					logger.Logger.Debug("Meter already deactivated, treating as success", "meter_id", meterID)
					return nil
				}
				// Also check error string contains the message
				if len(errStr) > 0 && (stripeErr.Code == "meter_already_deactivated" || stripeErr.Msg == "meter_already_deactivated") {
					logger.Logger.Debug("Meter already deactivated (via error check), treating as success", "meter_id", meterID)
					return nil
				}
			}
		}
		logger.Logger.Error("Failed to deactivate Stripe meter", "error", err, "stripeID", meterID)
		return fmt.Errorf("failed to deactivate Stripe meter %s: %w", meterID, err)
	}

	return nil
}

// GetTenantActiveSubscriptions retrieves active subscriptions for a tenant
// Returns subscriptions with config_price_id instead of stripe_price_id
func (s *StripeService) GetTenantActiveSubscriptions(stripeCustomerID string) ([]models.SubscriptionResponse, error) {
	params := &stripe.SubscriptionListParams{
		Customer: stripe.String(stripeCustomerID),
	}
	s.applyConnectAccount(params)

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
				SubscriptionID:     sub.ID,
				ConfigPriceID:      configPriceID,
				Status:             string(sub.Status),
				IsLegacyPrice:      isLegacy,
				CurrentPeriodStart: item.CurrentPeriodStart,
				CurrentPeriodEnd:   item.CurrentPeriodEnd,
				CancelAtPeriodEnd:  sub.CancelAtPeriodEnd,
				CanceledAt:         getInt64Pointer(sub.CanceledAt),
				TrialStart:         getInt64Pointer(sub.TrialStart),
				TrialEnd:           getInt64Pointer(sub.TrialEnd),
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
	params := &stripe.PaymentMethodListParams{
		Customer: stripe.String(stripeCustomerID),
		Type:     stripe.String("card"),
	}
	s.applyConnectAccount(params)

	iter := paymentmethod.List(params)
	hasCard := iter.Next() // Returns true if at least one card exists

	if err := iter.Err(); err != nil {
		return false, fmt.Errorf("failed to list payment methods: %w", err)
	}
	return hasCard, nil
}

// getInt64Pointer converts an int64 to *int64, returning nil if the value is 0
func getInt64Pointer(val int64) *int64 {
	if val == 0 {
		return nil
	}
	return &val
}

// CreateSubscription creates a Stripe subscription for a customer with a given price
func (s *StripeService) CreateSubscription(customerID string, priceID string) (*stripe.Subscription, error) {
	params := &stripe.SubscriptionParams{
		Customer: stripe.String(customerID),
		Items: []*stripe.SubscriptionItemsParams{
			{
				Price: stripe.String(priceID),
			},
		},
	}
	s.applyConnectAccount(params)

	logger.Logger.Debug("Creating Stripe subscription",
		"customer_id", customerID,
		"price_id", priceID,
		"account_id", s.accountID)

	sub, err := subscription.New(params)
	if err != nil {
		logger.Logger.Error("Failed to create Stripe subscription",
			"customer_id", customerID,
			"price_id", priceID,
			"error", err)
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	logger.Logger.Info("Stripe subscription created successfully",
		"subscription_id", sub.ID,
		"customer_id", customerID,
		"status", sub.Status)

	return sub, nil
}

// CancelSubscription cancels a Stripe subscription immediately
func (s *StripeService) CancelSubscription(subscriptionID string) (*stripe.Subscription, error) {
	params := &stripe.SubscriptionCancelParams{}
	s.applyConnectAccount(params)

	logger.Logger.Debug("Canceling Stripe subscription immediately",
		"subscription_id", subscriptionID,
		"account_id", s.accountID)

	sub, err := subscription.Cancel(subscriptionID, params)
	if err != nil {
		logger.Logger.Error("Failed to cancel Stripe subscription",
			"subscription_id", subscriptionID,
			"error", err)
		return nil, fmt.Errorf("failed to cancel subscription: %w", err)
	}

	logger.Logger.Info("Stripe subscription canceled successfully",
		"subscription_id", subscriptionID,
		"status", sub.Status)

	return sub, nil
}

// CreateInvoice creates a new draft invoice for a customer
func (s *StripeService) CreateInvoice(customerID string, currency string, autoAdvance bool, collectionMethod string, daysUntilDue int64, description string, metadata map[string]string) (*stripe.Invoice, error) {
	params := &stripe.InvoiceParams{
		Customer:    stripe.String(customerID),
		Currency:    stripe.String(currency),
		AutoAdvance: stripe.Bool(autoAdvance),
	}

	if collectionMethod != "" {
		params.CollectionMethod = stripe.String(collectionMethod)
	}
	if daysUntilDue > 0 {
		params.DaysUntilDue = stripe.Int64(daysUntilDue)
	}

	if description != "" {
		params.Description = stripe.String(description)
	}

	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	s.applyConnectAccount(params)

	inv, err := invoice.New(params)
	if err != nil {
		logger.Logger.Error("Failed to create invoice",
			"customer_id", customerID,
			"error", err)
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	logger.Logger.Debug("Invoice created",
		"invoice_id", inv.ID,
		"customer_id", customerID)

	return inv, nil
}

// GetInvoice retrieves an invoice by ID
func (s *StripeService) GetInvoice(invoiceID string) (*stripe.Invoice, error) {
	params := &stripe.InvoiceParams{}
	s.applyConnectAccount(params)

	inv, err := invoice.Get(invoiceID, params)
	if err != nil {
		logger.Logger.Error("Failed to get invoice",
			"invoice_id", invoiceID,
			"error", err)
		return nil, fmt.Errorf("failed to get invoice: %w", err)
	}

	return inv, nil
}

// UpdateInvoice updates invoice description and metadata
func (s *StripeService) UpdateInvoice(invoiceID string, description *string, metadata map[string]string) (*stripe.Invoice, error) {
	params := &stripe.InvoiceParams{}
	s.applyConnectAccount(params)

	if description != nil {
		params.Description = description
	}

	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	inv, err := invoice.Update(invoiceID, params)
	if err != nil {
		logger.Logger.Error("Failed to update invoice",
			"invoice_id", invoiceID,
			"error", err)
		return nil, fmt.Errorf("failed to update invoice: %w", err)
	}

	logger.Logger.Debug("Invoice updated",
		"invoice_id", invoiceID)

	return inv, nil
}

// AddInvoiceLineItem adds a line item to a draft invoice
func (s *StripeService) AddInvoiceLineItem(invoiceID string, customerID string, amount int64, currency string, description string) (*stripe.InvoiceItem, error) {
	params := &stripe.InvoiceItemParams{
		Customer:    stripe.String(customerID),
		Invoice:     stripe.String(invoiceID),
		Amount:      stripe.Int64(amount),
		Currency:    stripe.String(currency),
		Description: stripe.String(description),
	}
	s.applyConnectAccount(params)

	item, err := invoiceitem.New(params)
	if err != nil {
		logger.Logger.Error("Failed to add invoice line item",
			"invoice_id", invoiceID,
			"customer_id", customerID,
			"amount", amount,
			"error", err)
		return nil, fmt.Errorf("failed to add invoice line item: %w", err)
	}

	logger.Logger.Debug("Invoice line item added",
		"invoice_id", invoiceID,
		"item_id", item.ID,
		"amount", amount)

	return item, nil
}

// AddInvoiceLineItemByPrice adds a line item to a draft invoice using a Stripe price ID and quantity
func (s *StripeService) AddInvoiceLineItemByPrice(invoiceID string, customerID string, stripePriceID string, quantity int64, currency string, description string, metadata map[string]string) (*stripe.InvoiceItem, error) {
	params := &stripe.InvoiceItemParams{
		Customer:    stripe.String(customerID),
		Invoice:     stripe.String(invoiceID),
		Quantity:    stripe.Int64(quantity),
		Currency:    stripe.String(currency),
		Description: stripe.String(description),
		Pricing: &stripe.InvoiceItemPricingParams{
			Price: stripe.String(stripePriceID),
		},
	}

	for k, v := range metadata {
		params.AddMetadata(k, v)
	}

	s.applyConnectAccount(params)

	item, err := invoiceitem.New(params)
	if err != nil {
		logger.Logger.Error("Failed to add invoice line item by price",
			"invoice_id", invoiceID,
			"customer_id", customerID,
			"price_id", stripePriceID,
			"quantity", quantity,
			"error", err)
		return nil, fmt.Errorf("failed to add invoice line item: %w", err)
	}

	logger.Logger.Debug("Invoice line item added by price",
		"invoice_id", invoiceID,
		"item_id", item.ID,
		"price_id", stripePriceID,
		"quantity", quantity)

	return item, nil
}

// FinalizeInvoice finalizes a draft invoice (optionally auto-advances to send)
func (s *StripeService) FinalizeInvoice(invoiceID string, autoAdvance bool) (*stripe.Invoice, error) {
	params := &stripe.InvoiceFinalizeInvoiceParams{
		AutoAdvance: stripe.Bool(autoAdvance),
	}
	s.applyConnectAccount(params)

	inv, err := invoice.FinalizeInvoice(invoiceID, params)
	if err != nil {
		logger.Logger.Error("Failed to finalize invoice",
			"invoice_id", invoiceID,
			"auto_advance", autoAdvance,
			"error", err)
		return nil, fmt.Errorf("failed to finalize invoice: %w", err)
	}

	logger.Logger.Info("Invoice finalized",
		"invoice_id", invoiceID,
		"status", inv.Status,
		"auto_advance", autoAdvance)

	return inv, nil
}

// SwapSubscriptionItemPrice swaps a subscription item's price to a new price
// Used for enterprise pricing transitions
func (s *StripeService) SwapSubscriptionItemPrice(subscriptionID string, oldConfigPriceID string, newStripePriceID string) error {
	// First, get the subscription to find the item with the old price
	params := &stripe.SubscriptionParams{}
	s.applyConnectAccount(params)

	sub, err := subscription.Get(subscriptionID, params)
	if err != nil {
		return fmt.Errorf("failed to get subscription: %w", err)
	}

	// Find the subscription item with the old price
	var targetItemID string
	for _, item := range sub.Items.Data {
		configID, _, err := s.GetConfigIDByStripeID(item.Price.ID)
		if err != nil {
			continue
		}
		if configID == oldConfigPriceID {
			targetItemID = item.ID
			break
		}
	}

	if targetItemID == "" {
		return fmt.Errorf("subscription item not found for price: %s", oldConfigPriceID)
	}

	// Update the subscription item with the new price
	updateParams := &stripe.SubscriptionParams{
		Items: []*stripe.SubscriptionItemsParams{
			{
				ID:    stripe.String(targetItemID),
				Price: stripe.String(newStripePriceID),
			},
		},
		ProrationBehavior: stripe.String("none"), // Don't prorate for enterprise switches
	}
	s.applyConnectAccount(updateParams)

	_, err = subscription.Update(subscriptionID, updateParams)
	if err != nil {
		return fmt.Errorf("failed to update subscription item price: %w", err)
	}

	logger.Logger.Info("Subscription item price swapped",
		"subscription_id", subscriptionID,
		"old_config_price", oldConfigPriceID,
		"new_stripe_price", newStripePriceID)

	return nil
}

// GetSubscriptionItemByPrice finds a subscription item by its config price ID
func (s *StripeService) GetSubscriptionItemByPrice(subscriptionID string, configPriceID string) (*stripe.SubscriptionItem, error) {
	params := &stripe.SubscriptionParams{}
	s.applyConnectAccount(params)

	sub, err := subscription.Get(subscriptionID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription: %w", err)
	}

	for _, item := range sub.Items.Data {
		configID, _, err := s.GetConfigIDByStripeID(item.Price.ID)
		if err != nil {
			continue
		}
		if configID == configPriceID {
			return item, nil
		}
	}

	return nil, fmt.Errorf("subscription item not found for price: %s", configPriceID)
}

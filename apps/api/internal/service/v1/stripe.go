package services_v1

import (
	"api/internal/config"
	"api/internal/models"
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

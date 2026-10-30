package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/stripe/stripe-go/v82"
)

var CreateProductError = errors.New("Failed to create stripe product")

func (s *Service) createProduct(ctx context.Context, productConfig Product) (*ProductChange, error) {
	if productConfig.StripeID != "" {
		tagParams := &stripe.ProductUpdateParams{
			Active:   stripe.Bool(true),
			Metadata: managedMetadata("product", productConfig.ID, productConfigHash(productConfig), nil),
		}
		s.stripe.ApplyAccount(tagParams)
		if _, err := s.stripe.Stripe.V1Products.Update(ctx, productConfig.StripeID, tagParams); err != nil {
			return nil, fmt.Errorf("failed to tag linked product %s: %w", productConfig.ID, err)
		}
		return &ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "linked",
			StripeID:    productConfig.StripeID,
			Details:     []string{fmt.Sprintf("Linked existing Stripe product %s to config ID %s", productConfig.StripeID, productConfig.ID)},
		}, nil
	}

	if productConfig.ID == "free" {
		return &ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "created_local",
			Details:     []string{fmt.Sprintf("Created free product: %s (local only)", productConfig.ID)},
		}, nil
	}

	params := buildProductCreateParams(productConfig, true)
	s.stripe.ApplyAccount(params)

	stripeProduct, err := s.stripe.Stripe.V1Products.Create(ctx, params)
	if err != nil {
		unarchived, unarchiveErr := s.unarchiveExistingProduct(ctx, productConfig)
		if unarchiveErr == nil {
			return unarchived, nil
		}
		return nil, fmt.Errorf("%w: %w", CreateProductError, err)
	}

	return &ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		StripeID:    stripeProduct.ID,
		Details:     []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)},
	}, nil
}

func buildProductCreateParams(productConfig Product, includeCustomID bool) *stripe.ProductCreateParams {
	params := &stripe.ProductCreateParams{
		Name:     stripe.String(productConfig.Name),
		Metadata: managedMetadata("product", productConfig.ID, productConfigHash(productConfig), nil),
	}
	if includeCustomID {
		params.ID = stripe.String(productConfig.ID)
	}
	if productConfig.Description != "" {
		params.Description = stripe.String(productConfig.Description)
	}
	if productConfig.Type != "" {
		params.Type = stripe.String(productConfig.Type)
	}
	return params
}

func (s *Service) updateProductFromConfig(ctx context.Context, desired Product, stripeID string) (*ProductChange, error) {
	params := &stripe.ProductUpdateParams{
		Name:     stripe.String(desired.Name),
		Active:   stripe.Bool(true),
		Metadata: managedMetadata("product", desired.ID, productConfigHash(desired), nil),
	}
	params.Description = stripe.String(desired.Description)

	s.stripe.ApplyAccount(params)
	if _, err := s.stripe.Stripe.V1Products.Update(ctx, stripeID, params); err != nil {
		return nil, fmt.Errorf("failed to update product: %w", err)
	}
	return &ProductChange{
		ProductID:   desired.ID,
		ProductName: desired.Name,
		Action:      "updated",
		StripeID:    stripeID,
		Details:     []string{fmt.Sprintf("Updated product: %s", stripeID)},
	}, nil
}

func (s *Service) recreateProduct(ctx context.Context, desired Product, oldStripeID string) (string, *ProductChange, error) {
	if _, err := s.archiveProductByStripeID(ctx, oldStripeID); err != nil {
		return "", nil, err
	}

	params := buildProductCreateParams(desired, false)
	s.stripe.ApplyAccount(params)
	stripeProduct, err := s.stripe.Stripe.V1Products.Create(ctx, params)
	if err != nil {
		return "", nil, fmt.Errorf("%w: failed to recreate product %s: %w", CreateProductError, desired.ID, err)
	}
	return stripeProduct.ID, &ProductChange{
		ProductID:   desired.ID,
		ProductName: desired.Name,
		Action:      "recreated",
		StripeID:    stripeProduct.ID,
		Details:     []string{fmt.Sprintf("Recreated product %s as %s", oldStripeID, stripeProduct.ID)},
	}, nil
}

func (s *Service) archiveProductByStripeID(ctx context.Context, stripeID string) (*ProductChange, error) {
	if stripeID == "free" {
		return &ProductChange{
			ProductID:   stripeID,
			ProductName: fmt.Sprintf("Product %s", stripeID),
			Action:      "archived_local",
			Details:     []string{fmt.Sprintf("Archived free product: %s (local only)", stripeID)},
		}, nil
	}

	getParams := &stripe.ProductRetrieveParams{}
	s.stripe.ApplyAccount(getParams)
	stripeProduct, err := s.stripe.Stripe.V1Products.Retrieve(ctx, stripeID, getParams)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &ProductChange{
				ProductID:   stripeID,
				ProductName: fmt.Sprintf("Product %s", stripeID),
				Action:      "archived",
				StripeID:    stripeID,
				Details:     []string{fmt.Sprintf("Product %s not found in Stripe (already deleted/archived)", stripeID)},
			}, nil
		}
		return nil, fmt.Errorf("failed to get product for archiving: %w", err)
	}

	archiveParams := &stripe.ProductUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(archiveParams)
	if _, err := s.stripe.Stripe.V1Products.Update(ctx, stripeID, archiveParams); err != nil {
		return nil, fmt.Errorf("failed to archive product: %w", err)
	}
	return &ProductChange{
		ProductID:   stripeID,
		ProductName: stripeProduct.Name,
		Action:      "archived",
		StripeID:    stripeID,
		Details:     []string{fmt.Sprintf("Archived product: %s", stripeID)},
	}, nil
}

func (s *Service) unarchiveExistingProduct(ctx context.Context, productConfig Product) (*ProductChange, error) {
	if productConfig.ID == "free" {
		return &ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "created_local",
			Details:     []string{fmt.Sprintf("Created free product: %s (local only)", productConfig.ID)},
		}, nil
	}

	params := &stripe.ProductUpdateParams{
		Active:   stripe.Bool(true),
		Name:     stripe.String(productConfig.Name),
		Metadata: managedMetadata("product", productConfig.ID, productConfigHash(productConfig), nil),
	}
	if productConfig.Description != "" {
		params.Description = stripe.String(productConfig.Description)
	}
	s.stripe.ApplyAccount(params)

	stripeProduct, err := s.stripe.Stripe.V1Products.Update(ctx, productConfig.ID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to unarchive Stripe product: %w", err)
	}
	return &ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		StripeID:    stripeProduct.ID,
		Details:     []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)},
	}, nil
}

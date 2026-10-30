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

func (s *Service) recreateProduct(ctx context.Context, desired Product, live *stripe.Product) (string, *ProductChange, error) {
	if _, err := s.archiveProduct(ctx, live); err != nil {
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
		Details:     []string{fmt.Sprintf("Recreated product %s as %s", live.ID, stripeProduct.ID)},
	}, nil
}

func productType(product Product) string {
	if product.Type == "" {
		return "service"
	}
	return product.Type
}

func productTypeOf(product *stripe.Product) string {
	value := string(product.Type)
	if value == "" {
		return "service"
	}
	return value
}

func (s *Service) archiveProduct(ctx context.Context, product *stripe.Product) (*ProductChange, error) {
	archiveParams := &stripe.ProductUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(archiveParams)
	if _, err := s.stripe.Stripe.V1Products.Update(ctx, product.ID, archiveParams); err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &ProductChange{
				ProductID:   product.ID,
				ProductName: product.Name,
				Action:      "archived",
				StripeID:    product.ID,
				Details:     []string{fmt.Sprintf("Product %s already deleted/archived", product.ID)},
			}, nil
		}
		return nil, fmt.Errorf("failed to archive product: %w", err)
	}
	return &ProductChange{
		ProductID:   product.ID,
		ProductName: product.Name,
		Action:      "archived",
		StripeID:    product.ID,
		Details:     []string{fmt.Sprintf("Archived product: %s", product.ID)},
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

	getParams := &stripe.ProductRetrieveParams{}
	s.stripe.ApplyAccount(getParams)
	existing, err := s.stripe.Stripe.V1Products.Retrieve(ctx, productConfig.ID, getParams)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve existing Stripe product: %w", err)
	}
	if productType(productConfig) != productTypeOf(existing) {
		_, change, recreateErr := s.recreateProduct(ctx, productConfig, existing)
		if recreateErr != nil {
			return nil, recreateErr
		}
		return change, nil
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

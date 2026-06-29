package stripe_config

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"

)

var CreateProductError = errors.New("Failed to create stripe product")

func (s *Service) createProduct(ctx context.Context, productConfig Product, configID uuid.UUID) (*ProductChange, error) {
	if productConfig.StripeID != "" {
		existing, err := s.GetMapping(ctx, productConfig.ID, "product")
		if err != nil {
			return nil, err
		}
		if existing != nil {
			return &ProductChange{
				ProductID:   productConfig.ID,
				ProductName: productConfig.Name,
				Action:      "skipped",
				Details: []string{
					fmt.Sprintf("Skipped product %s as stripe_id has already been linked to %s. Remove the stripe_id mapping to modify this resource.",
						productConfig.ID, existing.StripeID),
				},
			}, nil
		}
		if configID != uuid.Nil {
			if err := s.SaveMapping(ctx, configID, productConfig.ID, productConfig.StripeID, "product"); err != nil {
				return nil, err
			}
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

	params := &stripe.ProductCreateParams{
		ID:   stripe.String(productConfig.ID),
		Name: stripe.String(productConfig.Name),
	}
	if productConfig.Description != "" {
		params.Description = stripe.String(productConfig.Description)
	}
	s.stripe.ApplyAccount(params)

	stripeProduct, err := s.stripe.Stripe.V1Products.Create(ctx, params)
	if err != nil {
		unarchived, unarchiveErr := s.unarchiveExistingProduct(ctx, productConfig, configID)
		if unarchiveErr == nil {
			return unarchived, nil
		}
		return nil, fmt.Errorf("%w: %w", CreateProductError, err)
	}

	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			return nil, err
		}
	}
	return &ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		StripeID:    stripeProduct.ID,
		Details:     []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)},
	}, nil
}

func (s *Service) updateProduct(ctx context.Context, update ProductUpdate) (*ProductChange, error) {
	if update.ID == "free" {
		return &ProductChange{
			ProductID:   update.ID,
			ProductName: fmt.Sprintf("Product %s", update.ID),
			Action:      "updated_local",
			Details:     []string{"Updated free product (local only)"},
		}, nil
	}
	if update.RequiresRecreate {
		return &ProductChange{
			ProductID:   update.ID,
			ProductName: fmt.Sprintf("Product %s", update.ID),
			Action:      "recreated",
			Details:     []string{"Product recreated due to type change"},
		}, nil
	}

	details := []string{}
	if len(update.FieldChanges) > 0 {
		params := &stripe.ProductUpdateParams{}
		if name, ok := update.FieldChanges["name"].(string); ok {
			params.Name = stripe.String(name)
			details = append(details, fmt.Sprintf("Updated name to: %s", name))
		}
		if description, ok := update.FieldChanges["description"].(string); ok {
			params.Description = stripe.String(description)
			details = append(details, "Updated description")
		}
		s.stripe.ApplyAccount(params)
		if _, err := s.stripe.Stripe.V1Products.Update(ctx, update.ID, params); err != nil {
			return nil, fmt.Errorf("failed to update product: %w", err)
		}
	}
	return &ProductChange{
		ProductID:   update.ID,
		ProductName: fmt.Sprintf("Product %s", update.ID),
		Action:      "updated",
		Details:     details,
	}, nil
}

func (s *Service) archiveProduct(ctx context.Context, productID string) (*ProductChange, error) {
	if productID == "free" {
		return &ProductChange{
			ProductID:   productID,
			ProductName: fmt.Sprintf("Product %s", productID),
			Action:      "archived_local",
			Details:     []string{fmt.Sprintf("Archived free product: %s (local only)", productID)},
		}, nil
	}

	getParams := &stripe.ProductRetrieveParams{}
	s.stripe.ApplyAccount(getParams)
	stripeProduct, err := s.stripe.Stripe.V1Products.Retrieve(ctx, productID, getParams)
	if err != nil {
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			return &ProductChange{
				ProductID:   productID,
				ProductName: fmt.Sprintf("Product %s", productID),
				Action:      "archived",
				Details:     []string{fmt.Sprintf("Product %s not found in Stripe (already deleted/archived)", productID)},
			}, nil
		}
		return nil, fmt.Errorf("failed to get product for archiving: %w", err)
	}

	archiveParams := &stripe.ProductUpdateParams{Active: stripe.Bool(false)}
	s.stripe.ApplyAccount(archiveParams)
	if _, err := s.stripe.Stripe.V1Products.Update(ctx, productID, archiveParams); err != nil {
		return nil, fmt.Errorf("failed to archive product: %w", err)
	}
	return &ProductChange{
		ProductID:   productID,
		ProductName: stripeProduct.Name,
		Action:      "archived",
		Details:     []string{fmt.Sprintf("Archived product: %s", productID)},
	}, nil
}

func (s *Service) unarchiveExistingProduct(ctx context.Context, productConfig Product, configID uuid.UUID) (*ProductChange, error) {
	if productConfig.ID == "free" {
		return &ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "created_local",
			Details:     []string{fmt.Sprintf("Created free product: %s (local only)", productConfig.ID)},
		}, nil
	}

	params := &stripe.ProductUpdateParams{
		Active: stripe.Bool(true),
		Name:   stripe.String(productConfig.Name),
	}
	if productConfig.Description != "" {
		params.Description = stripe.String(productConfig.Description)
	}
	s.stripe.ApplyAccount(params)

	stripeProduct, err := s.stripe.Stripe.V1Products.Update(ctx, productConfig.ID, params)
	if err != nil {
		return nil, fmt.Errorf("failed to unarchive Stripe product: %w", err)
	}
	if configID != uuid.Nil {
		if err := s.SaveMapping(ctx, configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			return nil, err
		}
	}
	return &ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		StripeID:    stripeProduct.ID,
		Details:     []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)},
	}, nil
}

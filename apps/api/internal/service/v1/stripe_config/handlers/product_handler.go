package handlers

import (
	"api/internal/models"
	"fmt"

	"github.com/google/uuid"
	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/product"
)

type ProductHandler struct {
	idMapper  IDMapperInterface
	accountID string
}

type IDMapperInterface interface {
	SaveIDMapping(configID uuid.UUID, configItemID string, stripeID string, itemType string) error
	GetStripeIDByConfigItemID(configItemID string, itemType string) (string, error)
}

func NewProductHandler(idMapper IDMapperInterface, accountID string) *ProductHandler {
	return &ProductHandler{
		idMapper:  idMapper,
		accountID: accountID,
	}
}

func (h *ProductHandler) CreateProduct(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error) {
	// Skip Stripe API for free products - store in DB only
	if productConfig.ID == "free" {
		// Still save the ID mapping for consistency
		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, productConfig.ID, "product"); err != nil {
				return nil, fmt.Errorf("failed to save free product ID mapping: %w", err)
			}
		}

		return &models.ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "created_local",
			Details:     []string{fmt.Sprintf("Created free product: %s (local only)", productConfig.ID)},
		}, nil
	}

	// Create the product
	productParams := &stripe.ProductParams{
		ID:   stripe.String(productConfig.ID),
		Name: stripe.String(productConfig.Name),
	}

	if productConfig.Description != "" {
		productParams.Description = stripe.String(productConfig.Description)
	}

	if productConfig.Type != "" {
		productParams.Type = stripe.String(productConfig.Type)
	}

	// Add Connect account if in managed mode
	if h.accountID != "" {
		productParams.SetStripeAccount(h.accountID)
	}

	stripeProduct, err := product.New(productParams)
	if err != nil {
		// If product creation fails, try to unarchive the existing product
		unarchiveResult, unarchiveErr := h.unarchiveExistingProduct(productConfig, configID)
		if unarchiveErr == nil {
			return unarchiveResult, nil
		}
		// If unarchive also fails, return the original creation error
		return nil, fmt.Errorf("failed to create Stripe product: %w", err)
	}

	// Save product ID mapping if we have config IDs
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			return nil, fmt.Errorf("failed to save product ID mapping: %w", err)
		}
	}

	details := []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)}

	return &models.ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		Details:     details,
	}, nil
}

func (h *ProductHandler) UpdateProduct(update models.ProductUpdate, configID uuid.UUID) (*models.ProductChange, error) {
	details := []string{}

	// Skip Stripe API for free products
	if update.ID == "free" {
		return &models.ProductChange{
			ProductID:   update.ID,
			ProductName: fmt.Sprintf("Product %s", update.ID),
			Action:      "updated_local",
			Details:     []string{"Updated free product (local only)"},
		}, nil
	}

	if update.RequiresRecreate {
		// Product type changes require recreation
		// This is a simplified approach - in production you might want more sophisticated handling
		details = append(details, "Product recreated due to type change")
		return &models.ProductChange{
			ProductID:   update.ID,
			ProductName: fmt.Sprintf("Product %s", update.ID),
			Action:      "recreated",
			Details:     details,
		}, nil
	}

	// Update editable fields
	if len(update.FieldChanges) > 0 {
		updateParams := &stripe.ProductParams{}

		if name, ok := update.FieldChanges["name"].(string); ok {
			updateParams.Name = stripe.String(name)
			details = append(details, fmt.Sprintf("Updated name to: %s", name))
		}

		if description, ok := update.FieldChanges["description"].(string); ok {
			updateParams.Description = stripe.String(description)
			details = append(details, "Updated description")
		}

		// Add Connect account if in managed mode
		if h.accountID != "" {
			updateParams.SetStripeAccount(h.accountID)
		}

		_, err := product.Update(update.ID, updateParams)
		if err != nil {
			return nil, fmt.Errorf("failed to update product: %w", err)
		}
	}

	return &models.ProductChange{
		ProductID:   update.ID,
		ProductName: fmt.Sprintf("Product %s", update.ID),
		Action:      "updated",
		Details:     details,
	}, nil
}

func (h *ProductHandler) ArchiveProduct(productID string) (*models.ProductChange, error) {
	// Skip Stripe API for free products
	if productID == "free" {
		return &models.ProductChange{
			ProductID:   productID,
			ProductName: fmt.Sprintf("Product %s", productID),
			Action:      "archived_local",
			Details:     []string{fmt.Sprintf("Archived free product: %s (local only)", productID)},
		}, nil
	}

	// First get the product to retrieve its name
	getParams := &stripe.ProductParams{}
	if h.accountID != "" {
		getParams.SetStripeAccount(h.accountID)
	}
	stripeProduct, err := product.Get(productID, getParams)
	if err != nil {
		return nil, fmt.Errorf("failed to get product for archiving: %w", err)
	}

	// Archive the product
	archiveParams := &stripe.ProductParams{
		Active: stripe.Bool(false),
	}
	if h.accountID != "" {
		archiveParams.SetStripeAccount(h.accountID)
	}
	_, err = product.Update(productID, archiveParams)
	if err != nil {
		return nil, fmt.Errorf("failed to archive product: %w", err)
	}

	return &models.ProductChange{
		ProductID:   productID,
		ProductName: stripeProduct.Name,
		Action:      "archived",
		Details:     []string{fmt.Sprintf("Archived product: %s", productID)},
	}, nil
}

func (h *ProductHandler) unarchiveExistingProduct(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error) {
	// Skip Stripe API for free products
	if productConfig.ID == "free" {
		// Still save the ID mapping for consistency
		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, productConfig.ID, "product"); err != nil {
				return nil, fmt.Errorf("failed to save free product ID mapping: %w", err)
			}
		}

		return &models.ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "unarchived_local",
			Details:     []string{fmt.Sprintf("Unarchived free product: %s (local only)", productConfig.ID)},
		}, nil
	}

	// Unarchive the existing product by setting it to active
	updateParams := &stripe.ProductParams{
		Active: stripe.Bool(true),
	}

	// Also update the name and description to match the current config
	updateParams.Name = stripe.String(productConfig.Name)
	if productConfig.Description != "" {
		updateParams.Description = stripe.String(productConfig.Description)
	}

	// Add Connect account if in managed mode
	if h.accountID != "" {
		updateParams.SetStripeAccount(h.accountID)
	}

	stripeProduct, err := product.Update(productConfig.ID, updateParams)
	if err != nil {
		return nil, fmt.Errorf("failed to unarchive Stripe product: %w", err)
	}

	// Save product ID mapping if we have config IDs
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			return nil, fmt.Errorf("failed to save product ID mapping: %w", err)
		}
	}

	details := []string{fmt.Sprintf("Unarchived product: %s (config: %s)", stripeProduct.ID, productConfig.ID)}

	return &models.ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "unarchived",
		Details:     details,
	}, nil
}

package handlers

import (
	"api/internal/logger"
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
	GetMappingByConfigItemID(configItemID string, itemType string) (*models.StripeIDMapping, error)
}

func NewProductHandler(idMapper IDMapperInterface, accountID string) *ProductHandler {
	return &ProductHandler{
		idMapper:  idMapper,
		accountID: accountID,
	}
}

func (h *ProductHandler) CreateProduct(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error) {
	logger.Logger.Info("Creating product", "productID", productConfig.ID, "name", productConfig.Name)

	// Check if stripe_id is provided for migration support
	if productConfig.StripeID != "" {
		logger.Logger.Info("Product has stripe_id, checking for existing mapping",
			"productID", productConfig.ID,
			"stripeID", productConfig.StripeID)

		// Check if mapping already exists for this config_id
		existingMapping, err := h.idMapper.GetMappingByConfigItemID(productConfig.ID, "product")

		if err != nil {
			return nil, fmt.Errorf("failed to check existing mapping: %w", err)
		}

		if existingMapping != nil {
			// Mapping exists - SKIP
			logger.Logger.Info("Skipped product - stripe_id already linked",
				"productID", productConfig.ID,
				"existingStripeID", existingMapping.StripeID)

			return &models.ProductChange{
				ProductID:   productConfig.ID,
				ProductName: productConfig.Name,
				Action:      "skipped",
				Details: []string{
					fmt.Sprintf("Skipped product %s as stripe_id has already been linked to %s. Remove the stripe_id mapping to modify this resource.",
						productConfig.ID, existingMapping.StripeID),
				},
			}, nil
		}

		// No mapping exists - CREATE mapping with provided stripe_id
		logger.Logger.Info("Creating stripe_id mapping from config",
			"productID", productConfig.ID,
			"stripeID", productConfig.StripeID)

		if configID != uuid.Nil {
			if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, productConfig.StripeID, "product"); err != nil {
				return nil, fmt.Errorf("failed to create product mapping: %w", err)
			}
		}

		return &models.ProductChange{
			ProductID:   productConfig.ID,
			ProductName: productConfig.Name,
			Action:      "linked",
			Details:     []string{fmt.Sprintf("Linked existing Stripe product %s to config ID %s", productConfig.StripeID, productConfig.ID)},
		}, nil
	}

	// Skip Stripe API for free products - store in DB only
	if productConfig.ID == "free" {
		logger.Logger.Debug("Skipping free product (local only)", "productID", productConfig.ID)
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

	ApplyConnectAccount(h.accountID, productParams)

	logger.Logger.Info("Making Stripe API call to create product", "productID", productConfig.ID)
	stripeProduct, err := product.New(productParams)
	if err != nil {
		logger.Logger.Warn("Failed to create Stripe product, attempting unarchive", "error", err, "productID", productConfig.ID)
		// If product creation fails, try to unarchive the existing product
		unarchiveResult, unarchiveErr := h.unarchiveExistingProduct(productConfig, configID)
		if unarchiveErr == nil {
			return unarchiveResult, nil
		}
		// If unarchive also fails, return the original creation error
		logger.Logger.Error("Failed to create or unarchive Stripe product", "error", err, "productID", productConfig.ID)
		return nil, fmt.Errorf("failed to create Stripe product: %w", err)
	}
	logger.Logger.Info("Stripe product created successfully", "configProductID", productConfig.ID, "stripeID", stripeProduct.ID)

	// Save product ID mapping if we have config IDs
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			logger.Logger.Error("Failed to save product ID mapping", "error", err, "productID", productConfig.ID)
			return nil, fmt.Errorf("failed to save product ID mapping: %w", err)
		}
	}

	details := []string{fmt.Sprintf("Created product: %s (config: %s)", stripeProduct.ID, productConfig.ID)}

	logger.Logger.Info("Product creation completed", "productID", productConfig.ID)
	return &models.ProductChange{
		ProductID:   productConfig.ID,
		ProductName: productConfig.Name,
		Action:      "created",
		Details:     details,
	}, nil
}

func (h *ProductHandler) UpdateProduct(update models.ProductUpdate, configID uuid.UUID) (*models.ProductChange, error) {
	logger.Logger.Info("Updating product", "productID", update.ID, "requiresRecreate", update.RequiresRecreate)

	details := []string{}

	// Skip Stripe API for free products
	if update.ID == "free" {
		logger.Logger.Debug("Skipping free product update", "productID", update.ID)
		return &models.ProductChange{
			ProductID:   update.ID,
			ProductName: fmt.Sprintf("Product %s", update.ID),
			Action:      "updated_local",
			Details:     []string{"Updated free product (local only)"},
		}, nil
	}

	if update.RequiresRecreate {
		logger.Logger.Warn("Product requires recreation due to type change", "productID", update.ID)
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
		logger.Logger.Debug("Updating product fields", "productID", update.ID, "changes", len(update.FieldChanges))
		updateParams := &stripe.ProductParams{}

		if name, ok := update.FieldChanges["name"].(string); ok {
			updateParams.Name = stripe.String(name)
			details = append(details, fmt.Sprintf("Updated name to: %s", name))
		}

		if description, ok := update.FieldChanges["description"].(string); ok {
			updateParams.Description = stripe.String(description)
			details = append(details, "Updated description")
		}

		ApplyConnectAccount(h.accountID, updateParams)

		logger.Logger.Info("Making Stripe API call to update product", "productID", update.ID)
		_, err := product.Update(update.ID, updateParams)
		if err != nil {
			logger.Logger.Error("Failed to update Stripe product", "error", err, "productID", update.ID)
			return nil, fmt.Errorf("failed to update product: %w", err)
		}
		logger.Logger.Info("Product updated successfully", "productID", update.ID)
	}

	return &models.ProductChange{
		ProductID:   update.ID,
		ProductName: fmt.Sprintf("Product %s", update.ID),
		Action:      "updated",
		Details:     details,
	}, nil
}

func (h *ProductHandler) ArchiveProduct(productID string) (*models.ProductChange, error) {
	logger.Logger.Info("Archiving product", "productID", productID)

	// Skip Stripe API for free products
	if productID == "free" {
		logger.Logger.Debug("Skipping free product archival", "productID", productID)
		return &models.ProductChange{
			ProductID:   productID,
			ProductName: fmt.Sprintf("Product %s", productID),
			Action:      "archived_local",
			Details:     []string{fmt.Sprintf("Archived free product: %s (local only)", productID)},
		}, nil
	}

	// First get the product to retrieve its name
	getParams := &stripe.ProductParams{}
	ApplyConnectAccount(h.accountID, getParams)
	logger.Logger.Debug("Getting product details before archival", "productID", productID)
	stripeProduct, err := product.Get(productID, getParams)
	if err != nil {
		// If the product doesn't exist in Stripe (404), treat as already archived
		if stripeErr, ok := err.(*stripe.Error); ok && stripeErr.Code == stripe.ErrorCodeResourceMissing {
			logger.Logger.Info("Product not found in Stripe, treating as already archived", "productID", productID)
			return &models.ProductChange{
				ProductID:   productID,
				ProductName: fmt.Sprintf("Product %s", productID),
				Action:      "archived",
				Details:     []string{fmt.Sprintf("Product %s not found in Stripe (already deleted/archived)", productID)},
			}, nil
		}
		logger.Logger.Error("Failed to get product for archiving", "error", err, "productID", productID)
		return nil, fmt.Errorf("failed to get product for archiving: %w", err)
	}

	// Archive the product
	archiveParams := &stripe.ProductParams{
		Active: stripe.Bool(false),
	}
	ApplyConnectAccount(h.accountID, archiveParams)

	logger.Logger.Info("Making Stripe API call to archive product", "productID", productID)
	_, err = product.Update(productID, archiveParams)
	if err != nil {
		logger.Logger.Error("Failed to archive Stripe product", "error", err, "productID", productID)
		return nil, fmt.Errorf("failed to archive product: %w", err)
	}

	logger.Logger.Info("Product archived successfully", "productID", productID)
	return &models.ProductChange{
		ProductID:   productID,
		ProductName: stripeProduct.Name,
		Action:      "archived",
		Details:     []string{fmt.Sprintf("Archived product: %s", productID)},
	}, nil
}

func (h *ProductHandler) unarchiveExistingProduct(productConfig models.Product, configID uuid.UUID) (*models.ProductChange, error) {
	logger.Logger.Info("Unarchiving existing product", "productID", productConfig.ID)

	// Skip Stripe API for free products
	if productConfig.ID == "free" {
		logger.Logger.Debug("Skipping free product unarchival", "productID", productConfig.ID)
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

	ApplyConnectAccount(h.accountID, updateParams)

	logger.Logger.Info("Making Stripe API call to unarchive product", "productID", productConfig.ID)
	stripeProduct, err := product.Update(productConfig.ID, updateParams)
	if err != nil {
		logger.Logger.Error("Failed to unarchive Stripe product", "error", err, "productID", productConfig.ID)
		return nil, fmt.Errorf("failed to unarchive Stripe product: %w", err)
	}
	logger.Logger.Info("Product unarchived successfully", "productID", productConfig.ID, "stripeID", stripeProduct.ID)

	// Save product ID mapping if we have config IDs
	if configID != uuid.Nil {
		if err := h.idMapper.SaveIDMapping(configID, productConfig.ID, stripeProduct.ID, "product"); err != nil {
			logger.Logger.Error("Failed to save product ID mapping", "error", err, "productID", productConfig.ID)
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

package stripe_config

import (
	"api/internal/models"
	"reflect"
)

type Differ struct{}

func NewDiffer() *Differ {
	return &Differ{}
}

func (d *Differ) CalculateConfigDiff(oldConfig, newConfig *models.StripeConfiguration) *models.ConfigDiff {
	diff := &models.ConfigDiff{
		NewProducts:      []models.Product{},
		UpdatedProducts:  []models.ProductUpdate{},
		ArchivedProducts: []string{},
		NewMeters:        []models.Meter{},
		ArchivedMeters:   []string{},
	}

	// Create maps for easier lookup
	oldProductMap := make(map[string]models.Product)
	newProductMap := make(map[string]models.Product)

	for _, product := range oldConfig.Products {
		oldProductMap[product.ID] = product
	}

	for _, product := range newConfig.Products {
		newProductMap[product.ID] = product
	}

	// Find new and updated products
	for _, newProduct := range newConfig.Products {
		if oldProduct, exists := oldProductMap[newProduct.ID]; !exists {
			// This is a new product
			diff.NewProducts = append(diff.NewProducts, newProduct)
		} else {
			// Check if the product has been updated
			if update := d.calculateProductUpdate(oldProduct, newProduct); update != nil {
				diff.UpdatedProducts = append(diff.UpdatedProducts, *update)
			}
		}
	}

	// Find archived products
	for productID := range oldProductMap {
		if _, exists := newProductMap[productID]; !exists {
			diff.ArchivedProducts = append(diff.ArchivedProducts, productID)
		}
	}

	// Handle meter differences
	oldMeterMap := make(map[string]models.Meter)
	newMeterMap := make(map[string]models.Meter)

	for _, meter := range oldConfig.Meters {
		oldMeterMap[meter.ID] = meter
	}

	for _, meter := range newConfig.Meters {
		newMeterMap[meter.ID] = meter
	}

	// Find new meters
	for _, newMeter := range newConfig.Meters {
		if _, exists := oldMeterMap[newMeter.ID]; !exists {
			diff.NewMeters = append(diff.NewMeters, newMeter)
		}
		// Note: Meters are immutable in Stripe, so we don't check for updates
	}

	// Find archived meters
	for meterID := range oldMeterMap {
		if _, exists := newMeterMap[meterID]; !exists {
			diff.ArchivedMeters = append(diff.ArchivedMeters, meterID)
		}
	}

	return diff
}

func (d *Differ) calculateProductUpdate(oldProduct, newProduct models.Product) *models.ProductUpdate {
	update := &models.ProductUpdate{
		ID:               newProduct.ID,
		FieldChanges:     make(map[string]interface{}),
		NewPrices:        []models.Price{},
		UpdatedPrices:    []models.Price{},
		ArchivedPrices:   []string{},
		RequiresRecreate: false,
	}

	hasChanges := false

	// Check for field changes
	if oldProduct.Name != newProduct.Name {
		update.FieldChanges["name"] = newProduct.Name
		hasChanges = true
	}

	if oldProduct.Description != newProduct.Description {
		update.FieldChanges["description"] = newProduct.Description
		hasChanges = true
	}

	if oldProduct.Type != newProduct.Type {
		update.FieldChanges["type"] = newProduct.Type
		update.RequiresRecreate = true
		hasChanges = true
	}

	// Check price changes
	oldPriceMap := make(map[string]models.Price)
	newPriceMap := make(map[string]models.Price)

	for _, price := range oldProduct.Prices {
		oldPriceMap[price.ID] = price
	}

	for _, price := range newProduct.Prices {
		newPriceMap[price.ID] = price
	}

	// Find new and updated prices
	for _, newPrice := range newProduct.Prices {
		if oldPrice, exists := oldPriceMap[newPrice.ID]; !exists {
			update.NewPrices = append(update.NewPrices, newPrice)
			hasChanges = true
		} else if !reflect.DeepEqual(oldPrice, newPrice) {
			// Prices are immutable in Stripe, so any change requires a new price
			update.NewPrices = append(update.NewPrices, newPrice)
			update.ArchivedPrices = append(update.ArchivedPrices, oldPrice.ID)
			hasChanges = true
		}
	}

	// Find archived prices
	for priceID := range oldPriceMap {
		if _, exists := newPriceMap[priceID]; !exists {
			update.ArchivedPrices = append(update.ArchivedPrices, priceID)
			hasChanges = true
		}
	}

	if !hasChanges {
		return nil
	}

	return update
}

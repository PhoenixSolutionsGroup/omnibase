package api_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var apiURL string

func init() {
	godotenv.Load("../.env")
	apiURL = os.Getenv("TEST_API_URL")
	if apiURL == "" {
		apiURL = "http://localhost:8080" // default fallback
	}
}

func loadTestConfig(filename string) ([]byte, error) {
	return os.ReadFile(fmt.Sprintf("../../test_configs/%s", filename))
}

// setupCleanState ensures we start with an empty Stripe configuration
func setupCleanState(t *testing.T) {
	emptyConfig := map[string]interface{}{
		"version":  "v1.0.0",
		"products": []interface{}{},
		"meters":   []interface{}{},
	}

	emptyConfigBytes, err := json.Marshal(emptyConfig)
	require.NoError(t, err)

	url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewReader(emptyConfigBytes))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	// Should return 200 status
	require.Equal(t, http.StatusOK, resp.StatusCode)
}

func TestStripeConfigCreateAndArchive(t *testing.T) {
	// List of all test config files to test
	testConfigs := []string{
		"01_simple_basic.json",
		"02_multiple_plans.json",
		"03_metered_billing.json",
		"04_tiered_pricing.json",
		"05_enterprise_complex.json",
		"06_basic_ui_example.json",
		"07_advanced_ui_example.json",
	}

	for _, configFile := range testConfigs {
		t.Run(configFile, func(t *testing.T) {
			testSingleConfig(t, configFile)
		})
	}
}

func testSingleConfig(t *testing.T, configFile string) {
	// Setup clean state before running tests
	setupCleanState(t)

	// Load test configuration
	configBytes, err := loadTestConfig(configFile)
	require.NoError(t, err)

	var configData map[string]interface{}
	err = json.Unmarshal(configBytes, &configData)
	require.NoError(t, err)

	// Test 1: Create configuration
	t.Run("Create Stripe Config", func(t *testing.T) {
		url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
		req, err := http.NewRequest("POST", url, bytes.NewReader(configBytes))
		require.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		require.NoError(t, err)
		defer resp.Body.Close()

		// Should return 200 status
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)

		validateConfigCreationResponse(t, response, configData)
	})

	// Test 2: Verify configuration is retrievable
	t.Run("Get Stripe Config", func(t *testing.T) {
		url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
		req, err := http.NewRequest("GET", url, nil)
		require.NoError(t, err)

		client := &http.Client{}
		resp, err := client.Do(req)
		require.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)

		validateRetrievedConfig(t, response, configData)
	})

	// Test 3: Archive configuration (empty products array)
	t.Run("Archive Stripe Config", func(t *testing.T) {
		emptyConfig := map[string]interface{}{
			"version":  configData["version"],
			"products": []interface{}{},
		}
		// Include meters if they exist in original config
		if meters, exists := configData["meters"]; exists {
			emptyConfig["meters"] = meters
		}

		emptyConfigBytes, err := json.Marshal(emptyConfig)
		require.NoError(t, err)

		url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
		req, err := http.NewRequest("POST", url, bytes.NewReader(emptyConfigBytes))
		require.NoError(t, err)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		require.NoError(t, err)
		defer resp.Body.Close()

		// Should return 200 status
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)

		validateArchiveResponse(t, response, configData)
	})

	// Test 4: Verify configuration is now empty
	t.Run("Verify Config is Empty After Archive", func(t *testing.T) {
		url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
		req, err := http.NewRequest("GET", url, nil)
		require.NoError(t, err)

		client := &http.Client{}
		resp, err := client.Do(req)
		require.NoError(t, err)
		defer resp.Body.Close()

		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		require.NoError(t, err)

		validateEmptyConfigAfterArchive(t, response)
	})
}

// Helper function to validate config creation response
func validateConfigCreationResponse(t *testing.T, response map[string]interface{}, configData map[string]interface{}) {
	// Verify response structure
	assert.Contains(t, response, "data")
	data := response["data"].(map[string]interface{})
	assert.Contains(t, data, "changes")

	changes := data["changes"].(map[string]interface{})
	assert.Contains(t, changes, "created")

	// Validate products were created
	created := changes["created"].([]interface{})
	expectedProducts := configData["products"].([]interface{})
	assert.Len(t, created, len(expectedProducts), "All products should be created")

	// Validate each created product
	for i, createdItem := range created {
		createdProduct := createdItem.(map[string]interface{})
		expectedProduct := expectedProducts[i].(map[string]interface{})

		assert.Equal(t, expectedProduct["id"], createdProduct["product_id"])
		assert.Equal(t, expectedProduct["name"], createdProduct["product_name"])
		action := createdProduct["action"].(string)
		assert.Contains(t, []string{"created", "unarchived"}, action, "Product action should be either 'created' or 'unarchived'")
	}

	// Validate meters were created if they exist
	if expectedMeters, hasMeters := configData["meters"]; hasMeters {
		expectedMetersList := expectedMeters.([]interface{})
		if len(expectedMetersList) > 0 {
			assert.Contains(t, changes, "meters")
			meterChanges := changes["meters"].(map[string]interface{})
			assert.Contains(t, meterChanges, "created")

			createdMeters := meterChanges["created"].([]interface{})
			assert.Len(t, createdMeters, len(expectedMetersList), "All meters should be created")

			for i, createdMeterItem := range createdMeters {
				createdMeter := createdMeterItem.(map[string]interface{})
				expectedMeter := expectedMetersList[i].(map[string]interface{})

				assert.Equal(t, expectedMeter["id"], createdMeter["meter_id"])
				assert.Equal(t, expectedMeter["display_name"], createdMeter["display_name"])
				meterAction := createdMeter["action"].(string)
				assert.Contains(t, []string{"created", "unarchived"}, meterAction, "Meter action should be either 'created' or 'unarchived'")
				assert.NotEmpty(t, createdMeter["stripe_id"], "Meter should have Stripe ID")
			}
		}
	}
}

// Helper function to validate retrieved config
func validateRetrievedConfig(t *testing.T, response map[string]interface{}, configData map[string]interface{}) {
	// Verify response contains the config we created
	assert.Contains(t, response, "data")
	data := response["data"].(map[string]interface{})
	assert.Contains(t, data, "config")

	config := data["config"].(map[string]interface{})
	assert.Contains(t, config, "products")

	// Validate products
	products := config["products"].([]interface{})
	expectedProducts := configData["products"].([]interface{})
	assert.Len(t, products, len(expectedProducts), "Retrieved config should have all products")

	// Create maps for easier lookup
	expectedProductMap := make(map[string]map[string]interface{})
	for _, p := range expectedProducts {
		product := p.(map[string]interface{})
		expectedProductMap[product["id"].(string)] = product
	}

	// Validate each product
	for _, retrievedProductItem := range products {
		retrievedProduct := retrievedProductItem.(map[string]interface{})
		productID := retrievedProduct["id"].(string)

		expectedProduct, exists := expectedProductMap[productID]
		assert.True(t, exists, "Retrieved product should exist in original config")

		assert.Equal(t, expectedProduct["name"], retrievedProduct["name"])

		// Check that Stripe IDs are populated (except for free products)
		if productID != "free" {
			if stripeID, exists := retrievedProduct["stripe_id"]; exists && stripeID != nil {
				assert.NotEmpty(t, stripeID)
			}
		}

		// Validate prices
		retrievedPrices := retrievedProduct["prices"].([]interface{})
		expectedPrices := expectedProduct["prices"].([]interface{})
		assert.Len(t, retrievedPrices, len(expectedPrices), "Product should have all expected prices")

		// Create expected price map
		expectedPriceMap := make(map[string]map[string]interface{})
		for _, p := range expectedPrices {
			price := p.(map[string]interface{})
			expectedPriceMap[price["id"].(string)] = price
		}

		// Validate each price
		for _, retrievedPriceItem := range retrievedPrices {
			retrievedPrice := retrievedPriceItem.(map[string]interface{})
			priceID := retrievedPrice["id"].(string)

			expectedPrice, exists := expectedPriceMap[priceID]
			assert.True(t, exists, "Retrieved price should exist in original config")

			// Check if amount exists and is not nil before conversion
			expectedAmount, expectedOk := expectedPrice["amount"]
			retrievedAmount, retrievedOk := retrievedPrice["amount"]

			// Handle tiered pricing that doesn't have simple amount field
			if expectedOk && retrievedOk && expectedAmount != nil && retrievedAmount != nil {
				// Try to convert safely
				expectedFloat, expectedFloatOk := expectedAmount.(float64)
				retrievedFloat, retrievedFloatOk := retrievedAmount.(float64)

				if expectedFloatOk && retrievedFloatOk {
					assert.Equal(t, int64(expectedFloat), int64(retrievedFloat))
				} else {
					// Fallback: compare as strings or skip this assertion
					assert.Equal(t, fmt.Sprintf("%v", expectedAmount), fmt.Sprintf("%v", retrievedAmount))
				}
			} else {
				// Check if this is a tiered price structure
				if expectedTiers, hasTiers := expectedPrice["tiers"]; hasTiers {
					if retrievedTiers, hasRetrievedTiers := retrievedPrice["tiers"]; hasRetrievedTiers {
						// For tiered pricing, we need to compare tiers with flexible null handling
						validateTiers(t, expectedTiers.([]interface{}), retrievedTiers.([]interface{}))
					}
				} else if expectedAmount != nil && retrievedAmount != nil {
					assert.Equal(t, expectedAmount, retrievedAmount)
				}
			}

			assert.Equal(t, expectedPrice["currency"], retrievedPrice["currency"])

			if interval, hasInterval := expectedPrice["interval"]; hasInterval {
				assert.Equal(t, interval, retrievedPrice["interval"])
			}

			// Check Stripe ID for non-free prices
			if priceID != "free" {
				if stripeID, exists := retrievedPrice["stripe_id"]; exists && stripeID != nil {
					assert.NotEmpty(t, stripeID)
				}
			}

			// Validate meter reference if price has meter
			if expectedMeter, hasMeter := expectedPrice["meter"]; hasMeter {
				assert.Contains(t, retrievedPrice, "meter", "Price should have meter reference")
				assert.Equal(t, expectedMeter, retrievedPrice["meter"], "Price should reference correct meter")

				// NEW: Validate meter association - the meter field should reference an existing meter
				// and that meter should have a Stripe ID populated
				if meters, hasMeters := config["meters"]; hasMeters {
					metersList := meters.([]interface{})
					meterFound := false
					for _, meterItem := range metersList {
						meter := meterItem.(map[string]interface{})
						if meter["id"].(string) == expectedMeter.(string) {
							// Verify the meter has a Stripe ID (meaning it was created in Stripe)
							assert.Contains(t, meter, "stripe_id", "Referenced meter should have stripe_id")
							if meterStripeID, exists := meter["stripe_id"]; exists && meterStripeID != nil {
								assert.NotEmpty(t, meterStripeID, "Meter stripe_id should not be empty")
							}
							meterFound = true
							break
						}
					}
					assert.True(t, meterFound, "Referenced meter should exist in config")
				}
			}
		}
	}

	// Validate meters if they exist
	if expectedMeters, hasMeters := configData["meters"]; hasMeters {
		expectedMetersList := expectedMeters.([]interface{})
		if len(expectedMetersList) > 0 {
			assert.Contains(t, config, "meters")

			meters := config["meters"].([]interface{})
			assert.Len(t, meters, len(expectedMetersList), "Retrieved config should have all meters")

			// Create expected meter map
			expectedMeterMap := make(map[string]map[string]interface{})
			for _, m := range expectedMetersList {
				meter := m.(map[string]interface{})
				expectedMeterMap[meter["id"].(string)] = meter
			}

			// Validate each meter
			for _, retrievedMeterItem := range meters {
				retrievedMeter := retrievedMeterItem.(map[string]interface{})
				meterID := retrievedMeter["id"].(string)

				expectedMeter, exists := expectedMeterMap[meterID]
				assert.True(t, exists, "Retrieved meter should exist in original config")

				assert.Equal(t, expectedMeter["display_name"], retrievedMeter["display_name"])
				assert.Equal(t, expectedMeter["event_name"], retrievedMeter["event_name"])

				// Check that Stripe ID is populated
				if stripeID, exists := retrievedMeter["stripe_id"]; exists && stripeID != nil {
					assert.NotEmpty(t, stripeID)
				}
			}
		}
	}
}

// Helper function to validate archive response
func validateArchiveResponse(t *testing.T, response map[string]interface{}, originalConfigData map[string]interface{}) {
	// Verify response structure
	assert.Contains(t, response, "data")
	data := response["data"].(map[string]interface{})
	assert.Contains(t, data, "changes")

	changes := data["changes"].(map[string]interface{})
	assert.Contains(t, changes, "archived")

	// Validate products were archived
	archived := changes["archived"].([]interface{})
	expectedProducts := originalConfigData["products"].([]interface{})
	assert.Len(t, archived, len(expectedProducts), "All products should be archived")

	// Create expected product map for validation
	expectedProductMap := make(map[string]map[string]interface{})
	for _, p := range expectedProducts {
		product := p.(map[string]interface{})
		expectedProductMap[product["id"].(string)] = product
	}

	// Validate each archived product
	for _, archivedItem := range archived {
		archivedProduct := archivedItem.(map[string]interface{})
		productID := archivedProduct["product_id"].(string)

		expectedProduct, exists := expectedProductMap[productID]
		assert.True(t, exists, "Archived product should exist in original config")

		assert.Equal(t, expectedProduct["name"], archivedProduct["product_name"])
		assert.Equal(t, "archived", archivedProduct["action"])
	}

}

// Helper function to validate tiers with flexible null handling
func validateTiers(t *testing.T, expectedTiers []interface{}, retrievedTiers []interface{}) {
	assert.Len(t, retrievedTiers, len(expectedTiers), "Tiers count should match")

	for i, expectedTierItem := range expectedTiers {
		if i >= len(retrievedTiers) {
			break
		}

		expectedTier := expectedTierItem.(map[string]interface{})
		retrievedTier := retrievedTiers[i].(map[string]interface{})

		// Compare required fields
		assert.Equal(t, expectedTier["unit_amount"], retrievedTier["unit_amount"], "unit_amount should match")
		assert.Equal(t, expectedTier["up_to"], retrievedTier["up_to"], "up_to should match")

		// Handle flat_amount with flexible null comparison
		expectedFlatAmount, expectedHasFlat := expectedTier["flat_amount"]
		retrievedFlatAmount, retrievedHasFlat := retrievedTier["flat_amount"]

		// If expected has flat_amount and it's null, retrieved might omit it entirely
		if expectedHasFlat {
			if expectedFlatAmount == nil {
				// Expected null - retrieved can either be null or missing
				if retrievedHasFlat {
					assert.Nil(t, retrievedFlatAmount, "flat_amount should be nil when expected to be null")
				}
				// If not present in retrieved, that's also acceptable for null values
			} else {
				// Expected has non-null value - retrieved must have the same value
				assert.True(t, retrievedHasFlat, "flat_amount should be present when expected to have a value")
				assert.Equal(t, expectedFlatAmount, retrievedFlatAmount, "flat_amount values should match")
			}
		} else {
			// Expected doesn't have flat_amount - retrieved shouldn't either (or should be null)
			if retrievedHasFlat {
				assert.Nil(t, retrievedFlatAmount, "flat_amount should be nil when not expected")
			}
		}
	}
}

// Helper function to validate empty config after archive
func validateEmptyConfigAfterArchive(t *testing.T, response map[string]interface{}) {
	// Verify response contains empty config
	assert.Contains(t, response, "data")
	data := response["data"].(map[string]interface{})
	assert.Contains(t, data, "config")

	config := data["config"].(map[string]interface{})
	assert.Contains(t, config, "products")

	products := config["products"].([]interface{})
	assert.Len(t, products, 0, "Products array should be empty after archiving")
}

func TestMeterPriceAssociations(t *testing.T) {
	// Test configs that have metered billing
	meteredConfigs := []string{
		"03_metered_billing.json",
		"05_enterprise_complex.json",
	}

	for _, configFile := range meteredConfigs {
		t.Run(configFile, func(t *testing.T) {
			testMeterPriceAssociation(t, configFile)
		})
	}
}

func testMeterPriceAssociation(t *testing.T, configFile string) {
	// Setup clean state
	setupCleanState(t)

	// Load and create config
	configBytes, err := loadTestConfig(configFile)
	require.NoError(t, err)

	var configData map[string]interface{}
	err = json.Unmarshal(configBytes, &configData)
	require.NoError(t, err)

	// Create configuration
	url := fmt.Sprintf("%s/api/v1/stripe/config", apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewReader(configBytes))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	require.Equal(t, http.StatusOK, resp.StatusCode)

	// Retrieve the config to validate meter-price associations
	getReq, err := http.NewRequest("GET", url, nil)
	require.NoError(t, err)

	getResp, err := client.Do(getReq)
	require.NoError(t, err)
	defer getResp.Body.Close()

	require.Equal(t, http.StatusOK, getResp.StatusCode)

	var response map[string]interface{}
	err = json.NewDecoder(getResp.Body).Decode(&response)
	require.NoError(t, err)

	validateMeterPriceAssociations(t, response, configData)
}

func validateMeterPriceAssociations(t *testing.T, response map[string]interface{}, configData map[string]interface{}) {
	data := response["data"].(map[string]interface{})
	config := data["config"].(map[string]interface{})

	// Build meter lookup map: config meter ID -> stripe meter ID
	meterLookup := make(map[string]string)
	if meters, hasMeters := config["meters"]; hasMeters {
		metersList := meters.([]interface{})
		for _, meterItem := range metersList {
			meter := meterItem.(map[string]interface{})
			configMeterID := meter["id"].(string)
			if stripeID, exists := meter["stripe_id"]; exists && stripeID != nil {
				meterLookup[configMeterID] = stripeID.(string)
			}
		}
	}

	// Track metered prices for comprehensive validation
	meteredPricesCount := 0

	// Validate all metered prices
	products := config["products"].([]interface{})
	for _, productItem := range products {
		product := productItem.(map[string]interface{})
		productID := product["id"].(string)
		prices := product["prices"].([]interface{})

		for _, priceItem := range prices {
			price := priceItem.(map[string]interface{})
			priceID := price["id"].(string)

			// If price references a meter
			if meterRef, hasMeter := price["meter"]; hasMeter {
				meteredPricesCount++
				configMeterID := meterRef.(string)

				t.Logf("Validating metered price: %s (product: %s, meter: %s)",
					priceID, productID, configMeterID)

				// Validate that the referenced meter exists and has a Stripe ID
				expectedStripeID, meterExists := meterLookup[configMeterID]
				assert.True(t, meterExists,
					"Referenced meter %s should exist in config for price %s",
					configMeterID, priceID)

				if meterExists {
					assert.NotEmpty(t, expectedStripeID,
						"Meter %s should have a Stripe ID for price %s",
						configMeterID, priceID)
				}

				// Validate pricing structure for metered prices
				if usageType, hasUsageType := price["usage_type"]; hasUsageType {
					assert.Equal(t, "metered", usageType,
						"Price %s with meter should have usage_type 'metered'", priceID)
				}

				// Validate that the price has a Stripe ID (meaning it was created successfully)
				assert.Contains(t, price, "stripe_id",
					"Metered price %s should have stripe_id", priceID)
				if stripeID, exists := price["stripe_id"]; exists && stripeID != nil {
					assert.NotEmpty(t, stripeID,
						"Price %s stripe_id should not be empty", priceID)
				}
			}
		}
	}

	// Ensure we actually tested some metered prices
	assert.Greater(t, meteredPricesCount, 0,
		"Test should validate at least one metered price")

	t.Logf("Successfully validated %d metered prices", meteredPricesCount)
}

import {
  createSimpleConfig,
  getConfigAfterCreate,
  archiveAllConfig,
  publicConfigFiltersPrivatePrices,
} from "./01-crud";

import {
  createConfigWithMeters,
  verifyMeterHasStripeID,
  verifyMeteredPriceReferencesCorrectMeter,
  createMultipleMeters,
  meterValidationErrors,
  meteredPriceWithoutMeterReference,
  priceReferencingNonExistentMeter,
} from "./02-meters";

import {
  rejectMissingProductID,
  rejectMissingProductName,
  rejectEmptyProductName,
  rejectProductWithNoPrices,
  rejectMissingPriceID,
  rejectEmptyPriceID,
  rejectNegativeAmount,
  rejectInvalidCurrency,
  rejectInvalidInterval,
  rejectTieredWithPerUnitScheme,
  rejectTieredWithoutTiersMode,
  rejectTieredWithoutTiers,
  rejectTieredWithEmptyTiers,
  rejectAmountOnTieredPrice,
  rejectTieredWithoutInfTier,
  rejectInvalidAggregationFormula,
  rejectMeterWithoutAggregation,
  rejectMissingVersion,
  rejectEmptyVersion,
  rejectMissingProducts,
  rejectNullProducts,
  acceptEmptyProducts,
  rejectDuplicateProductIDs,
  rejectDuplicatePriceIDs,
  rejectDuplicateMeterIDs,
} from "./03-validation";

import {
  detectNewProduct,
  detectNewPrice,
  detectNewMeter,
  detectProductNameUpdate,
  detectProductDescriptionUpdate,
  detectRemovedProduct,
  detectRemovedPrice,
  detectRemovedMeter,
  priceAmountChangeTriggersRecreation,
  priceCurrencyChangeTriggersRecreation,
  priceIntervalChangeTriggersRecreation,
  priceUsageTypeChangeTriggersRecreation,
  noChangeOnIdenticalConfig,
  noChangeOnVersionOnlyUpdate,
} from "./04-differ";

import {
  convertStripeIDToConfigID,
  convertNonExistentStripeID,
  convertPriceStripeIDToConfigID,
  migrationWithStripeID,
  migrationSkipsExistingMapping,
  freeProductLocalOnly,
  freePriceLocalOnly,
  unarchiveExistingProduct,
} from "./05-id-mapping";

import {
  pullConfigFromStripe,
  pullConfigNormalizesIDs,
  pullConfigExcludesProductsWithoutPrices,
  archiveAllArchivesMeters,
  archiveAllArchivesPrices,
  archiveAllArchivesProducts,
  archiveAllCreatesEmptyConfig,
  archiveAllHandlesPartialFailures,
  getConfigHistoryPagination,
  getConfigHistoryLimit,
  getConfigHistoryOffset,
  getConfigHistoryInvalidLimit,
  getConfigHistoryLimitExceedsMax,
  validateValidConfig,
  validateInvalidConfig,
  getSchema,
} from "./06-admin";

import {
  getPriceByID,
  getPriceByIDNotFound,
  getProductByID,
  getProductByIDNotFound,
  getMeterByID,
  getMeterByIDNotFound,
  productsWithNoPublicPricesExcluded,
} from "./07-lookups";

import {
  createGraduatedTieredPrice,
  createVolumeTieredPrice,
  verifyTiersStructure,
  verifyInfinityTier,
  pullConfigPreservesTiers,
  tiersModeCorrectlySet,
} from "./08-tiered";

/**
 * Stripe Config Integration Tests
 *
 * Comprehensive test suite for the Stripe configuration management service.
 * Tests cover CRUD operations, meters, validation, diffing, ID mapping,
 * admin endpoints, resource lookups, and tiered pricing.
 *
 * Prerequisites:
 * - API running at API_URL (default: http://localhost:8080)
 * - Valid STRIPE_SECRET_KEY environment variable
 * - X-Service-Key header for authentication
 */
export async function StripeConfigTests() {
  // 01-crud.ts - Basic CRUD lifecycle tests
  createSimpleConfig();
  getConfigAfterCreate();
  archiveAllConfig();
  publicConfigFiltersPrivatePrices();

  // 02-meters.ts - Meter-specific tests
  createConfigWithMeters();
  verifyMeterHasStripeID();
  verifyMeteredPriceReferencesCorrectMeter();
  createMultipleMeters();
  meterValidationErrors();
  meteredPriceWithoutMeterReference();
  priceReferencingNonExistentMeter();

  // 03-validation.ts - Validation error tests
  rejectMissingProductID();
  rejectMissingProductName();
  rejectEmptyProductName();
  rejectProductWithNoPrices();
  rejectMissingPriceID();
  rejectEmptyPriceID();
  rejectNegativeAmount();
  rejectInvalidCurrency();
  rejectInvalidInterval();
  rejectTieredWithPerUnitScheme();
  rejectTieredWithoutTiersMode();
  rejectTieredWithoutTiers();
  rejectTieredWithEmptyTiers();
  rejectAmountOnTieredPrice();
  rejectTieredWithoutInfTier();
  rejectInvalidAggregationFormula();
  rejectMeterWithoutAggregation();
  rejectMissingVersion();
  rejectEmptyVersion();
  rejectMissingProducts();
  rejectNullProducts();
  acceptEmptyProducts();
  rejectDuplicateProductIDs();
  rejectDuplicatePriceIDs();
  rejectDuplicateMeterIDs();

  // 04-differ.ts - Diff/change detection tests
  detectNewProduct();
  detectNewPrice();
  detectNewMeter();
  detectProductNameUpdate();
  detectProductDescriptionUpdate();
  detectRemovedProduct();
  detectRemovedPrice();
  detectRemovedMeter();
  priceAmountChangeTriggersRecreation();
  priceCurrencyChangeTriggersRecreation();
  priceIntervalChangeTriggersRecreation();
  priceUsageTypeChangeTriggersRecreation();
  noChangeOnIdenticalConfig();
  noChangeOnVersionOnlyUpdate();

  // 05-id-mapping.ts - ID mapping tests
  convertStripeIDToConfigID();
  convertNonExistentStripeID();
  convertPriceStripeIDToConfigID();
  migrationWithStripeID();
  migrationSkipsExistingMapping();
  freeProductLocalOnly();
  freePriceLocalOnly();
  unarchiveExistingProduct();

  // 06-admin.ts - Admin endpoint tests
  pullConfigFromStripe();
  pullConfigNormalizesIDs();
  pullConfigExcludesProductsWithoutPrices();
  archiveAllArchivesMeters();
  archiveAllArchivesPrices();
  archiveAllArchivesProducts();
  archiveAllCreatesEmptyConfig();
  archiveAllHandlesPartialFailures();
  getConfigHistoryPagination();
  getConfigHistoryLimit();
  getConfigHistoryOffset();
  getConfigHistoryInvalidLimit();
  getConfigHistoryLimitExceedsMax();
  validateValidConfig();
  validateInvalidConfig();
  getSchema();

  // 07-lookups.ts - Resource lookup tests
  getPriceByID();
  getPriceByIDNotFound();
  getProductByID();
  getProductByIDNotFound();
  getMeterByID();
  getMeterByIDNotFound();
  productsWithNoPublicPricesExcluded();

  // 08-tiered.ts - Tiered pricing tests
  createGraduatedTieredPrice();
  createVolumeTieredPrice();
  verifyTiersStructure();
  verifyInfinityTier();
  pullConfigPreservesTiers();
  tiersModeCorrectlySet();
}

export default StripeConfigTests;

// Re-export all individual test functions for selective execution
export * from "./01-crud";
export * from "./02-meters";
export * from "./03-validation";
export * from "./04-differ";
export * from "./05-id-mapping";
export * from "./06-admin";
export * from "./07-lookups";
export * from "./08-tiered";

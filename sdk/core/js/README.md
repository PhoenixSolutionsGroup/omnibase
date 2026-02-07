# @omnibase/core-js@0.18.1

A TypeScript SDK client for the api.omnibase.tech API.

## Usage

First, install the SDK from npm.

```bash
npm install @omnibase/core-js --save
```

Next, try it out.


```ts
import {
  Configuration,
  V1AuthApi,
} from '@omnibase/core-js';
import type { CreateUserOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1AuthApi(config);

  const body = {
    // CreateUserRequest
    createUserRequest: ...,
  } satisfies CreateUserOperationRequest;

  try {
    const data = await api.createUser(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```


## Documentation

### API Endpoints

All URIs are relative to *https://api.omnibase.tech*

| Class | Method | HTTP request | Description
| ----- | ------ | ------------ | -------------
*V1AuthApi* | [**createUser**](docs/V1AuthApi.md#createuseroperation) | **POST** /api/v1/auth/users | Create new user
*V1AuthApi* | [**getActiveTenant**](docs/V1AuthApi.md#getactivetenant) | **GET** /api/v1/auth/active-tenant | Get active tenant
*V1AuthApi* | [**getIdentity**](docs/V1AuthApi.md#getidentity) | **GET** /api/v1/auth/identity | Get current identity
*V1AuthApi* | [**getSession**](docs/V1AuthApi.md#getsession) | **GET** /api/v1/auth/session | Get current session
*V1AuthApi* | [**listTenants**](docs/V1AuthApi.md#listtenants) | **GET** /api/v1/auth/tenants | List user\&#39;s tenants
*V1AuthApi* | [**logout**](docs/V1AuthApi.md#logout) | **POST** /api/v1/auth/logout | Logout user
*V1AuthApi* | [**whoAmI**](docs/V1AuthApi.md#whoami) | **GET** /api/v1/auth/whoami | Check authentication status
*V1ConfigurationApi* | [**archiveAllStripeConfig**](docs/V1ConfigurationApi.md#archiveallstripeconfig) | **POST** /api/v1/stripe/admin/config/archive-all | Archive all Stripe config
*V1ConfigurationApi* | [**createOrUpdateEmailTemplate**](docs/V1ConfigurationApi.md#createorupdateemailtemplate) | **POST** /api/v1/email/templates | Create or update email template
*V1ConfigurationApi* | [**deleteEmailTemplate**](docs/V1ConfigurationApi.md#deleteemailtemplate) | **DELETE** /api/v1/email/templates/{type} | Delete email template
*V1ConfigurationApi* | [**deployPermissionNamespaces**](docs/V1ConfigurationApi.md#deploypermissionnamespaces) | **POST** /api/v1/permissions/namespaces | Deploy Keto namespace configurations
*V1ConfigurationApi* | [**generateDatabaseTypes**](docs/V1ConfigurationApi.md#generatedatabasetypes) | **GET** /api/v1/database/typegen | Generate types from database schema
*V1ConfigurationApi* | [**getEmailTemplates**](docs/V1ConfigurationApi.md#getemailtemplates) | **GET** /api/v1/email/templates | Get all email templates
*V1ConfigurationApi* | [**getStripeConfigHistory**](docs/V1ConfigurationApi.md#getstripeconfighistory) | **GET** /api/v1/stripe/admin/config/history | Get config history
*V1ConfigurationApi* | [**getStripeConfigSchema**](docs/V1ConfigurationApi.md#getstripeconfigschema) | **GET** /api/v1/stripe/schema | Get Stripe config schema
*V1ConfigurationApi* | [**pullStripeConfig**](docs/V1ConfigurationApi.md#pullstripeconfig) | **GET** /api/v1/stripe/admin/config/pull | Pull config from Stripe
*V1ConfigurationApi* | [**updateStripeConfig**](docs/V1ConfigurationApi.md#updatestripeconfig) | **POST** /api/v1/stripe/admin/config | Update Stripe config
*V1ConfigurationApi* | [**uploadDatabaseMigrations**](docs/V1ConfigurationApi.md#uploaddatabasemigrations) | **POST** /api/v1/database/migrations | Upload database migrations
*V1ConfigurationApi* | [**validateStripeConfig**](docs/V1ConfigurationApi.md#validatestripeconfig) | **POST** /api/v1/stripe/admin/config/validate | Validate Stripe config
*V1PaymentsApi* | [**addInvoiceLineItem**](docs/V1PaymentsApi.md#addinvoicelineitemoperation) | **POST** /api/v1/payments/invoices/{invoice_id}/items | Add invoice line item
*V1PaymentsApi* | [**addInvoiceLineItemWithPriceId**](docs/V1PaymentsApi.md#addinvoicelineitemwithpriceid) | **POST** /api/v1/payments/invoices/{invoice_id}/items/price | Add invoice line item with price ID
*V1PaymentsApi* | [**createCheckout**](docs/V1PaymentsApi.md#createcheckoutoperation) | **POST** /api/v1/payments/checkout | Create checkout session
*V1PaymentsApi* | [**createCustomerPortal**](docs/V1PaymentsApi.md#createcustomerportal) | **POST** /api/v1/payments/portal | Create customer portal session
*V1PaymentsApi* | [**createInvoice**](docs/V1PaymentsApi.md#createinvoiceoperation) | **POST** /api/v1/payments/invoices | Create invoice
*V1PaymentsApi* | [**finalizeInvoice**](docs/V1PaymentsApi.md#finalizeinvoiceoperation) | **POST** /api/v1/payments/invoices/{invoice_id}/finalize | Finalize invoice
*V1PaymentsApi* | [**getInvoice**](docs/V1PaymentsApi.md#getinvoice) | **GET** /api/v1/payments/invoices/{invoice_id} | Get invoice
*V1PaymentsApi* | [**recordUsage**](docs/V1PaymentsApi.md#recordusageoperation) | **POST** /api/v1/payments/usage | Record metered usage
*V1PaymentsApi* | [**updateInvoice**](docs/V1PaymentsApi.md#updateinvoiceoperation) | **PATCH** /api/v1/payments/invoices/{invoice_id} | Update invoice
*V1PermissionsApi* | [**checkPermission**](docs/V1PermissionsApi.md#checkpermissionoperation) | **POST** /api/v1/permissions/check | Check permission
*V1PermissionsApi* | [**createRelationship**](docs/V1PermissionsApi.md#createrelationshipoperation) | **POST** /api/v1/permissions/relationships | Create relationship
*V1PermissionsApi* | [**deleteRelationship**](docs/V1PermissionsApi.md#deleterelationshipoperation) | **DELETE** /api/v1/permissions/relationships | Delete relationship
*V1StorageApi* | [**deleteObject**](docs/V1StorageApi.md#deleteobjectoperation) | **DELETE** /api/v1/storage/object | Delete file from storage
*V1StorageApi* | [**downloadFile**](docs/V1StorageApi.md#downloadfile) | **POST** /api/v1/storage/download | Download file from storage
*V1StorageApi* | [**uploadFile**](docs/V1StorageApi.md#uploadfile) | **POST** /api/v1/storage/upload | Upload file to storage
*V1StripeApi* | [**applyEnterpriseCustom**](docs/V1StripeApi.md#applyenterprisecustomoperation) | **POST** /api/v1/stripe/admin/enterprise/apply-custom | Apply custom enterprise pricing
*V1StripeApi* | [**applyEnterpriseTemplate**](docs/V1StripeApi.md#applyenterprisetemplateoperation) | **POST** /api/v1/stripe/admin/enterprise/apply-template | Apply enterprise template pricing
*V1StripeApi* | [**calculatePriceCost**](docs/V1StripeApi.md#calculatepricecostoperation) | **POST** /api/v1/stripe/config/prices/{price_id}/calculate | Calculate cost for a price
*V1StripeApi* | [**convertStripeIDToConfigID**](docs/V1StripeApi.md#convertstripeidtoconfigid) | **GET** /api/v1/stripe/convert/stripe-id/{stripe_id} | Convert Stripe ID to config ID
*V1StripeApi* | [**getEnterprisePricesByID**](docs/V1StripeApi.md#getenterprisepricesbyid) | **GET** /api/v1/stripe/admin/enterprise/prices/by-id/{enterprise_id} | Get enterprise prices by ID
*V1StripeApi* | [**getEnterprisePricesByTemplate**](docs/V1StripeApi.md#getenterprisepricesbytemplate) | **GET** /api/v1/stripe/admin/enterprise/prices/by-template/{template} | Get enterprise prices by template
*V1StripeApi* | [**getMeterByID**](docs/V1StripeApi.md#getmeterbyid) | **GET** /api/v1/stripe/config/meters/{meter_id} | Get meter by ID
*V1StripeApi* | [**getPriceByID**](docs/V1StripeApi.md#getpricebyid) | **GET** /api/v1/stripe/config/prices/{price_id} | Get price by ID
*V1StripeApi* | [**getProductByID**](docs/V1StripeApi.md#getproductbyid) | **GET** /api/v1/stripe/config/products/{product_id} | Get product by ID
*V1StripeApi* | [**getStripeConfig**](docs/V1StripeApi.md#getstripeconfig) | **GET** /api/v1/stripe/config | Get public Stripe config
*V1StripeApi* | [**getStripeConfigAdmin**](docs/V1StripeApi.md#getstripeconfigadmin) | **GET** /api/v1/stripe/admin/config | Get full Stripe config (admin)
*V1StripeApi* | [**listWebhooks**](docs/V1StripeApi.md#listwebhooks) | **GET** /api/v1/stripe/admin/webhooks | List all webhooks
*V1TenantsApi* | [**acceptInvite**](docs/V1TenantsApi.md#acceptinviteoperation) | **PUT** /api/v1/tenants/invites/accept | Accept tenant invite
*V1TenantsApi* | [**addSubscription**](docs/V1TenantsApi.md#addsubscriptionoperation) | **POST** /api/v1/tenants/subscriptions | Add subscription
*V1TenantsApi* | [**createInvite**](docs/V1TenantsApi.md#createinvite) | **POST** /api/v1/tenants/invites | Create tenant invite
*V1TenantsApi* | [**createRole**](docs/V1TenantsApi.md#createroleoperation) | **POST** /api/v1/tenants/roles | Create role
*V1TenantsApi* | [**createTenant**](docs/V1TenantsApi.md#createtenantoperation) | **POST** /api/v1/tenants | Create tenant
*V1TenantsApi* | [**deleteRole**](docs/V1TenantsApi.md#deleterole) | **DELETE** /api/v1/tenants/roles/{role_id} | Delete role
*V1TenantsApi* | [**deleteTenant**](docs/V1TenantsApi.md#deletetenant) | **DELETE** /api/v1/tenants | Delete tenant
*V1TenantsApi* | [**getRoleDefinitions**](docs/V1TenantsApi.md#getroledefinitions) | **GET** /api/v1/tenants/roles/definitions | Get namespace definitions
*V1TenantsApi* | [**getTenantBillingStatus**](docs/V1TenantsApi.md#gettenantbillingstatus) | **GET** /api/v1/tenants/billing-status | Get billing status
*V1TenantsApi* | [**getTenantByID**](docs/V1TenantsApi.md#gettenantbyid) | **GET** /api/v1/tenants/by-id/{tenant_id} | Get tenant by ID
*V1TenantsApi* | [**getTenantByStripeCustomerID**](docs/V1TenantsApi.md#gettenantbystripecustomerid) | **GET** /api/v1/tenants/by-stripe-customer/{stripe_customer_id} | Get tenant by Stripe customer ID
*V1TenantsApi* | [**getTenantJWT**](docs/V1TenantsApi.md#gettenantjwt) | **GET** /api/v1/tenants/jwt | Get PostgREST JWT token
*V1TenantsApi* | [**getTenantSubscription**](docs/V1TenantsApi.md#gettenantsubscription) | **GET** /api/v1/tenants/subscriptions/{config_price_id} | Get tenant subscription by plan
*V1TenantsApi* | [**listRoles**](docs/V1TenantsApi.md#listroles) | **GET** /api/v1/tenants/roles | List roles
*V1TenantsApi* | [**listTenantSubscriptions**](docs/V1TenantsApi.md#listtenantsubscriptions) | **GET** /api/v1/tenants/subscriptions | Get tenant subscriptions
*V1TenantsApi* | [**listTenantUsers**](docs/V1TenantsApi.md#listtenantusers) | **GET** /api/v1/tenants/users | Get tenant users
*V1TenantsApi* | [**removeSubscription**](docs/V1TenantsApi.md#removesubscriptionoperation) | **DELETE** /api/v1/tenants/subscriptions | Remove subscription
*V1TenantsApi* | [**removeTenantUser**](docs/V1TenantsApi.md#removetenantuser) | **DELETE** /api/v1/tenants/users | Remove tenant user
*V1TenantsApi* | [**switchActiveTenant**](docs/V1TenantsApi.md#switchactivetenant) | **PUT** /api/v1/tenants/switch-active | Switch active tenant
*V1TenantsApi* | [**updateRole**](docs/V1TenantsApi.md#updateroleoperation) | **PUT** /api/v1/tenants/roles/{role_id} | Update role
*V1TenantsApi* | [**updateTenantUserRole**](docs/V1TenantsApi.md#updatetenantuserroleoperation) | **PUT** /api/v1/tenants/users | Update user role


### Models

- [AcceptInvite200Response](docs/AcceptInvite200Response.md)
- [AcceptInviteRequest](docs/AcceptInviteRequest.md)
- [AcceptInviteResponse](docs/AcceptInviteResponse.md)
- [ActiveTenantResponse](docs/ActiveTenantResponse.md)
- [AddInvoiceLineItem200Response](docs/AddInvoiceLineItem200Response.md)
- [AddInvoiceLineItemRequest](docs/AddInvoiceLineItemRequest.md)
- [AddInvoiceLineItemWithConfigPriceRequest](docs/AddInvoiceLineItemWithConfigPriceRequest.md)
- [AddInvoiceLineItemWithPriceIDRequest](docs/AddInvoiceLineItemWithPriceIDRequest.md)
- [AddInvoiceLineItemWithStripePriceRequest](docs/AddInvoiceLineItemWithStripePriceRequest.md)
- [AddSubscription200Response](docs/AddSubscription200Response.md)
- [AddSubscriptionRequest](docs/AddSubscriptionRequest.md)
- [AddSubscriptionResponse](docs/AddSubscriptionResponse.md)
- [ApplyEnterpriseCustomRequest](docs/ApplyEnterpriseCustomRequest.md)
- [ApplyEnterpriseTemplate200Response](docs/ApplyEnterpriseTemplate200Response.md)
- [ApplyEnterpriseTemplateRequest](docs/ApplyEnterpriseTemplateRequest.md)
- [ArchiveAllResponse](docs/ArchiveAllResponse.md)
- [ArchiveAllStripeConfig200Response](docs/ArchiveAllStripeConfig200Response.md)
- [BadRequest](docs/BadRequest.md)
- [BadRequestResponse](docs/BadRequestResponse.md)
- [BillingInterval](docs/BillingInterval.md)
- [BillingStatusResponse](docs/BillingStatusResponse.md)
- [CalculatePriceCost200Response](docs/CalculatePriceCost200Response.md)
- [CalculatePriceCostRequest](docs/CalculatePriceCostRequest.md)
- [CalculatePriceCostResponse](docs/CalculatePriceCostResponse.md)
- [CheckPermission200Response](docs/CheckPermission200Response.md)
- [CheckPermissionRequest](docs/CheckPermissionRequest.md)
- [CheckPermissionResponse](docs/CheckPermissionResponse.md)
- [ConfigHistoryItem](docs/ConfigHistoryItem.md)
- [ConfigHistoryPagination](docs/ConfigHistoryPagination.md)
- [ConfigHistoryResponse](docs/ConfigHistoryResponse.md)
- [ConflictResponse](docs/ConflictResponse.md)
- [ConvertStripeIDToConfigID200Response](docs/ConvertStripeIDToConfigID200Response.md)
- [Coupon](docs/Coupon.md)
- [CouponChange](docs/CouponChange.md)
- [CouponChanges](docs/CouponChanges.md)
- [CouponDuration](docs/CouponDuration.md)
- [CouponWithStripeID](docs/CouponWithStripeID.md)
- [CreateCheckout200Response](docs/CreateCheckout200Response.md)
- [CreateCheckoutRequest](docs/CreateCheckoutRequest.md)
- [CreateCheckoutResponse](docs/CreateCheckoutResponse.md)
- [CreateCustomerPortal200Response](docs/CreateCustomerPortal200Response.md)
- [CreateEmailTemplateRequest](docs/CreateEmailTemplateRequest.md)
- [CreateInvite200Response](docs/CreateInvite200Response.md)
- [CreateInvoice200Response](docs/CreateInvoice200Response.md)
- [CreateInvoiceRequest](docs/CreateInvoiceRequest.md)
- [CreateOrUpdateEmailTemplate200Response](docs/CreateOrUpdateEmailTemplate200Response.md)
- [CreateOrUpdateEmailTemplate200ResponseAllOfData](docs/CreateOrUpdateEmailTemplate200ResponseAllOfData.md)
- [CreatePortalRequest](docs/CreatePortalRequest.md)
- [CreatePortalResponse](docs/CreatePortalResponse.md)
- [CreateRelationship200Response](docs/CreateRelationship200Response.md)
- [CreateRelationshipRequest](docs/CreateRelationshipRequest.md)
- [CreateRelationshipResponse](docs/CreateRelationshipResponse.md)
- [CreateRole200Response](docs/CreateRole200Response.md)
- [CreateRoleRequest](docs/CreateRoleRequest.md)
- [CreateTenant200Response](docs/CreateTenant200Response.md)
- [CreateTenantRequest](docs/CreateTenantRequest.md)
- [CreateTenantResponse](docs/CreateTenantResponse.md)
- [CreateTenantUserInviteRequest](docs/CreateTenantUserInviteRequest.md)
- [CreateTenantUserInviteResponse](docs/CreateTenantUserInviteResponse.md)
- [CreateUser200Response](docs/CreateUser200Response.md)
- [CreateUserRequest](docs/CreateUserRequest.md)
- [CreateUserRequestName](docs/CreateUserRequestName.md)
- [CurrencyCode](docs/CurrencyCode.md)
- [DeleteEmailTemplate200Response](docs/DeleteEmailTemplate200Response.md)
- [DeleteEmailTemplate200ResponseAllOfData](docs/DeleteEmailTemplate200ResponseAllOfData.md)
- [DeleteObject200Response](docs/DeleteObject200Response.md)
- [DeleteObjectRequest](docs/DeleteObjectRequest.md)
- [DeleteRelationship200Response](docs/DeleteRelationship200Response.md)
- [DeleteRelationshipRequest](docs/DeleteRelationshipRequest.md)
- [DeleteRelationshipResponse](docs/DeleteRelationshipResponse.md)
- [DeleteRole200Response](docs/DeleteRole200Response.md)
- [DeleteRoleResponse](docs/DeleteRoleResponse.md)
- [DeleteTenant200Response](docs/DeleteTenant200Response.md)
- [DeleteTenantResponse](docs/DeleteTenantResponse.md)
- [DeleteTenantUserRequest](docs/DeleteTenantUserRequest.md)
- [DeployPermissionNamespaces200Response](docs/DeployPermissionNamespaces200Response.md)
- [DownloadFile200Response](docs/DownloadFile200Response.md)
- [DownloadRequest](docs/DownloadRequest.md)
- [DownloadResponse](docs/DownloadResponse.md)
- [EmailTemplate](docs/EmailTemplate.md)
- [EnterpriseApplyResponse](docs/EnterpriseApplyResponse.md)
- [EnterprisePricesResponse](docs/EnterprisePricesResponse.md)
- [ErrorResponse](docs/ErrorResponse.md)
- [FinalizeInvoiceRequest](docs/FinalizeInvoiceRequest.md)
- [ForbiddenResponse](docs/ForbiddenResponse.md)
- [GetActiveTenant200Response](docs/GetActiveTenant200Response.md)
- [GetEmailTemplates200Response](docs/GetEmailTemplates200Response.md)
- [GetEmailTemplates200ResponseAllOfData](docs/GetEmailTemplates200ResponseAllOfData.md)
- [GetEnterprisePricesByTemplate200Response](docs/GetEnterprisePricesByTemplate200Response.md)
- [GetIdentity200Response](docs/GetIdentity200Response.md)
- [GetMeterByID200Response](docs/GetMeterByID200Response.md)
- [GetPriceByID200Response](docs/GetPriceByID200Response.md)
- [GetProductByID200Response](docs/GetProductByID200Response.md)
- [GetRoleDefinitions200Response](docs/GetRoleDefinitions200Response.md)
- [GetSession200Response](docs/GetSession200Response.md)
- [GetStripeConfig200Response](docs/GetStripeConfig200Response.md)
- [GetStripeConfigHistory200Response](docs/GetStripeConfigHistory200Response.md)
- [GetTenantBillingStatus200Response](docs/GetTenantBillingStatus200Response.md)
- [GetTenantByID200Response](docs/GetTenantByID200Response.md)
- [GetTenantByIDResponse](docs/GetTenantByIDResponse.md)
- [GetTenantByStripeCustomerID200Response](docs/GetTenantByStripeCustomerID200Response.md)
- [GetTenantByStripeCustomerIDResponse](docs/GetTenantByStripeCustomerIDResponse.md)
- [GetTenantJWT200Response](docs/GetTenantJWT200Response.md)
- [GetTenantSubscription200Response](docs/GetTenantSubscription200Response.md)
- [InternalServerError](docs/InternalServerError.md)
- [InternalServerErrorResponse](docs/InternalServerErrorResponse.md)
- [InvoiceLineItemResponse](docs/InvoiceLineItemResponse.md)
- [InvoiceResponse](docs/InvoiceResponse.md)
- [JWTTokenResponse](docs/JWTTokenResponse.md)
- [KratosIdentity](docs/KratosIdentity.md)
- [KratosIdentityCredentials](docs/KratosIdentityCredentials.md)
- [KratosIdentityCredentialsPassword](docs/KratosIdentityCredentialsPassword.md)
- [KratosIdentityRecoveryAddressesInner](docs/KratosIdentityRecoveryAddressesInner.md)
- [KratosIdentityTraits](docs/KratosIdentityTraits.md)
- [KratosIdentityTraitsName](docs/KratosIdentityTraitsName.md)
- [KratosIdentityVerifiableAddressesInner](docs/KratosIdentityVerifiableAddressesInner.md)
- [ListRoles200Response](docs/ListRoles200Response.md)
- [ListTenantSubscriptions200Response](docs/ListTenantSubscriptions200Response.md)
- [ListTenantUsers200Response](docs/ListTenantUsers200Response.md)
- [ListTenants200Response](docs/ListTenants200Response.md)
- [ListTenantsResponse](docs/ListTenantsResponse.md)
- [ListWebhooks200Response](docs/ListWebhooks200Response.md)
- [ListWebhooksResponse](docs/ListWebhooksResponse.md)
- [Logout200Response](docs/Logout200Response.md)
- [LogoutResponse](docs/LogoutResponse.md)
- [MessageResponse](docs/MessageResponse.md)
- [Meter](docs/Meter.md)
- [MeterChange](docs/MeterChange.md)
- [MeterChanges](docs/MeterChanges.md)
- [MeterCustomerMapping](docs/MeterCustomerMapping.md)
- [MeterDefaultAggregation](docs/MeterDefaultAggregation.md)
- [MeterResponse](docs/MeterResponse.md)
- [MeterValueSettings](docs/MeterValueSettings.md)
- [MeterWithStripeID](docs/MeterWithStripeID.md)
- [MigrationErrorResponse](docs/MigrationErrorResponse.md)
- [MigrationSuccessResponse](docs/MigrationSuccessResponse.md)
- [NamespaceDefinition](docs/NamespaceDefinition.md)
- [NamespaceDefinitionsResponse](docs/NamespaceDefinitionsResponse.md)
- [NamespaceDeploymentResponse](docs/NamespaceDeploymentResponse.md)
- [NotFound](docs/NotFound.md)
- [NotFoundResponse](docs/NotFoundResponse.md)
- [PerUnitBillingScheme](docs/PerUnitBillingScheme.md)
- [PerUnitPrice](docs/PerUnitPrice.md)
- [Price](docs/Price.md)
- [PriceChange](docs/PriceChange.md)
- [PriceChanges](docs/PriceChanges.md)
- [PriceDisplay](docs/PriceDisplay.md)
- [PriceLimit](docs/PriceLimit.md)
- [PriceResponse](docs/PriceResponse.md)
- [PriceUI](docs/PriceUI.md)
- [PriceWithStripeID](docs/PriceWithStripeID.md)
- [Product](docs/Product.md)
- [ProductChange](docs/ProductChange.md)
- [ProductChanges](docs/ProductChanges.md)
- [ProductResponse](docs/ProductResponse.md)
- [ProductUI](docs/ProductUI.md)
- [ProductWithStripeIDs](docs/ProductWithStripeIDs.md)
- [PromotionCode](docs/PromotionCode.md)
- [PromotionCodeChange](docs/PromotionCodeChange.md)
- [PromotionCodeChanges](docs/PromotionCodeChanges.md)
- [PromotionCodeWithStripeID](docs/PromotionCodeWithStripeID.md)
- [PullStripeConfig200Response](docs/PullStripeConfig200Response.md)
- [RecordUsageRequest](docs/RecordUsageRequest.md)
- [RelationMetadata](docs/RelationMetadata.md)
- [Relationship](docs/Relationship.md)
- [RemoveSubscription200Response](docs/RemoveSubscription200Response.md)
- [RemoveSubscriptionRequest](docs/RemoveSubscriptionRequest.md)
- [RemoveSubscriptionResponse](docs/RemoveSubscriptionResponse.md)
- [Role](docs/Role.md)
- [RolesListResponse](docs/RolesListResponse.md)
- [SchemasConflictResponse](docs/SchemasConflictResponse.md)
- [SessionResponse](docs/SessionResponse.md)
- [StripeConfigChanges](docs/StripeConfigChanges.md)
- [StripeConfigResponse](docs/StripeConfigResponse.md)
- [StripeConfigUpdateRequest](docs/StripeConfigUpdateRequest.md)
- [StripeConfigUpdateResponse](docs/StripeConfigUpdateResponse.md)
- [StripeConfigValidateRequest](docs/StripeConfigValidateRequest.md)
- [StripeConfiguration](docs/StripeConfiguration.md)
- [StripeConfigurationWithIDs](docs/StripeConfigurationWithIDs.md)
- [StripeIDConversionResponse](docs/StripeIDConversionResponse.md)
- [SubjectSet](docs/SubjectSet.md)
- [SubjectSetRequest](docs/SubjectSetRequest.md)
- [SubscriptionResponse](docs/SubscriptionResponse.md)
- [SuccessResponse](docs/SuccessResponse.md)
- [SuccessResponseData](docs/SuccessResponseData.md)
- [SwitchActiveTenant200Response](docs/SwitchActiveTenant200Response.md)
- [SwitchTenantRequest](docs/SwitchTenantRequest.md)
- [SwitchTenantResponse](docs/SwitchTenantResponse.md)
- [Tenant](docs/Tenant.md)
- [TenantInvite](docs/TenantInvite.md)
- [TenantSettings](docs/TenantSettings.md)
- [TenantUserResponse](docs/TenantUserResponse.md)
- [Tier](docs/Tier.md)
- [TierUpTo](docs/TierUpTo.md)
- [TieredBillingScheme](docs/TieredBillingScheme.md)
- [TieredPrice](docs/TieredPrice.md)
- [TiersMode](docs/TiersMode.md)
- [TooManyRequestsResponse](docs/TooManyRequestsResponse.md)
- [Unauthorized](docs/Unauthorized.md)
- [UnauthorizedResponse](docs/UnauthorizedResponse.md)
- [UpdateInvoiceRequest](docs/UpdateInvoiceRequest.md)
- [UpdateRoleRequest](docs/UpdateRoleRequest.md)
- [UpdateStripeConfig200Response](docs/UpdateStripeConfig200Response.md)
- [UpdateTenantUserRole200Response](docs/UpdateTenantUserRole200Response.md)
- [UpdateTenantUserRoleRequest](docs/UpdateTenantUserRoleRequest.md)
- [UpdateTenantUserRoleResponse](docs/UpdateTenantUserRoleResponse.md)
- [UploadFile200Response](docs/UploadFile200Response.md)
- [UploadRequest](docs/UploadRequest.md)
- [UploadResponse](docs/UploadResponse.md)
- [UsageType](docs/UsageType.md)
- [UserTenantListItem](docs/UserTenantListItem.md)
- [WebhookChange](docs/WebhookChange.md)
- [WebhookChanges](docs/WebhookChanges.md)
- [WebhookEndpointConfig](docs/WebhookEndpointConfig.md)
- [WebhookSecretResponse](docs/WebhookSecretResponse.md)
- [WhoAmI200Response](docs/WhoAmI200Response.md)
- [WhoAmIResponse](docs/WhoAmIResponse.md)

### Authorization


Authentication schemes defined for the API:
<a id="CookieAuth"></a>
#### CookieAuth


- **Type**: API key
- **API key parameter name**: `ory_kratos_session`
- **Location**: 
<a id="SessionTokenAuth"></a>
#### SessionTokenAuth


- **Type**: API key
- **API key parameter name**: `X-Session-Token`
- **Location**: HTTP header
<a id="ServiceKeyAuth"></a>
#### ServiceKeyAuth


- **Type**: API key
- **API key parameter name**: `X-Service-Key`
- **Location**: HTTP header

## About

This TypeScript SDK client supports the [Fetch API](https://fetch.spec.whatwg.org/)
and is automatically generated by the
[OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `0.18.1`
- Package version: `0.18.1`
- Generator version: `7.17.0`
- Build package: `org.openapitools.codegen.languages.TypeScriptFetchClientCodegen`

The generated npm module supports the following:

- Environments
  * Node.js
  * Webpack
  * Browserify
- Language levels
  * ES5 - you must have a Promises/A+ library installed
  * ES6
- Module systems
  * CommonJS
  * ES6 module system

For more information, please visit [https://omnibase.dev/support](https://omnibase.dev/support)

## Development

### Building

To build the TypeScript source code, you need to have Node.js and npm installed.
After cloning the repository, navigate to the project directory and run:

```bash
npm install
npm run build
```

### Publishing

Once you've built the package, you can publish it to npm:

```bash
npm publish
```

## License

[MIT](https://opensource.org/licenses/MIT)

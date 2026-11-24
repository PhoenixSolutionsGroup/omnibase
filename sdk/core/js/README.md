# @omnibase/core-js@0.0.0-dev

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

All URIs are relative to _https://api.omnibase.tech_

| Class                       | Method                                                                                                | HTTP request                                                          | Description                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------- |
| _V1AuthApi_                 | [**createUser**](docs/V1AuthApi.md#createuseroperation)                                               | **POST** /api/v1/auth/users                                           | Create a new user identity                           |
| _V1AuthApi_                 | [**getActiveTenant**](docs/V1AuthApi.md#getactivetenant)                                              | **GET** /api/v1/auth/active-tenant                                    | Get the active tenant for the authenticated user     |
| _V1AuthApi_                 | [**getIdentity**](docs/V1AuthApi.md#getidentity)                                                      | **GET** /api/v1/auth/identity                                         | Get current identity                                 |
| _V1AuthApi_                 | [**getSession**](docs/V1AuthApi.md#getsession)                                                        | **GET** /api/v1/auth/session                                          | Get current session                                  |
| _V1AuthApi_                 | [**listTenants**](docs/V1AuthApi.md#listtenants)                                                      | **GET** /api/v1/auth/tenants                                          | List tenants the authenticated user belongs to       |
| _V1AuthApi_                 | [**logout**](docs/V1AuthApi.md#logout)                                                                | **POST** /api/v1/auth/logout                                          | Logout user                                          |
| _V1AuthApi_                 | [**whoAmI**](docs/V1AuthApi.md#whoami)                                                                | **GET** /api/v1/auth/whoami                                           | Get authenticated user identity                      |
| _V1ConfigurationApi_        | [**archiveAllStripeConfig**](docs/V1ConfigurationApi.md#archiveallstripeconfig)                       | **POST** /api/v1/stripe/admin/config/archive-all                      | Archive all Stripe config                            |
| _V1ConfigurationApi_        | [**createOrUpdateEmailTemplate**](docs/V1ConfigurationApi.md#createorupdateemailtemplate)             | **POST** /api/v1/email/templates                                      | Create or update email template                      |
| _V1ConfigurationApi_        | [**createOrUpdateSystemEmailTemplate**](docs/V1ConfigurationApi.md#createorupdatesystememailtemplate) | **POST** /api/v1/email/system-templates                               | Create or update a system email template             |
| _V1ConfigurationApi_        | [**deleteEmailTemplate**](docs/V1ConfigurationApi.md#deleteemailtemplate)                             | **DELETE** /api/v1/email/templates/{type}                             | Delete email template                                |
| _V1ConfigurationApi_        | [**deleteSystemEmailTemplate**](docs/V1ConfigurationApi.md#deletesystememailtemplate)                 | **DELETE** /api/v1/email/system-templates/{name}                      | Delete a system email template                       |
| _V1ConfigurationApi_        | [**deployPermissionNamespaces**](docs/V1ConfigurationApi.md#deploypermissionnamespaces)               | **POST** /api/v1/permissions/namespaces                               | Deploy Keto namespace configurations                 |
| _V1ConfigurationApi_        | [**getEmailTemplates**](docs/V1ConfigurationApi.md#getemailtemplates)                                 | **GET** /api/v1/email/templates                                       | Get all email templates                              |
| _V1ConfigurationApi_        | [**getPermissionRequirements**](docs/V1ConfigurationApi.md#getpermissionrequirements)                 | **GET** /api/v1/permissions/requirements                              | Get required permission namespaces                   |
| _V1ConfigurationApi_        | [**getStripeConfigHistory**](docs/V1ConfigurationApi.md#getstripeconfighistory)                       | **GET** /api/v1/stripe/admin/config/history                           | Get config history                                   |
| _V1ConfigurationApi_        | [**getStripeConfigSchema**](docs/V1ConfigurationApi.md#getstripeconfigschema)                         | **GET** /api/v1/stripe/schema                                         | Get Stripe config schema                             |
| _V1ConfigurationApi_        | [**getStripeConfigStatus**](docs/V1ConfigurationApi.md#getstripeconfigstatus)                         | **POST** /api/v1/stripe/admin/config/status                           | Get Stripe config status                             |
| _V1ConfigurationApi_        | [**getSystemEmailTemplates**](docs/V1ConfigurationApi.md#getsystememailtemplates)                     | **GET** /api/v1/email/system-templates                                | Get all system email templates                       |
| _V1ConfigurationApi_        | [**pullStripeConfig**](docs/V1ConfigurationApi.md#pullstripeconfig)                                   | **GET** /api/v1/stripe/admin/config/pull                              | Pull config from Stripe                              |
| _V1ConfigurationApi_        | [**sendEmail**](docs/V1ConfigurationApi.md#sendemail)                                                 | **POST** /api/v1/email/send                                           | Send an email using an app template                  |
| _V1ConfigurationApi_        | [**sendEmailHTML**](docs/V1ConfigurationApi.md#sendemailhtml)                                         | **POST** /api/v1/email/send/html                                      | Send a raw HTML email                                |
| _V1ConfigurationApi_        | [**serveEmailTemplate**](docs/V1ConfigurationApi.md#serveemailtemplate)                               | **GET** /api/v1/email/templates/{template_name}/{type}                | Serve an email template file                         |
| _V1ConfigurationApi_        | [**serveSystemEmailTemplate**](docs/V1ConfigurationApi.md#servesystememailtemplate)                   | **GET** /api/v1/email/system-templates/{name}/{type}                  | Serve a system email template file                   |
| _V1ConfigurationApi_        | [**updateStripeConfig**](docs/V1ConfigurationApi.md#updatestripeconfig)                               | **POST** /api/v1/stripe/admin/config                                  | Update Stripe config                                 |
| _V1ConfigurationApi_        | [**validateStripeConfig**](docs/V1ConfigurationApi.md#validatestripeconfig)                           | **POST** /api/v1/stripe/admin/config/validate                         | Validate Stripe config                               |
| _V1DatabaseApi_             | [**generateDatabaseTypes**](docs/V1DatabaseApi.md#generatedatabasetypes)                              | **GET** /api/v1/database/typegen                                      | Generate type definitions for the database schema    |
| _V1DatabaseApi_             | [**getDatabaseMigrationStatus**](docs/V1DatabaseApi.md#getdatabasemigrationstatus)                    | **GET** /api/v1/database/migrations/status                            | Get the status of applied migrations                 |
| _V1DatabaseApi_             | [**rollbackDatabaseMigrations**](docs/V1DatabaseApi.md#rollbackdatabasemigrations)                    | **POST** /api/v1/database/migrations/down                             | Roll back database migrations                        |
| _V1DatabaseApi_             | [**uploadDatabaseMigrations**](docs/V1DatabaseApi.md#uploaddatabasemigrations)                        | **POST** /api/v1/database/migrations                                  | Apply database migrations                            |
| _V1PaymentsApi_             | [**addInvoiceLineItem**](docs/V1PaymentsApi.md#addinvoicelineitem)                                    | **POST** /api/v1/payments/invoices/{invoice_id}/items                 | Add a line item to a Stripe invoice                  |
| _V1PaymentsApi_             | [**addInvoiceLineItemWithPriceId**](docs/V1PaymentsApi.md#addinvoicelineitemwithpriceid)              | **POST** /api/v1/payments/invoices/{invoice_id}/items/price           | Add a line item to a Stripe invoice using a price ID |
| _V1PaymentsApi_             | [**createCheckout**](docs/V1PaymentsApi.md#createcheckoutoperation)                                   | **POST** /api/v1/payments/checkout                                    | Create a Stripe checkout session                     |
| _V1PaymentsApi_             | [**createCustomerPortal**](docs/V1PaymentsApi.md#createcustomerportal)                                | **POST** /api/v1/payments/portal                                      | Create a Stripe customer portal session              |
| _V1PaymentsApi_             | [**createInvoice**](docs/V1PaymentsApi.md#createinvoiceoperation)                                     | **POST** /api/v1/payments/invoices                                    | Create a Stripe invoice                              |
| _V1PaymentsApi_             | [**finalizeInvoice**](docs/V1PaymentsApi.md#finalizeinvoice)                                          | **POST** /api/v1/payments/invoices/{invoice_id}/finalize              | Finalize a Stripe invoice                            |
| _V1PaymentsApi_             | [**getInvoice**](docs/V1PaymentsApi.md#getinvoice)                                                    | **GET** /api/v1/payments/invoices/{invoice_id}                        | Get a Stripe invoice                                 |
| _V1PaymentsApi_             | [**recordUsage**](docs/V1PaymentsApi.md#recordusageoperation)                                         | **POST** /api/v1/payments/usage                                       | Record a Stripe meter usage event                    |
| _V1PaymentsApi_             | [**updateInvoice**](docs/V1PaymentsApi.md#updateinvoiceoperation)                                     | **PATCH** /api/v1/payments/invoices/{invoice_id}                      | Update a Stripe invoice                              |
| _V1PermissionsApi_          | [**checkPermission**](docs/V1PermissionsApi.md#checkpermission)                                       | **POST** /api/v1/permissions/check                                    | Check permission                                     |
| _V1PermissionsApi_          | [**createRelationship**](docs/V1PermissionsApi.md#createrelationshipoperation)                        | **POST** /api/v1/permissions/relationships                            | Create relationship                                  |
| _V1PermissionsApi_          | [**deleteRelationship**](docs/V1PermissionsApi.md#deleterelationshipoperation)                        | **DELETE** /api/v1/permissions/relationships                          | Delete relationship                                  |
| _V1StorageApi_              | [**deleteObject**](docs/V1StorageApi.md#deleteobjectoperation)                                        | **DELETE** /api/v1/storage/object                                     | Delete file from storage                             |
| _V1StorageApi_              | [**downloadFile**](docs/V1StorageApi.md#downloadfile)                                                 | **POST** /api/v1/storage/download                                     | Download file from storage                           |
| _V1StorageApi_              | [**makeFilePublic**](docs/V1StorageApi.md#makefilepublic)                                             | **POST** /api/v1/storage/make-public                                  | Make a file publicly accessible                      |
| _V1StorageApi_              | [**uploadFile**](docs/V1StorageApi.md#uploadfile)                                                     | **POST** /api/v1/storage/upload                                       | Upload file to storage                               |
| _V1StripeApi_               | [**applyEnterpriseCustom**](docs/V1StripeApi.md#applyenterprisecustomoperation)                       | **POST** /api/v1/stripe/admin/enterprise/apply-custom                 | Apply custom enterprise pricing                      |
| _V1StripeApi_               | [**applyEnterpriseTemplate**](docs/V1StripeApi.md#applyenterprisetemplateoperation)                   | **POST** /api/v1/stripe/admin/enterprise/apply-template               | Apply enterprise template pricing                    |
| _V1StripeApi_               | [**calculatePriceCost**](docs/V1StripeApi.md#calculatepricecostoperation)                             | **POST** /api/v1/stripe/config/prices/{price_id}/calculate            | Calculate cost for a price                           |
| _V1StripeApi_               | [**convertStripeIDToConfigID**](docs/V1StripeApi.md#convertstripeidtoconfigid)                        | **GET** /api/v1/stripe/convert/stripe-id/{stripe_id}                  | Convert Stripe ID to config ID                       |
| _V1StripeApi_               | [**getEnterprisePricesByID**](docs/V1StripeApi.md#getenterprisepricesbyid)                            | **GET** /api/v1/stripe/admin/enterprise/prices/by-id/{enterprise_id}  | Get enterprise prices by ID                          |
| _V1StripeApi_               | [**getEnterprisePricesByTemplate**](docs/V1StripeApi.md#getenterprisepricesbytemplate)                | **GET** /api/v1/stripe/admin/enterprise/prices/by-template/{template} | Get enterprise prices by template                    |
| _V1StripeApi_               | [**getMeterByID**](docs/V1StripeApi.md#getmeterbyid)                                                  | **GET** /api/v1/stripe/config/meters/{meter_id}                       | Get meter by ID                                      |
| _V1StripeApi_               | [**getPriceByID**](docs/V1StripeApi.md#getpricebyid)                                                  | **GET** /api/v1/stripe/config/prices/{price_id}                       | Get price by ID                                      |
| _V1StripeApi_               | [**getProductByID**](docs/V1StripeApi.md#getproductbyid)                                              | **GET** /api/v1/stripe/config/products/{product_id}                   | Get product by ID                                    |
| _V1StripeApi_               | [**getStripeConfig**](docs/V1StripeApi.md#getstripeconfig)                                            | **GET** /api/v1/stripe/config                                         | Get public Stripe config                             |
| _V1StripeApi_               | [**getStripeConfigAdmin**](docs/V1StripeApi.md#getstripeconfigadmin)                                  | **GET** /api/v1/stripe/admin/config                                   | Get full Stripe config (admin)                       |
| _V1StripeApi_               | [**listWebhooks**](docs/V1StripeApi.md#listwebhooks)                                                  | **GET** /api/v1/stripe/admin/webhooks                                 | List all webhooks                                    |
| _V1TenantsInvitesApi_       | [**acceptInvite**](docs/V1TenantsInvitesApi.md#acceptinvite)                                          | **PUT** /api/v1/tenants/invites/accept                                | Accept a tenant invite                               |
| _V1TenantsInvitesApi_       | [**createInvite**](docs/V1TenantsInvitesApi.md#createinvite)                                          | **POST** /api/v1/tenants/invites                                      | Create a tenant invite                               |
| _V1TenantsLifecycleApi_     | [**createTenant**](docs/V1TenantsLifecycleApi.md#createtenantoperation)                               | **POST** /api/v1/tenants                                              | Create a tenant                                      |
| _V1TenantsLifecycleApi_     | [**deleteTenant**](docs/V1TenantsLifecycleApi.md#deletetenant)                                        | **DELETE** /api/v1/tenants                                            | Delete the current tenant                            |
| _V1TenantsLifecycleApi_     | [**getTenantByID**](docs/V1TenantsLifecycleApi.md#gettenantbyid)                                      | **GET** /api/v1/tenants/by-id/{tenant_id}                             | Get tenant by ID                                     |
| _V1TenantsLifecycleApi_     | [**getTenantByStripeCustomerID**](docs/V1TenantsLifecycleApi.md#gettenantbystripecustomerid)          | **GET** /api/v1/tenants/by-stripe-customer/{stripe_customer_id}       | Get tenant by Stripe customer ID                     |
| _V1TenantsLifecycleApi_     | [**switchActiveTenant**](docs/V1TenantsLifecycleApi.md#switchactivetenant)                            | **PUT** /api/v1/tenants/switch-active                                 | Switch the active tenant                             |
| _V1TenantsRolesApi_         | [**createRole**](docs/V1TenantsRolesApi.md#createroleoperation)                                       | **POST** /api/v1/tenants/roles                                        | Create a role                                        |
| _V1TenantsRolesApi_         | [**deleteRole**](docs/V1TenantsRolesApi.md#deleterole)                                                | **DELETE** /api/v1/tenants/roles/{role_id}                            | Delete a role                                        |
| _V1TenantsRolesApi_         | [**listRoleDefinitions**](docs/V1TenantsRolesApi.md#listroledefinitions)                              | **GET** /api/v1/tenants/roles/definitions                             | List role definitions                                |
| _V1TenantsRolesApi_         | [**listRoles**](docs/V1TenantsRolesApi.md#listroles)                                                  | **GET** /api/v1/tenants/roles                                         | List roles for the tenant                            |
| _V1TenantsRolesApi_         | [**updateRole**](docs/V1TenantsRolesApi.md#updateroleoperation)                                       | **PUT** /api/v1/tenants/roles/{role_id}                               | Update a role                                        |
| _V1TenantsSubscriptionsApi_ | [**addSubscription**](docs/V1TenantsSubscriptionsApi.md#addsubscription)                              | **POST** /api/v1/tenants/subscriptions                                | Add a subscription to the tenant                     |
| _V1TenantsSubscriptionsApi_ | [**getTenantBillingStatus**](docs/V1TenantsSubscriptionsApi.md#gettenantbillingstatus)                | **GET** /api/v1/tenants/billing-status                                | Get tenant billing status                            |
| _V1TenantsSubscriptionsApi_ | [**getTenantSubscription**](docs/V1TenantsSubscriptionsApi.md#gettenantsubscription)                  | **GET** /api/v1/tenants/subscriptions/{config_price_id}               | Get a single tenant subscription                     |
| _V1TenantsSubscriptionsApi_ | [**listTenantSubscriptions**](docs/V1TenantsSubscriptionsApi.md#listtenantsubscriptions)              | **GET** /api/v1/tenants/subscriptions                                 | List subscriptions for the tenant                    |
| _V1TenantsSubscriptionsApi_ | [**removeSubscription**](docs/V1TenantsSubscriptionsApi.md#removesubscription)                        | **DELETE** /api/v1/tenants/subscriptions                              | Remove a subscription from the tenant                |
| _V1TenantsUsersApi_         | [**listTenantUsers**](docs/V1TenantsUsersApi.md#listtenantusers)                                      | **GET** /api/v1/tenants/users                                         | List users in the tenant                             |
| _V1TenantsUsersApi_         | [**removeTenantUser**](docs/V1TenantsUsersApi.md#removetenantuser)                                    | **DELETE** /api/v1/tenants/users                                      | Remove a user from the tenant                        |
| _V1TenantsUsersApi_         | [**updateTenantUserRole**](docs/V1TenantsUsersApi.md#updatetenantuserrole)                            | **PUT** /api/v1/tenants/users                                         | Update a tenant user\&#39;s role                     |

### Models

- [AcceptRequest](docs/AcceptRequest.md)
- [AcceptResponse](docs/AcceptResponse.md)
- [ActiveTenantResponse](docs/ActiveTenantResponse.md)
- [AddLineItemByPriceRequest](docs/AddLineItemByPriceRequest.md)
- [AddLineItemRequest](docs/AddLineItemRequest.md)
- [AddRequest](docs/AddRequest.md)
- [AddResponse](docs/AddResponse.md)
- [AppliedMigration](docs/AppliedMigration.md)
- [ApplyEnterpriseCustomRequest](docs/ApplyEnterpriseCustomRequest.md)
- [ApplyEnterpriseTemplateRequest](docs/ApplyEnterpriseTemplateRequest.md)
- [ApplyMigrationsResponse](docs/ApplyMigrationsResponse.md)
- [ArchiveAllInputBody](docs/ArchiveAllInputBody.md)
- [ArchiveAllResponse](docs/ArchiveAllResponse.md)
- [AuthTenantInvite](docs/AuthTenantInvite.md)
- [BillingStatusResponse](docs/BillingStatusResponse.md)
- [CalculatePriceCostRequest](docs/CalculatePriceCostRequest.md)
- [CalculatePriceCostResponse](docs/CalculatePriceCostResponse.md)
- [CheckRequest](docs/CheckRequest.md)
- [CheckResponse](docs/CheckResponse.md)
- [ConfigChanges](docs/ConfigChanges.md)
- [ConfigHistoryItem](docs/ConfigHistoryItem.md)
- [ConfigHistoryPagination](docs/ConfigHistoryPagination.md)
- [ConfigHistoryResponse](docs/ConfigHistoryResponse.md)
- [ConfigResponse](docs/ConfigResponse.md)
- [ConfigStatus](docs/ConfigStatus.md)
- [ConfigStatusEntry](docs/ConfigStatusEntry.md)
- [ConfigStatusSummary](docs/ConfigStatusSummary.md)
- [ConvertStripeIDResponse](docs/ConvertStripeIDResponse.md)
- [Coupon](docs/Coupon.md)
- [CouponChange](docs/CouponChange.md)
- [CouponChanges](docs/CouponChanges.md)
- [CouponWithStripeID](docs/CouponWithStripeID.md)
- [CreateCheckoutRequest](docs/CreateCheckoutRequest.md)
- [CreateCheckoutResponse](docs/CreateCheckoutResponse.md)
- [CreateInvoiceRequest](docs/CreateInvoiceRequest.md)
- [CreatePortalRequest](docs/CreatePortalRequest.md)
- [CreatePortalResponse](docs/CreatePortalResponse.md)
- [CreateRelationshipRequest](docs/CreateRelationshipRequest.md)
- [CreateRelationshipResponse](docs/CreateRelationshipResponse.md)
- [CreateRequest](docs/CreateRequest.md)
- [CreateResponse](docs/CreateResponse.md)
- [CreateRoleRequest](docs/CreateRoleRequest.md)
- [CreateRoleRow](docs/CreateRoleRow.md)
- [CreateTenantRequest](docs/CreateTenantRequest.md)
- [CreateTenantResponse](docs/CreateTenantResponse.md)
- [CreateUserRequest](docs/CreateUserRequest.md)
- [DeleteObjectRequest](docs/DeleteObjectRequest.md)
- [DeleteObjectResponse](docs/DeleteObjectResponse.md)
- [DeleteRelationshipRequest](docs/DeleteRelationshipRequest.md)
- [DeleteRelationshipResponse](docs/DeleteRelationshipResponse.md)
- [DeleteRequest](docs/DeleteRequest.md)
- [DeleteSystemTemplateResponse](docs/DeleteSystemTemplateResponse.md)
- [DeleteTemplateResponse](docs/DeleteTemplateResponse.md)
- [DeleteTenantResponse](docs/DeleteTenantResponse.md)
- [DeployNamespacesResponse](docs/DeployNamespacesResponse.md)
- [DownloadRequest](docs/DownloadRequest.md)
- [DownloadResponse](docs/DownloadResponse.md)
- [EmailSystemTemplate](docs/EmailSystemTemplate.md)
- [EmailTemplate](docs/EmailTemplate.md)
- [EnterpriseApplyResponse](docs/EnterpriseApplyResponse.md)
- [EnterprisePricesResponse](docs/EnterprisePricesResponse.md)
- [ErrorDetail](docs/ErrorDetail.md)
- [ErrorModel](docs/ErrorModel.md)
- [FinalizeRequest](docs/FinalizeRequest.md)
- [FormFile](docs/FormFile.md)
- [GetMeterResponse](docs/GetMeterResponse.md)
- [GetPriceResponse](docs/GetPriceResponse.md)
- [GetProductResponse](docs/GetProductResponse.md)
- [GetTenantByIDRow](docs/GetTenantByIDRow.md)
- [GetTenantByStripeCustomerIDRow](docs/GetTenantByStripeCustomerIDRow.md)
- [Identity](docs/Identity.md)
- [IdentityCredentials](docs/IdentityCredentials.md)
- [IdentityName](docs/IdentityName.md)
- [InvoiceLineItemResponse](docs/InvoiceLineItemResponse.md)
- [InvoiceResponse](docs/InvoiceResponse.md)
- [LineItem](docs/LineItem.md)
- [ListRolesByTenantRow](docs/ListRolesByTenantRow.md)
- [ListStripeWebhooksRow](docs/ListStripeWebhooksRow.md)
- [ListSystemTemplatesResponse](docs/ListSystemTemplatesResponse.md)
- [ListTemplatesResponse](docs/ListTemplatesResponse.md)
- [ListTenantsResponse](docs/ListTenantsResponse.md)
- [ListWebhooksResponse](docs/ListWebhooksResponse.md)
- [LogoutResponse](docs/LogoutResponse.md)
- [MakePublicRequest](docs/MakePublicRequest.md)
- [MakePublicResponse](docs/MakePublicResponse.md)
- [Meter](docs/Meter.md)
- [MeterChange](docs/MeterChange.md)
- [MeterChanges](docs/MeterChanges.md)
- [MeterCustomerMapping](docs/MeterCustomerMapping.md)
- [MeterDefaultAggregation](docs/MeterDefaultAggregation.md)
- [MeterValueSettings](docs/MeterValueSettings.md)
- [MeterWithStripeID](docs/MeterWithStripeID.md)
- [MigrationsDownResponse](docs/MigrationsDownResponse.md)
- [ModelFile](docs/ModelFile.md)
- [NamespaceDefinitionResponse](docs/NamespaceDefinitionResponse.md)
- [ParsedNamespaceDefinition](docs/ParsedNamespaceDefinition.md)
- [Price](docs/Price.md)
- [PriceChange](docs/PriceChange.md)
- [PriceChanges](docs/PriceChanges.md)
- [PriceDisplay](docs/PriceDisplay.md)
- [PriceLimit](docs/PriceLimit.md)
- [PriceUI](docs/PriceUI.md)
- [PriceWithStripeID](docs/PriceWithStripeID.md)
- [Product](docs/Product.md)
- [ProductChange](docs/ProductChange.md)
- [ProductChanges](docs/ProductChanges.md)
- [ProductUI](docs/ProductUI.md)
- [ProductWithStripeIDs](docs/ProductWithStripeIDs.md)
- [PromotionCode](docs/PromotionCode.md)
- [PromotionCodeChange](docs/PromotionCodeChange.md)
- [PromotionCodeChanges](docs/PromotionCodeChanges.md)
- [PromotionCodeWithStripeID](docs/PromotionCodeWithStripeID.md)
- [RecordUsageRequest](docs/RecordUsageRequest.md)
- [RecoveryIdentityAddress](docs/RecoveryIdentityAddress.md)
- [RelationMetadata](docs/RelationMetadata.md)
- [RelationMetadataResponse](docs/RelationMetadataResponse.md)
- [RemoveRequest](docs/RemoveRequest.md)
- [RemoveResponse](docs/RemoveResponse.md)
- [Requirements](docs/Requirements.md)
- [SendHTMLRequest](docs/SendHTMLRequest.md)
- [SendResponse](docs/SendResponse.md)
- [SendTemplateRequest](docs/SendTemplateRequest.md)
- [Session](docs/Session.md)
- [SessionAuthenticationMethod](docs/SessionAuthenticationMethod.md)
- [SessionDevice](docs/SessionDevice.md)
- [SessionResponse](docs/SessionResponse.md)
- [StripeConfigResponse](docs/StripeConfigResponse.md)
- [StripeConfiguration](docs/StripeConfiguration.md)
- [StripeConfigurationWithIDs](docs/StripeConfigurationWithIDs.md)
- [SubjectSetRequest](docs/SubjectSetRequest.md)
- [SubscriptionResponse](docs/SubscriptionResponse.md)
- [SwitchActiveRequest](docs/SwitchActiveRequest.md)
- [SwitchActiveResponse](docs/SwitchActiveResponse.md)
- [TenantPayload](docs/TenantPayload.md)
- [Tier](docs/Tier.md)
- [UpdateInvoiceRequest](docs/UpdateInvoiceRequest.md)
- [UpdateRolePermissionsRow](docs/UpdateRolePermissionsRow.md)
- [UpdateRoleRequest](docs/UpdateRoleRequest.md)
- [UpdateUserRoleRequest](docs/UpdateUserRoleRequest.md)
- [UpdateUserRoleResponse](docs/UpdateUserRoleResponse.md)
- [UploadRequest](docs/UploadRequest.md)
- [UploadResponse](docs/UploadResponse.md)
- [UpsertSystemTemplateRequest](docs/UpsertSystemTemplateRequest.md)
- [UpsertSystemTemplateResponse](docs/UpsertSystemTemplateResponse.md)
- [UpsertTemplateRequest](docs/UpsertTemplateRequest.md)
- [UpsertTemplateResponse](docs/UpsertTemplateResponse.md)
- [UserResponse](docs/UserResponse.md)
- [UserTenantListItem](docs/UserTenantListItem.md)
- [VerifiableIdentityAddress](docs/VerifiableIdentityAddress.md)
- [WebhookChange](docs/WebhookChange.md)
- [WebhookChanges](docs/WebhookChanges.md)
- [WebhookEndpointConfig](docs/WebhookEndpointConfig.md)
- [WhoAmIBody](docs/WhoAmIBody.md)

### Authorization

Authentication schemes defined for the API:
<a id="AppKeyAuth"></a>

#### AppKeyAuth

- **Type**: API key
- **API key parameter name**: `X-App-Key`
- **Location**: HTTP header
  <a id="CookieAuth"></a>
#### CookieAuth

- **Type**: API key
- **API key parameter name**: `omnibase_session_token`
- **Location**:
  <a id="ServiceKeyAuth"></a>
#### ServiceKeyAuth

- **Type**: API key
- **API key parameter name**: `X-Service-Key`
- **Location**: HTTP header
  <a id="SessionTokenAuth"></a>
#### SessionTokenAuth

- **Type**: API key
- **API key parameter name**: `X-Session-Token`
- **Location**: HTTP header

## About

This TypeScript SDK client supports the [Fetch API](https://fetch.spec.whatwg.org/)
and is automatically generated by the
[OpenAPI Generator](https://openapi-generator.tech) project:

- API version: `0.0.0-dev`
- Package version: `0.0.0-dev`
- Generator version: `7.17.0`
- Build package: `org.openapitools.codegen.languages.TypeScriptFetchClientCodegen`

The generated npm module supports the following:

- Environments
  - Node.js
  - Webpack
  - Browserify
- Language levels
  - ES5 - you must have a Promises/A+ library installed
  - ES6
- Module systems
  - CommonJS
  - ES6 module system

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

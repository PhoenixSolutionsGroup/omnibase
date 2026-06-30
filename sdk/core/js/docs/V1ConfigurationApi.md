# V1ConfigurationApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**archiveAllStripeConfig**](V1ConfigurationApi.md#archiveallstripeconfig) | **POST** /api/v1/stripe/admin/config/archive-all | Archive all Stripe config |
| [**createOrUpdateEmailTemplate**](V1ConfigurationApi.md#createorupdateemailtemplate) | **POST** /api/v1/email/templates | Create or update email template |
| [**deleteEmailTemplate**](V1ConfigurationApi.md#deleteemailtemplate) | **DELETE** /api/v1/email/templates/{type} | Delete email template |
| [**deployPermissionNamespaces**](V1ConfigurationApi.md#deploypermissionnamespaces) | **POST** /api/v1/permissions/namespaces | Deploy Keto namespace configurations |
| [**generateDatabaseTypes**](V1ConfigurationApi.md#generatedatabasetypes) | **GET** /api/v1/database/typegen | Generate types from database schema |
| [**getDatabaseMigrationStatus**](V1ConfigurationApi.md#getdatabasemigrationstatus) | **GET** /api/v1/database/migrations/status | Get applied migration status |
| [**getEmailTemplates**](V1ConfigurationApi.md#getemailtemplates) | **GET** /api/v1/email/templates | Get all email templates |
| [**getStripeConfigHistory**](V1ConfigurationApi.md#getstripeconfighistory) | **GET** /api/v1/stripe/admin/config/history | Get config history |
| [**getStripeConfigSchema**](V1ConfigurationApi.md#getstripeconfigschema) | **GET** /api/v1/stripe/schema | Get Stripe config schema |
| [**pullStripeConfig**](V1ConfigurationApi.md#pullstripeconfig) | **GET** /api/v1/stripe/admin/config/pull | Pull config from Stripe |
| [**rollbackDatabaseMigrations**](V1ConfigurationApi.md#rollbackdatabasemigrations) | **POST** /api/v1/database/migrations/down | Roll back database migrations |
| [**sendEmail**](V1ConfigurationApi.md#sendemailoperation) | **POST** /api/v1/email/send | Send an email |
| [**serveEmailTemplate**](V1ConfigurationApi.md#serveemailtemplate) | **GET** /api/v1/email/templates/{template_name}/{type} | Serve an email template file |
| [**updateStripeConfig**](V1ConfigurationApi.md#updatestripeconfig) | **POST** /api/v1/stripe/admin/config | Update Stripe config |
| [**uploadDatabaseMigrations**](V1ConfigurationApi.md#uploaddatabasemigrations) | **POST** /api/v1/database/migrations | Upload database migrations |
| [**validateStripeConfig**](V1ConfigurationApi.md#validatestripeconfig) | **POST** /api/v1/stripe/admin/config/validate | Validate Stripe config |



## archiveAllStripeConfig

> ArchiveAllResponse archiveAllStripeConfig()

Archive all Stripe config

Archives all active products, prices, and meters in Stripe and clears the local configuration.  ## Authentication Requires admin JWT token.  ## Warning This is a destructive operation that will archive ALL active Stripe resources.  ## Use Cases - Clean slate for new configuration - Remove all test data - Reset Stripe account 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { ArchiveAllStripeConfigRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  try {
    const data = await api.archiveAllStripeConfig();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**ArchiveAllResponse**](ArchiveAllResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Archive operation completed |  -  |
| **401** | Invalid or missing admin token |  -  |
| **500** | Failed to archive resources |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateEmailTemplate

> CreateOrUpdateEmailTemplate200Response createOrUpdateEmailTemplate(createEmailTemplateRequest)

Create or update email template

Creates a new email template or updates an existing one based on template type.  ## Template Management - If template type exists: updates subject and HTML body - If template type is new: creates new template entry  ## Template Types Template types are user-defined identifiers (e.g., \&quot;welcome\&quot;, \&quot;password-reset\&quot;, \&quot;invoice\&quot;).  ## Use Cases - Store custom email templates for transactional emails - Update email content without code deployments - Maintain versioned email templates 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { CreateOrUpdateEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // CreateEmailTemplateRequest
    createEmailTemplateRequest: ...,
  } satisfies CreateOrUpdateEmailTemplateRequest;

  try {
    const data = await api.createOrUpdateEmailTemplate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createEmailTemplateRequest** | [CreateEmailTemplateRequest](CreateEmailTemplateRequest.md) |  | |

### Return type

[**CreateOrUpdateEmailTemplate200Response**](CreateOrUpdateEmailTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template created/updated successfully |  -  |
| **400** | Bad request - Invalid or missing required headers/body |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteEmailTemplate

> DeleteEmailTemplate200Response deleteEmailTemplate(type)

Delete email template

Deletes an email template by its type identifier.  ## Deletion Process - Searches for template by type - Removes template from database if found - Returns 404 if template doesn\&#39;t exist  ## Use Cases - Remove deprecated email templates - Clean up test templates - Template lifecycle management 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { DeleteEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string | Template type identifier
    type: welcome,
  } satisfies DeleteEmailTemplateRequest;

  try {
    const data = await api.deleteEmailTemplate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **type** | `string` | Template type identifier | [Defaults to `undefined`] |

### Return type

[**DeleteEmailTemplate200Response**](DeleteEmailTemplate200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template deleted successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deployPermissionNamespaces

> NamespaceDeploymentResponse deployPermissionNamespaces(namespaces)

Deploy Keto namespace configurations

Uploads and deploys permission namespace configurations as a zip file.  ## Authentication Requires JWT token with appropriate permissions.  ## File Format Upload a zip file containing namespace definition files and optionally a &#x60;roles.config.json&#x60; file. The namespace files are stored in S3 and parsed to extract permission definitions.  **roles.config.json format:** &#x60;&#x60;&#x60;json {   \&quot;roles\&quot;: [     {       \&quot;role\&quot;: \&quot;admin\&quot;,       \&quot;permissions\&quot;: [\&quot;projects:read\&quot;, \&quot;projects:write\&quot;, \&quot;projects:delete\&quot;]     },     {       \&quot;role\&quot;: \&quot;viewer\&quot;,       \&quot;permissions\&quot;: [\&quot;projects:read\&quot;]     }   ] } &#x60;&#x60;&#x60;  ## Managed Mode If managed hosting is enabled, this endpoint will also trigger a restart of the Keto service.  ## Use Cases - CLI namespace deployment via &#x60;omnibase permissions push&#x60; - CI/CD pipeline integrations - Programmatic permission management 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { DeployPermissionNamespacesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // Blob | Zip file containing namespace configuration files
    namespaces: BINARY_DATA_HERE,
  } satisfies DeployPermissionNamespacesRequest;

  try {
    const data = await api.deployPermissionNamespaces(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **namespaces** | `Blob` | Zip file containing namespace configuration files | [Defaults to `undefined`] |

### Return type

[**NamespaceDeploymentResponse**](NamespaceDeploymentResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Namespaces deployed successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## generateDatabaseTypes

> string generateDatabaseTypes(schemas, language)

Generate types from database schema

Generates type definitions from the database schema using postgres-meta.  ## Supported Languages - &#x60;typescript&#x60; (default) - TypeScript type definitions - &#x60;go&#x60; - Go struct definitions - &#x60;swift&#x60; (beta) - Swift type definitions  ## Authentication Requires service key authentication.  ## Use Cases - CLI type generation via &#x60;omnibase db typegen&#x60; - CI/CD pipeline type generation - Programmatic type generation for SDKs 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GenerateDatabaseTypesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string | Comma-separated list of database schemas to include (valid PostgreSQL identifiers) (optional)
    schemas: public,auth,
    // 'typescript' | 'go' | 'swift' | Target language for type generation (optional)
    language: typescript,
  } satisfies GenerateDatabaseTypesRequest;

  try {
    const data = await api.generateDatabaseTypes(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **schemas** | `string` | Comma-separated list of database schemas to include (valid PostgreSQL identifiers) | [Optional] [Defaults to `&#39;public&#39;`] |
| **language** | `typescript`, `go`, `swift` | Target language for type generation | [Optional] [Defaults to `&#39;typescript&#39;`] [Enum: typescript, go, swift] |

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Generated type definitions |  -  |
| **400** | Unsupported language |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |
| **502** | Failed to connect to typegen service |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDatabaseMigrationStatus

> Array&lt;AppliedMigration&gt; getDatabaseMigrationStatus()

Get applied migration status

Returns the migrations recorded in the &#x60;migrations.schema_migrations&#x60; tracking table, ordered by version descending. A &#x60;dirty&#x60; migration indicates a previous run failed partway and needs manual intervention.  ## Authentication Requires service key authentication.  ## Use Cases - Inspect applied migrations via &#x60;omnibase db migrate status&#x60; - Detect dirty/failed migration state in CI 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GetDatabaseMigrationStatusRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  try {
    const data = await api.getDatabaseMigrationStatus();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;AppliedMigration&gt;**](AppliedMigration.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Applied migrations retrieved successfully |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getEmailTemplates

> GetEmailTemplates200Response getEmailTemplates()

Get all email templates

Retrieves all email templates stored in the database.  ## Response Returns array of all templates with their type, subject, and HTML body.  ## Use Cases - List available email templates - Display template management interface - Audit email template inventory 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GetEmailTemplatesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  try {
    const data = await api.getEmailTemplates();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**GetEmailTemplates200Response**](GetEmailTemplates200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Templates retrieved successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfigHistory

> ConfigHistoryResponse getStripeConfigHistory(limit, offset)

Get config history

Returns paginated history of all Stripe configurations.  ## Authentication Requires admin JWT token.  ## Query Parameters - limit: Items per page (default: 10, max: 100, min: 1) - offset: Number of items to skip (default: 0, min: 0) 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GetStripeConfigHistoryRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // number | Items per page (optional)
    limit: 56,
    // number | Items to skip (optional)
    offset: 56,
  } satisfies GetStripeConfigHistoryRequest;

  try {
    const data = await api.getStripeConfigHistory(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **limit** | `number` | Items per page | [Optional] [Defaults to `10`] |
| **offset** | `number` | Items to skip | [Optional] [Defaults to `0`] |

### Return type

[**ConfigHistoryResponse**](ConfigHistoryResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Configuration history retrieved successfully |  -  |
| **400** | Invalid limit/offset parameters or unknown query parameter |  -  |
| **401** | Invalid or missing admin token |  -  |
| **500** | Failed to retrieve history |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfigSchema

> object getStripeConfigSchema()

Get Stripe config schema

Returns the JSON schema definition for validating Stripe configuration files.  ## Use Cases - Validate configuration before upload - IDE autocomplete support - Generate configuration templates 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GetStripeConfigSchemaRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const api = new V1ConfigurationApi();

  try {
    const data = await api.getStripeConfigSchema();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

**object**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/schema+json`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | JSON schema for Stripe configuration |  -  |
| **500** | Failed to load schema |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## pullStripeConfig

> StripeConfigurationWithIDs pullStripeConfig()

Pull config from Stripe

Fetches all active products, prices, and meters from Stripe API and converts them to the local configuration format.  ## Authentication Requires admin JWT token.  ## Use Cases - Sync remote Stripe config to local - Import existing Stripe setup - Configuration backup 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { PullStripeConfigRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  try {
    const data = await api.pullStripeConfig();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**StripeConfigurationWithIDs**](StripeConfigurationWithIDs.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Stripe configuration pulled successfully |  -  |
| **401** | Invalid or missing admin token |  -  |
| **500** | Failed to pull configuration from Stripe |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## rollbackDatabaseMigrations

> RollbackDatabaseMigrations200Response rollbackDatabaseMigrations(steps, migrations)

Roll back database migrations

Rolls back the last N migrations using the supplied migration files.  **WARNING: Rolling back migrations can be destructive.** Down migrations may drop tables or columns and permanently delete data.  ## Authentication Requires service key authentication (typically used by CLI tools).  ## Migration Format Upload a zip file containing the SQL migration files (the same set used to apply the migrations). Files are renamed to golang-migrate format so the matching &#x60;*.down.sql&#x60; files can be executed.  ## Use Cases - Roll back migrations via &#x60;omnibase db migrate down&#x60; - Undo a faulty migration during development 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { RollbackDatabaseMigrationsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // number | Number of migrations to roll back
    steps: 56,
    // Blob | Zip file containing SQL migration files
    migrations: BINARY_DATA_HERE,
  } satisfies RollbackDatabaseMigrationsRequest;

  try {
    const data = await api.rollbackDatabaseMigrations(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **steps** | `number` | Number of migrations to roll back | [Defaults to `undefined`] |
| **migrations** | `Blob` | Zip file containing SQL migration files | [Defaults to `undefined`] |

### Return type

[**RollbackDatabaseMigrations200Response**](RollbackDatabaseMigrations200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Migrations rolled back successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sendEmail

> SendEmail200Response sendEmail(sendEmailRequest)

Send an email

Sends an email to the specified recipient using the configured SMTP server.  ## Email Content - Supports HTML body content - Optional plain text version for email clients that don\&#39;t support HTML - If both HTML and plain text are provided, sends as multipart/alternative  ## Use Cases - Send transactional emails - Send notifications to users - Custom email communications 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { SendEmailOperationRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // SendEmailRequest
    sendEmailRequest: ...,
  } satisfies SendEmailOperationRequest;

  try {
    const data = await api.sendEmail(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **sendEmailRequest** | [SendEmailRequest](SendEmailRequest.md) |  | |

### Return type

[**SendEmail200Response**](SendEmail200Response.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Email sent successfully |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## serveEmailTemplate

> string serveEmailTemplate(templateName, type)

Serve an email template file

Serves the raw contents of an email template used by Ory Kratos for transactional emails (verification, recovery, etc.).  A custom template is looked up in object storage first, falling back to the built-in default template shipped with the API.  ## Template Types - &#x60;body&#x60; — HTML body template (&#x60;email.body.gotmpl&#x60;) - &#x60;plaintext&#x60; — plain-text body template (&#x60;email.body.plaintext.gotmpl&#x60;) - &#x60;subject&#x60; — subject line template (&#x60;email.subject.gotmpl&#x60;)  ## Use Cases - Kratos courier template rendering - Previewing the active template for a given flow 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { ServeEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string | Kratos flow/template name
    templateName: verification,
    // 'body' | 'plaintext' | 'subject' | Which part of the template to serve
    type: body,
  } satisfies ServeEmailTemplateRequest;

  try {
    const data = await api.serveEmailTemplate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **templateName** | `string` | Kratos flow/template name | [Defaults to `undefined`] |
| **type** | `body`, `plaintext`, `subject` | Which part of the template to serve | [Defaults to `undefined`] [Enum: body, plaintext, subject] |

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Template contents |  -  |
| **400** | Bad Request - Invalid request parameters |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **404** | Not Found - Resource not found |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateStripeConfig

> StripeConfigUpdateResponse updateStripeConfig(stripeConfigUpdateRequest)

Update Stripe config

Updates the Stripe configuration and syncs with Stripe API to create/update products, prices, meters, and webhooks.  ## Authentication Requires admin JWT token.  ## Use Cases - Deploy new pricing - Update product definitions - Modify metered billing settings - Configure webhook endpoints  ## Webhooks Include a &#x60;webhooks&#x60; array to configure webhook endpoints. Webhooks not in the array will be deleted. Each webhook can have &#x60;connect: true&#x60; to listen to events from connected accounts. 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { UpdateStripeConfigRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // StripeConfigUpdateRequest
    stripeConfigUpdateRequest: ...,
  } satisfies UpdateStripeConfigRequest;

  try {
    const data = await api.updateStripeConfig(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **stripeConfigUpdateRequest** | [StripeConfigUpdateRequest](StripeConfigUpdateRequest.md) |  | |

### Return type

[**StripeConfigUpdateResponse**](StripeConfigUpdateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Configuration updated successfully |  -  |
| **400** | Invalid configuration, validation errors, or configuration data is required |  -  |
| **401** | Invalid or missing admin token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadDatabaseMigrations

> object uploadDatabaseMigrations(migrations)

Upload database migrations

Uploads SQL migration files and applies them to the user\&#39;s PostgreSQL database.  ## Authentication Requires JWT token (typically used by CLI tools, not browser sessions).  ## Migration Format Upload a zip file containing SQL files named like: &#x60;001-seed.sql&#x60;, &#x60;002-rls.sql&#x60;, etc. Files are automatically renamed to golang-migrate format: &#x60;001_seed.up.sql&#x60;, &#x60;002_rls.up.sql&#x60;.  ## Use Cases - CLI migration uploads via &#x60;omnibase db migration push&#x60; - CI/CD pipeline integrations - Programmatic schema management 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { UploadDatabaseMigrationsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // Blob | Zip file containing SQL migration files
    migrations: BINARY_DATA_HERE,
  } satisfies UploadDatabaseMigrationsRequest;

  try {
    const data = await api.uploadDatabaseMigrations(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **migrations** | `Blob` | Zip file containing SQL migration files | [Defaults to `undefined`] |

### Return type

**object**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Migrations applied successfully |  -  |
| **400** | No migrations zip file provided |  -  |
| **401** | Unauthorized - Authentication required |  -  |
| **500** | Internal Server Error - Server encountered an error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## validateStripeConfig

> object validateStripeConfig(stripeConfigValidateRequest)

Validate Stripe config

Validates a Stripe configuration against the schema without saving or deploying it.  ## Authentication Requires admin JWT token.  ## Use Cases - Pre-deployment validation - Configuration testing - Schema compliance checking 

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { ValidateStripeConfigRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // StripeConfigValidateRequest | Stripe configuration to validate
    stripeConfigValidateRequest: ...,
  } satisfies ValidateStripeConfigRequest;

  try {
    const data = await api.validateStripeConfig(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **stripeConfigValidateRequest** | [StripeConfigValidateRequest](StripeConfigValidateRequest.md) | Stripe configuration to validate | |

### Return type

**object**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Configuration is valid |  -  |
| **400** | Configuration validation failed or version is required |  -  |
| **401** | Invalid or missing admin token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


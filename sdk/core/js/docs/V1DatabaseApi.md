# V1DatabaseApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**generateDatabaseTypes**](V1DatabaseApi.md#generatedatabasetypes) | **GET** /api/v1/database/typegen | Generate type definitions for the database schema |
| [**getDatabaseMigrationStatus**](V1DatabaseApi.md#getdatabasemigrationstatus) | **GET** /api/v1/database/migrations/status | Get the status of applied migrations |
| [**rollbackDatabaseMigrations**](V1DatabaseApi.md#rollbackdatabasemigrations) | **POST** /api/v1/database/migrations/down | Roll back database migrations |
| [**uploadDatabaseMigrations**](V1DatabaseApi.md#uploaddatabasemigrations) | **POST** /api/v1/database/migrations | Apply database migrations |



## generateDatabaseTypes

> string generateDatabaseTypes(language, schemas)

Generate type definitions for the database schema

### Example

```ts
import {
  Configuration,
  V1DatabaseApi,
} from '@omnibase/core-js';
import type { GenerateDatabaseTypesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1DatabaseApi(config);

  const body = {
    // 'typescript' | 'go' | 'swift' (optional)
    language: language_example,
    // string (optional)
    schemas: schemas_example,
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
| **language** | `typescript`, `go`, `swift` |  | [Optional] [Defaults to `&#39;typescript&#39;`] [Enum: typescript, go, swift] |
| **schemas** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * Content-Type -  <br>  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDatabaseMigrationStatus

> Array&lt;AppliedMigration&gt; getDatabaseMigrationStatus()

Get the status of applied migrations

### Example

```ts
import {
  Configuration,
  V1DatabaseApi,
} from '@omnibase/core-js';
import type { GetDatabaseMigrationStatusRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1DatabaseApi(config);

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## rollbackDatabaseMigrations

> MigrationsDownResponse rollbackDatabaseMigrations(migrations, steps)

Roll back database migrations

### Example

```ts
import {
  Configuration,
  V1DatabaseApi,
} from '@omnibase/core-js';
import type { RollbackDatabaseMigrationsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1DatabaseApi(config);

  const body = {
    // Blob
    migrations: BINARY_DATA_HERE,
    // string
    steps: steps_example,
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
| **migrations** | `Blob` |  | [Defaults to `undefined`] |
| **steps** | `string` |  | [Defaults to `undefined`] |

### Return type

[**MigrationsDownResponse**](MigrationsDownResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadDatabaseMigrations

> ApplyMigrationsResponse uploadDatabaseMigrations(migrations)

Apply database migrations

### Example

```ts
import {
  Configuration,
  V1DatabaseApi,
} from '@omnibase/core-js';
import type { UploadDatabaseMigrationsRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1DatabaseApi(config);

  const body = {
    // Blob
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
| **migrations** | `Blob` |  | [Defaults to `undefined`] |

### Return type

[**ApplyMigrationsResponse**](ApplyMigrationsResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


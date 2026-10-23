# V1ConfigurationApi

All URIs are relative to *https://api.omnibase.tech*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**archiveAllStripeConfig**](V1ConfigurationApi.md#archiveallstripeconfig) | **POST** /api/v1/stripe/admin/config/archive-all | Archive all Stripe config |
| [**createOrUpdateEmailTemplate**](V1ConfigurationApi.md#createorupdateemailtemplate) | **POST** /api/v1/email/templates | Create or update email template |
| [**createOrUpdateSystemEmailTemplate**](V1ConfigurationApi.md#createorupdatesystememailtemplate) | **POST** /api/v1/email/system-templates | Create or update a system email template |
| [**deleteEmailTemplate**](V1ConfigurationApi.md#deleteemailtemplate) | **DELETE** /api/v1/email/templates/{type} | Delete email template |
| [**deleteSystemEmailTemplate**](V1ConfigurationApi.md#deletesystememailtemplate) | **DELETE** /api/v1/email/system-templates/{name} | Delete a system email template |
| [**deployPermissionNamespaces**](V1ConfigurationApi.md#deploypermissionnamespaces) | **POST** /api/v1/permissions/namespaces | Deploy Keto namespace configurations |
| [**getEmailTemplates**](V1ConfigurationApi.md#getemailtemplates) | **GET** /api/v1/email/templates | Get all email templates |
| [**getStripeConfigHistory**](V1ConfigurationApi.md#getstripeconfighistory) | **GET** /api/v1/stripe/admin/config/history | Get config history |
| [**getStripeConfigSchema**](V1ConfigurationApi.md#getstripeconfigschema) | **GET** /api/v1/stripe/schema | Get Stripe config schema |
| [**getSystemEmailTemplates**](V1ConfigurationApi.md#getsystememailtemplates) | **GET** /api/v1/email/system-templates | Get all system email templates |
| [**pullStripeConfig**](V1ConfigurationApi.md#pullstripeconfig) | **GET** /api/v1/stripe/admin/config/pull | Pull config from Stripe |
| [**sendEmail**](V1ConfigurationApi.md#sendemail) | **POST** /api/v1/email/send | Send an email using an app template |
| [**sendEmailHTML**](V1ConfigurationApi.md#sendemailhtml) | **POST** /api/v1/email/send/html | Send a raw HTML email |
| [**serveEmailTemplate**](V1ConfigurationApi.md#serveemailtemplate) | **GET** /api/v1/email/templates/{template_name}/{type} | Serve an email template file |
| [**serveSystemEmailTemplate**](V1ConfigurationApi.md#servesystememailtemplate) | **GET** /api/v1/email/system-templates/{name}/{type} | Serve a system email template file |
| [**updateStripeConfig**](V1ConfigurationApi.md#updatestripeconfig) | **POST** /api/v1/stripe/admin/config | Update Stripe config |
| [**validateStripeConfig**](V1ConfigurationApi.md#validatestripeconfig) | **POST** /api/v1/stripe/admin/config/validate | Validate Stripe config |



## archiveAllStripeConfig

> ArchiveAllResponse archiveAllStripeConfig()

Archive all Stripe config

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateEmailTemplate

> UpsertTemplateResponse createOrUpdateEmailTemplate(upsertTemplateRequest)

Create or update email template

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // UpsertTemplateRequest
    upsertTemplateRequest: ...,
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
| **upsertTemplateRequest** | [UpsertTemplateRequest](UpsertTemplateRequest.md) |  | |

### Return type

[**UpsertTemplateResponse**](UpsertTemplateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createOrUpdateSystemEmailTemplate

> UpsertSystemTemplateResponse createOrUpdateSystemEmailTemplate(upsertSystemTemplateRequest)

Create or update a system email template

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { CreateOrUpdateSystemEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // UpsertSystemTemplateRequest
    upsertSystemTemplateRequest: ...,
  } satisfies CreateOrUpdateSystemEmailTemplateRequest;

  try {
    const data = await api.createOrUpdateSystemEmailTemplate(body);
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
| **upsertSystemTemplateRequest** | [UpsertSystemTemplateRequest](UpsertSystemTemplateRequest.md) |  | |

### Return type

[**UpsertSystemTemplateResponse**](UpsertSystemTemplateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteEmailTemplate

> DeleteTemplateResponse deleteEmailTemplate(type)

Delete email template

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string
    type: type_example,
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
| **type** | `string` |  | [Defaults to `undefined`] |

### Return type

[**DeleteTemplateResponse**](DeleteTemplateResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteSystemEmailTemplate

> DeleteSystemTemplateResponse deleteSystemEmailTemplate(name)

Delete a system email template

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { DeleteSystemEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string
    name: name_example,
  } satisfies DeleteSystemEmailTemplateRequest;

  try {
    const data = await api.deleteSystemEmailTemplate(body);
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
| **name** | `string` |  | [Defaults to `undefined`] |

### Return type

[**DeleteSystemTemplateResponse**](DeleteSystemTemplateResponse.md)

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


## deployPermissionNamespaces

> DeployNamespacesResponse deployPermissionNamespaces(namespaces)

Deploy Keto namespace configurations

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
    // Blob
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
| **namespaces** | `Blob` |  | [Defaults to `undefined`] |

### Return type

[**DeployNamespacesResponse**](DeployNamespacesResponse.md)

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


## getEmailTemplates

> ListTemplatesResponse getEmailTemplates()

Get all email templates

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
    // To configure API key authorization: AppKeyAuth
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

[**ListTemplatesResponse**](ListTemplatesResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getStripeConfigHistory

> ConfigHistoryResponse getStripeConfigHistory(limit, offset)

Get config history

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
    // number (optional)
    limit: 789,
    // number (optional)
    offset: 789,
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
| **limit** | `number` |  | [Optional] [Defaults to `10`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**ConfigHistoryResponse**](ConfigHistoryResponse.md)

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


## getStripeConfigSchema

> string getStripeConfigSchema()

Get Stripe config schema

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

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * Content-Type -  <br>  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSystemEmailTemplates

> ListSystemTemplatesResponse getSystemEmailTemplates()

Get all system email templates

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { GetSystemEmailTemplatesRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  try {
    const data = await api.getSystemEmailTemplates();
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

[**ListSystemTemplatesResponse**](ListSystemTemplatesResponse.md)

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


## pullStripeConfig

> StripeConfiguration pullStripeConfig()

Pull config from Stripe

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

[**StripeConfiguration**](StripeConfiguration.md)

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


## sendEmail

> SendResponse sendEmail(sendTemplateRequest)

Send an email using an app template

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { SendEmailRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // SendTemplateRequest
    sendTemplateRequest: ...,
  } satisfies SendEmailRequest;

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
| **sendTemplateRequest** | [SendTemplateRequest](SendTemplateRequest.md) |  | |

### Return type

[**SendResponse**](SendResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sendEmailHTML

> SendResponse sendEmailHTML(sendHTMLRequest)

Send a raw HTML email

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { SendEmailHTMLRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: CookieAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // SendHTMLRequest
    sendHTMLRequest: ...,
  } satisfies SendEmailHTMLRequest;

  try {
    const data = await api.sendEmailHTML(body);
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
| **sendHTMLRequest** | [SendHTMLRequest](SendHTMLRequest.md) |  | |

### Return type

[**SendResponse**](SendResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## serveEmailTemplate

> string serveEmailTemplate(templateName, type)

Serve an email template file

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
    // To configure API key authorization: AppKeyAuth
    apiKey: "YOUR API KEY",
    // To configure API key authorization: SessionTokenAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string
    templateName: templateName_example,
    // string
    type: type_example,
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
| **templateName** | `string` |  | [Defaults to `undefined`] |
| **type** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth), [CookieAuth](../README.md#CookieAuth), [AppKeyAuth](../README.md#AppKeyAuth), [SessionTokenAuth](../README.md#SessionTokenAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * Cache-Control -  <br>  * Content-Type -  <br>  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## serveSystemEmailTemplate

> string serveSystemEmailTemplate(name, type)

Serve a system email template file

### Example

```ts
import {
  Configuration,
  V1ConfigurationApi,
} from '@omnibase/core-js';
import type { ServeSystemEmailTemplateRequest } from '@omnibase/core-js';

async function example() {
  console.log("🚀 Testing @omnibase/core-js SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: ServiceKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new V1ConfigurationApi(config);

  const body = {
    // string
    name: name_example,
    // string
    type: type_example,
  } satisfies ServeSystemEmailTemplateRequest;

  try {
    const data = await api.serveSystemEmailTemplate(body);
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
| **name** | `string` |  | [Defaults to `undefined`] |
| **type** | `string` |  | [Defaults to `undefined`] |

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
| **200** | OK |  * Cache-Control -  <br>  * Content-Type -  <br>  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateStripeConfig

> ConfigResponse updateStripeConfig(body)

Update Stripe config

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
    // object
    body: Object,
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
| **body** | `object` |  | |

### Return type

[**ConfigResponse**](ConfigResponse.md)

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## validateStripeConfig

> string validateStripeConfig(body)

Validate Stripe config

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
    // object
    body: Object,
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
| **body** | `object` |  | |

### Return type

**string**

### Authorization

[ServiceKeyAuth](../README.md#ServiceKeyAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **0** | Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


# ListWebhooksResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Webhooks** | [**[]WebhookSecretResponse**](WebhookSecretResponse.md) | List of all configured webhooks | 

## Methods

### NewListWebhooksResponse

`func NewListWebhooksResponse(webhooks []WebhookSecretResponse, ) *ListWebhooksResponse`

NewListWebhooksResponse instantiates a new ListWebhooksResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListWebhooksResponseWithDefaults

`func NewListWebhooksResponseWithDefaults() *ListWebhooksResponse`

NewListWebhooksResponseWithDefaults instantiates a new ListWebhooksResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetWebhooks

`func (o *ListWebhooksResponse) GetWebhooks() []WebhookSecretResponse`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *ListWebhooksResponse) GetWebhooksOk() (*[]WebhookSecretResponse, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *ListWebhooksResponse) SetWebhooks(v []WebhookSecretResponse)`

SetWebhooks sets Webhooks field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



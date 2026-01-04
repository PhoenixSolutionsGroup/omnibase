# WebhooksConfigRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Webhooks** | [**[]WebhookEndpointConfig**](WebhookEndpointConfig.md) | List of webhook endpoint configurations. Each webhook must have a unique URL - duplicate URLs are not allowed. | 

## Methods

### NewWebhooksConfigRequest

`func NewWebhooksConfigRequest(webhooks []WebhookEndpointConfig, ) *WebhooksConfigRequest`

NewWebhooksConfigRequest instantiates a new WebhooksConfigRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhooksConfigRequestWithDefaults

`func NewWebhooksConfigRequestWithDefaults() *WebhooksConfigRequest`

NewWebhooksConfigRequestWithDefaults instantiates a new WebhooksConfigRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetWebhooks

`func (o *WebhooksConfigRequest) GetWebhooks() []WebhookEndpointConfig`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *WebhooksConfigRequest) GetWebhooksOk() (*[]WebhookEndpointConfig, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *WebhooksConfigRequest) SetWebhooks(v []WebhookEndpointConfig)`

SetWebhooks sets Webhooks field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



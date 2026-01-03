# WebhooksConfigResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Webhooks** | [**[]WebhookResult**](WebhookResult.md) | List of configured webhook endpoints with results | 

## Methods

### NewWebhooksConfigResponse

`func NewWebhooksConfigResponse(webhooks []WebhookResult, ) *WebhooksConfigResponse`

NewWebhooksConfigResponse instantiates a new WebhooksConfigResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhooksConfigResponseWithDefaults

`func NewWebhooksConfigResponseWithDefaults() *WebhooksConfigResponse`

NewWebhooksConfigResponseWithDefaults instantiates a new WebhooksConfigResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetWebhooks

`func (o *WebhooksConfigResponse) GetWebhooks() []WebhookResult`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *WebhooksConfigResponse) GetWebhooksOk() (*[]WebhookResult, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *WebhooksConfigResponse) SetWebhooks(v []WebhookResult)`

SetWebhooks sets Webhooks field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



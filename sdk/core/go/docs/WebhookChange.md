# WebhookChange

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Action** | **string** |  | 
**StripeId** | Pointer to **string** |  | [optional] 
**Url** | **string** |  | 
**WebhookId** | Pointer to **string** |  | [optional] 

## Methods

### NewWebhookChange

`func NewWebhookChange(action string, url string, ) *WebhookChange`

NewWebhookChange instantiates a new WebhookChange object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookChangeWithDefaults

`func NewWebhookChangeWithDefaults() *WebhookChange`

NewWebhookChangeWithDefaults instantiates a new WebhookChange object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAction

`func (o *WebhookChange) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *WebhookChange) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *WebhookChange) SetAction(v string)`

SetAction sets Action field to given value.


### GetStripeId

`func (o *WebhookChange) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *WebhookChange) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *WebhookChange) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *WebhookChange) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetUrl

`func (o *WebhookChange) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *WebhookChange) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *WebhookChange) SetUrl(v string)`

SetUrl sets Url field to given value.


### GetWebhookId

`func (o *WebhookChange) GetWebhookId() string`

GetWebhookId returns the WebhookId field if non-nil, zero value otherwise.

### GetWebhookIdOk

`func (o *WebhookChange) GetWebhookIdOk() (*string, bool)`

GetWebhookIdOk returns a tuple with the WebhookId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhookId

`func (o *WebhookChange) SetWebhookId(v string)`

SetWebhookId sets WebhookId field to given value.

### HasWebhookId

`func (o *WebhookChange) HasWebhookId() bool`

HasWebhookId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



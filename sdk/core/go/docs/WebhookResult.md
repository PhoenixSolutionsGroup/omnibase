# WebhookResult

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** | Internal webhook ID | [optional] 
**StripeId** | **string** | Stripe webhook endpoint ID (we_xxx) or managed pseudo ID (wh_managed_xxx) | 
**Url** | **string** | Webhook endpoint URL | 
**Events** | **[]string** | List of subscribed event types | 
**Connect** | **bool** | Whether webhook listens to connected account events | 
**Secret** | **string** | Webhook signing secret for signature verification | 
**Action** | **string** | Action performed on the webhook | 

## Methods

### NewWebhookResult

`func NewWebhookResult(stripeId string, url string, events []string, connect bool, secret string, action string, ) *WebhookResult`

NewWebhookResult instantiates a new WebhookResult object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookResultWithDefaults

`func NewWebhookResultWithDefaults() *WebhookResult`

NewWebhookResultWithDefaults instantiates a new WebhookResult object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *WebhookResult) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *WebhookResult) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *WebhookResult) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *WebhookResult) HasId() bool`

HasId returns a boolean if a field has been set.

### GetStripeId

`func (o *WebhookResult) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *WebhookResult) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *WebhookResult) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.


### GetUrl

`func (o *WebhookResult) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *WebhookResult) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *WebhookResult) SetUrl(v string)`

SetUrl sets Url field to given value.


### GetEvents

`func (o *WebhookResult) GetEvents() []string`

GetEvents returns the Events field if non-nil, zero value otherwise.

### GetEventsOk

`func (o *WebhookResult) GetEventsOk() (*[]string, bool)`

GetEventsOk returns a tuple with the Events field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvents

`func (o *WebhookResult) SetEvents(v []string)`

SetEvents sets Events field to given value.


### GetConnect

`func (o *WebhookResult) GetConnect() bool`

GetConnect returns the Connect field if non-nil, zero value otherwise.

### GetConnectOk

`func (o *WebhookResult) GetConnectOk() (*bool, bool)`

GetConnectOk returns a tuple with the Connect field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConnect

`func (o *WebhookResult) SetConnect(v bool)`

SetConnect sets Connect field to given value.


### GetSecret

`func (o *WebhookResult) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *WebhookResult) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *WebhookResult) SetSecret(v string)`

SetSecret sets Secret field to given value.


### GetAction

`func (o *WebhookResult) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *WebhookResult) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *WebhookResult) SetAction(v string)`

SetAction sets Action field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



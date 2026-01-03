# WebhookEndpointConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** | Optional unique identifier for the webhook endpoint | [optional] 
**Url** | **string** | Webhook endpoint URL (supports ${VAR} env var interpolation via CLI) | 
**Events** | **[]string** | List of Stripe event types to subscribe to | 
**Connect** | Pointer to **bool** | If true, listen to events from connected accounts (Stripe Connect) | [optional] [default to false]

## Methods

### NewWebhookEndpointConfig

`func NewWebhookEndpointConfig(url string, events []string, ) *WebhookEndpointConfig`

NewWebhookEndpointConfig instantiates a new WebhookEndpointConfig object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWebhookEndpointConfigWithDefaults

`func NewWebhookEndpointConfigWithDefaults() *WebhookEndpointConfig`

NewWebhookEndpointConfigWithDefaults instantiates a new WebhookEndpointConfig object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *WebhookEndpointConfig) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *WebhookEndpointConfig) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *WebhookEndpointConfig) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *WebhookEndpointConfig) HasId() bool`

HasId returns a boolean if a field has been set.

### GetUrl

`func (o *WebhookEndpointConfig) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *WebhookEndpointConfig) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *WebhookEndpointConfig) SetUrl(v string)`

SetUrl sets Url field to given value.


### GetEvents

`func (o *WebhookEndpointConfig) GetEvents() []string`

GetEvents returns the Events field if non-nil, zero value otherwise.

### GetEventsOk

`func (o *WebhookEndpointConfig) GetEventsOk() (*[]string, bool)`

GetEventsOk returns a tuple with the Events field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvents

`func (o *WebhookEndpointConfig) SetEvents(v []string)`

SetEvents sets Events field to given value.


### GetConnect

`func (o *WebhookEndpointConfig) GetConnect() bool`

GetConnect returns the Connect field if non-nil, zero value otherwise.

### GetConnectOk

`func (o *WebhookEndpointConfig) GetConnectOk() (*bool, bool)`

GetConnectOk returns a tuple with the Connect field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConnect

`func (o *WebhookEndpointConfig) SetConnect(v bool)`

SetConnect sets Connect field to given value.

### HasConnect

`func (o *WebhookEndpointConfig) HasConnect() bool`

HasConnect returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# ListStripeWebhooksRow

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ConfigId** | **string** |  | 
**Connect** | **bool** |  | 
**CreatedAt** | **time.Time** |  | 
**Events** | **[]string** |  | 
**Id** | **string** |  | 
**Secret** | **string** |  | 
**StripeId** | **string** |  | 
**UpdatedAt** | **time.Time** |  | 
**Url** | **string** |  | 

## Methods

### NewListStripeWebhooksRow

`func NewListStripeWebhooksRow(configId string, connect bool, createdAt time.Time, events []string, id string, secret string, stripeId string, updatedAt time.Time, url string, ) *ListStripeWebhooksRow`

NewListStripeWebhooksRow instantiates a new ListStripeWebhooksRow object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListStripeWebhooksRowWithDefaults

`func NewListStripeWebhooksRowWithDefaults() *ListStripeWebhooksRow`

NewListStripeWebhooksRowWithDefaults instantiates a new ListStripeWebhooksRow object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfigId

`func (o *ListStripeWebhooksRow) GetConfigId() string`

GetConfigId returns the ConfigId field if non-nil, zero value otherwise.

### GetConfigIdOk

`func (o *ListStripeWebhooksRow) GetConfigIdOk() (*string, bool)`

GetConfigIdOk returns a tuple with the ConfigId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigId

`func (o *ListStripeWebhooksRow) SetConfigId(v string)`

SetConfigId sets ConfigId field to given value.


### GetConnect

`func (o *ListStripeWebhooksRow) GetConnect() bool`

GetConnect returns the Connect field if non-nil, zero value otherwise.

### GetConnectOk

`func (o *ListStripeWebhooksRow) GetConnectOk() (*bool, bool)`

GetConnectOk returns a tuple with the Connect field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConnect

`func (o *ListStripeWebhooksRow) SetConnect(v bool)`

SetConnect sets Connect field to given value.


### GetCreatedAt

`func (o *ListStripeWebhooksRow) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *ListStripeWebhooksRow) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *ListStripeWebhooksRow) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetEvents

`func (o *ListStripeWebhooksRow) GetEvents() []string`

GetEvents returns the Events field if non-nil, zero value otherwise.

### GetEventsOk

`func (o *ListStripeWebhooksRow) GetEventsOk() (*[]string, bool)`

GetEventsOk returns a tuple with the Events field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEvents

`func (o *ListStripeWebhooksRow) SetEvents(v []string)`

SetEvents sets Events field to given value.


### SetEventsNil

`func (o *ListStripeWebhooksRow) SetEventsNil(b bool)`

 SetEventsNil sets the value for Events to be an explicit nil

### UnsetEvents
`func (o *ListStripeWebhooksRow) UnsetEvents()`

UnsetEvents ensures that no value is present for Events, not even an explicit nil
### GetId

`func (o *ListStripeWebhooksRow) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ListStripeWebhooksRow) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ListStripeWebhooksRow) SetId(v string)`

SetId sets Id field to given value.


### GetSecret

`func (o *ListStripeWebhooksRow) GetSecret() string`

GetSecret returns the Secret field if non-nil, zero value otherwise.

### GetSecretOk

`func (o *ListStripeWebhooksRow) GetSecretOk() (*string, bool)`

GetSecretOk returns a tuple with the Secret field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSecret

`func (o *ListStripeWebhooksRow) SetSecret(v string)`

SetSecret sets Secret field to given value.


### GetStripeId

`func (o *ListStripeWebhooksRow) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ListStripeWebhooksRow) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ListStripeWebhooksRow) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.


### GetUpdatedAt

`func (o *ListStripeWebhooksRow) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *ListStripeWebhooksRow) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *ListStripeWebhooksRow) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.


### GetUrl

`func (o *ListStripeWebhooksRow) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *ListStripeWebhooksRow) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *ListStripeWebhooksRow) SetUrl(v string)`

SetUrl sets Url field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



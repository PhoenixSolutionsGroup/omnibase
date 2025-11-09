# V1StripeIDConversionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ConfigId** | **string** | Config ID | 
**ConfigUuid** | **string** | Configuration UUID that this mapping belongs to | 
**HistoryCount** | **int32** | Number of historical Stripe IDs for this config item | 
**ItemType** | **string** | Item type (product, price, or meter) | 
**StripeId** | **string** | Stripe ID | 

## Methods

### NewV1StripeIDConversionResponse

`func NewV1StripeIDConversionResponse(configId string, configUuid string, historyCount int32, itemType string, stripeId string, ) *V1StripeIDConversionResponse`

NewV1StripeIDConversionResponse instantiates a new V1StripeIDConversionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1StripeIDConversionResponseWithDefaults

`func NewV1StripeIDConversionResponseWithDefaults() *V1StripeIDConversionResponse`

NewV1StripeIDConversionResponseWithDefaults instantiates a new V1StripeIDConversionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfigId

`func (o *V1StripeIDConversionResponse) GetConfigId() string`

GetConfigId returns the ConfigId field if non-nil, zero value otherwise.

### GetConfigIdOk

`func (o *V1StripeIDConversionResponse) GetConfigIdOk() (*string, bool)`

GetConfigIdOk returns a tuple with the ConfigId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigId

`func (o *V1StripeIDConversionResponse) SetConfigId(v string)`

SetConfigId sets ConfigId field to given value.


### GetConfigUuid

`func (o *V1StripeIDConversionResponse) GetConfigUuid() string`

GetConfigUuid returns the ConfigUuid field if non-nil, zero value otherwise.

### GetConfigUuidOk

`func (o *V1StripeIDConversionResponse) GetConfigUuidOk() (*string, bool)`

GetConfigUuidOk returns a tuple with the ConfigUuid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigUuid

`func (o *V1StripeIDConversionResponse) SetConfigUuid(v string)`

SetConfigUuid sets ConfigUuid field to given value.


### GetHistoryCount

`func (o *V1StripeIDConversionResponse) GetHistoryCount() int32`

GetHistoryCount returns the HistoryCount field if non-nil, zero value otherwise.

### GetHistoryCountOk

`func (o *V1StripeIDConversionResponse) GetHistoryCountOk() (*int32, bool)`

GetHistoryCountOk returns a tuple with the HistoryCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHistoryCount

`func (o *V1StripeIDConversionResponse) SetHistoryCount(v int32)`

SetHistoryCount sets HistoryCount field to given value.


### GetItemType

`func (o *V1StripeIDConversionResponse) GetItemType() string`

GetItemType returns the ItemType field if non-nil, zero value otherwise.

### GetItemTypeOk

`func (o *V1StripeIDConversionResponse) GetItemTypeOk() (*string, bool)`

GetItemTypeOk returns a tuple with the ItemType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetItemType

`func (o *V1StripeIDConversionResponse) SetItemType(v string)`

SetItemType sets ItemType field to given value.


### GetStripeId

`func (o *V1StripeIDConversionResponse) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *V1StripeIDConversionResponse) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *V1StripeIDConversionResponse) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# StripeIDConversionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**StripeId** | **string** | Stripe ID | 
**ConfigId** | **string** | Config ID | 
**ItemType** | **string** | Item type (product, price, or meter) | 
**ConfigUuid** | **string** | Configuration UUID that this mapping belongs to | 
**HistoryCount** | **int32** | Number of historical Stripe IDs for this config item | 

## Methods

### NewStripeIDConversionResponse

`func NewStripeIDConversionResponse(stripeId string, configId string, itemType string, configUuid string, historyCount int32, ) *StripeIDConversionResponse`

NewStripeIDConversionResponse instantiates a new StripeIDConversionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeIDConversionResponseWithDefaults

`func NewStripeIDConversionResponseWithDefaults() *StripeIDConversionResponse`

NewStripeIDConversionResponseWithDefaults instantiates a new StripeIDConversionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStripeId

`func (o *StripeIDConversionResponse) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *StripeIDConversionResponse) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *StripeIDConversionResponse) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.


### GetConfigId

`func (o *StripeIDConversionResponse) GetConfigId() string`

GetConfigId returns the ConfigId field if non-nil, zero value otherwise.

### GetConfigIdOk

`func (o *StripeIDConversionResponse) GetConfigIdOk() (*string, bool)`

GetConfigIdOk returns a tuple with the ConfigId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigId

`func (o *StripeIDConversionResponse) SetConfigId(v string)`

SetConfigId sets ConfigId field to given value.


### GetItemType

`func (o *StripeIDConversionResponse) GetItemType() string`

GetItemType returns the ItemType field if non-nil, zero value otherwise.

### GetItemTypeOk

`func (o *StripeIDConversionResponse) GetItemTypeOk() (*string, bool)`

GetItemTypeOk returns a tuple with the ItemType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetItemType

`func (o *StripeIDConversionResponse) SetItemType(v string)`

SetItemType sets ItemType field to given value.


### GetConfigUuid

`func (o *StripeIDConversionResponse) GetConfigUuid() string`

GetConfigUuid returns the ConfigUuid field if non-nil, zero value otherwise.

### GetConfigUuidOk

`func (o *StripeIDConversionResponse) GetConfigUuidOk() (*string, bool)`

GetConfigUuidOk returns a tuple with the ConfigUuid field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigUuid

`func (o *StripeIDConversionResponse) SetConfigUuid(v string)`

SetConfigUuid sets ConfigUuid field to given value.


### GetHistoryCount

`func (o *StripeIDConversionResponse) GetHistoryCount() int32`

GetHistoryCount returns the HistoryCount field if non-nil, zero value otherwise.

### GetHistoryCountOk

`func (o *StripeIDConversionResponse) GetHistoryCountOk() (*int32, bool)`

GetHistoryCountOk returns a tuple with the HistoryCount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHistoryCount

`func (o *StripeIDConversionResponse) SetHistoryCount(v int32)`

SetHistoryCount sets HistoryCount field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



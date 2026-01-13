# MeterChange

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**MeterId** | **string** | Meter config ID | 
**DisplayName** | **string** | Meter display name | 
**Action** | **string** | Action performed on the meter | 
**StripeId** | Pointer to **string** | Stripe meter ID | [optional] 

## Methods

### NewMeterChange

`func NewMeterChange(meterId string, displayName string, action string, ) *MeterChange`

NewMeterChange instantiates a new MeterChange object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMeterChangeWithDefaults

`func NewMeterChangeWithDefaults() *MeterChange`

NewMeterChangeWithDefaults instantiates a new MeterChange object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMeterId

`func (o *MeterChange) GetMeterId() string`

GetMeterId returns the MeterId field if non-nil, zero value otherwise.

### GetMeterIdOk

`func (o *MeterChange) GetMeterIdOk() (*string, bool)`

GetMeterIdOk returns a tuple with the MeterId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMeterId

`func (o *MeterChange) SetMeterId(v string)`

SetMeterId sets MeterId field to given value.


### GetDisplayName

`func (o *MeterChange) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *MeterChange) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *MeterChange) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetAction

`func (o *MeterChange) GetAction() string`

GetAction returns the Action field if non-nil, zero value otherwise.

### GetActionOk

`func (o *MeterChange) GetActionOk() (*string, bool)`

GetActionOk returns a tuple with the Action field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAction

`func (o *MeterChange) SetAction(v string)`

SetAction sets Action field to given value.


### GetStripeId

`func (o *MeterChange) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *MeterChange) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *MeterChange) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *MeterChange) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



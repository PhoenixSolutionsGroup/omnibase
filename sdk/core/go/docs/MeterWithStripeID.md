# MeterWithStripeID

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CustomerMapping** | Pointer to [**MeterCustomerMapping**](MeterCustomerMapping.md) |  | [optional] 
**DefaultAggregation** | [**MeterDefaultAggregation**](MeterDefaultAggregation.md) |  | 
**DisplayName** | **string** |  | 
**EventName** | **string** |  | 
**Id** | **string** |  | 
**StripeId** | Pointer to **string** |  | [optional] 
**ValueSettings** | Pointer to [**MeterValueSettings**](MeterValueSettings.md) |  | [optional] 

## Methods

### NewMeterWithStripeID

`func NewMeterWithStripeID(defaultAggregation MeterDefaultAggregation, displayName string, eventName string, id string, ) *MeterWithStripeID`

NewMeterWithStripeID instantiates a new MeterWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMeterWithStripeIDWithDefaults

`func NewMeterWithStripeIDWithDefaults() *MeterWithStripeID`

NewMeterWithStripeIDWithDefaults instantiates a new MeterWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCustomerMapping

`func (o *MeterWithStripeID) GetCustomerMapping() MeterCustomerMapping`

GetCustomerMapping returns the CustomerMapping field if non-nil, zero value otherwise.

### GetCustomerMappingOk

`func (o *MeterWithStripeID) GetCustomerMappingOk() (*MeterCustomerMapping, bool)`

GetCustomerMappingOk returns a tuple with the CustomerMapping field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerMapping

`func (o *MeterWithStripeID) SetCustomerMapping(v MeterCustomerMapping)`

SetCustomerMapping sets CustomerMapping field to given value.

### HasCustomerMapping

`func (o *MeterWithStripeID) HasCustomerMapping() bool`

HasCustomerMapping returns a boolean if a field has been set.

### GetDefaultAggregation

`func (o *MeterWithStripeID) GetDefaultAggregation() MeterDefaultAggregation`

GetDefaultAggregation returns the DefaultAggregation field if non-nil, zero value otherwise.

### GetDefaultAggregationOk

`func (o *MeterWithStripeID) GetDefaultAggregationOk() (*MeterDefaultAggregation, bool)`

GetDefaultAggregationOk returns a tuple with the DefaultAggregation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefaultAggregation

`func (o *MeterWithStripeID) SetDefaultAggregation(v MeterDefaultAggregation)`

SetDefaultAggregation sets DefaultAggregation field to given value.


### GetDisplayName

`func (o *MeterWithStripeID) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *MeterWithStripeID) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *MeterWithStripeID) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetEventName

`func (o *MeterWithStripeID) GetEventName() string`

GetEventName returns the EventName field if non-nil, zero value otherwise.

### GetEventNameOk

`func (o *MeterWithStripeID) GetEventNameOk() (*string, bool)`

GetEventNameOk returns a tuple with the EventName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventName

`func (o *MeterWithStripeID) SetEventName(v string)`

SetEventName sets EventName field to given value.


### GetId

`func (o *MeterWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *MeterWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *MeterWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *MeterWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *MeterWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *MeterWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *MeterWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetValueSettings

`func (o *MeterWithStripeID) GetValueSettings() MeterValueSettings`

GetValueSettings returns the ValueSettings field if non-nil, zero value otherwise.

### GetValueSettingsOk

`func (o *MeterWithStripeID) GetValueSettingsOk() (*MeterValueSettings, bool)`

GetValueSettingsOk returns a tuple with the ValueSettings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValueSettings

`func (o *MeterWithStripeID) SetValueSettings(v MeterValueSettings)`

SetValueSettings sets ValueSettings field to given value.

### HasValueSettings

`func (o *MeterWithStripeID) HasValueSettings() bool`

HasValueSettings returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



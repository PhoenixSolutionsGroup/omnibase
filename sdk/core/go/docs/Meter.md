# Meter

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **string** | Meter identifier (config ID) | 
**StripeId** | Pointer to **string** | Original Stripe ID for migration support (optional, used to link existing Stripe meters) | [optional] 
**DisplayName** | **string** | Human-readable meter name | 
**EventName** | **string** | Event name to track for this meter | 
**DefaultAggregation** | [**MeterDefaultAggregation**](MeterDefaultAggregation.md) |  | 
**CustomerMapping** | Pointer to [**MeterCustomerMapping**](MeterCustomerMapping.md) |  | [optional] 
**ValueSettings** | Pointer to [**MeterValueSettings**](MeterValueSettings.md) |  | [optional] 

## Methods

### NewMeter

`func NewMeter(id string, displayName string, eventName string, defaultAggregation MeterDefaultAggregation, ) *Meter`

NewMeter instantiates a new Meter object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMeterWithDefaults

`func NewMeterWithDefaults() *Meter`

NewMeterWithDefaults instantiates a new Meter object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Meter) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Meter) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Meter) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *Meter) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *Meter) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *Meter) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *Meter) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetDisplayName

`func (o *Meter) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *Meter) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *Meter) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetEventName

`func (o *Meter) GetEventName() string`

GetEventName returns the EventName field if non-nil, zero value otherwise.

### GetEventNameOk

`func (o *Meter) GetEventNameOk() (*string, bool)`

GetEventNameOk returns a tuple with the EventName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventName

`func (o *Meter) SetEventName(v string)`

SetEventName sets EventName field to given value.


### GetDefaultAggregation

`func (o *Meter) GetDefaultAggregation() MeterDefaultAggregation`

GetDefaultAggregation returns the DefaultAggregation field if non-nil, zero value otherwise.

### GetDefaultAggregationOk

`func (o *Meter) GetDefaultAggregationOk() (*MeterDefaultAggregation, bool)`

GetDefaultAggregationOk returns a tuple with the DefaultAggregation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefaultAggregation

`func (o *Meter) SetDefaultAggregation(v MeterDefaultAggregation)`

SetDefaultAggregation sets DefaultAggregation field to given value.


### GetCustomerMapping

`func (o *Meter) GetCustomerMapping() MeterCustomerMapping`

GetCustomerMapping returns the CustomerMapping field if non-nil, zero value otherwise.

### GetCustomerMappingOk

`func (o *Meter) GetCustomerMappingOk() (*MeterCustomerMapping, bool)`

GetCustomerMappingOk returns a tuple with the CustomerMapping field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerMapping

`func (o *Meter) SetCustomerMapping(v MeterCustomerMapping)`

SetCustomerMapping sets CustomerMapping field to given value.

### HasCustomerMapping

`func (o *Meter) HasCustomerMapping() bool`

HasCustomerMapping returns a boolean if a field has been set.

### GetValueSettings

`func (o *Meter) GetValueSettings() MeterValueSettings`

GetValueSettings returns the ValueSettings field if non-nil, zero value otherwise.

### GetValueSettingsOk

`func (o *Meter) GetValueSettingsOk() (*MeterValueSettings, bool)`

GetValueSettingsOk returns a tuple with the ValueSettings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValueSettings

`func (o *Meter) SetValueSettings(v MeterValueSettings)`

SetValueSettings sets ValueSettings field to given value.

### HasValueSettings

`func (o *Meter) HasValueSettings() bool`

HasValueSettings returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# ModelsMeter

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CustomerMapping** | Pointer to [**ModelsMeterCustomerMapping**](ModelsMeterCustomerMapping.md) |  | [optional] 
**DefaultAggregation** | [**ModelsMeterDefaultAggregation**](ModelsMeterDefaultAggregation.md) |  | 
**DisplayName** | **string** |  | 
**EventName** | **string** |  | 
**Id** | **string** |  | 
**ValueSettings** | Pointer to [**ModelsMeterValueSettings**](ModelsMeterValueSettings.md) |  | [optional] 

## Methods

### NewModelsMeter

`func NewModelsMeter(defaultAggregation ModelsMeterDefaultAggregation, displayName string, eventName string, id string, ) *ModelsMeter`

NewModelsMeter instantiates a new ModelsMeter object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsMeterWithDefaults

`func NewModelsMeterWithDefaults() *ModelsMeter`

NewModelsMeterWithDefaults instantiates a new ModelsMeter object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCustomerMapping

`func (o *ModelsMeter) GetCustomerMapping() ModelsMeterCustomerMapping`

GetCustomerMapping returns the CustomerMapping field if non-nil, zero value otherwise.

### GetCustomerMappingOk

`func (o *ModelsMeter) GetCustomerMappingOk() (*ModelsMeterCustomerMapping, bool)`

GetCustomerMappingOk returns a tuple with the CustomerMapping field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerMapping

`func (o *ModelsMeter) SetCustomerMapping(v ModelsMeterCustomerMapping)`

SetCustomerMapping sets CustomerMapping field to given value.

### HasCustomerMapping

`func (o *ModelsMeter) HasCustomerMapping() bool`

HasCustomerMapping returns a boolean if a field has been set.

### GetDefaultAggregation

`func (o *ModelsMeter) GetDefaultAggregation() ModelsMeterDefaultAggregation`

GetDefaultAggregation returns the DefaultAggregation field if non-nil, zero value otherwise.

### GetDefaultAggregationOk

`func (o *ModelsMeter) GetDefaultAggregationOk() (*ModelsMeterDefaultAggregation, bool)`

GetDefaultAggregationOk returns a tuple with the DefaultAggregation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefaultAggregation

`func (o *ModelsMeter) SetDefaultAggregation(v ModelsMeterDefaultAggregation)`

SetDefaultAggregation sets DefaultAggregation field to given value.


### GetDisplayName

`func (o *ModelsMeter) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *ModelsMeter) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *ModelsMeter) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetEventName

`func (o *ModelsMeter) GetEventName() string`

GetEventName returns the EventName field if non-nil, zero value otherwise.

### GetEventNameOk

`func (o *ModelsMeter) GetEventNameOk() (*string, bool)`

GetEventNameOk returns a tuple with the EventName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventName

`func (o *ModelsMeter) SetEventName(v string)`

SetEventName sets EventName field to given value.


### GetId

`func (o *ModelsMeter) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsMeter) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsMeter) SetId(v string)`

SetId sets Id field to given value.


### GetValueSettings

`func (o *ModelsMeter) GetValueSettings() ModelsMeterValueSettings`

GetValueSettings returns the ValueSettings field if non-nil, zero value otherwise.

### GetValueSettingsOk

`func (o *ModelsMeter) GetValueSettingsOk() (*ModelsMeterValueSettings, bool)`

GetValueSettingsOk returns a tuple with the ValueSettings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValueSettings

`func (o *ModelsMeter) SetValueSettings(v ModelsMeterValueSettings)`

SetValueSettings sets ValueSettings field to given value.

### HasValueSettings

`func (o *ModelsMeter) HasValueSettings() bool`

HasValueSettings returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



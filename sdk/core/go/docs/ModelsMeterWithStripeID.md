# ModelsMeterWithStripeID

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CustomerMapping** | Pointer to [**ModelsMeterCustomerMapping**](ModelsMeterCustomerMapping.md) |  | [optional] 
**DefaultAggregation** | [**ModelsMeterDefaultAggregation**](ModelsMeterDefaultAggregation.md) |  | 
**DisplayName** | **string** |  | 
**EventName** | **string** |  | 
**Id** | **string** |  | 
**StripeId** | Pointer to **string** | actual Stripe meter ID | [optional] 
**ValueSettings** | Pointer to [**ModelsMeterValueSettings**](ModelsMeterValueSettings.md) |  | [optional] 

## Methods

### NewModelsMeterWithStripeID

`func NewModelsMeterWithStripeID(defaultAggregation ModelsMeterDefaultAggregation, displayName string, eventName string, id string, ) *ModelsMeterWithStripeID`

NewModelsMeterWithStripeID instantiates a new ModelsMeterWithStripeID object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsMeterWithStripeIDWithDefaults

`func NewModelsMeterWithStripeIDWithDefaults() *ModelsMeterWithStripeID`

NewModelsMeterWithStripeIDWithDefaults instantiates a new ModelsMeterWithStripeID object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCustomerMapping

`func (o *ModelsMeterWithStripeID) GetCustomerMapping() ModelsMeterCustomerMapping`

GetCustomerMapping returns the CustomerMapping field if non-nil, zero value otherwise.

### GetCustomerMappingOk

`func (o *ModelsMeterWithStripeID) GetCustomerMappingOk() (*ModelsMeterCustomerMapping, bool)`

GetCustomerMappingOk returns a tuple with the CustomerMapping field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCustomerMapping

`func (o *ModelsMeterWithStripeID) SetCustomerMapping(v ModelsMeterCustomerMapping)`

SetCustomerMapping sets CustomerMapping field to given value.

### HasCustomerMapping

`func (o *ModelsMeterWithStripeID) HasCustomerMapping() bool`

HasCustomerMapping returns a boolean if a field has been set.

### GetDefaultAggregation

`func (o *ModelsMeterWithStripeID) GetDefaultAggregation() ModelsMeterDefaultAggregation`

GetDefaultAggregation returns the DefaultAggregation field if non-nil, zero value otherwise.

### GetDefaultAggregationOk

`func (o *ModelsMeterWithStripeID) GetDefaultAggregationOk() (*ModelsMeterDefaultAggregation, bool)`

GetDefaultAggregationOk returns a tuple with the DefaultAggregation field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDefaultAggregation

`func (o *ModelsMeterWithStripeID) SetDefaultAggregation(v ModelsMeterDefaultAggregation)`

SetDefaultAggregation sets DefaultAggregation field to given value.


### GetDisplayName

`func (o *ModelsMeterWithStripeID) GetDisplayName() string`

GetDisplayName returns the DisplayName field if non-nil, zero value otherwise.

### GetDisplayNameOk

`func (o *ModelsMeterWithStripeID) GetDisplayNameOk() (*string, bool)`

GetDisplayNameOk returns a tuple with the DisplayName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDisplayName

`func (o *ModelsMeterWithStripeID) SetDisplayName(v string)`

SetDisplayName sets DisplayName field to given value.


### GetEventName

`func (o *ModelsMeterWithStripeID) GetEventName() string`

GetEventName returns the EventName field if non-nil, zero value otherwise.

### GetEventNameOk

`func (o *ModelsMeterWithStripeID) GetEventNameOk() (*string, bool)`

GetEventNameOk returns a tuple with the EventName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEventName

`func (o *ModelsMeterWithStripeID) SetEventName(v string)`

SetEventName sets EventName field to given value.


### GetId

`func (o *ModelsMeterWithStripeID) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *ModelsMeterWithStripeID) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *ModelsMeterWithStripeID) SetId(v string)`

SetId sets Id field to given value.


### GetStripeId

`func (o *ModelsMeterWithStripeID) GetStripeId() string`

GetStripeId returns the StripeId field if non-nil, zero value otherwise.

### GetStripeIdOk

`func (o *ModelsMeterWithStripeID) GetStripeIdOk() (*string, bool)`

GetStripeIdOk returns a tuple with the StripeId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeId

`func (o *ModelsMeterWithStripeID) SetStripeId(v string)`

SetStripeId sets StripeId field to given value.

### HasStripeId

`func (o *ModelsMeterWithStripeID) HasStripeId() bool`

HasStripeId returns a boolean if a field has been set.

### GetValueSettings

`func (o *ModelsMeterWithStripeID) GetValueSettings() ModelsMeterValueSettings`

GetValueSettings returns the ValueSettings field if non-nil, zero value otherwise.

### GetValueSettingsOk

`func (o *ModelsMeterWithStripeID) GetValueSettingsOk() (*ModelsMeterValueSettings, bool)`

GetValueSettingsOk returns a tuple with the ValueSettings field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValueSettings

`func (o *ModelsMeterWithStripeID) SetValueSettings(v ModelsMeterValueSettings)`

SetValueSettings sets ValueSettings field to given value.

### HasValueSettings

`func (o *ModelsMeterWithStripeID) HasValueSettings() bool`

HasValueSettings returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



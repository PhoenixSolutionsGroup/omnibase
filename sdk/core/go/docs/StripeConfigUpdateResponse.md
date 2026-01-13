# StripeConfigUpdateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Status message describing the update result | 
**Changes** | Pointer to [**StripeConfigChanges**](StripeConfigChanges.md) |  | [optional] 
**Config** | Pointer to [**StripeConfiguration**](StripeConfiguration.md) |  | [optional] 
**Errors** | Pointer to **[]string** | List of validation errors (only present if validation failed) | [optional] 

## Methods

### NewStripeConfigUpdateResponse

`func NewStripeConfigUpdateResponse(message string, ) *StripeConfigUpdateResponse`

NewStripeConfigUpdateResponse instantiates a new StripeConfigUpdateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigUpdateResponseWithDefaults

`func NewStripeConfigUpdateResponseWithDefaults() *StripeConfigUpdateResponse`

NewStripeConfigUpdateResponseWithDefaults instantiates a new StripeConfigUpdateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *StripeConfigUpdateResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *StripeConfigUpdateResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *StripeConfigUpdateResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetChanges

`func (o *StripeConfigUpdateResponse) GetChanges() StripeConfigChanges`

GetChanges returns the Changes field if non-nil, zero value otherwise.

### GetChangesOk

`func (o *StripeConfigUpdateResponse) GetChangesOk() (*StripeConfigChanges, bool)`

GetChangesOk returns a tuple with the Changes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChanges

`func (o *StripeConfigUpdateResponse) SetChanges(v StripeConfigChanges)`

SetChanges sets Changes field to given value.

### HasChanges

`func (o *StripeConfigUpdateResponse) HasChanges() bool`

HasChanges returns a boolean if a field has been set.

### GetConfig

`func (o *StripeConfigUpdateResponse) GetConfig() StripeConfiguration`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *StripeConfigUpdateResponse) GetConfigOk() (*StripeConfiguration, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *StripeConfigUpdateResponse) SetConfig(v StripeConfiguration)`

SetConfig sets Config field to given value.

### HasConfig

`func (o *StripeConfigUpdateResponse) HasConfig() bool`

HasConfig returns a boolean if a field has been set.

### GetErrors

`func (o *StripeConfigUpdateResponse) GetErrors() []string`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *StripeConfigUpdateResponse) GetErrorsOk() (*[]string, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *StripeConfigUpdateResponse) SetErrors(v []string)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *StripeConfigUpdateResponse) HasErrors() bool`

HasErrors returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



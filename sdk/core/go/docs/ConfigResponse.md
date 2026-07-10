# ConfigResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Changes** | Pointer to [**ConfigChanges**](ConfigChanges.md) |  | [optional] 
**Config** | Pointer to [**StripeConfiguration**](StripeConfiguration.md) |  | [optional] 
**Errors** | Pointer to **[]string** |  | [optional] 
**Message** | **string** |  | 

## Methods

### NewConfigResponse

`func NewConfigResponse(message string, ) *ConfigResponse`

NewConfigResponse instantiates a new ConfigResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigResponseWithDefaults

`func NewConfigResponseWithDefaults() *ConfigResponse`

NewConfigResponseWithDefaults instantiates a new ConfigResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetChanges

`func (o *ConfigResponse) GetChanges() ConfigChanges`

GetChanges returns the Changes field if non-nil, zero value otherwise.

### GetChangesOk

`func (o *ConfigResponse) GetChangesOk() (*ConfigChanges, bool)`

GetChangesOk returns a tuple with the Changes field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetChanges

`func (o *ConfigResponse) SetChanges(v ConfigChanges)`

SetChanges sets Changes field to given value.

### HasChanges

`func (o *ConfigResponse) HasChanges() bool`

HasChanges returns a boolean if a field has been set.

### GetConfig

`func (o *ConfigResponse) GetConfig() StripeConfiguration`

GetConfig returns the Config field if non-nil, zero value otherwise.

### GetConfigOk

`func (o *ConfigResponse) GetConfigOk() (*StripeConfiguration, bool)`

GetConfigOk returns a tuple with the Config field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfig

`func (o *ConfigResponse) SetConfig(v StripeConfiguration)`

SetConfig sets Config field to given value.

### HasConfig

`func (o *ConfigResponse) HasConfig() bool`

HasConfig returns a boolean if a field has been set.

### GetErrors

`func (o *ConfigResponse) GetErrors() []string`

GetErrors returns the Errors field if non-nil, zero value otherwise.

### GetErrorsOk

`func (o *ConfigResponse) GetErrorsOk() (*[]string, bool)`

GetErrorsOk returns a tuple with the Errors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetErrors

`func (o *ConfigResponse) SetErrors(v []string)`

SetErrors sets Errors field to given value.

### HasErrors

`func (o *ConfigResponse) HasErrors() bool`

HasErrors returns a boolean if a field has been set.

### SetErrorsNil

`func (o *ConfigResponse) SetErrorsNil(b bool)`

 SetErrorsNil sets the value for Errors to be an explicit nil

### UnsetErrors
`func (o *ConfigResponse) UnsetErrors()`

UnsetErrors ensures that no value is present for Errors, not even an explicit nil
### GetMessage

`func (o *ConfigResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *ConfigResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *ConfigResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# HandlersUnauthorizedResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Error** | Pointer to **string** | Error message | [optional] 
**Status** | Pointer to **int32** | HTTP status code | [optional] 

## Methods

### NewHandlersUnauthorizedResponse

`func NewHandlersUnauthorizedResponse() *HandlersUnauthorizedResponse`

NewHandlersUnauthorizedResponse instantiates a new HandlersUnauthorizedResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewHandlersUnauthorizedResponseWithDefaults

`func NewHandlersUnauthorizedResponseWithDefaults() *HandlersUnauthorizedResponse`

NewHandlersUnauthorizedResponseWithDefaults instantiates a new HandlersUnauthorizedResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetError

`func (o *HandlersUnauthorizedResponse) GetError() string`

GetError returns the Error field if non-nil, zero value otherwise.

### GetErrorOk

`func (o *HandlersUnauthorizedResponse) GetErrorOk() (*string, bool)`

GetErrorOk returns a tuple with the Error field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetError

`func (o *HandlersUnauthorizedResponse) SetError(v string)`

SetError sets Error field to given value.

### HasError

`func (o *HandlersUnauthorizedResponse) HasError() bool`

HasError returns a boolean if a field has been set.

### GetStatus

`func (o *HandlersUnauthorizedResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *HandlersUnauthorizedResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *HandlersUnauthorizedResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *HandlersUnauthorizedResponse) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



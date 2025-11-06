# HandlersInternalServerErrorResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Error** | Pointer to **string** | Error message | [optional] 
**Status** | Pointer to **int32** | HTTP status code | [optional] 

## Methods

### NewHandlersInternalServerErrorResponse

`func NewHandlersInternalServerErrorResponse() *HandlersInternalServerErrorResponse`

NewHandlersInternalServerErrorResponse instantiates a new HandlersInternalServerErrorResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewHandlersInternalServerErrorResponseWithDefaults

`func NewHandlersInternalServerErrorResponseWithDefaults() *HandlersInternalServerErrorResponse`

NewHandlersInternalServerErrorResponseWithDefaults instantiates a new HandlersInternalServerErrorResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetError

`func (o *HandlersInternalServerErrorResponse) GetError() string`

GetError returns the Error field if non-nil, zero value otherwise.

### GetErrorOk

`func (o *HandlersInternalServerErrorResponse) GetErrorOk() (*string, bool)`

GetErrorOk returns a tuple with the Error field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetError

`func (o *HandlersInternalServerErrorResponse) SetError(v string)`

SetError sets Error field to given value.

### HasError

`func (o *HandlersInternalServerErrorResponse) HasError() bool`

HasError returns a boolean if a field has been set.

### GetStatus

`func (o *HandlersInternalServerErrorResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *HandlersInternalServerErrorResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *HandlersInternalServerErrorResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *HandlersInternalServerErrorResponse) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



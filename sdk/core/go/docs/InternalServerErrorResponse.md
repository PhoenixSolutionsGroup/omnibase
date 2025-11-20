# InternalServerErrorResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Error** | **string** | Error message | 

## Methods

### NewInternalServerErrorResponse

`func NewInternalServerErrorResponse(status int32, error_ string, ) *InternalServerErrorResponse`

NewInternalServerErrorResponse instantiates a new InternalServerErrorResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInternalServerErrorResponseWithDefaults

`func NewInternalServerErrorResponseWithDefaults() *InternalServerErrorResponse`

NewInternalServerErrorResponseWithDefaults instantiates a new InternalServerErrorResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *InternalServerErrorResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *InternalServerErrorResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *InternalServerErrorResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetError

`func (o *InternalServerErrorResponse) GetError() string`

GetError returns the Error field if non-nil, zero value otherwise.

### GetErrorOk

`func (o *InternalServerErrorResponse) GetErrorOk() (*string, bool)`

GetErrorOk returns a tuple with the Error field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetError

`func (o *InternalServerErrorResponse) SetError(v string)`

SetError sets Error field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



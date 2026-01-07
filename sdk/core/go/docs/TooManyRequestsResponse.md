# TooManyRequestsResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Error** | **string** | Error message | 

## Methods

### NewTooManyRequestsResponse

`func NewTooManyRequestsResponse(status int32, error_ string, ) *TooManyRequestsResponse`

NewTooManyRequestsResponse instantiates a new TooManyRequestsResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTooManyRequestsResponseWithDefaults

`func NewTooManyRequestsResponseWithDefaults() *TooManyRequestsResponse`

NewTooManyRequestsResponseWithDefaults instantiates a new TooManyRequestsResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *TooManyRequestsResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *TooManyRequestsResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *TooManyRequestsResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetError

`func (o *TooManyRequestsResponse) GetError() string`

GetError returns the Error field if non-nil, zero value otherwise.

### GetErrorOk

`func (o *TooManyRequestsResponse) GetErrorOk() (*string, bool)`

GetErrorOk returns a tuple with the Error field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetError

`func (o *TooManyRequestsResponse) SetError(v string)`

SetError sets Error field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



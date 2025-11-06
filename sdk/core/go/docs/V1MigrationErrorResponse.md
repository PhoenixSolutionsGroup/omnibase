# V1MigrationErrorResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Error message | 
**Status** | **int32** | HTTP status code | 

## Methods

### NewV1MigrationErrorResponse

`func NewV1MigrationErrorResponse(message string, status int32, ) *V1MigrationErrorResponse`

NewV1MigrationErrorResponse instantiates a new V1MigrationErrorResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1MigrationErrorResponseWithDefaults

`func NewV1MigrationErrorResponseWithDefaults() *V1MigrationErrorResponse`

NewV1MigrationErrorResponseWithDefaults instantiates a new V1MigrationErrorResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *V1MigrationErrorResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *V1MigrationErrorResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *V1MigrationErrorResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetStatus

`func (o *V1MigrationErrorResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *V1MigrationErrorResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *V1MigrationErrorResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



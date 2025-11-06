# V1MigrationSuccessResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**Status** | **int32** | HTTP status code | 

## Methods

### NewV1MigrationSuccessResponse

`func NewV1MigrationSuccessResponse(message string, status int32, ) *V1MigrationSuccessResponse`

NewV1MigrationSuccessResponse instantiates a new V1MigrationSuccessResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1MigrationSuccessResponseWithDefaults

`func NewV1MigrationSuccessResponseWithDefaults() *V1MigrationSuccessResponse`

NewV1MigrationSuccessResponseWithDefaults instantiates a new V1MigrationSuccessResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *V1MigrationSuccessResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *V1MigrationSuccessResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *V1MigrationSuccessResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetStatus

`func (o *V1MigrationSuccessResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *V1MigrationSuccessResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *V1MigrationSuccessResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



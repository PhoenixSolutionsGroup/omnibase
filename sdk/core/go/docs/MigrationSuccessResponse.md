# MigrationSuccessResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Message** | **string** | Success message | 

## Methods

### NewMigrationSuccessResponse

`func NewMigrationSuccessResponse(status int32, message string, ) *MigrationSuccessResponse`

NewMigrationSuccessResponse instantiates a new MigrationSuccessResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMigrationSuccessResponseWithDefaults

`func NewMigrationSuccessResponseWithDefaults() *MigrationSuccessResponse`

NewMigrationSuccessResponseWithDefaults instantiates a new MigrationSuccessResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *MigrationSuccessResponse) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *MigrationSuccessResponse) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *MigrationSuccessResponse) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetMessage

`func (o *MigrationSuccessResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *MigrationSuccessResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *MigrationSuccessResponse) SetMessage(v string)`

SetMessage sets Message field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



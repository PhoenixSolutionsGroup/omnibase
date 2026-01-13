# UploadResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**UploadUrl** | **string** | Presigned URL for uploading the file (valid for 15 minutes) | 
**Path** | **string** | Confirmed storage path | 

## Methods

### NewUploadResponse

`func NewUploadResponse(uploadUrl string, path string, ) *UploadResponse`

NewUploadResponse instantiates a new UploadResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUploadResponseWithDefaults

`func NewUploadResponseWithDefaults() *UploadResponse`

NewUploadResponseWithDefaults instantiates a new UploadResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetUploadUrl

`func (o *UploadResponse) GetUploadUrl() string`

GetUploadUrl returns the UploadUrl field if non-nil, zero value otherwise.

### GetUploadUrlOk

`func (o *UploadResponse) GetUploadUrlOk() (*string, bool)`

GetUploadUrlOk returns a tuple with the UploadUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUploadUrl

`func (o *UploadResponse) SetUploadUrl(v string)`

SetUploadUrl sets UploadUrl field to given value.


### GetPath

`func (o *UploadResponse) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *UploadResponse) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *UploadResponse) SetPath(v string)`

SetPath sets Path field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



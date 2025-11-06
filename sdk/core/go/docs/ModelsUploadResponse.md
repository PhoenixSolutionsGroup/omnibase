# ModelsUploadResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | Pointer to **string** | Confirmed storage path | [optional] 
**UploadUrl** | Pointer to **string** | Presigned URL for uploading the file (valid for 15 minutes) | [optional] 

## Methods

### NewModelsUploadResponse

`func NewModelsUploadResponse() *ModelsUploadResponse`

NewModelsUploadResponse instantiates a new ModelsUploadResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsUploadResponseWithDefaults

`func NewModelsUploadResponseWithDefaults() *ModelsUploadResponse`

NewModelsUploadResponseWithDefaults instantiates a new ModelsUploadResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPath

`func (o *ModelsUploadResponse) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *ModelsUploadResponse) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *ModelsUploadResponse) SetPath(v string)`

SetPath sets Path field to given value.

### HasPath

`func (o *ModelsUploadResponse) HasPath() bool`

HasPath returns a boolean if a field has been set.

### GetUploadUrl

`func (o *ModelsUploadResponse) GetUploadUrl() string`

GetUploadUrl returns the UploadUrl field if non-nil, zero value otherwise.

### GetUploadUrlOk

`func (o *ModelsUploadResponse) GetUploadUrlOk() (*string, bool)`

GetUploadUrlOk returns a tuple with the UploadUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUploadUrl

`func (o *ModelsUploadResponse) SetUploadUrl(v string)`

SetUploadUrl sets UploadUrl field to given value.

### HasUploadUrl

`func (o *ModelsUploadResponse) HasUploadUrl() bool`

HasUploadUrl returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



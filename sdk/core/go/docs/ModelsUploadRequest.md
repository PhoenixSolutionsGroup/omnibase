# ModelsUploadRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Metadata** | Pointer to **map[string]interface{}** | Optional metadata to attach to the file | [optional] 
**Path** | **string** | Path where file will be stored (e.g., \&quot;public/images/avatar.png\&quot;) | 

## Methods

### NewModelsUploadRequest

`func NewModelsUploadRequest(path string, ) *ModelsUploadRequest`

NewModelsUploadRequest instantiates a new ModelsUploadRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewModelsUploadRequestWithDefaults

`func NewModelsUploadRequestWithDefaults() *ModelsUploadRequest`

NewModelsUploadRequestWithDefaults instantiates a new ModelsUploadRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMetadata

`func (o *ModelsUploadRequest) GetMetadata() map[string]interface{}`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *ModelsUploadRequest) GetMetadataOk() (*map[string]interface{}, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *ModelsUploadRequest) SetMetadata(v map[string]interface{})`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *ModelsUploadRequest) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### GetPath

`func (o *ModelsUploadRequest) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *ModelsUploadRequest) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *ModelsUploadRequest) SetPath(v string)`

SetPath sets Path field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



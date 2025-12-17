# DownloadRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Path** | **string** | Path of the file to download. Must start with alphanumeric character, can contain forward slashes, underscores, dots, spaces, and hyphens. | 

## Methods

### NewDownloadRequest

`func NewDownloadRequest(path string, ) *DownloadRequest`

NewDownloadRequest instantiates a new DownloadRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDownloadRequestWithDefaults

`func NewDownloadRequestWithDefaults() *DownloadRequest`

NewDownloadRequestWithDefaults instantiates a new DownloadRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPath

`func (o *DownloadRequest) GetPath() string`

GetPath returns the Path field if non-nil, zero value otherwise.

### GetPathOk

`func (o *DownloadRequest) GetPathOk() (*string, bool)`

GetPathOk returns a tuple with the Path field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPath

`func (o *DownloadRequest) SetPath(v string)`

SetPath sets Path field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



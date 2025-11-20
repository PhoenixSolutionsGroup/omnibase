# DownloadResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**DownloadUrl** | **string** | Presigned URL for downloading the file (valid for 15 minutes) | 

## Methods

### NewDownloadResponse

`func NewDownloadResponse(downloadUrl string, ) *DownloadResponse`

NewDownloadResponse instantiates a new DownloadResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewDownloadResponseWithDefaults

`func NewDownloadResponseWithDefaults() *DownloadResponse`

NewDownloadResponseWithDefaults instantiates a new DownloadResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetDownloadUrl

`func (o *DownloadResponse) GetDownloadUrl() string`

GetDownloadUrl returns the DownloadUrl field if non-nil, zero value otherwise.

### GetDownloadUrlOk

`func (o *DownloadResponse) GetDownloadUrlOk() (*string, bool)`

GetDownloadUrlOk returns a tuple with the DownloadUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDownloadUrl

`func (o *DownloadResponse) SetDownloadUrl(v string)`

SetDownloadUrl sets DownloadUrl field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



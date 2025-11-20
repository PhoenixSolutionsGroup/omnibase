# ArchiveAllResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**ArchivedItems** | **[]string** | List of successfully archived items | 
**ArchiveErrors** | **[]string** | List of items that failed to archive | 
**TotalArchived** | **int32** | Total number of archived items | 
**TotalErrors** | **int32** | Total number of errors | 
**Warning** | Pointer to **string** | Warning message if there were errors | [optional] 

## Methods

### NewArchiveAllResponse

`func NewArchiveAllResponse(message string, archivedItems []string, archiveErrors []string, totalArchived int32, totalErrors int32, ) *ArchiveAllResponse`

NewArchiveAllResponse instantiates a new ArchiveAllResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewArchiveAllResponseWithDefaults

`func NewArchiveAllResponseWithDefaults() *ArchiveAllResponse`

NewArchiveAllResponseWithDefaults instantiates a new ArchiveAllResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *ArchiveAllResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *ArchiveAllResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *ArchiveAllResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetArchivedItems

`func (o *ArchiveAllResponse) GetArchivedItems() []string`

GetArchivedItems returns the ArchivedItems field if non-nil, zero value otherwise.

### GetArchivedItemsOk

`func (o *ArchiveAllResponse) GetArchivedItemsOk() (*[]string, bool)`

GetArchivedItemsOk returns a tuple with the ArchivedItems field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchivedItems

`func (o *ArchiveAllResponse) SetArchivedItems(v []string)`

SetArchivedItems sets ArchivedItems field to given value.


### GetArchiveErrors

`func (o *ArchiveAllResponse) GetArchiveErrors() []string`

GetArchiveErrors returns the ArchiveErrors field if non-nil, zero value otherwise.

### GetArchiveErrorsOk

`func (o *ArchiveAllResponse) GetArchiveErrorsOk() (*[]string, bool)`

GetArchiveErrorsOk returns a tuple with the ArchiveErrors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetArchiveErrors

`func (o *ArchiveAllResponse) SetArchiveErrors(v []string)`

SetArchiveErrors sets ArchiveErrors field to given value.


### GetTotalArchived

`func (o *ArchiveAllResponse) GetTotalArchived() int32`

GetTotalArchived returns the TotalArchived field if non-nil, zero value otherwise.

### GetTotalArchivedOk

`func (o *ArchiveAllResponse) GetTotalArchivedOk() (*int32, bool)`

GetTotalArchivedOk returns a tuple with the TotalArchived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalArchived

`func (o *ArchiveAllResponse) SetTotalArchived(v int32)`

SetTotalArchived sets TotalArchived field to given value.


### GetTotalErrors

`func (o *ArchiveAllResponse) GetTotalErrors() int32`

GetTotalErrors returns the TotalErrors field if non-nil, zero value otherwise.

### GetTotalErrorsOk

`func (o *ArchiveAllResponse) GetTotalErrorsOk() (*int32, bool)`

GetTotalErrorsOk returns a tuple with the TotalErrors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalErrors

`func (o *ArchiveAllResponse) SetTotalErrors(v int32)`

SetTotalErrors sets TotalErrors field to given value.


### GetWarning

`func (o *ArchiveAllResponse) GetWarning() string`

GetWarning returns the Warning field if non-nil, zero value otherwise.

### GetWarningOk

`func (o *ArchiveAllResponse) GetWarningOk() (*string, bool)`

GetWarningOk returns a tuple with the Warning field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWarning

`func (o *ArchiveAllResponse) SetWarning(v string)`

SetWarning sets Warning field to given value.

### HasWarning

`func (o *ArchiveAllResponse) HasWarning() bool`

HasWarning returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



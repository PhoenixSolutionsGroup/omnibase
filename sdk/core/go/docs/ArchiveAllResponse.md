# ArchiveAllResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ArchiveErrors** | **[]string** |  | 
**ArchivedItems** | **[]string** |  | 
**Message** | **string** |  | 
**TotalArchived** | **int64** |  | 
**TotalErrors** | **int64** |  | 
**Warning** | Pointer to **string** |  | [optional] 

## Methods

### NewArchiveAllResponse

`func NewArchiveAllResponse(archiveErrors []string, archivedItems []string, message string, totalArchived int64, totalErrors int64, ) *ArchiveAllResponse`

NewArchiveAllResponse instantiates a new ArchiveAllResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewArchiveAllResponseWithDefaults

`func NewArchiveAllResponseWithDefaults() *ArchiveAllResponse`

NewArchiveAllResponseWithDefaults instantiates a new ArchiveAllResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

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


### SetArchiveErrorsNil

`func (o *ArchiveAllResponse) SetArchiveErrorsNil(b bool)`

 SetArchiveErrorsNil sets the value for ArchiveErrors to be an explicit nil

### UnsetArchiveErrors
`func (o *ArchiveAllResponse) UnsetArchiveErrors()`

UnsetArchiveErrors ensures that no value is present for ArchiveErrors, not even an explicit nil
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


### SetArchivedItemsNil

`func (o *ArchiveAllResponse) SetArchivedItemsNil(b bool)`

 SetArchivedItemsNil sets the value for ArchivedItems to be an explicit nil

### UnsetArchivedItems
`func (o *ArchiveAllResponse) UnsetArchivedItems()`

UnsetArchivedItems ensures that no value is present for ArchivedItems, not even an explicit nil
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


### GetTotalArchived

`func (o *ArchiveAllResponse) GetTotalArchived() int64`

GetTotalArchived returns the TotalArchived field if non-nil, zero value otherwise.

### GetTotalArchivedOk

`func (o *ArchiveAllResponse) GetTotalArchivedOk() (*int64, bool)`

GetTotalArchivedOk returns a tuple with the TotalArchived field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalArchived

`func (o *ArchiveAllResponse) SetTotalArchived(v int64)`

SetTotalArchived sets TotalArchived field to given value.


### GetTotalErrors

`func (o *ArchiveAllResponse) GetTotalErrors() int64`

GetTotalErrors returns the TotalErrors field if non-nil, zero value otherwise.

### GetTotalErrorsOk

`func (o *ArchiveAllResponse) GetTotalErrorsOk() (*int64, bool)`

GetTotalErrorsOk returns a tuple with the TotalErrors field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalErrors

`func (o *ArchiveAllResponse) SetTotalErrors(v int64)`

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



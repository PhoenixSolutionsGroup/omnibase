# ConfigHistoryPagination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HasNext** | **bool** |  | 
**HasPrev** | **bool** |  | 
**Page** | **int64** |  | 
**PerPage** | **int64** |  | 
**Total** | **int64** |  | 
**TotalPages** | **int64** |  | 

## Methods

### NewConfigHistoryPagination

`func NewConfigHistoryPagination(hasNext bool, hasPrev bool, page int64, perPage int64, total int64, totalPages int64, ) *ConfigHistoryPagination`

NewConfigHistoryPagination instantiates a new ConfigHistoryPagination object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigHistoryPaginationWithDefaults

`func NewConfigHistoryPaginationWithDefaults() *ConfigHistoryPagination`

NewConfigHistoryPaginationWithDefaults instantiates a new ConfigHistoryPagination object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetHasNext

`func (o *ConfigHistoryPagination) GetHasNext() bool`

GetHasNext returns the HasNext field if non-nil, zero value otherwise.

### GetHasNextOk

`func (o *ConfigHistoryPagination) GetHasNextOk() (*bool, bool)`

GetHasNextOk returns a tuple with the HasNext field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasNext

`func (o *ConfigHistoryPagination) SetHasNext(v bool)`

SetHasNext sets HasNext field to given value.


### GetHasPrev

`func (o *ConfigHistoryPagination) GetHasPrev() bool`

GetHasPrev returns the HasPrev field if non-nil, zero value otherwise.

### GetHasPrevOk

`func (o *ConfigHistoryPagination) GetHasPrevOk() (*bool, bool)`

GetHasPrevOk returns a tuple with the HasPrev field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasPrev

`func (o *ConfigHistoryPagination) SetHasPrev(v bool)`

SetHasPrev sets HasPrev field to given value.


### GetPage

`func (o *ConfigHistoryPagination) GetPage() int64`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *ConfigHistoryPagination) GetPageOk() (*int64, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *ConfigHistoryPagination) SetPage(v int64)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *ConfigHistoryPagination) GetPerPage() int64`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *ConfigHistoryPagination) GetPerPageOk() (*int64, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *ConfigHistoryPagination) SetPerPage(v int64)`

SetPerPage sets PerPage field to given value.


### GetTotal

`func (o *ConfigHistoryPagination) GetTotal() int64`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *ConfigHistoryPagination) GetTotalOk() (*int64, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *ConfigHistoryPagination) SetTotal(v int64)`

SetTotal sets Total field to given value.


### GetTotalPages

`func (o *ConfigHistoryPagination) GetTotalPages() int64`

GetTotalPages returns the TotalPages field if non-nil, zero value otherwise.

### GetTotalPagesOk

`func (o *ConfigHistoryPagination) GetTotalPagesOk() (*int64, bool)`

GetTotalPagesOk returns a tuple with the TotalPages field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalPages

`func (o *ConfigHistoryPagination) SetTotalPages(v int64)`

SetTotalPages sets TotalPages field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



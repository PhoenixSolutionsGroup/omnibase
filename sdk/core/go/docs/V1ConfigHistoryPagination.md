# V1ConfigHistoryPagination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HasNext** | **bool** | Whether there is a next page | 
**HasPrev** | **bool** | Whether there is a previous page | 
**Page** | **int32** | Current page number | 
**PerPage** | **int32** | Items per page | 
**Total** | **int32** | Total number of configurations | 
**TotalPages** | **int32** | Total pages | 

## Methods

### NewV1ConfigHistoryPagination

`func NewV1ConfigHistoryPagination(hasNext bool, hasPrev bool, page int32, perPage int32, total int32, totalPages int32, ) *V1ConfigHistoryPagination`

NewV1ConfigHistoryPagination instantiates a new V1ConfigHistoryPagination object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1ConfigHistoryPaginationWithDefaults

`func NewV1ConfigHistoryPaginationWithDefaults() *V1ConfigHistoryPagination`

NewV1ConfigHistoryPaginationWithDefaults instantiates a new V1ConfigHistoryPagination object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetHasNext

`func (o *V1ConfigHistoryPagination) GetHasNext() bool`

GetHasNext returns the HasNext field if non-nil, zero value otherwise.

### GetHasNextOk

`func (o *V1ConfigHistoryPagination) GetHasNextOk() (*bool, bool)`

GetHasNextOk returns a tuple with the HasNext field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasNext

`func (o *V1ConfigHistoryPagination) SetHasNext(v bool)`

SetHasNext sets HasNext field to given value.


### GetHasPrev

`func (o *V1ConfigHistoryPagination) GetHasPrev() bool`

GetHasPrev returns the HasPrev field if non-nil, zero value otherwise.

### GetHasPrevOk

`func (o *V1ConfigHistoryPagination) GetHasPrevOk() (*bool, bool)`

GetHasPrevOk returns a tuple with the HasPrev field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHasPrev

`func (o *V1ConfigHistoryPagination) SetHasPrev(v bool)`

SetHasPrev sets HasPrev field to given value.


### GetPage

`func (o *V1ConfigHistoryPagination) GetPage() int32`

GetPage returns the Page field if non-nil, zero value otherwise.

### GetPageOk

`func (o *V1ConfigHistoryPagination) GetPageOk() (*int32, bool)`

GetPageOk returns a tuple with the Page field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPage

`func (o *V1ConfigHistoryPagination) SetPage(v int32)`

SetPage sets Page field to given value.


### GetPerPage

`func (o *V1ConfigHistoryPagination) GetPerPage() int32`

GetPerPage returns the PerPage field if non-nil, zero value otherwise.

### GetPerPageOk

`func (o *V1ConfigHistoryPagination) GetPerPageOk() (*int32, bool)`

GetPerPageOk returns a tuple with the PerPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPerPage

`func (o *V1ConfigHistoryPagination) SetPerPage(v int32)`

SetPerPage sets PerPage field to given value.


### GetTotal

`func (o *V1ConfigHistoryPagination) GetTotal() int32`

GetTotal returns the Total field if non-nil, zero value otherwise.

### GetTotalOk

`func (o *V1ConfigHistoryPagination) GetTotalOk() (*int32, bool)`

GetTotalOk returns a tuple with the Total field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotal

`func (o *V1ConfigHistoryPagination) SetTotal(v int32)`

SetTotal sets Total field to given value.


### GetTotalPages

`func (o *V1ConfigHistoryPagination) GetTotalPages() int32`

GetTotalPages returns the TotalPages field if non-nil, zero value otherwise.

### GetTotalPagesOk

`func (o *V1ConfigHistoryPagination) GetTotalPagesOk() (*int32, bool)`

GetTotalPagesOk returns a tuple with the TotalPages field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalPages

`func (o *V1ConfigHistoryPagination) SetTotalPages(v int32)`

SetTotalPages sets TotalPages field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



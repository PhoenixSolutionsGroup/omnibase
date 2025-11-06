# V1ConfigHistoryPagination

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HasNext** | Pointer to **bool** | Whether there is a next page | [optional] 
**HasPrev** | Pointer to **bool** | Whether there is a previous page | [optional] 
**Page** | Pointer to **int32** | Current page number | [optional] 
**PerPage** | Pointer to **int32** | Items per page | [optional] 
**Total** | Pointer to **int32** | Total number of configurations | [optional] 
**TotalPages** | Pointer to **int32** | Total pages | [optional] 

## Methods

### NewV1ConfigHistoryPagination

`func NewV1ConfigHistoryPagination() *V1ConfigHistoryPagination`

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

### HasHasNext

`func (o *V1ConfigHistoryPagination) HasHasNext() bool`

HasHasNext returns a boolean if a field has been set.

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

### HasHasPrev

`func (o *V1ConfigHistoryPagination) HasHasPrev() bool`

HasHasPrev returns a boolean if a field has been set.

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

### HasPage

`func (o *V1ConfigHistoryPagination) HasPage() bool`

HasPage returns a boolean if a field has been set.

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

### HasPerPage

`func (o *V1ConfigHistoryPagination) HasPerPage() bool`

HasPerPage returns a boolean if a field has been set.

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

### HasTotal

`func (o *V1ConfigHistoryPagination) HasTotal() bool`

HasTotal returns a boolean if a field has been set.

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

### HasTotalPages

`func (o *V1ConfigHistoryPagination) HasTotalPages() bool`

HasTotalPages returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



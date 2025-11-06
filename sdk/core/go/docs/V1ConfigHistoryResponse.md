# V1ConfigHistoryResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Configs** | Pointer to [**[]V1ConfigHistoryItem**](V1ConfigHistoryItem.md) | List of configuration entries | [optional] 
**Pagination** | Pointer to [**V1ConfigHistoryPagination**](V1ConfigHistoryPagination.md) | Pagination information | [optional] 

## Methods

### NewV1ConfigHistoryResponse

`func NewV1ConfigHistoryResponse() *V1ConfigHistoryResponse`

NewV1ConfigHistoryResponse instantiates a new V1ConfigHistoryResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1ConfigHistoryResponseWithDefaults

`func NewV1ConfigHistoryResponseWithDefaults() *V1ConfigHistoryResponse`

NewV1ConfigHistoryResponseWithDefaults instantiates a new V1ConfigHistoryResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfigs

`func (o *V1ConfigHistoryResponse) GetConfigs() []V1ConfigHistoryItem`

GetConfigs returns the Configs field if non-nil, zero value otherwise.

### GetConfigsOk

`func (o *V1ConfigHistoryResponse) GetConfigsOk() (*[]V1ConfigHistoryItem, bool)`

GetConfigsOk returns a tuple with the Configs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigs

`func (o *V1ConfigHistoryResponse) SetConfigs(v []V1ConfigHistoryItem)`

SetConfigs sets Configs field to given value.

### HasConfigs

`func (o *V1ConfigHistoryResponse) HasConfigs() bool`

HasConfigs returns a boolean if a field has been set.

### GetPagination

`func (o *V1ConfigHistoryResponse) GetPagination() V1ConfigHistoryPagination`

GetPagination returns the Pagination field if non-nil, zero value otherwise.

### GetPaginationOk

`func (o *V1ConfigHistoryResponse) GetPaginationOk() (*V1ConfigHistoryPagination, bool)`

GetPaginationOk returns a tuple with the Pagination field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPagination

`func (o *V1ConfigHistoryResponse) SetPagination(v V1ConfigHistoryPagination)`

SetPagination sets Pagination field to given value.

### HasPagination

`func (o *V1ConfigHistoryResponse) HasPagination() bool`

HasPagination returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



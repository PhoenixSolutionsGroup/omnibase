# ConfigHistoryResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Configs** | [**[]ConfigHistoryItem**](ConfigHistoryItem.md) | List of configuration entries | 
**Pagination** | [**ConfigHistoryPagination**](ConfigHistoryPagination.md) |  | 

## Methods

### NewConfigHistoryResponse

`func NewConfigHistoryResponse(configs []ConfigHistoryItem, pagination ConfigHistoryPagination, ) *ConfigHistoryResponse`

NewConfigHistoryResponse instantiates a new ConfigHistoryResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewConfigHistoryResponseWithDefaults

`func NewConfigHistoryResponseWithDefaults() *ConfigHistoryResponse`

NewConfigHistoryResponseWithDefaults instantiates a new ConfigHistoryResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetConfigs

`func (o *ConfigHistoryResponse) GetConfigs() []ConfigHistoryItem`

GetConfigs returns the Configs field if non-nil, zero value otherwise.

### GetConfigsOk

`func (o *ConfigHistoryResponse) GetConfigsOk() (*[]ConfigHistoryItem, bool)`

GetConfigsOk returns a tuple with the Configs field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetConfigs

`func (o *ConfigHistoryResponse) SetConfigs(v []ConfigHistoryItem)`

SetConfigs sets Configs field to given value.


### GetPagination

`func (o *ConfigHistoryResponse) GetPagination() ConfigHistoryPagination`

GetPagination returns the Pagination field if non-nil, zero value otherwise.

### GetPaginationOk

`func (o *ConfigHistoryResponse) GetPaginationOk() (*ConfigHistoryPagination, bool)`

GetPaginationOk returns a tuple with the Pagination field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPagination

`func (o *ConfigHistoryResponse) SetPagination(v ConfigHistoryPagination)`

SetPagination sets Pagination field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



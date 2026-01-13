# EnterpriseApplyResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** | Success message | 
**TenantId** | **string** | Tenant ID that pricing was applied to | 
**PricesSwapped** | **int32** | Number of subscription prices that were swapped | 
**SwappedDetails** | Pointer to **[]string** | Details of each price swap performed | [optional] 

## Methods

### NewEnterpriseApplyResponse

`func NewEnterpriseApplyResponse(message string, tenantId string, pricesSwapped int32, ) *EnterpriseApplyResponse`

NewEnterpriseApplyResponse instantiates a new EnterpriseApplyResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewEnterpriseApplyResponseWithDefaults

`func NewEnterpriseApplyResponseWithDefaults() *EnterpriseApplyResponse`

NewEnterpriseApplyResponseWithDefaults instantiates a new EnterpriseApplyResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *EnterpriseApplyResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *EnterpriseApplyResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *EnterpriseApplyResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTenantId

`func (o *EnterpriseApplyResponse) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *EnterpriseApplyResponse) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *EnterpriseApplyResponse) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetPricesSwapped

`func (o *EnterpriseApplyResponse) GetPricesSwapped() int32`

GetPricesSwapped returns the PricesSwapped field if non-nil, zero value otherwise.

### GetPricesSwappedOk

`func (o *EnterpriseApplyResponse) GetPricesSwappedOk() (*int32, bool)`

GetPricesSwappedOk returns a tuple with the PricesSwapped field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPricesSwapped

`func (o *EnterpriseApplyResponse) SetPricesSwapped(v int32)`

SetPricesSwapped sets PricesSwapped field to given value.


### GetSwappedDetails

`func (o *EnterpriseApplyResponse) GetSwappedDetails() []string`

GetSwappedDetails returns the SwappedDetails field if non-nil, zero value otherwise.

### GetSwappedDetailsOk

`func (o *EnterpriseApplyResponse) GetSwappedDetailsOk() (*[]string, bool)`

GetSwappedDetailsOk returns a tuple with the SwappedDetails field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSwappedDetails

`func (o *EnterpriseApplyResponse) SetSwappedDetails(v []string)`

SetSwappedDetails sets SwappedDetails field to given value.

### HasSwappedDetails

`func (o *EnterpriseApplyResponse) HasSwappedDetails() bool`

HasSwappedDetails returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# ApplyEnterpriseCustomRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TenantId** | **string** | Tenant ID to apply enterprise pricing to | 
**EnterpriseId** | **string** | Enterprise pricing group ID (e.g., acme_corp, bigtech_inc) | 

## Methods

### NewApplyEnterpriseCustomRequest

`func NewApplyEnterpriseCustomRequest(tenantId string, enterpriseId string, ) *ApplyEnterpriseCustomRequest`

NewApplyEnterpriseCustomRequest instantiates a new ApplyEnterpriseCustomRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewApplyEnterpriseCustomRequestWithDefaults

`func NewApplyEnterpriseCustomRequestWithDefaults() *ApplyEnterpriseCustomRequest`

NewApplyEnterpriseCustomRequestWithDefaults instantiates a new ApplyEnterpriseCustomRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTenantId

`func (o *ApplyEnterpriseCustomRequest) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *ApplyEnterpriseCustomRequest) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *ApplyEnterpriseCustomRequest) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.


### GetEnterpriseId

`func (o *ApplyEnterpriseCustomRequest) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *ApplyEnterpriseCustomRequest) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *ApplyEnterpriseCustomRequest) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



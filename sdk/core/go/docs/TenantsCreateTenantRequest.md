# TenantsCreateTenantRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**BillingEmail** | Pointer to **string** | Billing email for Stripe customer | [optional] 
**Name** | **string** | Organization name | 
**UserId** | **string** | User ID of the tenant creator | 

## Methods

### NewTenantsCreateTenantRequest

`func NewTenantsCreateTenantRequest(name string, userId string, ) *TenantsCreateTenantRequest`

NewTenantsCreateTenantRequest instantiates a new TenantsCreateTenantRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateTenantRequestWithDefaults

`func NewTenantsCreateTenantRequestWithDefaults() *TenantsCreateTenantRequest`

NewTenantsCreateTenantRequestWithDefaults instantiates a new TenantsCreateTenantRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetBillingEmail

`func (o *TenantsCreateTenantRequest) GetBillingEmail() string`

GetBillingEmail returns the BillingEmail field if non-nil, zero value otherwise.

### GetBillingEmailOk

`func (o *TenantsCreateTenantRequest) GetBillingEmailOk() (*string, bool)`

GetBillingEmailOk returns a tuple with the BillingEmail field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingEmail

`func (o *TenantsCreateTenantRequest) SetBillingEmail(v string)`

SetBillingEmail sets BillingEmail field to given value.

### HasBillingEmail

`func (o *TenantsCreateTenantRequest) HasBillingEmail() bool`

HasBillingEmail returns a boolean if a field has been set.

### GetName

`func (o *TenantsCreateTenantRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *TenantsCreateTenantRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *TenantsCreateTenantRequest) SetName(v string)`

SetName sets Name field to given value.


### GetUserId

`func (o *TenantsCreateTenantRequest) GetUserId() string`

GetUserId returns the UserId field if non-nil, zero value otherwise.

### GetUserIdOk

`func (o *TenantsCreateTenantRequest) GetUserIdOk() (*string, bool)`

GetUserIdOk returns a tuple with the UserId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUserId

`func (o *TenantsCreateTenantRequest) SetUserId(v string)`

SetUserId sets UserId field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



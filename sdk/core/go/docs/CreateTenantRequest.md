# CreateTenantRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** | Organization name | 
**BillingEmail** | Pointer to **string** | Billing email for Stripe customer | [optional] 
**Type** | Pointer to **string** | Tenant type: &#39;organization&#39; for multi-user tenants with invitations and team management, &#39;individual&#39; for single-user tenants. Defaults to &#39;organization&#39; if not specified. | [optional] [default to "organization"]

## Methods

### NewCreateTenantRequest

`func NewCreateTenantRequest(name string, ) *CreateTenantRequest`

NewCreateTenantRequest instantiates a new CreateTenantRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateTenantRequestWithDefaults

`func NewCreateTenantRequestWithDefaults() *CreateTenantRequest`

NewCreateTenantRequestWithDefaults instantiates a new CreateTenantRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateTenantRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateTenantRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateTenantRequest) SetName(v string)`

SetName sets Name field to given value.


### GetBillingEmail

`func (o *CreateTenantRequest) GetBillingEmail() string`

GetBillingEmail returns the BillingEmail field if non-nil, zero value otherwise.

### GetBillingEmailOk

`func (o *CreateTenantRequest) GetBillingEmailOk() (*string, bool)`

GetBillingEmailOk returns a tuple with the BillingEmail field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBillingEmail

`func (o *CreateTenantRequest) SetBillingEmail(v string)`

SetBillingEmail sets BillingEmail field to given value.

### HasBillingEmail

`func (o *CreateTenantRequest) HasBillingEmail() bool`

HasBillingEmail returns a boolean if a field has been set.

### GetType

`func (o *CreateTenantRequest) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *CreateTenantRequest) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *CreateTenantRequest) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *CreateTenantRequest) HasType() bool`

HasType returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



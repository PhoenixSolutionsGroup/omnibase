# TenantPayload

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**CreatedAt** | **time.Time** |  | 
**EnterpriseId** | Pointer to **string** |  | [optional] 
**EnterpriseTemplate** | Pointer to **string** |  | [optional] 
**Id** | **string** |  | 
**Name** | **string** |  | 
**StripeCustomerId** | Pointer to **string** |  | [optional] 
**Type** | **string** |  | 
**UpdatedAt** | **time.Time** |  | 

## Methods

### NewTenantPayload

`func NewTenantPayload(createdAt time.Time, id string, name string, type_ string, updatedAt time.Time, ) *TenantPayload`

NewTenantPayload instantiates a new TenantPayload object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantPayloadWithDefaults

`func NewTenantPayloadWithDefaults() *TenantPayload`

NewTenantPayloadWithDefaults instantiates a new TenantPayload object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCreatedAt

`func (o *TenantPayload) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *TenantPayload) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *TenantPayload) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.


### GetEnterpriseId

`func (o *TenantPayload) GetEnterpriseId() string`

GetEnterpriseId returns the EnterpriseId field if non-nil, zero value otherwise.

### GetEnterpriseIdOk

`func (o *TenantPayload) GetEnterpriseIdOk() (*string, bool)`

GetEnterpriseIdOk returns a tuple with the EnterpriseId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseId

`func (o *TenantPayload) SetEnterpriseId(v string)`

SetEnterpriseId sets EnterpriseId field to given value.

### HasEnterpriseId

`func (o *TenantPayload) HasEnterpriseId() bool`

HasEnterpriseId returns a boolean if a field has been set.

### GetEnterpriseTemplate

`func (o *TenantPayload) GetEnterpriseTemplate() string`

GetEnterpriseTemplate returns the EnterpriseTemplate field if non-nil, zero value otherwise.

### GetEnterpriseTemplateOk

`func (o *TenantPayload) GetEnterpriseTemplateOk() (*string, bool)`

GetEnterpriseTemplateOk returns a tuple with the EnterpriseTemplate field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEnterpriseTemplate

`func (o *TenantPayload) SetEnterpriseTemplate(v string)`

SetEnterpriseTemplate sets EnterpriseTemplate field to given value.

### HasEnterpriseTemplate

`func (o *TenantPayload) HasEnterpriseTemplate() bool`

HasEnterpriseTemplate returns a boolean if a field has been set.

### GetId

`func (o *TenantPayload) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *TenantPayload) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *TenantPayload) SetId(v string)`

SetId sets Id field to given value.


### GetName

`func (o *TenantPayload) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *TenantPayload) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *TenantPayload) SetName(v string)`

SetName sets Name field to given value.


### GetStripeCustomerId

`func (o *TenantPayload) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *TenantPayload) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *TenantPayload) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### HasStripeCustomerId

`func (o *TenantPayload) HasStripeCustomerId() bool`

HasStripeCustomerId returns a boolean if a field has been set.

### GetType

`func (o *TenantPayload) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *TenantPayload) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *TenantPayload) SetType(v string)`

SetType sets Type field to given value.


### GetUpdatedAt

`func (o *TenantPayload) GetUpdatedAt() time.Time`

GetUpdatedAt returns the UpdatedAt field if non-nil, zero value otherwise.

### GetUpdatedAtOk

`func (o *TenantPayload) GetUpdatedAtOk() (*time.Time, bool)`

GetUpdatedAtOk returns a tuple with the UpdatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUpdatedAt

`func (o *TenantPayload) SetUpdatedAt(v time.Time)`

SetUpdatedAt sets UpdatedAt field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



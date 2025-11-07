# V1CreateSubscriptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PlanId** | **string** | The plan ID from your Stripe configuration (config item ID) | 
**StripeCustomerId** | Pointer to **string** | Optional Stripe customer ID to use directly (provide either tenant_id OR stripe_customer_id) | [optional] 
**TenantId** | Pointer to **string** | Optional tenant ID to lookup Stripe customer ID (provide either tenant_id OR stripe_customer_id) | [optional] 

## Methods

### NewV1CreateSubscriptionRequest

`func NewV1CreateSubscriptionRequest(planId string, ) *V1CreateSubscriptionRequest`

NewV1CreateSubscriptionRequest instantiates a new V1CreateSubscriptionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CreateSubscriptionRequestWithDefaults

`func NewV1CreateSubscriptionRequestWithDefaults() *V1CreateSubscriptionRequest`

NewV1CreateSubscriptionRequestWithDefaults instantiates a new V1CreateSubscriptionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlanId

`func (o *V1CreateSubscriptionRequest) GetPlanId() string`

GetPlanId returns the PlanId field if non-nil, zero value otherwise.

### GetPlanIdOk

`func (o *V1CreateSubscriptionRequest) GetPlanIdOk() (*string, bool)`

GetPlanIdOk returns a tuple with the PlanId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanId

`func (o *V1CreateSubscriptionRequest) SetPlanId(v string)`

SetPlanId sets PlanId field to given value.


### GetStripeCustomerId

`func (o *V1CreateSubscriptionRequest) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *V1CreateSubscriptionRequest) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *V1CreateSubscriptionRequest) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### HasStripeCustomerId

`func (o *V1CreateSubscriptionRequest) HasStripeCustomerId() bool`

HasStripeCustomerId returns a boolean if a field has been set.

### GetTenantId

`func (o *V1CreateSubscriptionRequest) GetTenantId() string`

GetTenantId returns the TenantId field if non-nil, zero value otherwise.

### GetTenantIdOk

`func (o *V1CreateSubscriptionRequest) GetTenantIdOk() (*string, bool)`

GetTenantIdOk returns a tuple with the TenantId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenantId

`func (o *V1CreateSubscriptionRequest) SetTenantId(v string)`

SetTenantId sets TenantId field to given value.

### HasTenantId

`func (o *V1CreateSubscriptionRequest) HasTenantId() bool`

HasTenantId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



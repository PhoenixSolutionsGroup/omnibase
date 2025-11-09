# TenantsAddSubscriptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PlanId** | **string** | The plan ID from your Stripe configuration (config item ID) | 
**StripeCustomerId** | Pointer to **string** | Optional Stripe customer ID to use directly (provide either tenant_id OR stripe_customer_id) | [optional] 

## Methods

### NewTenantsAddSubscriptionRequest

`func NewTenantsAddSubscriptionRequest(planId string, ) *TenantsAddSubscriptionRequest`

NewTenantsAddSubscriptionRequest instantiates a new TenantsAddSubscriptionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsAddSubscriptionRequestWithDefaults

`func NewTenantsAddSubscriptionRequestWithDefaults() *TenantsAddSubscriptionRequest`

NewTenantsAddSubscriptionRequestWithDefaults instantiates a new TenantsAddSubscriptionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlanId

`func (o *TenantsAddSubscriptionRequest) GetPlanId() string`

GetPlanId returns the PlanId field if non-nil, zero value otherwise.

### GetPlanIdOk

`func (o *TenantsAddSubscriptionRequest) GetPlanIdOk() (*string, bool)`

GetPlanIdOk returns a tuple with the PlanId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanId

`func (o *TenantsAddSubscriptionRequest) SetPlanId(v string)`

SetPlanId sets PlanId field to given value.


### GetStripeCustomerId

`func (o *TenantsAddSubscriptionRequest) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *TenantsAddSubscriptionRequest) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *TenantsAddSubscriptionRequest) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### HasStripeCustomerId

`func (o *TenantsAddSubscriptionRequest) HasStripeCustomerId() bool`

HasStripeCustomerId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



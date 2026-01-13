# AddSubscriptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PlanId** | **string** | The plan ID from your Stripe configuration (required, cannot be empty) | 
**StripeCustomerId** | Pointer to **string** | Optional Stripe customer ID to use directly (provide either tenant_id OR stripe_customer_id) | [optional] 

## Methods

### NewAddSubscriptionRequest

`func NewAddSubscriptionRequest(planId string, ) *AddSubscriptionRequest`

NewAddSubscriptionRequest instantiates a new AddSubscriptionRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewAddSubscriptionRequestWithDefaults

`func NewAddSubscriptionRequestWithDefaults() *AddSubscriptionRequest`

NewAddSubscriptionRequestWithDefaults instantiates a new AddSubscriptionRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetPlanId

`func (o *AddSubscriptionRequest) GetPlanId() string`

GetPlanId returns the PlanId field if non-nil, zero value otherwise.

### GetPlanIdOk

`func (o *AddSubscriptionRequest) GetPlanIdOk() (*string, bool)`

GetPlanIdOk returns a tuple with the PlanId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlanId

`func (o *AddSubscriptionRequest) SetPlanId(v string)`

SetPlanId sets PlanId field to given value.


### GetStripeCustomerId

`func (o *AddSubscriptionRequest) GetStripeCustomerId() string`

GetStripeCustomerId returns the StripeCustomerId field if non-nil, zero value otherwise.

### GetStripeCustomerIdOk

`func (o *AddSubscriptionRequest) GetStripeCustomerIdOk() (*string, bool)`

GetStripeCustomerIdOk returns a tuple with the StripeCustomerId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStripeCustomerId

`func (o *AddSubscriptionRequest) SetStripeCustomerId(v string)`

SetStripeCustomerId sets StripeCustomerId field to given value.

### HasStripeCustomerId

`func (o *AddSubscriptionRequest) HasStripeCustomerId() bool`

HasStripeCustomerId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



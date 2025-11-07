# V1CreateSubscriptionRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**PlanId** | **string** | The plan ID from your Stripe configuration (config item ID) | 
**TenantId** | **string** | The tenant ID to create subscription for | 

## Methods

### NewV1CreateSubscriptionRequest

`func NewV1CreateSubscriptionRequest(planId string, tenantId string, ) *V1CreateSubscriptionRequest`

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



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



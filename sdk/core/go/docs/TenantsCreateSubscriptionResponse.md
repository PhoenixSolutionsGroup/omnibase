# TenantsCreateSubscriptionResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | Pointer to **string** | Subscription status (active, trialing, etc.) | [optional] 
**SubscriptionId** | Pointer to **string** | Stripe Subscription ID | [optional] 

## Methods

### NewTenantsCreateSubscriptionResponse

`func NewTenantsCreateSubscriptionResponse() *TenantsCreateSubscriptionResponse`

NewTenantsCreateSubscriptionResponse instantiates a new TenantsCreateSubscriptionResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewTenantsCreateSubscriptionResponseWithDefaults

`func NewTenantsCreateSubscriptionResponseWithDefaults() *TenantsCreateSubscriptionResponse`

NewTenantsCreateSubscriptionResponseWithDefaults instantiates a new TenantsCreateSubscriptionResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *TenantsCreateSubscriptionResponse) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *TenantsCreateSubscriptionResponse) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *TenantsCreateSubscriptionResponse) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *TenantsCreateSubscriptionResponse) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetSubscriptionId

`func (o *TenantsCreateSubscriptionResponse) GetSubscriptionId() string`

GetSubscriptionId returns the SubscriptionId field if non-nil, zero value otherwise.

### GetSubscriptionIdOk

`func (o *TenantsCreateSubscriptionResponse) GetSubscriptionIdOk() (*string, bool)`

GetSubscriptionIdOk returns a tuple with the SubscriptionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubscriptionId

`func (o *TenantsCreateSubscriptionResponse) SetSubscriptionId(v string)`

SetSubscriptionId sets SubscriptionId field to given value.

### HasSubscriptionId

`func (o *TenantsCreateSubscriptionResponse) HasSubscriptionId() bool`

HasSubscriptionId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



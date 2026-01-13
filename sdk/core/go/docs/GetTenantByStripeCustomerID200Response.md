# GetTenantByStripeCustomerID200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**GetTenantByStripeCustomerIDResponse**](GetTenantByStripeCustomerIDResponse.md) |  | [optional] 

## Methods

### NewGetTenantByStripeCustomerID200Response

`func NewGetTenantByStripeCustomerID200Response(status int32, ) *GetTenantByStripeCustomerID200Response`

NewGetTenantByStripeCustomerID200Response instantiates a new GetTenantByStripeCustomerID200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetTenantByStripeCustomerID200ResponseWithDefaults

`func NewGetTenantByStripeCustomerID200ResponseWithDefaults() *GetTenantByStripeCustomerID200Response`

NewGetTenantByStripeCustomerID200ResponseWithDefaults instantiates a new GetTenantByStripeCustomerID200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetTenantByStripeCustomerID200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetTenantByStripeCustomerID200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetTenantByStripeCustomerID200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *GetTenantByStripeCustomerID200Response) GetData() GetTenantByStripeCustomerIDResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *GetTenantByStripeCustomerID200Response) GetDataOk() (*GetTenantByStripeCustomerIDResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *GetTenantByStripeCustomerID200Response) SetData(v GetTenantByStripeCustomerIDResponse)`

SetData sets Data field to given value.

### HasData

`func (o *GetTenantByStripeCustomerID200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



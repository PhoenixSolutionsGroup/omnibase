# GetTenantSubscription200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**SubscriptionResponse**](SubscriptionResponse.md) |  | [optional] 

## Methods

### NewGetTenantSubscription200Response

`func NewGetTenantSubscription200Response(status int32, ) *GetTenantSubscription200Response`

NewGetTenantSubscription200Response instantiates a new GetTenantSubscription200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetTenantSubscription200ResponseWithDefaults

`func NewGetTenantSubscription200ResponseWithDefaults() *GetTenantSubscription200Response`

NewGetTenantSubscription200ResponseWithDefaults instantiates a new GetTenantSubscription200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetTenantSubscription200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetTenantSubscription200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetTenantSubscription200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *GetTenantSubscription200Response) GetData() SubscriptionResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *GetTenantSubscription200Response) GetDataOk() (*SubscriptionResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *GetTenantSubscription200Response) SetData(v SubscriptionResponse)`

SetData sets Data field to given value.

### HasData

`func (o *GetTenantSubscription200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



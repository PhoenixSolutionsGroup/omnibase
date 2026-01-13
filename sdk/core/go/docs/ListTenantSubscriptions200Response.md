# ListTenantSubscriptions200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**[]SubscriptionResponse**](SubscriptionResponse.md) |  | [optional] 

## Methods

### NewListTenantSubscriptions200Response

`func NewListTenantSubscriptions200Response(status int32, ) *ListTenantSubscriptions200Response`

NewListTenantSubscriptions200Response instantiates a new ListTenantSubscriptions200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListTenantSubscriptions200ResponseWithDefaults

`func NewListTenantSubscriptions200ResponseWithDefaults() *ListTenantSubscriptions200Response`

NewListTenantSubscriptions200ResponseWithDefaults instantiates a new ListTenantSubscriptions200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *ListTenantSubscriptions200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ListTenantSubscriptions200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ListTenantSubscriptions200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *ListTenantSubscriptions200Response) GetData() []SubscriptionResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ListTenantSubscriptions200Response) GetDataOk() (*[]SubscriptionResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ListTenantSubscriptions200Response) SetData(v []SubscriptionResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ListTenantSubscriptions200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



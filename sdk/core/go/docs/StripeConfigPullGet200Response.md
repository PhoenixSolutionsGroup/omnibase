# StripeConfigPullGet200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to [**ModelsStripeConfiguration**](ModelsStripeConfiguration.md) |  | [optional] 
**Status** | Pointer to **int32** | HTTP status code | [optional] 

## Methods

### NewStripeConfigPullGet200Response

`func NewStripeConfigPullGet200Response() *StripeConfigPullGet200Response`

NewStripeConfigPullGet200Response instantiates a new StripeConfigPullGet200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewStripeConfigPullGet200ResponseWithDefaults

`func NewStripeConfigPullGet200ResponseWithDefaults() *StripeConfigPullGet200Response`

NewStripeConfigPullGet200ResponseWithDefaults instantiates a new StripeConfigPullGet200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *StripeConfigPullGet200Response) GetData() ModelsStripeConfiguration`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *StripeConfigPullGet200Response) GetDataOk() (*ModelsStripeConfiguration, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *StripeConfigPullGet200Response) SetData(v ModelsStripeConfiguration)`

SetData sets Data field to given value.

### HasData

`func (o *StripeConfigPullGet200Response) HasData() bool`

HasData returns a boolean if a field has been set.

### GetStatus

`func (o *StripeConfigPullGet200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *StripeConfigPullGet200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *StripeConfigPullGet200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *StripeConfigPullGet200Response) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



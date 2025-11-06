# CreateCheckout200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Data** | Pointer to [**V1CreateCheckoutResponse**](V1CreateCheckoutResponse.md) |  | [optional] 
**Status** | Pointer to **int32** | HTTP status code | [optional] 

## Methods

### NewCreateCheckout200Response

`func NewCreateCheckout200Response() *CreateCheckout200Response`

NewCreateCheckout200Response instantiates a new CreateCheckout200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateCheckout200ResponseWithDefaults

`func NewCreateCheckout200ResponseWithDefaults() *CreateCheckout200Response`

NewCreateCheckout200ResponseWithDefaults instantiates a new CreateCheckout200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetData

`func (o *CreateCheckout200Response) GetData() V1CreateCheckoutResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *CreateCheckout200Response) GetDataOk() (*V1CreateCheckoutResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *CreateCheckout200Response) SetData(v V1CreateCheckoutResponse)`

SetData sets Data field to given value.

### HasData

`func (o *CreateCheckout200Response) HasData() bool`

HasData returns a boolean if a field has been set.

### GetStatus

`func (o *CreateCheckout200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *CreateCheckout200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *CreateCheckout200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *CreateCheckout200Response) HasStatus() bool`

HasStatus returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



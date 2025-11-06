# V1CreateCheckoutResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**SessionId** | Pointer to **string** | Stripe Checkout Session ID | [optional] 
**Url** | Pointer to **string** | Stripe Checkout Session URL | [optional] 

## Methods

### NewV1CreateCheckoutResponse

`func NewV1CreateCheckoutResponse() *V1CreateCheckoutResponse`

NewV1CreateCheckoutResponse instantiates a new V1CreateCheckoutResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewV1CreateCheckoutResponseWithDefaults

`func NewV1CreateCheckoutResponseWithDefaults() *V1CreateCheckoutResponse`

NewV1CreateCheckoutResponseWithDefaults instantiates a new V1CreateCheckoutResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetSessionId

`func (o *V1CreateCheckoutResponse) GetSessionId() string`

GetSessionId returns the SessionId field if non-nil, zero value otherwise.

### GetSessionIdOk

`func (o *V1CreateCheckoutResponse) GetSessionIdOk() (*string, bool)`

GetSessionIdOk returns a tuple with the SessionId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSessionId

`func (o *V1CreateCheckoutResponse) SetSessionId(v string)`

SetSessionId sets SessionId field to given value.

### HasSessionId

`func (o *V1CreateCheckoutResponse) HasSessionId() bool`

HasSessionId returns a boolean if a field has been set.

### GetUrl

`func (o *V1CreateCheckoutResponse) GetUrl() string`

GetUrl returns the Url field if non-nil, zero value otherwise.

### GetUrlOk

`func (o *V1CreateCheckoutResponse) GetUrlOk() (*string, bool)`

GetUrlOk returns a tuple with the Url field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetUrl

`func (o *V1CreateCheckoutResponse) SetUrl(v string)`

SetUrl sets Url field to given value.

### HasUrl

`func (o *V1CreateCheckoutResponse) HasUrl() bool`

HasUrl returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



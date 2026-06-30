# ListWebhooksResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Count** | **int64** |  | 
**Webhooks** | [**[]ListStripeWebhooksRow**](ListStripeWebhooksRow.md) |  | 

## Methods

### NewListWebhooksResponse

`func NewListWebhooksResponse(count int64, webhooks []ListStripeWebhooksRow, ) *ListWebhooksResponse`

NewListWebhooksResponse instantiates a new ListWebhooksResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListWebhooksResponseWithDefaults

`func NewListWebhooksResponseWithDefaults() *ListWebhooksResponse`

NewListWebhooksResponseWithDefaults instantiates a new ListWebhooksResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCount

`func (o *ListWebhooksResponse) GetCount() int64`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *ListWebhooksResponse) GetCountOk() (*int64, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *ListWebhooksResponse) SetCount(v int64)`

SetCount sets Count field to given value.


### GetWebhooks

`func (o *ListWebhooksResponse) GetWebhooks() []ListStripeWebhooksRow`

GetWebhooks returns the Webhooks field if non-nil, zero value otherwise.

### GetWebhooksOk

`func (o *ListWebhooksResponse) GetWebhooksOk() (*[]ListStripeWebhooksRow, bool)`

GetWebhooksOk returns a tuple with the Webhooks field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWebhooks

`func (o *ListWebhooksResponse) SetWebhooks(v []ListStripeWebhooksRow)`

SetWebhooks sets Webhooks field to given value.


### SetWebhooksNil

`func (o *ListWebhooksResponse) SetWebhooksNil(b bool)`

 SetWebhooksNil sets the value for Webhooks to be an explicit nil

### UnsetWebhooks
`func (o *ListWebhooksResponse) UnsetWebhooks()`

UnsetWebhooks ensures that no value is present for Webhooks, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



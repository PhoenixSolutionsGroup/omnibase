# ApplyEnterpriseTemplate200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**EnterpriseApplyResponse**](EnterpriseApplyResponse.md) |  | [optional] 

## Methods

### NewApplyEnterpriseTemplate200Response

`func NewApplyEnterpriseTemplate200Response(status int32, ) *ApplyEnterpriseTemplate200Response`

NewApplyEnterpriseTemplate200Response instantiates a new ApplyEnterpriseTemplate200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewApplyEnterpriseTemplate200ResponseWithDefaults

`func NewApplyEnterpriseTemplate200ResponseWithDefaults() *ApplyEnterpriseTemplate200Response`

NewApplyEnterpriseTemplate200ResponseWithDefaults instantiates a new ApplyEnterpriseTemplate200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *ApplyEnterpriseTemplate200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ApplyEnterpriseTemplate200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ApplyEnterpriseTemplate200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *ApplyEnterpriseTemplate200Response) GetData() EnterpriseApplyResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ApplyEnterpriseTemplate200Response) GetDataOk() (*EnterpriseApplyResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ApplyEnterpriseTemplate200Response) SetData(v EnterpriseApplyResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ApplyEnterpriseTemplate200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



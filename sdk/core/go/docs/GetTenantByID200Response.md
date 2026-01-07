# GetTenantByID200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**GetTenantByIDResponse**](GetTenantByIDResponse.md) |  | [optional] 

## Methods

### NewGetTenantByID200Response

`func NewGetTenantByID200Response(status int32, ) *GetTenantByID200Response`

NewGetTenantByID200Response instantiates a new GetTenantByID200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewGetTenantByID200ResponseWithDefaults

`func NewGetTenantByID200ResponseWithDefaults() *GetTenantByID200Response`

NewGetTenantByID200ResponseWithDefaults instantiates a new GetTenantByID200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *GetTenantByID200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *GetTenantByID200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *GetTenantByID200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *GetTenantByID200Response) GetData() GetTenantByIDResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *GetTenantByID200Response) GetDataOk() (*GetTenantByIDResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *GetTenantByID200Response) SetData(v GetTenantByIDResponse)`

SetData sets Data field to given value.

### HasData

`func (o *GetTenantByID200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



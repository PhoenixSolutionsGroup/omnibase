# ListTenants200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**ListTenantsResponse**](ListTenantsResponse.md) |  | [optional] 

## Methods

### NewListTenants200Response

`func NewListTenants200Response(status int32, ) *ListTenants200Response`

NewListTenants200Response instantiates a new ListTenants200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListTenants200ResponseWithDefaults

`func NewListTenants200ResponseWithDefaults() *ListTenants200Response`

NewListTenants200ResponseWithDefaults instantiates a new ListTenants200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *ListTenants200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *ListTenants200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *ListTenants200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *ListTenants200Response) GetData() ListTenantsResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *ListTenants200Response) GetDataOk() (*ListTenantsResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *ListTenants200Response) SetData(v ListTenantsResponse)`

SetData sets Data field to given value.

### HasData

`func (o *ListTenants200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



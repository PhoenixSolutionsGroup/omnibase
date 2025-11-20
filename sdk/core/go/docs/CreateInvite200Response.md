# CreateInvite200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | **int32** | HTTP status code | 
**Data** | Pointer to [**CreateTenantUserInviteResponse**](CreateTenantUserInviteResponse.md) |  | [optional] 

## Methods

### NewCreateInvite200Response

`func NewCreateInvite200Response(status int32, ) *CreateInvite200Response`

NewCreateInvite200Response instantiates a new CreateInvite200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateInvite200ResponseWithDefaults

`func NewCreateInvite200ResponseWithDefaults() *CreateInvite200Response`

NewCreateInvite200ResponseWithDefaults instantiates a new CreateInvite200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *CreateInvite200Response) GetStatus() int32`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *CreateInvite200Response) GetStatusOk() (*int32, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *CreateInvite200Response) SetStatus(v int32)`

SetStatus sets Status field to given value.


### GetData

`func (o *CreateInvite200Response) GetData() CreateTenantUserInviteResponse`

GetData returns the Data field if non-nil, zero value otherwise.

### GetDataOk

`func (o *CreateInvite200Response) GetDataOk() (*CreateTenantUserInviteResponse, bool)`

GetDataOk returns a tuple with the Data field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetData

`func (o *CreateInvite200Response) SetData(v CreateTenantUserInviteResponse)`

SetData sets Data field to given value.

### HasData

`func (o *CreateInvite200Response) HasData() bool`

HasData returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



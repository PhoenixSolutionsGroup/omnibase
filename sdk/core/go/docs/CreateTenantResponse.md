# CreateTenantResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** |  | 
**Tenant** | [**TenantPayload**](TenantPayload.md) |  | 

## Methods

### NewCreateTenantResponse

`func NewCreateTenantResponse(message string, tenant TenantPayload, ) *CreateTenantResponse`

NewCreateTenantResponse instantiates a new CreateTenantResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateTenantResponseWithDefaults

`func NewCreateTenantResponseWithDefaults() *CreateTenantResponse`

NewCreateTenantResponseWithDefaults instantiates a new CreateTenantResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *CreateTenantResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateTenantResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateTenantResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTenant

`func (o *CreateTenantResponse) GetTenant() TenantPayload`

GetTenant returns the Tenant field if non-nil, zero value otherwise.

### GetTenantOk

`func (o *CreateTenantResponse) GetTenantOk() (*TenantPayload, bool)`

GetTenantOk returns a tuple with the Tenant field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTenant

`func (o *CreateTenantResponse) SetTenant(v TenantPayload)`

SetTenant sets Tenant field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



# CreatePortalRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**ReturnUrl** | **string** | URL to redirect to after leaving the portal (required, cannot be empty) | 

## Methods

### NewCreatePortalRequest

`func NewCreatePortalRequest(returnUrl string, ) *CreatePortalRequest`

NewCreatePortalRequest instantiates a new CreatePortalRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreatePortalRequestWithDefaults

`func NewCreatePortalRequestWithDefaults() *CreatePortalRequest`

NewCreatePortalRequestWithDefaults instantiates a new CreatePortalRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetReturnUrl

`func (o *CreatePortalRequest) GetReturnUrl() string`

GetReturnUrl returns the ReturnUrl field if non-nil, zero value otherwise.

### GetReturnUrlOk

`func (o *CreatePortalRequest) GetReturnUrlOk() (*string, bool)`

GetReturnUrlOk returns a tuple with the ReturnUrl field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetReturnUrl

`func (o *CreatePortalRequest) SetReturnUrl(v string)`

SetReturnUrl sets ReturnUrl field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



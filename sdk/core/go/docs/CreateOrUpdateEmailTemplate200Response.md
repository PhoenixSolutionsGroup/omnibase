# CreateOrUpdateEmailTemplate200Response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | Pointer to **string** |  | [optional] 
**Template** | Pointer to [**EmailTemplate**](EmailTemplate.md) |  | [optional] 

## Methods

### NewCreateOrUpdateEmailTemplate200Response

`func NewCreateOrUpdateEmailTemplate200Response() *CreateOrUpdateEmailTemplate200Response`

NewCreateOrUpdateEmailTemplate200Response instantiates a new CreateOrUpdateEmailTemplate200Response object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateOrUpdateEmailTemplate200ResponseWithDefaults

`func NewCreateOrUpdateEmailTemplate200ResponseWithDefaults() *CreateOrUpdateEmailTemplate200Response`

NewCreateOrUpdateEmailTemplate200ResponseWithDefaults instantiates a new CreateOrUpdateEmailTemplate200Response object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *CreateOrUpdateEmailTemplate200Response) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *CreateOrUpdateEmailTemplate200Response) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *CreateOrUpdateEmailTemplate200Response) SetMessage(v string)`

SetMessage sets Message field to given value.

### HasMessage

`func (o *CreateOrUpdateEmailTemplate200Response) HasMessage() bool`

HasMessage returns a boolean if a field has been set.

### GetTemplate

`func (o *CreateOrUpdateEmailTemplate200Response) GetTemplate() EmailTemplate`

GetTemplate returns the Template field if non-nil, zero value otherwise.

### GetTemplateOk

`func (o *CreateOrUpdateEmailTemplate200Response) GetTemplateOk() (*EmailTemplate, bool)`

GetTemplateOk returns a tuple with the Template field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplate

`func (o *CreateOrUpdateEmailTemplate200Response) SetTemplate(v EmailTemplate)`

SetTemplate sets Template field to given value.

### HasTemplate

`func (o *CreateOrUpdateEmailTemplate200Response) HasTemplate() bool`

HasTemplate returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



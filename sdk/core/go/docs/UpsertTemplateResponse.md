# UpsertTemplateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** |  | 
**Template** | [**EmailTemplate**](EmailTemplate.md) |  | 

## Methods

### NewUpsertTemplateResponse

`func NewUpsertTemplateResponse(message string, template EmailTemplate, ) *UpsertTemplateResponse`

NewUpsertTemplateResponse instantiates a new UpsertTemplateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpsertTemplateResponseWithDefaults

`func NewUpsertTemplateResponseWithDefaults() *UpsertTemplateResponse`

NewUpsertTemplateResponseWithDefaults instantiates a new UpsertTemplateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *UpsertTemplateResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *UpsertTemplateResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *UpsertTemplateResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTemplate

`func (o *UpsertTemplateResponse) GetTemplate() EmailTemplate`

GetTemplate returns the Template field if non-nil, zero value otherwise.

### GetTemplateOk

`func (o *UpsertTemplateResponse) GetTemplateOk() (*EmailTemplate, bool)`

GetTemplateOk returns a tuple with the Template field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplate

`func (o *UpsertTemplateResponse) SetTemplate(v EmailTemplate)`

SetTemplate sets Template field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



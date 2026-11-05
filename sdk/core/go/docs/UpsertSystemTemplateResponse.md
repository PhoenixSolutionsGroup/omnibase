# UpsertSystemTemplateResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Message** | **string** |  | 
**Template** | [**EmailSystemTemplate**](EmailSystemTemplate.md) |  | 

## Methods

### NewUpsertSystemTemplateResponse

`func NewUpsertSystemTemplateResponse(message string, template EmailSystemTemplate, ) *UpsertSystemTemplateResponse`

NewUpsertSystemTemplateResponse instantiates a new UpsertSystemTemplateResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpsertSystemTemplateResponseWithDefaults

`func NewUpsertSystemTemplateResponseWithDefaults() *UpsertSystemTemplateResponse`

NewUpsertSystemTemplateResponseWithDefaults instantiates a new UpsertSystemTemplateResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetMessage

`func (o *UpsertSystemTemplateResponse) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *UpsertSystemTemplateResponse) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *UpsertSystemTemplateResponse) SetMessage(v string)`

SetMessage sets Message field to given value.


### GetTemplate

`func (o *UpsertSystemTemplateResponse) GetTemplate() EmailSystemTemplate`

GetTemplate returns the Template field if non-nil, zero value otherwise.

### GetTemplateOk

`func (o *UpsertSystemTemplateResponse) GetTemplateOk() (*EmailSystemTemplate, bool)`

GetTemplateOk returns a tuple with the Template field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplate

`func (o *UpsertSystemTemplateResponse) SetTemplate(v EmailSystemTemplate)`

SetTemplate sets Template field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



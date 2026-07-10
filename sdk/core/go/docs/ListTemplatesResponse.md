# ListTemplatesResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Count** | **int64** |  | 
**Templates** | [**[]EmailTemplate**](EmailTemplate.md) |  | 

## Methods

### NewListTemplatesResponse

`func NewListTemplatesResponse(count int64, templates []EmailTemplate, ) *ListTemplatesResponse`

NewListTemplatesResponse instantiates a new ListTemplatesResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListTemplatesResponseWithDefaults

`func NewListTemplatesResponseWithDefaults() *ListTemplatesResponse`

NewListTemplatesResponseWithDefaults instantiates a new ListTemplatesResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetCount

`func (o *ListTemplatesResponse) GetCount() int64`

GetCount returns the Count field if non-nil, zero value otherwise.

### GetCountOk

`func (o *ListTemplatesResponse) GetCountOk() (*int64, bool)`

GetCountOk returns a tuple with the Count field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCount

`func (o *ListTemplatesResponse) SetCount(v int64)`

SetCount sets Count field to given value.


### GetTemplates

`func (o *ListTemplatesResponse) GetTemplates() []EmailTemplate`

GetTemplates returns the Templates field if non-nil, zero value otherwise.

### GetTemplatesOk

`func (o *ListTemplatesResponse) GetTemplatesOk() (*[]EmailTemplate, bool)`

GetTemplatesOk returns a tuple with the Templates field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTemplates

`func (o *ListTemplatesResponse) SetTemplates(v []EmailTemplate)`

SetTemplates sets Templates field to given value.


### SetTemplatesNil

`func (o *ListTemplatesResponse) SetTemplatesNil(b bool)`

 SetTemplatesNil sets the value for Templates to be an explicit nil

### UnsetTemplates
`func (o *ListTemplatesResponse) UnsetTemplates()`

UnsetTemplates ensures that no value is present for Templates, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



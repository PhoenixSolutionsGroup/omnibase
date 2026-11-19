# UpsertSystemTemplateRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**HtmlBody** | **string** |  | 
**Name** | **string** |  | 
**PlaintextBody** | Pointer to **string** |  | [optional] 
**Subject** | **string** |  | 

## Methods

### NewUpsertSystemTemplateRequest

`func NewUpsertSystemTemplateRequest(htmlBody string, name string, subject string, ) *UpsertSystemTemplateRequest`

NewUpsertSystemTemplateRequest instantiates a new UpsertSystemTemplateRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewUpsertSystemTemplateRequestWithDefaults

`func NewUpsertSystemTemplateRequestWithDefaults() *UpsertSystemTemplateRequest`

NewUpsertSystemTemplateRequestWithDefaults instantiates a new UpsertSystemTemplateRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetHtmlBody

`func (o *UpsertSystemTemplateRequest) GetHtmlBody() string`

GetHtmlBody returns the HtmlBody field if non-nil, zero value otherwise.

### GetHtmlBodyOk

`func (o *UpsertSystemTemplateRequest) GetHtmlBodyOk() (*string, bool)`

GetHtmlBodyOk returns a tuple with the HtmlBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHtmlBody

`func (o *UpsertSystemTemplateRequest) SetHtmlBody(v string)`

SetHtmlBody sets HtmlBody field to given value.


### GetName

`func (o *UpsertSystemTemplateRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *UpsertSystemTemplateRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *UpsertSystemTemplateRequest) SetName(v string)`

SetName sets Name field to given value.


### GetPlaintextBody

`func (o *UpsertSystemTemplateRequest) GetPlaintextBody() string`

GetPlaintextBody returns the PlaintextBody field if non-nil, zero value otherwise.

### GetPlaintextBodyOk

`func (o *UpsertSystemTemplateRequest) GetPlaintextBodyOk() (*string, bool)`

GetPlaintextBodyOk returns a tuple with the PlaintextBody field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPlaintextBody

`func (o *UpsertSystemTemplateRequest) SetPlaintextBody(v string)`

SetPlaintextBody sets PlaintextBody field to given value.

### HasPlaintextBody

`func (o *UpsertSystemTemplateRequest) HasPlaintextBody() bool`

HasPlaintextBody returns a boolean if a field has been set.

### GetSubject

`func (o *UpsertSystemTemplateRequest) GetSubject() string`

GetSubject returns the Subject field if non-nil, zero value otherwise.

### GetSubjectOk

`func (o *UpsertSystemTemplateRequest) GetSubjectOk() (*string, bool)`

GetSubjectOk returns a tuple with the Subject field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubject

`func (o *UpsertSystemTemplateRequest) SetSubject(v string)`

SetSubject sets Subject field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)



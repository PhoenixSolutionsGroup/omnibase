package v1

import (
	"net/http"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	"api/tests/testenv"
)

func CreateInvoiceRaw(t *testing.T, client *sdk.APIClient, tenantID string, req sdk.CreateInvoiceRequest) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.CreateInvoice(helpers.Ctx()).
		XServiceKey(testenv.ServiceKey).
		XTenantId(tenantID).
		CreateInvoiceRequest(req).
		Execute()
	return out, resp, err
}

func GetInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.GetInvoice(helpers.Ctx(), invoiceID).
		XServiceKey(testenv.ServiceKey).
		Execute()
	return out, resp, err
}

func UpdateInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string, req sdk.UpdateInvoiceRequest) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.UpdateInvoice(helpers.Ctx(), invoiceID).
		XServiceKey(testenv.ServiceKey).
		UpdateInvoiceRequest(req).
		Execute()
	return out, resp, err
}

func AddInvoiceLineItemRaw(t *testing.T, client *sdk.APIClient, invoiceID, tenantID string, req sdk.AddInvoiceLineItemRequest) (*sdk.InvoiceLineItemResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.AddInvoiceLineItem(helpers.Ctx(), invoiceID).
		XServiceKey(testenv.ServiceKey).
		XTenantId(tenantID).
		AddInvoiceLineItemRequest(req).
		Execute()
	return out, resp, err
}

func FinalizeInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string, autoAdvance bool) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	req := sdk.FinalizeInvoiceRequest{AutoAdvance: &autoAdvance}
	out, resp, err := client.V1PaymentsAPI.FinalizeInvoice(helpers.Ctx(), invoiceID).
		XServiceKey(testenv.ServiceKey).
		FinalizeInvoiceRequest(req).
		Execute()
	return out, resp, err
}

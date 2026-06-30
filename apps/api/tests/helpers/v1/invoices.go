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
	out, resp, err := client.V1PaymentsAPI.CreateInvoice(helpers.CtxWithServiceKeyTenant(testenv.ServiceKey, tenantID)).
		CreateInvoiceRequest(req).
		Execute()
	return out, resp, err
}

func GetInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.GetInvoice(helpers.CtxWithServiceKey(testenv.ServiceKey), invoiceID).
		Execute()
	return out, resp, err
}

func UpdateInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string, req sdk.UpdateInvoiceRequest) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.UpdateInvoice(helpers.CtxWithServiceKey(testenv.ServiceKey), invoiceID).
		UpdateInvoiceRequest(req).
		Execute()
	return out, resp, err
}

func AddInvoiceLineItemRaw(t *testing.T, client *sdk.APIClient, invoiceID, tenantID string, req sdk.AddLineItemRequest) (*sdk.InvoiceLineItemResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1PaymentsAPI.AddInvoiceLineItem(helpers.CtxWithServiceKeyTenant(testenv.ServiceKey, tenantID), invoiceID).
		AddLineItemRequest(req).
		Execute()
	return out, resp, err
}

func FinalizeInvoiceRaw(t *testing.T, client *sdk.APIClient, invoiceID string, autoAdvance bool) (*sdk.InvoiceResponse, *http.Response, error) {
	t.Helper()
	req := sdk.FinalizeRequest{AutoAdvance: &autoAdvance}
	out, resp, err := client.V1PaymentsAPI.FinalizeInvoice(helpers.CtxWithServiceKey(testenv.ServiceKey), invoiceID).
		FinalizeRequest(req).
		Execute()
	return out, resp, err
}

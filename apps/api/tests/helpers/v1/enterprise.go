package v1

import (
	"net/http"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func GetEnterprisePricesByTemplateRaw(t *testing.T, client *sdk.APIClient, template string) (*sdk.EnterprisePricesResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1StripeAPI.GetEnterprisePricesByTemplate(helpers.Ctx(), template).Execute()
	return out, resp, err
}

func GetEnterprisePricesByIDRaw(t *testing.T, client *sdk.APIClient, enterpriseID string) (*sdk.EnterprisePricesResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1StripeAPI.GetEnterprisePricesByID(helpers.Ctx(), enterpriseID).Execute()
	return out, resp, err
}

func ApplyEnterpriseTemplateRaw(t *testing.T, client *sdk.APIClient, tenantID, template string) (*sdk.EnterpriseApplyResponse, *http.Response, error) {
	t.Helper()
	req := sdk.ApplyEnterpriseTemplateRequest{TenantId: tenantID, EnterpriseTemplate: template}
	out, resp, err := client.V1StripeAPI.ApplyEnterpriseTemplate(helpers.Ctx()).
		ApplyEnterpriseTemplateRequest(req).
		Execute()
	return out, resp, err
}

func ApplyEnterpriseCustomRaw(t *testing.T, client *sdk.APIClient, tenantID, enterpriseID string) (*sdk.EnterpriseApplyResponse, *http.Response, error) {
	t.Helper()
	req := sdk.ApplyEnterpriseCustomRequest{TenantId: tenantID, EnterpriseId: enterpriseID}
	out, resp, err := client.V1StripeAPI.ApplyEnterpriseCustom(helpers.Ctx()).
		ApplyEnterpriseCustomRequest(req).
		Execute()
	return out, resp, err
}

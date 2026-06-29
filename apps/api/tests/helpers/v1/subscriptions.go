package v1

import (
	"net/http"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func ListTenantSubscriptionsRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) ([]sdk.SubscriptionResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.ListTenantSubscriptions(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return out, resp, err
}

func GetTenantSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, configPriceID string) (*sdk.SubscriptionResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.GetTenantSubscription(helpers.Ctx(), configPriceID).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return out, resp, err
}

func AddSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, planID string) (*sdk.AddSubscriptionResponse, *http.Response, error) {
	t.Helper()
	req := sdk.AddSubscriptionRequest{PlanId: planID}
	out, resp, err := client.V1TenantsAPI.AddSubscription(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		AddSubscriptionRequest(req).
		Execute()
	return out, resp, err
}

func RemoveSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, planID string) (*sdk.RemoveSubscriptionResponse, *http.Response, error) {
	t.Helper()
	req := sdk.RemoveSubscriptionRequest{PlanId: planID}
	out, resp, err := client.V1TenantsAPI.RemoveSubscription(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		RemoveSubscriptionRequest(req).
		Execute()
	return out, resp, err
}

func GetBillingStatusRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*sdk.GetTenantBillingStatus200Response, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.GetTenantBillingStatus(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return out, resp, err
}

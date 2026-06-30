package v1

import (
	"net/http"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func ListTenantSubscriptionsRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) ([]sdk.SubscriptionResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsSubscriptionsAPI.ListTenantSubscriptions(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	return out, resp, err
}

func GetTenantSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, configPriceID string) (*sdk.SubscriptionResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsSubscriptionsAPI.GetTenantSubscription(helpers.CtxWithUserTenant(userID, tenantID), configPriceID).
		Execute()
	return out, resp, err
}

func AddSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, planID string) (*sdk.AddResponse, *http.Response, error) {
	t.Helper()
	req := sdk.AddRequest{PlanId: planID}
	out, resp, err := client.V1TenantsSubscriptionsAPI.AddSubscription(helpers.CtxWithUserTenant(userID, tenantID)).
		AddRequest(req).
		Execute()
	return out, resp, err
}

func RemoveSubscriptionRaw(t *testing.T, client *sdk.APIClient, userID, tenantID, planID string) (*sdk.RemoveResponse, *http.Response, error) {
	t.Helper()
	req := sdk.RemoveRequest{PlanId: planID}
	out, resp, err := client.V1TenantsSubscriptionsAPI.RemoveSubscription(helpers.CtxWithUserTenant(userID, tenantID)).
		RemoveRequest(req).
		Execute()
	return out, resp, err
}

func GetBillingStatusRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*sdk.BillingStatusResponse, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsSubscriptionsAPI.GetTenantBillingStatus(helpers.CtxWithUserTenant(userID, tenantID)).
		Execute()
	return out, resp, err
}

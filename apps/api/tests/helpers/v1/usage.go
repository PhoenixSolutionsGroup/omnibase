package v1

import (
	"net/http"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func RecordUsageRaw(t *testing.T, client *sdk.APIClient, tenantID, meterEventName, value string) (interface{}, *http.Response, error) {
	t.Helper()
	req := sdk.RecordUsageRequest{MeterEventName: meterEventName, Value: value}
	out, resp, err := client.V1PaymentsAPI.RecordUsage(helpers.CtxWithTenant(tenantID)).
		RecordUsageRequest(req).
		Execute()
	return out, resp, err
}

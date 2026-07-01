package perf_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync/atomic"
	"testing"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"
	"github.com/stretchr/testify/require"
	vegeta "github.com/tsenart/vegeta/v12/lib"

	"api/tests/helpers"
	"api/tests/perf"
	"api/tests/testenv"
)

func TestStress_ListTenants(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, 20)
	seedStressTenants(t, client, users)

	var i uint64
	tgt := func(tgt *vegeta.Target) error {
		n := atomic.AddUint64(&i, 1)
		user := users[int(n)%len(users)]
		tgt.Method = http.MethodGet
		tgt.URL = apiURL + "/api/v1/auth/tenants"
		tgt.Header = http.Header{
			"X-Service-Key": {testenv.ServiceKey},
			"X-User-Id":     {user.ID},
		}
		return nil
	}

	perf.Stress(t, "listTenants", tgt, perf.DefaultRamp())
}

func TestStress_CreateTenant(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, 20)

	var i uint64
	tgt := func(tgt *vegeta.Target) error {
		n := atomic.AddUint64(&i, 1)
		user := users[int(n)%len(users)]
		body, _ := json.Marshal(map[string]any{
			"name":          fmt.Sprintf("stress-tenant-%d", n),
			"billing_email": user.Email,
			"type":          "organization",
		})
		tgt.Method = http.MethodPost
		tgt.URL = apiURL + "/api/v1/tenants"
		tgt.Body = body
		tgt.Header = http.Header{
			"Content-Type":  {"application/json"},
			"X-Service-Key": {testenv.ServiceKey},
			"X-User-Id":     {user.ID},
		}
		return nil
	}

	perf.Stress(t, "createTenant", tgt, perf.DefaultRamp())
}

func TestStress_KratosCreateUser(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	_ = testenv.NewSDKClient(t)

	baseID := helpers.UniqueID()
	var i uint64
	tgt := func(tgt *vegeta.Target) error {
		n := atomic.AddUint64(&i, 1)
		body, _ := json.Marshal(map[string]any{
			"email":    fmt.Sprintf("stress-user-%s-%d@example.com", baseID, n),
			"password": "StressPass1!",
			"name":     map[string]any{"first": "Stress", "last": "User"},
		})
		tgt.Method = http.MethodPost
		tgt.URL = apiURL + "/api/v1/auth/users"
		tgt.Body = body
		tgt.Header = http.Header{
			"Content-Type":  {"application/json"},
			"X-Service-Key": {testenv.ServiceKey},
		}
		return nil
	}

	// Argon2 is intentionally slow. Cap ramp lower + longer step to see degradation.
	profile := perf.RampProfile{
		Rates:   []int{1, 5, 10, 20, 50, 100},
		StepDur: perf.DefaultRamp().StepDur,
		StopAt:  perf.DefaultRamp().StopAt,
	}
	perf.Stress(t, "kratosCreateUser", tgt, profile)
}

func TestStress_PermissionsCheck(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, 20)
	tenants := seedStressTenantsWithIDs(t, client, users)

	var i uint64
	tgt := func(tgt *vegeta.Target) error {
		n := atomic.AddUint64(&i, 1)
		pair := tenants[int(n)%len(tenants)]
		body, _ := json.Marshal(map[string]any{
			"namespace": "Tenant",
			"object":    pair.TenantID,
			"relation":  "delete_tenant",
			"subject_set": map[string]any{
				"namespace": "User",
				"object":    pair.UserID,
				"relation":  "",
			},
		})
		tgt.Method = http.MethodPost
		tgt.URL = apiURL + "/api/v1/permissions/check"
		tgt.Body = body
		tgt.Header = http.Header{
			"Content-Type":  {"application/json"},
			"X-Service-Key": {testenv.ServiceKey},
			"X-User-Id":     {pair.UserID},
			"X-Tenant-Id":   {pair.TenantID},
		}
		return nil
	}

	perf.Stress(t, "permissionsCheck", tgt, perf.DefaultRamp())
}

func seedStressTenants(t *testing.T, client *sdk.APIClient, users []perf.User) {
	t.Helper()
	for i, u := range users {
		req := sdk.CreateTenantRequest{
			Name:         fmt.Sprintf("stress-seed-%d", i),
			BillingEmail: u.Email,
			Type:         "organization",
		}
		_, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(u.ID)).
			CreateTenantRequest(req).Execute()
		require.NoError(t, err, "seed tenant %d", i)
		require.NotNil(t, resp)
	}
}

type stressPair struct {
	UserID   string
	TenantID string
}

func seedStressTenantsWithIDs(t *testing.T, client *sdk.APIClient, users []perf.User) []stressPair {
	t.Helper()
	pairs := make([]stressPair, 0, len(users))
	for i, u := range users {
		req := sdk.CreateTenantRequest{
			Name:         fmt.Sprintf("stress-check-%d", i),
			BillingEmail: u.Email,
			Type:         "organization",
		}
		out, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(u.ID)).
			CreateTenantRequest(req).Execute()
		require.NoError(t, err, "seed tenant %d", i)
		require.NotNil(t, resp)
		require.NotNil(t, out)
		require.NotNil(t, out.Tenant)
		pairs = append(pairs, stressPair{UserID: u.ID, TenantID: out.Tenant.Id})
	}
	return pairs
}

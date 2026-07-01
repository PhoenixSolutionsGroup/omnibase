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

const userPoolSize = 20

func TestPerf_TenantLifecycle(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, userPoolSize)
	tenants := preCreateTenants(t, client, users)

	t.Run("createTenant", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			user := users[int(n)%len(users)]
			body, _ := json.Marshal(map[string]any{
				"name":          fmt.Sprintf("Perf-%d", n),
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
		perf.Attack(t, "createTenant", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("listTenantUsers", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			pair := tenants[int(n)%len(tenants)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/tenants/users"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {pair.UserID},
				"X-Tenant-Id":   {pair.TenantID},
			}
			return nil
		}
		perf.Attack(t, "listTenantUsers", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("getTenantJWT", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			pair := tenants[int(n)%len(tenants)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/tenants/jwt"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {pair.UserID},
				"X-Tenant-Id":   {pair.TenantID},
			}
			return nil
		}
		perf.Attack(t, "getTenantJWT", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("listTenants", func(t *testing.T) {
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
		perf.Attack(t, "listTenants", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})
}

type userTenant struct {
	UserID   string
	TenantID string
}

func preCreateTenants(t *testing.T, client *sdk.APIClient, users []perf.User) []userTenant {
	t.Helper()
	tenants := make([]userTenant, 0, len(users))
	for i, u := range users {
		req := sdk.CreateTenantRequest{
			Name:         fmt.Sprintf("perf-seed-%d", i),
			BillingEmail: u.Email,
			Type:         "organization",
		}
		out, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(u.ID)).
			CreateTenantRequest(req).Execute()
		require.NoError(t, err, "seed tenant %d", i)
		require.NotNil(t, resp)
		require.NotNil(t, out)
		require.NotNil(t, out.Tenant)
		tenants = append(tenants, userTenant{UserID: u.ID, TenantID: out.Tenant.Id})
	}
	return tenants
}

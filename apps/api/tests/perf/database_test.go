package perf_test

import (
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

func TestPerf_DatabaseConnections(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, userPoolSize)
	seeds := seedDBTenants(t, client, users)

	t.Run("listTenantUsers", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/tenants/users"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "listTenantUsers", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("listTenants", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/auth/tenants"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
			}
			return nil
		}
		perf.Attack(t, "listTenants", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("getTenantJWT", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/tenants/jwt"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "getTenantJWT", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})
}

type dbSeed struct {
	UserID   string
	TenantID string
}

func seedDBTenants(t *testing.T, client *sdk.APIClient, users []perf.User) []dbSeed {
	t.Helper()
	seeds := make([]dbSeed, 0, len(users))
	for i, u := range users {
		req := sdk.CreateTenantRequest{
			Name:         fmt.Sprintf("perf-db-seed-%d", i),
			BillingEmail: u.Email,
			Type:         "organization",
		}
		out, resp, err := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(u.ID)).
			CreateTenantRequest(req).Execute()
		require.NoError(t, err, "seed tenant %d", i)
		require.NotNil(t, resp)
		require.NotNil(t, out)
		require.NotNil(t, out.Tenant)
		seeds = append(seeds, dbSeed{UserID: u.ID, TenantID: out.Tenant.Id})
	}
	return seeds
}

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

func TestPerf_Permissions(t *testing.T) {
	perf.RequirePerf(t)
	env := testenv.Start(t)
	apiURL := testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	users := perf.CreateUserPool(t, client, userPoolSize)
	seeds := preCreateTenantRoles(t, client, users)

	t.Run("checkPermission", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			body, _ := json.Marshal(map[string]any{
				"namespace": "Tenant",
				"object":    seed.TenantID,
				"relation":  "delete_tenant",
				"subject_set": map[string]any{
					"namespace": "User",
					"object":    seed.UserID,
					"relation":  "",
				},
			})
			tgt.Method = http.MethodPost
			tgt.URL = apiURL + "/api/v1/permissions/check"
			tgt.Body = body
			tgt.Header = http.Header{
				"Content-Type":  {"application/json"},
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "checkPermission", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("createRole", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			body, _ := json.Marshal(map[string]any{
				"role_name":   fmt.Sprintf("perf-role-%d", n),
				"permissions": []string{"Tenant#view_users"},
			})
			tgt.Method = http.MethodPost
			tgt.URL = apiURL + "/api/v1/tenants/roles"
			tgt.Body = body
			tgt.Header = http.Header{
				"Content-Type":  {"application/json"},
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "createRole", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("updateRole", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			body, _ := json.Marshal(map[string]any{
				"permissions": []string{"Tenant#view_users", "Tenant#invite_user"},
			})
			tgt.Method = http.MethodPut
			tgt.URL = fmt.Sprintf("%s/api/v1/tenants/roles/%s", apiURL, seed.RoleID)
			tgt.Body = body
			tgt.Header = http.Header{
				"Content-Type":  {"application/json"},
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "updateRole", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})

	t.Run("listRoles", func(t *testing.T) {
		var i uint64
		tgt := func(tgt *vegeta.Target) error {
			n := atomic.AddUint64(&i, 1)
			seed := seeds[int(n)%len(seeds)]
			tgt.Method = http.MethodGet
			tgt.URL = apiURL + "/api/v1/tenants/roles"
			tgt.Header = http.Header{
				"X-Service-Key": {testenv.ServiceKey},
				"X-User-Id":     {seed.UserID},
				"X-Tenant-Id":   {seed.TenantID},
			}
			return nil
		}
		perf.Attack(t, "listRoles", tgt, perf.Thresholds{MaxErrorRate: 0.01})
	})
}

type userTenantRole struct {
	UserID   string
	TenantID string
	RoleID   string
}

func preCreateTenantRoles(t *testing.T, client *sdk.APIClient, users []perf.User) []userTenantRole {
	t.Helper()
	seeds := make([]userTenantRole, 0, len(users))
	for i, u := range users {
		tReq := sdk.CreateTenantRequest{
			Name:         fmt.Sprintf("perf-perm-seed-%d", i),
			BillingEmail: u.Email,
			Type:         "organization",
		}
		tOut, tResp, tErr := client.V1TenantsLifecycleAPI.CreateTenant(helpers.CtxWithUser(u.ID)).
			CreateTenantRequest(tReq).Execute()
		require.NoError(t, tErr, "seed tenant %d", i)
		require.NotNil(t, tResp)
		require.NotNil(t, tOut)
		require.NotNil(t, tOut.Tenant)

		rReq := sdk.CreateRoleRequest{
			RoleName:    fmt.Sprintf("perf-seed-role-%d", i),
			Permissions: []string{"Tenant#view_users"},
		}
		rOut, rResp, rErr := client.V1TenantsRolesAPI.CreateRole(helpers.CtxWithUserTenant(u.ID, tOut.Tenant.Id)).
			CreateRoleRequest(rReq).Execute()
		require.NoError(t, rErr, "seed role %d", i)
		require.NotNil(t, rResp)
		require.NotNil(t, rOut)
		require.NotEmpty(t, rOut.Id)

		seeds = append(seeds, userTenantRole{
			UserID:   u.ID,
			TenantID: tOut.Tenant.Id,
			RoleID:   rOut.Id,
		})
	}
	return seeds
}

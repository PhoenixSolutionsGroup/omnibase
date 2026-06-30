package roles_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRolesList(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-list-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Roles List "+id, ownerEmail).Tenant

	t.Run("system roles seeded", func(t *testing.T) {
		roles := h.ListRoles(t, client, tenant.Id)
		names := roleNames(roles)
		assert.Contains(t, names, "owner")
		assert.Contains(t, names, "admin")
		assert.Contains(t, names, "member")
	})

	customName := fmt.Sprintf("custom_role_%s", id)
	h.CreateRole(t, client, ownerID, tenant.Id, customName, []string{"tenant#view_users"})

	t.Run("custom role appears in list", func(t *testing.T) {
		roles := h.ListRoles(t, client, tenant.Id)
		assert.Contains(t, roleNames(roles), customName)
	})
}

func roleNames(roles []sdk.ListRolesByTenantRow) []string {
	out := make([]string, 0, len(roles))
	for _, r := range roles {
		out = append(out, r.RoleName)
	}
	return out
}

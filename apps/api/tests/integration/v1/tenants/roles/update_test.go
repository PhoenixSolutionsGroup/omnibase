package roles_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRolesUpdate(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-update-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Roles Update "+id, ownerEmail).Tenant

	customName := fmt.Sprintf("custom_role_%s", id)
	role := h.CreateRole(t, client, ownerID, tenant.Id, customName, []string{"tenant#view_users"})

	updated := []string{
		"tenant:projects#view",
		"tenant:projects#create",
		"tenant:projects#edit",
		"tenant:projects#delete",
	}
	out := h.UpdateRole(t, client, ownerID, tenant.Id, role.Id, updated)

	t.Run("update replaces permissions", func(t *testing.T) {
		assert.ElementsMatch(t, updated, out.Permissions)
	})

	t.Run("updated permissions visible in list", func(t *testing.T) {
		roles := h.ListRoles(t, client, tenant.Id)
		var found []string
		for _, r := range roles {
			if r.RoleName == customName {
				found = r.Permissions
			}
		}
		require.NotNil(t, found)
		assert.ElementsMatch(t, updated, found)
	})
}

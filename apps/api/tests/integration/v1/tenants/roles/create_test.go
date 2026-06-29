package roles_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRolesCreate(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-create-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Roles Create "+id, ownerEmail).Tenant

	customName := fmt.Sprintf("custom_role_%s", id)
	customPerms := []string{"tenant#view_users", "tenant#invite_user"}
	role := h.CreateRole(t, client, ownerID, tenant.Id, customName, customPerms)

	t.Run("created role has name + permissions", func(t *testing.T) {
		assert.Equal(t, customName, role.RoleName)
		assert.ElementsMatch(t, customPerms, role.Permissions)
	})

	t.Run("created role appears in list", func(t *testing.T) {
		roles := h.ListRoles(t, client, tenant.Id)
		assert.Contains(t, roleNames(roles), customName)
	})
}

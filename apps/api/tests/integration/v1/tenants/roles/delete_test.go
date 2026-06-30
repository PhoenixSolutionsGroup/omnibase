package roles_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"

	"api/tests/helpers"
	h "api/tests/helpers/v1"
	"api/tests/testenv"
)

func TestRolesDelete(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	client := testenv.NewSDKClient(t)

	id := helpers.UniqueID()
	ownerEmail := fmt.Sprintf("owner-delete-%s@example.com", id)
	pw := fmt.Sprintf("pwd-%s-aZ09!", id)

	ownerID := h.CreateUser(t, client, ownerEmail, pw)
	tenant := h.CreateTenant(t, client, ownerID, "Roles Delete "+id, ownerEmail).Tenant

	customName := fmt.Sprintf("custom_role_%s", id)
	role := h.CreateRole(t, client, ownerID, tenant.Id, customName, []string{"tenant#view_users"})

	h.DeleteRole(t, client, ownerID, tenant.Id, role.Id)

	t.Run("deleted role no longer in list", func(t *testing.T) {
		roles := h.ListRoles(t, client, tenant.Id)
		assert.NotContains(t, roleNames(roles), customName)
	})
}

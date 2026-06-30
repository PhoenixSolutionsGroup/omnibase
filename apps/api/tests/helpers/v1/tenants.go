package v1

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	sdk "github.com/phoenixsolutionsgroup/omnibase/sdk/core/go"

	"api/tests/helpers"
)

func CreateTenant(t *testing.T, client *sdk.APIClient, userID, name, billingEmail string) *sdk.CreateTenantResponse {
	t.Helper()
	tenantType := "organization"
	req := sdk.CreateTenantRequest{
		Name:         name,
		BillingEmail: &billingEmail,
		Type:         &tenantType,
	}
	out, resp, err := client.V1TenantsAPI.CreateTenant(helpers.Ctx()).
		XUserId(userID).
		CreateTenantRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createTenant")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Tenant.Id)
	return out
}

func CreateInvite(t *testing.T, client *sdk.APIClient, ownerID, tenantID, email, role string) *sdk.TenantInvite {
	t.Helper()
	req := sdk.CreateTenantUserInviteRequest{
		Email:     email,
		Role:      role,
		InviteUrl: "http://localhost:3000/accept-invite",
	}
	out, resp, err := client.V1TenantsAPI.CreateInvite(helpers.Ctx()).
		XUserId(ownerID).
		XTenantId(tenantID).
		CreateTenantUserInviteRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createInvite")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Invite.Token)
	return &out.Invite
}

func CreateInviteRaw(t *testing.T, client *sdk.APIClient, callerUserID, tenantID, email, role string) (*http.Response, error) {
	t.Helper()
	req := sdk.CreateTenantUserInviteRequest{
		Email:     email,
		Role:      role,
		InviteUrl: "http://localhost:3000/accept-invite",
	}
	_, resp, err := client.V1TenantsAPI.CreateInvite(helpers.Ctx()).
		XUserId(callerUserID).
		XTenantId(tenantID).
		CreateTenantUserInviteRequest(req).
		Execute()
	return resp, err
}

func AcceptInvite(t *testing.T, client *sdk.APIClient, userID, token string) *sdk.AcceptInviteResponse {
	t.Helper()
	req := sdk.AcceptInviteRequest{Token: token}
	out, resp, err := client.V1TenantsAPI.AcceptInvite(helpers.Ctx()).
		XUserId(userID).
		AcceptInviteRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "acceptInvite")
	require.NotNil(t, out)
	return out
}

func AcceptInviteRaw(t *testing.T, client *sdk.APIClient, userID, token string) (*http.Response, error) {
	t.Helper()
	req := sdk.AcceptInviteRequest{Token: token}
	_, resp, err := client.V1TenantsAPI.AcceptInvite(helpers.Ctx()).
		XUserId(userID).
		AcceptInviteRequest(req).
		Execute()
	return resp, err
}

func ListTenantUsers(t *testing.T, client *sdk.APIClient, userID, tenantID string) []sdk.TenantUserResponse {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.ListTenantUsers(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	helpers.EnsureOK(t, resp, err, "listTenantUsers")
	return out
}

func ListTenantUsersRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	_, resp, err := client.V1TenantsAPI.ListTenantUsers(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return resp, err
}

func ListUserTenants(t *testing.T, client *sdk.APIClient, userID string) []sdk.UserTenantListItem {
	t.Helper()
	out, resp, err := client.V1AuthAPI.ListTenants(helpers.Ctx()).
		XUserId(userID).
		Execute()
	helpers.EnsureOK(t, resp, err, "listTenants")
	require.NotNil(t, out)
	return out.Tenants
}

func GetTenantJWT(t *testing.T, client *sdk.APIClient, userID, tenantID string) string {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.GetTenantJWT(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	helpers.EnsureOK(t, resp, err, "getTenantJWT")
	require.NotNil(t, out)
	return out.Token
}

func GetTenantJWTRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	_, resp, err := client.V1TenantsAPI.GetTenantJWT(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return resp, err
}

func SwitchActiveTenant(t *testing.T, client *sdk.APIClient, userID, tenantID string) string {
	t.Helper()
	req := sdk.SwitchTenantRequest{TenantId: tenantID}
	out, resp, err := client.V1TenantsAPI.SwitchActiveTenant(helpers.Ctx()).
		XUserId(userID).
		SwitchTenantRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "switchActiveTenant")
	require.NotNil(t, out)
	return out.Token
}

func SwitchActiveTenantRaw(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	req := sdk.SwitchTenantRequest{TenantId: tenantID}
	_, resp, err := client.V1TenantsAPI.SwitchActiveTenant(helpers.Ctx()).
		XUserId(userID).
		SwitchTenantRequest(req).
		Execute()
	return resp, err
}

func DeleteTenant(t *testing.T, client *sdk.APIClient, userID, tenantID string) (*http.Response, error) {
	t.Helper()
	resp, err := client.V1TenantsAPI.DeleteTenant(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	return resp, err
}

func ListRoles(t *testing.T, client *sdk.APIClient, tenantID string) []sdk.Role {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.ListRoles(helpers.Ctx()).
		XTenantId(tenantID).
		Execute()
	helpers.EnsureOK(t, resp, err, "listRoles")
	return out
}

func CreateRole(t *testing.T, client *sdk.APIClient, userID, tenantID, name string, permissions []string) *sdk.Role {
	t.Helper()
	req := sdk.CreateRoleRequest{RoleName: name, Permissions: permissions}
	out, resp, err := client.V1TenantsAPI.CreateRole(helpers.Ctx()).
		XUserId(userID).
		XTenantId(tenantID).
		CreateRoleRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "createRole")
	require.NotNil(t, out)
	require.NotEmpty(t, out.Id)
	return out
}

func UpdateRole(t *testing.T, client *sdk.APIClient, userID, tenantID, roleID string, permissions []string) *sdk.Role {
	t.Helper()
	req := sdk.UpdateRoleRequest{Permissions: permissions}
	out, resp, err := client.V1TenantsAPI.UpdateRole(helpers.Ctx(), roleID).
		XUserId(userID).
		XTenantId(tenantID).
		UpdateRoleRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "updateRole")
	require.NotNil(t, out)
	return out
}

func DeleteRole(t *testing.T, client *sdk.APIClient, userID, tenantID, roleID string) {
	t.Helper()
	resp, err := client.V1TenantsAPI.DeleteRole(helpers.Ctx(), roleID).
		XUserId(userID).
		XTenantId(tenantID).
		Execute()
	helpers.EnsureOK(t, resp, err, "deleteRole")
}

func UpdateTenantUserRole(t *testing.T, client *sdk.APIClient, ownerID, tenantID, targetUserID, role string) (*http.Response, error) {
	t.Helper()
	req := sdk.UpdateTenantUserRoleRequest{UserId: targetUserID, Role: role}
	resp, err := client.V1TenantsAPI.UpdateTenantUserRole(helpers.Ctx()).
		XUserId(ownerID).
		XTenantId(tenantID).
		UpdateTenantUserRoleRequest(req).
		Execute()
	return resp, err
}

func RemoveTenantUser(t *testing.T, client *sdk.APIClient, callerUserID, tenantID, targetUserID string) (*http.Response, error) {
	t.Helper()
	req := sdk.DeleteTenantUserRequest{UserId: targetUserID}
	resp, err := client.V1TenantsAPI.RemoveTenantUser(helpers.Ctx()).
		XUserId(callerUserID).
		XTenantId(tenantID).
		DeleteTenantUserRequest(req).
		Execute()
	return resp, err
}

func GetTenantByID(t *testing.T, client *sdk.APIClient, tenantID string) (*sdk.Tenant, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.GetTenantByID(helpers.Ctx(), tenantID).Execute()
	if err != nil || out == nil {
		return nil, resp, err
	}
	return out, resp, nil
}

func GetTenantByStripeCustomerID(t *testing.T, client *sdk.APIClient, stripeCustomerID string) (*sdk.Tenant, *http.Response, error) {
	t.Helper()
	out, resp, err := client.V1TenantsAPI.GetTenantByStripeCustomerID(helpers.Ctx(), stripeCustomerID).Execute()
	if err != nil || out == nil {
		return nil, resp, err
	}
	return out, resp, nil
}

func CheckTenantPermission(t *testing.T, client *sdk.APIClient, tenantID, relation, subjUserID string) bool {
	t.Helper()
	req := sdk.CheckPermissionRequest{
		Namespace: "Tenant",
		Object:    tenantID,
		Relation:  relation,
		SubjectSet: sdk.SubjectSetRequest{
			Namespace: "User",
			Object:    subjUserID,
		},
	}
	out, resp, err := client.V1PermissionsAPI.CheckPermission(helpers.Ctx()).
		CheckPermissionRequest(req).
		Execute()
	helpers.EnsureOK(t, resp, err, "checkPermission")
	require.NotNil(t, out)
	return out.Allowed
}

package v1

import (
	"net/http"

	"api/internal/config"
	"api/internal/database"
	"api/internal/database/repository"
	tenantsh "api/internal/handlers/v1/tenants"
	"api/internal/handlers/v1/tenants/invites"
	"api/internal/handlers/v1/tenants/lifecycle"
	"api/internal/handlers/v1/tenants/roles"
	"api/internal/handlers/v1/tenants/subscriptions"
	"api/internal/handlers/v1/tenants/users"
	"api/internal/logger"
	"api/internal/middleware"
	"api/internal/services/auth"
	"api/internal/services/billing"
	"api/internal/services/email"
	"api/internal/services/permissions"
	"api/internal/services/permissions/rbac"
	"api/internal/services/stripe_client"
	"api/internal/services/tenants"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"
)

func SetUpTenantRoutes(_ *gin.RouterGroup, api huma.API) {
	logger.Logger.Info("Initializing tenant routes")
	cfg := config.New()

	pool, err := database.GetPool(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get pgx pool", "error", err)
		panic(err)
	}
	repo := repository.New(pool)
	perms := permissions.New(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)
	authSvc := auth.New(auth.Deps{AdminURL: cfg.AuthConfig.AuthAdminURL})
	tenantsSvc := tenants.New(tenants.Deps{Repo: repo, Auth: authSvc, SigningKey: cfg.Database.SigningKey})
	rbacSvc := rbac.New(rbac.Deps{Repo: repo, Perms: perms})
	emailSvc, err := email.New(email.Deps{
		Repo:          repo,
		ConnectionURI: cfg.SMTPConfig.ConnectionURI,
		DefaultFrom:   cfg.SMTPConfig.FromEmail,
	})
	if err != nil {
		logger.Logger.Error("Failed to initialize email service", "error", err)
		panic(err)
	}

	tenantHandler := tenantsh.New(cfg)
	rolesHandler := roles.New(roles.Deps{Repo: repo, Perms: perms})
	usersHandler := users.New(users.Deps{
		Repo:    repo,
		Perms:   perms,
		Auth:    authSvc,
		RBAC:    rbacSvc,
		Tenants: tenantsSvc,
	})
	invitesHandler := invites.New(invites.Deps{
		Repo:    repo,
		Perms:   perms,
		Auth:    authSvc,
		RBAC:    rbacSvc,
		Tenants: tenantsSvc,
		Email:   emailSvc,
	})
	stripeClient := stripe_client.New(cfg.StripeConfig)
	billingSvc := billing.New(billing.Deps{
		Repo:   repo,
		Stripe: stripeClient,
		FeePct: cfg.StripeConfig.PlatformFeePercent,
	})
	lifecycleHandler := lifecycle.New(lifecycle.Deps{
		Repo:    repo,
		Tenants: tenantsSvc,
		Billing: billingSvc,
		RBAC:    rbacSvc,
		Perms:   perms,
		Auth:    authSvc,
	})
	subscriptionsHandler := subscriptions.New(subscriptions.Deps{
		Repo:    repo,
		Billing: billingSvc,
	})
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	serviceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireServiceKey()),
	}
	sessionOrServiceMW := huma.Middlewares{
		middleware.GinToHuma(authMiddleware.RequireAuthHeaders(), authMiddleware.RequireSessionOrServiceKey()),
	}
	serviceSec := []map[string][]string{{"ServiceKeyAuth": {}}}
	sessionOrServiceSec := []map[string][]string{{"SessionTokenAuth": {}}, {"CookieAuth": {}}, {"ServiceKeyAuth": {}}}

	lifecycleTag := []string{"V1TenantsLifecycle"}
	invitesTag := []string{"V1TenantsInvites"}
	rolesTag := []string{"V1TenantsRoles"}
	usersTag := []string{"V1TenantsUsers"}
	subsTag := []string{"V1TenantsSubscriptions"}

	huma.Register(api, huma.Operation{
		OperationID: "getTenantByID", Method: http.MethodGet, Path: "/api/v1/tenants/by-id/{tenant_id}",
		Summary: "Get tenant by ID", Tags: lifecycleTag, Security: serviceSec, Middlewares: serviceMW,
	}, tenantHandler.GetTenantByID)

	huma.Register(api, huma.Operation{
		OperationID: "getTenantByStripeCustomerID", Method: http.MethodGet, Path: "/api/v1/tenants/by-stripe-customer/{stripe_customer_id}",
		Summary: "Get tenant by Stripe customer ID", Tags: lifecycleTag, Security: serviceSec, Middlewares: serviceMW,
	}, tenantHandler.GetTenantByStripeCustomerID)

	huma.Register(api, huma.Operation{
		OperationID: "createTenant", Method: http.MethodPost, Path: "/api/v1/tenants",
		Summary: "Create a tenant", Tags: lifecycleTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, lifecycleHandler.CreateTenant)

	huma.Register(api, huma.Operation{
		OperationID: "deleteTenant", Method: http.MethodDelete, Path: "/api/v1/tenants",
		Summary: "Delete the current tenant", Tags: lifecycleTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, lifecycleHandler.DeleteTenant)

	huma.Register(api, huma.Operation{
		OperationID: "getTenantJWT", Method: http.MethodGet, Path: "/api/v1/tenants/jwt",
		Summary: "Get JWT for the current tenant", Tags: lifecycleTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, lifecycleHandler.GetJWT)

	huma.Register(api, huma.Operation{
		OperationID: "switchActiveTenant", Method: http.MethodPut, Path: "/api/v1/tenants/switch-active",
		Summary: "Switch the active tenant", Tags: lifecycleTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, lifecycleHandler.SwitchActive)

	huma.Register(api, huma.Operation{
		OperationID: "createInvite", Method: http.MethodPost, Path: "/api/v1/tenants/invites",
		Summary: "Create a tenant invite", Tags: invitesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, invitesHandler.Create)

	huma.Register(api, huma.Operation{
		OperationID: "acceptInvite", Method: http.MethodPut, Path: "/api/v1/tenants/invites/accept",
		Summary: "Accept a tenant invite", Tags: invitesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, invitesHandler.Accept)

	huma.Register(api, huma.Operation{
		OperationID: "listRoles", Method: http.MethodGet, Path: "/api/v1/tenants/roles",
		Summary: "List roles for the tenant", Tags: rolesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, rolesHandler.ListRoles)

	huma.Register(api, huma.Operation{
		OperationID: "listRoleDefinitions", Method: http.MethodGet, Path: "/api/v1/tenants/roles/definitions",
		Summary: "List role definitions", Tags: rolesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, rolesHandler.ListDefinitions)

	huma.Register(api, huma.Operation{
		OperationID: "createRole", Method: http.MethodPost, Path: "/api/v1/tenants/roles",
		Summary: "Create a role", Tags: rolesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, rolesHandler.CreateRole)

	huma.Register(api, huma.Operation{
		OperationID: "updateRole", Method: http.MethodPut, Path: "/api/v1/tenants/roles/{role_id}",
		Summary: "Update a role", Tags: rolesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, rolesHandler.UpdateRole)

	huma.Register(api, huma.Operation{
		OperationID: "deleteRole", Method: http.MethodDelete, Path: "/api/v1/tenants/roles/{role_id}",
		Summary: "Delete a role", Tags: rolesTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, rolesHandler.DeleteRole)

	huma.Register(api, huma.Operation{
		OperationID: "listTenantUsers", Method: http.MethodGet, Path: "/api/v1/tenants/users",
		Summary: "List users in the tenant", Tags: usersTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, usersHandler.List)

	huma.Register(api, huma.Operation{
		OperationID: "updateTenantUserRole", Method: http.MethodPut, Path: "/api/v1/tenants/users",
		Summary: "Update a tenant user's role", Tags: usersTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, usersHandler.UpdateRole)

	huma.Register(api, huma.Operation{
		OperationID: "removeTenantUser", Method: http.MethodDelete, Path: "/api/v1/tenants/users",
		Summary: "Remove a user from the tenant", Tags: usersTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, usersHandler.Delete)

	huma.Register(api, huma.Operation{
		OperationID: "listTenantSubscriptions", Method: http.MethodGet, Path: "/api/v1/tenants/subscriptions",
		Summary: "List subscriptions for the tenant", Tags: subsTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, subscriptionsHandler.List)

	huma.Register(api, huma.Operation{
		OperationID: "getTenantSubscription", Method: http.MethodGet, Path: "/api/v1/tenants/subscriptions/{config_price_id}",
		Summary: "Get a single tenant subscription", Tags: subsTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, subscriptionsHandler.Get)

	huma.Register(api, huma.Operation{
		OperationID: "addSubscription", Method: http.MethodPost, Path: "/api/v1/tenants/subscriptions",
		Summary: "Add a subscription to the tenant", Tags: subsTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, subscriptionsHandler.Add)

	huma.Register(api, huma.Operation{
		OperationID: "removeSubscription", Method: http.MethodDelete, Path: "/api/v1/tenants/subscriptions",
		Summary: "Remove a subscription from the tenant", Tags: subsTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, subscriptionsHandler.Remove)

	huma.Register(api, huma.Operation{
		OperationID: "getTenantBillingStatus", Method: http.MethodGet, Path: "/api/v1/tenants/billing-status",
		Summary: "Get tenant billing status", Tags: subsTag, Security: sessionOrServiceSec, Middlewares: sessionOrServiceMW,
	}, subscriptionsHandler.BillingStatus)
}

package v1

import (
	"api/internal/config"
	"api/internal/database"
	"api/internal/handlers"
	"api/internal/logger"
	"api/internal/models"
	"context"

	"github.com/gin-gonic/gin"
	kratos "github.com/ory/kratos-client-go"
	"gorm.io/gorm"
)

type AuthHandler struct {
	kratosClient      *kratos.APIClient
	kratosAdminClient *kratos.APIClient
	db                *gorm.DB
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	logger.Logger.Info("Initializing AuthHandler", "kratos_url", cfg.AuthConfig.KratosURL)

	publicConfig := kratos.NewConfiguration()
	publicConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.KratosURL,
		},
	}

	adminConfig := kratos.NewConfiguration()
	adminConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: cfg.AuthConfig.KratosAdminURL,
		},
	}

	db, err := database.GetConnection(cfg.Database)
	if err != nil {
		logger.Logger.Error("Failed to get database connection in auth handler", "error", err)
		panic(err)
	}

	return &AuthHandler{
		kratosClient:      kratos.NewAPIClient(publicConfig),
		kratosAdminClient: kratos.NewAPIClient(adminConfig),
		db:                db,
	}
}

func (h *AuthHandler) GetSession(c *gin.Context) {
	logger.Logger.Info("GetSession handler started")

	// Session already validated by RequireSession() middleware
	session := c.MustGet("session").(*kratos.Session)
	identity := c.MustGet("identity").(*kratos.Identity)
	tenantID, hasTenant := c.Get("tenant_id")

	logger.Logger.Debug("Session retrieved successfully", "user_id", session.Identity.GetId(), "has_tenant", hasTenant)

	response := models.SessionResponse{
		Session:  session,
		Identity: identity,
	}

	// Fetch full tenant object if user has active tenant
	if hasTenant {
		var tenant models.Tenant
		if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", tenantID, "error", err)
		} else {
			response.Tenant = &tenant
		}
	}

	handlers.NewSuccessResponse(c, response)
}

func (h *AuthHandler) GetIdentity(c *gin.Context) {
	logger.Logger.Info("GetIdentity handler started")

	// Identity already validated by RequireSession() middleware
	identity := c.MustGet("identity").(*kratos.Identity)

	logger.Logger.Debug("Identity retrieved successfully", "user_id", identity.GetId())

	handlers.NewSuccessResponse(c, identity)
}

func (h *AuthHandler) WhoAmI(c *gin.Context) {
	logger.Logger.Info("WhoAmI handler started")

	// Session already validated by RequireSession() middleware
	session := c.MustGet("session").(*kratos.Session)
	userID := session.Identity.GetId()

	logger.Logger.Debug("WhoAmI check successful", "user_id", userID, "authenticated", true)

	response := models.WhoAmIResponse{
		Authenticated: true,
		UserID:        userID,
	}

	handlers.NewSuccessResponse(c, response)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	logger.Logger.Info("Logout handler started")

	// Get cookie header for logout flow
	cookieHeader := c.GetHeader("Cookie")

	if cookieHeader == "" {
		logger.Logger.Warn("Missing cookie header for logout")
		handlers.NewBadRequestResponse(c, "Cookie header required for logout")
		return
	}

	logger.Logger.Debug("Creating logout flow")

	// Create logout flow with cookie
	logoutReq := h.kratosClient.FrontendAPI.CreateBrowserLogoutFlow(context.Background())
	logoutReq = logoutReq.Cookie(cookieHeader)

	logoutFlow, resp, err := logoutReq.Execute()
	if err != nil {
		logger.Logger.Error("Failed to create logout flow", "error", err, "status", resp.StatusCode)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("Logout flow created successfully", "logout_url", logoutFlow.LogoutUrl)

	response := models.LogoutResponse{
		LogoutURL:   logoutFlow.LogoutUrl,
		LogoutToken: logoutFlow.LogoutToken,
	}

	handlers.NewSuccessResponse(c, response)
}

func (h *AuthHandler) GetActiveTenant(c *gin.Context) {
	logger.Logger.Info("GetActiveTenant handler started")

	userID := c.GetString("user_id")
	if userID == "" {
		logger.Logger.Warn("Missing user_id in request context - returning 403")
		handlers.NewUnauthorizedResponse(c, "User ID not found in context")
		return
	}

	// Tenant ID set by RequireSession() middleware if user has active tenant
	tenantID, hasTenant := c.Get("tenant_id")

	logger.Logger.Debug("Active tenant check", "has_tenant", hasTenant, "tenant_id", tenantID)

	response := models.ActiveTenantResponse{}

	// Fetch full tenant object if user has active tenant
	var tenant models.Tenant
	if hasTenant {
		logger.Logger.Debug("Fetching tenant by tenant_id from context", "tenant_id", tenantID)
		if err := h.db.Where("id = ?", tenantID).First(&tenant).Error; err != nil {
			logger.Logger.Warn("Failed to fetch tenant", "tenant_id", tenantID, "error", err)
		} else {
			response.Tenant = &tenant
		}
	} else {
		// No tenant_id in context, search for first active tenant for user
		logger.Logger.Debug("No tenant_id in context, searching for active tenant", "user_id", userID)

		var tenantUser models.TenantUser
		if err := h.db.
			Preload("Tenant").
			Where("user_id = ? AND is_active = ?", userID, true).
			First(&tenantUser).Error; err != nil {
			logger.Logger.Debug("No active tenant found for user", "user_id", userID, "error", err)
		} else if tenantUser.Tenant != nil {
			logger.Logger.Info("Found active tenant for user", "user_id", userID, "tenant_id", tenantUser.TenantID)
			response.Tenant = tenantUser.Tenant
		} else {
			logger.Logger.Warn("TenantUser found but Tenant is nil", "user_id", userID, "tenant_user_id", tenantUser.ID)
		}
	}

	handlers.NewSuccessResponse(c, response)
}

func (h *AuthHandler) ListTenants(c *gin.Context) {
	logger.Logger.Info("ListTenants handler started")

	// Session already validated by RequireSession() middleware
	userID := c.GetString("user_id")
	if userID == "" {
		handlers.NewBadRequestResponse(c, "UserID not found in context")
		return
	}

	logger.Logger.Debug("Fetching tenants for user", "user_id", userID)

	// Query tenant_users table with joined tenant information
	var tenantUsers []models.TenantUser
	if err := h.db.
		Preload("Tenant").
		Where("user_id = ?", userID).
		Find(&tenantUsers).Error; err != nil {
		logger.Logger.Error("Failed to fetch tenant memberships", "user_id", userID, "error", err)
		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Debug("Fetched tenant memberships", "user_id", userID, "count", len(tenantUsers))

	// Transform to response format
	tenantList := make([]models.UserTenantListItem, 0, len(tenantUsers))
	for _, tu := range tenantUsers {
		if tu.Tenant != nil {
			logger.Logger.Trace("Adding tenant to list", "tenant_id", tu.TenantID, "is_active", tu.IsActive)
			tenantList = append(tenantList, models.UserTenantListItem{
				IsActive: tu.IsActive,
				Tenant:   *tu.Tenant,
			})
		} else {
			logger.Logger.Warn("TenantUser has nil Tenant", "tenant_user_id", tu.ID, "tenant_id", tu.TenantID)
		}
	}

	logger.Logger.Info("Tenants list retrieved successfully", "user_id", userID, "tenant_count", len(tenantList))

	response := models.ListTenantsResponse{
		Tenants: tenantList,
	}

	handlers.NewSuccessResponse(c, response)
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
	logger.Logger.Info("CreateUser handler started")

	// Parse request body
	var req models.CreateUserRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Logger.Warn("Invalid create user request", "error", err)
		handlers.NewBadRequestResponse(c, err.Error())
		return
	}

	logger.Logger.Debug("Creating user via Kratos admin API", "email", req.Email)

	// Build identity traits
	traits := map[string]interface{}{
		"email": req.Email,
		"name": map[string]interface{}{
			"first": req.Name.First,
			"last":  req.Name.Last,
		},
	}

	// Create identity body with password
	createBody := kratos.CreateIdentityBody{
		SchemaId: "default",
		Traits:   traits,
		Credentials: &kratos.IdentityWithCredentials{
			Password: &kratos.IdentityWithCredentialsPassword{
				Config: &kratos.IdentityWithCredentialsPasswordConfig{
					Password: &req.Password,
				},
			},
		},
	}

	// Call Kratos admin API to create identity
	identity, resp, err := h.kratosAdminClient.IdentityAPI.
		CreateIdentity(c.Request.Context()).
		CreateIdentityBody(createBody).
		Execute()

	if err != nil {
		logger.Logger.Error("Failed to create identity via Kratos",
			"error", err,
			"status", resp.StatusCode,
			"email", req.Email)

		// Handle specific HTTP status codes from Kratos
		if resp != nil {
			switch resp.StatusCode {
			case 409:
				logger.Logger.Warn("User already exists", "email", req.Email)
				handlers.NewConflictResponse(c, "A user with this email already exists")
				return
			case 400:
				handlers.NewBadRequestResponse(c, "Invalid user data provided")
				return
			}
		}

		handlers.NewInternalServerErrorResponse(c, err)
		return
	}

	logger.Logger.Info("User created successfully",
		"user_id", identity.Id,
		"email", req.Email)

	handlers.NewSuccessResponse(c, identity)
}

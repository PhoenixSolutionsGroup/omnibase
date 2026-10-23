package v1

import (
	"fmt"
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/database/repository"
	"api/internal/handlers/v1/email"
	"api/internal/logger"
	"api/internal/middleware"
	emailsvc "api/internal/services/email"
)

func SetUpEmailRoutes(_ *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing email routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)

	emailService, err := emailsvc.New(emailsvc.Deps{
		Repo:          repo,
		ConnectionURI: cfg.SMTPConfig.ConnectionURI,
		DefaultFrom:   cfg.SMTPConfig.FromEmail,
		ExtraHeaders:  cfg.SMTPConfig.ExtraHeaders,
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize email service: %s", err))
	}

	handler := email.New(email.Deps{
		Repo:       repo,
		Email:      emailService,
		SendLimit:  cfg.SMTPConfig.SendLimit,
		SendWindow: cfg.SMTPConfig.SendWindow,
	})

	tenantPermission := func(relation string) huma.Middlewares {
		return huma.Middlewares{middleware.GinToHuma(d.RBAC.CheckTenantPermission(relation))}
	}

	register(api, d.Auth, huma.Operation{
		OperationID: "createOrUpdateEmailTemplate",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/templates",
		Summary:     "Create or update email template",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, tenantPermission("manage_email_templates"), handler.CreateOrUpdateTemplate)

	register(api, d.Auth, huma.Operation{
		OperationID: "getEmailTemplates",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/templates",
		Summary:     "Get all email templates",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, nil, handler.ListTemplates)

	register(api, d.Auth, huma.Operation{
		OperationID: "deleteEmailTemplate",
		Method:      http.MethodDelete,
		Path:        "/api/v1/email/templates/{type}",
		Summary:     "Delete email template",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, tenantPermission("manage_email_templates"), handler.DeleteTemplate)

	register(api, d.Auth, huma.Operation{
		OperationID: "sendEmail",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/send",
		Summary:     "Send an email using an app template",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, tenantPermission("send_email"), handler.Send)

	register(api, d.Auth, huma.Operation{
		OperationID: "sendEmailHTML",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/send/html",
		Summary:     "Send a raw HTML email",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, tenantPermission("send_email"), handler.SendHTML)

	register(api, d.Auth, huma.Operation{
		OperationID: "serveEmailTemplate",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/templates/{template_name}/{type}",
		Summary:     "Serve an email template file",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthSessionOrBackendKey, nil, handler.ServeTemplate)

	register(api, d.Auth, huma.Operation{
		OperationID: "createOrUpdateSystemEmailTemplate",
		Method:      http.MethodPost,
		Path:        "/api/v1/email/system-templates",
		Summary:     "Create or update a system email template",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, handler.CreateOrUpdateSystemTemplate)

	register(api, d.Auth, huma.Operation{
		OperationID: "getSystemEmailTemplates",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/system-templates",
		Summary:     "Get all system email templates",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, handler.ListSystemTemplates)

	register(api, d.Auth, huma.Operation{
		OperationID: "deleteSystemEmailTemplate",
		Method:      http.MethodDelete,
		Path:        "/api/v1/email/system-templates/{name}",
		Summary:     "Delete a system email template",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, handler.DeleteSystemTemplate)

	register(api, d.Auth, huma.Operation{
		OperationID: "serveSystemEmailTemplate",
		Method:      http.MethodGet,
		Path:        "/api/v1/email/system-templates/{name}/{type}",
		Summary:     "Serve a system email template file",
		Tags:        []string{"V1Configuration"},
	}, authn.AuthServiceKey, nil, handler.ServeSystemTemplate)

	logger.Logger.Info("Email routes registration completed")
}

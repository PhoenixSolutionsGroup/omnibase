package email

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/danielgtaylor/huma/v2"
	"github.com/jackc/pgx/v5"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
)

var templateFileNames = map[string]string{
	"body":      "email.body.gotmpl",
	"plaintext": "email.body.plaintext.gotmpl",
	"subject":   "email.subject.gotmpl",
}

type ServeTemplateInput struct {
	handlers.AuthCtx
	TemplateName string `path:"template_name"`
	Type         string `path:"type"`
}

type ServeTemplateOutput struct {
	ContentType  string `header:"Content-Type"`
	CacheControl string `header:"Cache-Control"`
	Body         []byte
}

func (h *Handler) ServeTemplate(ctx context.Context, in *ServeTemplateInput) (*ServeTemplateOutput, error) {
	if _, ok := templateFileNames[in.Type]; !ok {
		return nil, huma.Error400BadRequest("Invalid type. Must be: body, plaintext, or subject")
	}

	tenantID, err := tenantScope(in.Method, in.TenantID)
	if err != nil {
		return nil, err
	}

	row, err := h.repo.GetEmailTemplateForTenant(ctx, repository.GetEmailTemplateForTenantParams{
		Type:     in.TemplateName,
		TenantID: tenantID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, huma.Error404NotFound(fmt.Sprintf("Template not found: %s/%s", in.TemplateName, in.Type))
		}
		logger.Logger.Error("Failed to fetch email template", "template", in.TemplateName, "error", err)
		return nil, huma.Error500InternalServerError("Failed to fetch email template")
	}

	var body string
	switch in.Type {
	case "subject":
		body = row.Subject
	case "body":
		body = row.HtmlBody
	default:
		return nil, huma.Error404NotFound(fmt.Sprintf("Template has no %s: %s", in.Type, in.TemplateName))
	}

	return &ServeTemplateOutput{
		ContentType:  "text/plain; charset=utf-8",
		CacheControl: "public, max-age=3600",
		Body:         []byte(body),
	}, nil
}

type ServeSystemTemplateInput struct {
	handlers.AuthCtx
	Name string `path:"name"`
	Type string `path:"type"`
}

type ServeSystemTemplateOutput struct {
	ContentType  string `header:"Content-Type"`
	CacheControl string `header:"Cache-Control"`
	Body         []byte
}

func (h *Handler) ServeSystemTemplate(ctx context.Context, in *ServeSystemTemplateInput) (*ServeSystemTemplateOutput, error) {
	fileName, ok := templateFileNames[in.Type]
	if !ok {
		return nil, huma.Error400BadRequest("Invalid type. Must be: body, plaintext, or subject")
	}
	if !validTemplateName(in.Name) {
		return nil, huma.Error400BadRequest("Invalid template name")
	}

	row, err := h.repo.GetSystemEmailTemplateByName(ctx, in.Name)
	if err == nil {
		var body string
		switch in.Type {
		case "subject":
			body = row.Subject
		case "body":
			body = row.HtmlBody
		case "plaintext":
			body = row.PlaintextBody
		}
		if body != "" {
			return &ServeSystemTemplateOutput{
				ContentType:  "text/plain; charset=utf-8",
				CacheControl: "public, max-age=3600",
				Body:         []byte(body),
			}, nil
		}
	} else if !errors.Is(err, pgx.ErrNoRows) {
		logger.Logger.Error("Failed to fetch system email template", "template", in.Name, "error", err)
		return nil, huma.Error500InternalServerError("Failed to fetch system email template")
	}

	staticPath := filepath.Join("./internal/static/templates", in.Name, fileName)
	defaultTemplate, err := os.ReadFile(staticPath)
	if err != nil {
		logger.Logger.Error("Default template not found", "path", staticPath, "error", err)
		return nil, huma.Error404NotFound(fmt.Sprintf("Template not found: %s/%s", in.Name, in.Type))
	}

	return &ServeSystemTemplateOutput{
		ContentType:  "text/plain; charset=utf-8",
		CacheControl: "public, max-age=86400",
		Body:         defaultTemplate,
	}, nil
}

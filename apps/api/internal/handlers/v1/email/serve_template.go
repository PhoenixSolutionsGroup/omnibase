package email

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"

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
	fileName, ok := templateFileNames[in.Type]
	if !ok {
		return nil, huma.Error400BadRequest("Invalid type. Must be: body, plaintext, or subject")
	}

	if body, ok := h.fetchTemplateFromS3(ctx, in.TemplateName, fileName); ok {
		return &ServeTemplateOutput{
			ContentType:  "text/plain; charset=utf-8",
			CacheControl: "public, max-age=3600",
			Body:         []byte(body),
		}, nil
	}

	staticPath := filepath.Join("./internal/static/templates", in.TemplateName, fileName)
	defaultTemplate, err := os.ReadFile(staticPath)
	if err != nil {
		logger.Logger.Error("Default template not found", "path", staticPath, "error", err)
		return nil, huma.Error404NotFound(fmt.Sprintf("Template not found: %s/%s", in.TemplateName, in.Type))
	}

	return &ServeTemplateOutput{
		ContentType:  "text/plain; charset=utf-8",
		CacheControl: "public, max-age=86400",
		Body:         defaultTemplate,
	}, nil
}

func (h *Handler) fetchTemplateFromS3(ctx context.Context, templateName, fileName string) (string, bool) {
	key := fmt.Sprintf("email-templates/%s/%s", templateName, fileName)
	out, err := h.s3.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(h.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		logger.Logger.Debug("Custom template not found in S3", "key", key, "error", err)
		return "", false
	}
	defer out.Body.Close()

	body, err := io.ReadAll(out.Body)
	if err != nil {
		logger.Logger.Warn("Failed to read S3 object body", "key", key, "error", err)
		return "", false
	}
	logger.Logger.Info("Serving custom template from S3", "key", key)
	return string(body), true
}

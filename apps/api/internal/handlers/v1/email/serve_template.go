package email

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"

	"api/internal/handlers"
	"api/internal/logger"
)

var templateFileNames = map[string]string{
	"body":      "email.body.gotmpl",
	"plaintext": "email.body.plaintext.gotmpl",
	"subject":   "email.subject.gotmpl",
}

func (h *Handler) ServeTemplate(ctx *gin.Context) {
	templateName := ctx.Param("template_name")
	templateType := ctx.Param("type")

	fileName, ok := templateFileNames[templateType]
	if !ok {
		handlers.NewBadRequestResponse(ctx, "Invalid type. Must be: body, plaintext, or subject")
		return
	}

	if body, ok := h.fetchTemplateFromS3(ctx.Request.Context(), templateName, fileName); ok {
		ctx.Header("Content-Type", "text/plain; charset=utf-8")
		ctx.Header("Cache-Control", "public, max-age=3600")
		ctx.String(http.StatusOK, body)
		return
	}

	staticPath := filepath.Join("./internal/static/templates", templateName, fileName)
	defaultTemplate, err := os.ReadFile(staticPath)
	if err != nil {
		logger.Logger.Error("Default template not found", "path", staticPath, "error", err)
		handlers.NewNotFoundResponse(ctx, fmt.Sprintf("Template not found: %s/%s", templateName, templateType))
		return
	}

	ctx.Header("Content-Type", "text/plain; charset=utf-8")
	ctx.Header("Cache-Control", "public, max-age=86400")
	ctx.String(http.StatusOK, string(defaultTemplate))
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

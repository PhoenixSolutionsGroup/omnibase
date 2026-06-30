package permissions

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/danielgtaylor/huma/v2"

	"api/internal/database/repository"
	"api/internal/handlers"
	"api/internal/logger"
	permsvc "api/internal/services/permissions"
)

var DeployNamespacesError = errors.New("Failed to deploy namespaces")

type DeployNamespacesResponse struct {
	Message     string `json:"message"`
	TenantID    string `json:"tenant_id"`
	Path        string `json:"path"`
	ManagedMode bool   `json:"managed_mode"`
	RolesSynced *int   `json:"roles_synced,omitempty"`
}

type DeployNamespacesInput struct {
	handlers.AuthCtx
	RawBody huma.MultipartFormFiles[struct {
		Namespaces huma.FormFile `form:"namespaces" required:"true"`
	}]
}

type DeployNamespacesOutput struct {
	Body DeployNamespacesResponse
}

func (h *Handler) DeployNamespaces(ctx context.Context, in *DeployNamespacesInput) (*DeployNamespacesOutput, error) {
	if h.tenantID == "" {
		return nil, huma.Error400BadRequest("Missing tenant ID")
	}

	form := in.RawBody.Data()
	file := form.Namespaces
	defer file.Close()

	if file.ContentType != "application/zip" && !strings.HasSuffix(file.Filename, ".zip") {
		return nil, huma.Error400BadRequest("File must be a zip archive")
	}

	objectKey := "internal/permissions.zip"

	if _, err := h.s3.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(h.bucketName),
		Key:         aws.String(objectKey),
		Body:        file,
		ContentType: aws.String("application/zip"),
	}); err != nil {
		logger.Logger.Error("S3 upload failed", "bucket", h.bucketName, "key", objectKey, "error", err)
		return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeployNamespacesError, err).Error())
	}

	resp := DeployNamespacesResponse{
		Message:     "Namespaces deployed successfully",
		TenantID:    h.tenantID,
		Path:        objectKey,
		ManagedMode: h.isManaged,
	}

	if _, err := file.Seek(0, io.SeekStart); err != nil {
		logger.Logger.Warn("Failed to rewind uploaded file for parsing", "error", err)
		return &DeployNamespacesOutput{Body: resp}, nil
	}

	zipBytes, err := io.ReadAll(file)
	if err != nil {
		logger.Logger.Warn("Failed to read file for parsing", "error", err)
		return &DeployNamespacesOutput{Body: resp}, nil
	}

	defs, err := permsvc.ParseNamespaceZip(zipBytes)
	if err != nil {
		logger.Logger.Warn("Failed to parse namespace definitions", "error", err)
		return &DeployNamespacesOutput{Body: resp}, nil
	}

	if err := h.storeDefinitions(ctx, defs); err != nil {
		logger.Logger.Warn("Failed to store definitions", "error", err)
	}

	if len(defs) > 0 {
		roles := permsvc.BuildRolesFromMetadata(defs)
		if len(roles) > 0 {
			count, err := h.storeRoleTemplates(ctx, roles)
			if err != nil {
				logger.Logger.Warn("Failed to store role templates", "error", err)
			} else {
				resp.RolesSynced = &count
			}
		}
	}

	return &DeployNamespacesOutput{Body: resp}, nil
}

func (h *Handler) storeDefinitions(ctx context.Context, defs []permsvc.ParsedNamespaceDefinition) error {
	for _, def := range defs {
		metaJSON, err := json.Marshal(def.RelationsMetadata)
		if err != nil {
			return err
		}
		subjJSON, err := json.Marshal(def.SubjectRelations)
		if err != nil {
			return err
		}

		if err := h.repo.UpsertNamespaceDefinition(ctx, repository.UpsertNamespaceDefinitionParams{
			Namespace:         def.Namespace,
			Relations:         def.Relations,
			RelationsMetadata: metaJSON,
			SubjectRelations:  subjJSON,
		}); err != nil {
			return fmt.Errorf("upsert namespace %s: %w", def.Namespace, err)
		}
	}
	return nil
}

func (h *Handler) storeRoleTemplates(ctx context.Context, roles []permsvc.ParsedRoleConfig) (int, error) {
	desc := "System role template"
	count := 0
	for _, r := range roles {
		if err := h.repo.UpsertRoleTemplate(ctx, repository.UpsertRoleTemplateParams{
			RoleName:    r.Role,
			Permissions: r.Permissions,
			Description: &desc,
		}); err != nil {
			return count, fmt.Errorf("upsert role %s: %w", r.Role, err)
		}
		count++
	}
	return count, nil
}

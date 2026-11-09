package permissions

import (
	"bytes"
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
	namespaces "api/permissions"
)

var (
	DeployNamespacesError     = errors.New("Failed to deploy namespaces")
	NamespacesIncompleteError = errors.New("Namespace files do not satisfy API requirements")
)

type DeployNamespacesResponse struct {
	Message         string `json:"message"`
	TenantID        string `json:"tenant_id"`
	Path            string `json:"path"`
	ManagedMode     bool   `json:"managed_mode"`
	RolesSynced     *int   `json:"roles_synced,omitempty"`
	RolesBackfilled *int   `json:"roles_backfilled,omitempty"`
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

	zipBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, huma.Error400BadRequest("Failed to read namespace archive")
	}

	defs, err := permsvc.ParseNamespaceZip(zipBytes)
	if err != nil {
		return nil, huma.Error400BadRequest(fmt.Errorf("%w: %v", NamespacesIncompleteError, err).Error())
	}

	requirements, err := namespaces.Load()
	if err != nil {
		logger.Logger.Error("Failed to load embedded namespace requirements", "error", err)
		return nil, huma.Error500InternalServerError("Failed to load namespace requirements")
	}

	if missing := permsvc.ValidateRequirements(defs, requirements.Namespaces); len(missing) > 0 {
		message := permsvc.FormatMissing(missing)
		logger.Logger.Warn("Rejected namespace deploy", "missing", missing)
		return nil, huma.Error400BadRequest(fmt.Errorf("%w: %s", NamespacesIncompleteError, message).Error())
	}

	objectKey := "internal/permissions.zip"
	if _, err := h.s3.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(h.bucketName),
		Key:         aws.String(objectKey),
		Body:        bytes.NewReader(zipBytes),
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

	if err := h.storeDefinitions(ctx, defs); err != nil {
		logger.Logger.Warn("Failed to store definitions", "error", err)
	}

	if roles := permsvc.BuildRolesFromMetadata(defs); len(roles) > 0 {
		count, backfilled, err := h.storeRoleTemplates(ctx, roles)
		if err != nil {
			logger.Logger.Error("Failed to sync role templates", "error", err)
			return nil, huma.Error500InternalServerError(fmt.Errorf("%w: %w", DeployNamespacesError, err).Error())
		}
		resp.RolesSynced = &count
		resp.RolesBackfilled = &backfilled
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

func (h *Handler) storeRoleTemplates(ctx context.Context, roles []permsvc.ParsedRoleConfig) (int, int, error) {
	desc := "System role template"
	count := 0
	backfilled := 0

	for _, role := range roles {
		if err := h.repo.UpsertRoleTemplate(ctx, repository.UpsertRoleTemplateParams{
			RoleName:    role.Role,
			Permissions: role.Permissions,
			Description: &desc,
		}); err != nil {
			return count, backfilled, fmt.Errorf("upsert role %s: %w", role.Role, err)
		}
		count++

		template, err := h.repo.GetRoleTemplateByName(ctx, role.Role)
		if err != nil {
			return count, backfilled, fmt.Errorf("load role template %s: %w", role.Role, err)
		}

		tenantRoles, err := h.repo.ListRolesByTemplateID(ctx, &template.ID)
		if err != nil {
			return count, backfilled, fmt.Errorf("list roles for template %s: %w", role.Role, err)
		}

		for _, tenantRole := range tenantRoles {
			if len(template.Permissions) == 0 {
				continue
			}

			merged, added := mergePermissions(tenantRole.Permissions, template.Permissions)
			userIDs := tenantRole.UserIds

			if len(userIDs) == 0 && len(added) == 0 {
				continue
			}

			if len(added) > 0 {
				updated, err := h.repo.UpdateRolePermissions(ctx, repository.UpdateRolePermissionsParams{
					Permissions: merged,
					ID:          tenantRole.ID,
					TenantID:    tenantRole.TenantID,
				})
				if err != nil {
					return count, backfilled, fmt.Errorf("update role %s/%s: %w", tenantRole.TenantID, tenantRole.RoleName, err)
				}
				userIDs = updated.UserIds
			}

			for _, userID := range userIDs {
				for _, permission := range template.Permissions {
					ns, object, relation, err := permsvc.ParsePermission(permission, tenantRole.TenantID.String())
					if err != nil {
						return count, backfilled, err
					}
					if err := h.perms.Create(ctx, ns, object, relation, permsvc.SubjectSet{
						Namespace: "User",
						Object:    userID.String(),
					}); err != nil {
						return count, backfilled, fmt.Errorf("grant %s to %s: %w", permission, userID, err)
					}
				}
			}

			backfilled++
			logger.Logger.Info("Backfilled role permissions",
				"tenant_id", tenantRole.TenantID,
				"role", tenantRole.RoleName,
				"added", added,
				"users", len(userIDs),
			)
		}
	}

	return count, backfilled, nil
}

func mergePermissions(existing, required []string) ([]string, []string) {
	present := make(map[string]struct{}, len(existing))
	for _, permission := range existing {
		present[permission] = struct{}{}
	}

	merged := append([]string{}, existing...)
	var added []string
	for _, permission := range required {
		if _, ok := present[permission]; ok {
			continue
		}
		present[permission] = struct{}{}
		merged = append(merged, permission)
		added = append(added, permission)
	}
	return merged, added
}

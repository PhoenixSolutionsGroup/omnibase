package v1

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/gin-gonic/gin"

	"api/internal/authn"
	"api/internal/database/repository"
	"api/internal/handlers/v1/storage"
	"api/internal/logger"
	"api/internal/services/permissions"
)

const storagePathDescription = "Storage object paths are unique across the entire bucket, not per tenant. Prefix paths with the tenant ID or another unique namespace, for example `tenants/<tenant_id>/avatars/me.png`."

const uploadPathDescription = storagePathDescription + " Uploading to an existing path returns 409 Conflict."

func SetUpStorageRoutes(router *gin.RouterGroup, api huma.API, d Deps) {
	logger.Logger.Info("Initializing storage routes")
	cfg := d.Cfg
	repo := repository.New(d.Pool)

	perms := permissions.New(cfg.PermissionsConfig.ReadURL, cfg.PermissionsConfig.WriteURL)

	handler := storage.New(storage.Deps{
		Repo:        repo,
		Perms:       perms,
		S3:          d.S3,
		S3Public:    d.S3Public,
		BucketName:  cfg.S3Config.BucketName,
		Credentials: d.Credentials,
	})

	register(api, d.Auth, huma.Operation{
		OperationID: "uploadFile",
		Errors:      []int{400, 401, 404, 409},
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/upload",
		Summary:     "Upload file to storage",
		Description: uploadPathDescription,
		Tags:        []string{"V1Storage"},
	}, authn.AuthSessionOrBackendKey, nil, handler.Upload)

	register(api, d.Auth, huma.Operation{
		OperationID: "downloadFile",
		Errors:      []int{400, 401, 404},
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/download",
		Summary:     "Download file from storage",
		Description: storagePathDescription,
		Tags:        []string{"V1Storage"},
	}, authn.AuthSessionOrBackendKey, nil, handler.Download)

	register(api, d.Auth, huma.Operation{
		OperationID: "deleteObject",
		Errors:      []int{400, 401, 404},
		Method:      http.MethodDelete,
		Path:        "/api/v1/storage/object",
		Summary:     "Delete file from storage",
		Description: storagePathDescription,
		Tags:        []string{"V1Storage"},
	}, authn.AuthSessionOrBackendKey, nil, handler.DeleteObject)

	register(api, d.Auth, huma.Operation{
		OperationID: "makeFilePublic",
		Errors:      []int{400, 401, 404},
		Method:      http.MethodPost,
		Path:        "/api/v1/storage/make-public",
		Summary:     "Make a file publicly accessible",
		Description: storagePathDescription,
		Tags:        []string{"V1Storage"},
	}, authn.AuthSessionOrBackendKey, nil, handler.MakePublic)

	register(api, d.Auth, huma.Operation{
		OperationID: "getStorageCredentials",
		Errors:      []int{401, 500, 503},
		Method:      http.MethodGet,
		Path:        "/api/v1/storage/credentials",
		Summary:     "Get temporary S3 credentials",
		Description: "Returns short-lived, bucket-scoped S3 credentials for server-side use. Requires the project service key. Do not expose the service key in browser code.",
		Tags:        []string{"V1Storage"},
	}, authn.AuthServiceKey, nil, handler.GetCredentials)

	logger.Logger.Info("Storage routes registration completed")
}

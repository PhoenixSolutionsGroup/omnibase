package permissions

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"api/internal/database/repository"
	"api/internal/services/permissions"
)

type Handler struct {
	repo       repository.Querier
	perms      *permissions.Service
	s3         *s3.Client
	bucketName string
	tenantID   string
	isManaged  bool
}

type Deps struct {
	Repo       repository.Querier
	Perms      *permissions.Service
	S3         *s3.Client
	BucketName string
	TenantID   string
	IsManaged  bool
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:       deps.Repo,
		perms:      deps.Perms,
		s3:         deps.S3,
		bucketName: deps.BucketName,
		tenantID:   deps.TenantID,
		isManaged:  deps.IsManaged,
	}
}

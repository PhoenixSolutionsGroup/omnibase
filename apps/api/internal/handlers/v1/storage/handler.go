package storage

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"api/internal/database/repository"
	"api/internal/services/permissions"
)

type Handler struct {
	repo       repository.Querier
	perms      *permissions.Service
	s3         *s3.Client
	s3Public   *s3.Client
	bucketName string
}

type Deps struct {
	Repo       repository.Querier
	Perms      *permissions.Service
	S3         *s3.Client
	S3Public   *s3.Client
	BucketName string
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:       deps.Repo,
		perms:      deps.Perms,
		s3:         deps.S3,
		s3Public:   deps.S3Public,
		bucketName: deps.BucketName,
	}
}

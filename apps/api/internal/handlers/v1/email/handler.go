package email

import (
	"api/internal/database/repository"
	"api/internal/services/email"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Handler struct {
	repo       repository.Querier
	email      *email.Service
	s3         *s3.Client
	bucketName string
}

type Deps struct {
	Repo       repository.Querier
	Email      *email.Service
	S3         *s3.Client
	BucketName string
}

func New(deps Deps) *Handler {
	return &Handler{
		repo:       deps.Repo,
		email:      deps.Email,
		s3:         deps.S3,
		bucketName: deps.BucketName,
	}
}

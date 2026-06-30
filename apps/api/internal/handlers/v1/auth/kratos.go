package auth

import (
	"api/internal/logger"

	kratos "github.com/ory/kratos-client-go"
)

func NewKratosClient(url, label string) *kratos.APIClient {
	logger.Logger.Debug("Initializing kratos client", "label", label, "url", url)
	cfg := kratos.NewConfiguration()
	cfg.Servers = []kratos.ServerConfiguration{{URL: url}}
	return kratos.NewAPIClient(cfg)
}

package permissions

import (
	"context"
	"net/http"
	"os"

	"api/internal/logger"

	"google.golang.org/api/idtoken"
)

type Service struct {
	readURL     string
	writeURL    string
	readClient  *http.Client
	writeClient *http.Client
}

type SubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
}

func New(readURL, writeURL string) *Service {
	logger.Logger.Debug("Initializing permissions service", "readURL", readURL, "writeURL", writeURL)

	readClient := &http.Client{}
	writeClient := &http.Client{}

	if os.Getenv("K_SERVICE") != "" {
		var err error
		readClient, err = idtoken.NewClient(context.Background(), readURL)
		if err != nil {
			logger.Logger.Error("Failed to create identity token client for permissions read", "error", err)
			panic(err)
		}
		writeClient, err = idtoken.NewClient(context.Background(), writeURL)
		if err != nil {
			logger.Logger.Error("Failed to create identity token client for permissions write", "error", err)
			panic(err)
		}
		logger.Logger.Debug("Using identity token clients for permissions service")
	}

	return &Service{
		readURL:     readURL,
		writeURL:    writeURL,
		readClient:  readClient,
		writeClient: writeClient,
	}
}

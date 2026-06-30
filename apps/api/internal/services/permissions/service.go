package permissions

import (
	"net/http"

	"api/internal/logger"
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

	return &Service{
		readURL:     readURL,
		writeURL:    writeURL,
		readClient:  &http.Client{},
		writeClient: &http.Client{},
	}
}

package email

import (
	"errors"
	"net/url"
	"strconv"
	"strings"

	"api/internal/database/repository"
	"api/internal/logger"
)

var InvalidSMTPURIError = errors.New("Invalid SMTP connection URI")

type Service struct {
	repo            repository.Querier
	host            string
	port            string
	username        string
	password        string
	defaultFrom     string
	disableStartTLS bool
}

type Deps struct {
	Repo          repository.Querier
	ConnectionURI string
	DefaultFrom   string
}

func New(deps Deps) (*Service, error) {
	if deps.ConnectionURI == "" {
		return nil, InvalidSMTPURIError
	}

	parsed, err := url.Parse(deps.ConnectionURI)
	if err != nil {
		return nil, InvalidSMTPURIError
	}

	hostParts := strings.Split(parsed.Host, ":")
	host := hostParts[0]
	port := "587"
	if len(hostParts) > 1 {
		port = hostParts[1]
	}

	username := ""
	password := ""
	if parsed.User != nil {
		username = parsed.User.Username()
		password, _ = parsed.User.Password()
	}

	disableStartTLS, _ := strconv.ParseBool(parsed.Query().Get("disable_starttls"))

	logger.Logger.Debug("Initialized email service", "host", host, "port", port, "disable_starttls", disableStartTLS)

	return &Service{
		repo:            deps.Repo,
		host:            host,
		port:            port,
		username:        username,
		password:        password,
		defaultFrom:     deps.DefaultFrom,
		disableStartTLS: disableStartTLS,
	}, nil
}

func (s *Service) fromOrDefault(from string) string {
	if from == "" {
		return s.defaultFrom
	}
	return from
}

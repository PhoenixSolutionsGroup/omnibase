package services_v1

import (
	"api/internal/logger"
	"context"
	"os"

	kratos "github.com/ory/kratos-client-go"
	"google.golang.org/api/idtoken"
)

type KratosService struct {
	adminClient *kratos.APIClient
}

type IdentityInfo struct {
	ID        string
	Email     string
	FirstName string
	LastName  string
}

func NewKratosService(adminURL string) *KratosService {
	logger.Logger.Info("Initializing Kratos service", "adminURL", adminURL)

	adminConfig := kratos.NewConfiguration()
	adminConfig.Servers = []kratos.ServerConfiguration{
		{URL: adminURL},
	}

	// On Cloud Run, use identity tokens for service-to-service auth
	if os.Getenv("K_SERVICE") != "" {
		idTokenClient, err := idtoken.NewClient(context.Background(), adminURL)
		if err != nil {
			logger.Logger.Error("Failed to create identity token client for Kratos admin", "error", err)
			panic(err)
		}
		adminConfig.HTTPClient = idTokenClient
		logger.Logger.Info("Using identity token client for Kratos admin API")
	}

	return &KratosService{
		adminClient: kratos.NewAPIClient(adminConfig),
	}
}

// GetIdentitiesByIDs fetches multiple identities by their IDs in a single batch request
func (s *KratosService) GetIdentitiesByIDs(ctx context.Context, userIDs []string) (map[string]IdentityInfo, error) {
	if len(userIDs) == 0 {
		return make(map[string]IdentityInfo), nil
	}

	logger.Logger.Debug("Batch fetching identities from Kratos", "count", len(userIDs))

	req := s.adminClient.IdentityAPI.ListIdentities(ctx)
	req = req.Ids(userIDs)

	identities, _, err := req.Execute()
	if err != nil {
		logger.Logger.Error("Failed to fetch identities from Kratos", "error", err, "count", len(userIDs))
		return nil, err
	}

	result := make(map[string]IdentityInfo, len(identities))
	for _, identity := range identities {
		info := IdentityInfo{
			ID: identity.GetId(),
		}

		// Extract traits (name, email)
		if traits, ok := identity.GetTraitsOk(); ok && traits != nil {
			traitsMap, ok := (*traits).(map[string]interface{})
			if ok {
				if email, exists := traitsMap["email"]; exists {
					info.Email, _ = email.(string)
				}
				if name, exists := traitsMap["name"]; exists {
					if nameMap, ok := name.(map[string]interface{}); ok {
						if first, exists := nameMap["first"]; exists {
							info.FirstName, _ = first.(string)
						}
						if last, exists := nameMap["last"]; exists {
							info.LastName, _ = last.(string)
						}
					}
				}
			}
		}

		result[identity.GetId()] = info
	}

	logger.Logger.Debug("Successfully fetched identities from Kratos", "requested", len(userIDs), "found", len(result))
	return result, nil
}

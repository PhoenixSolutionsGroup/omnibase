package auth

import (
	"context"
	"errors"
	"fmt"

	"api/internal/logger"
)

var GetIdentitiesError = errors.New("Failed to get identities")

func (s *Service) GetIdentities(ctx context.Context, ids []string) (map[string]Identity, error) {
	if len(ids) == 0 {
		return map[string]Identity{}, nil
	}

	logger.Logger.Debug("Fetching identities", "count", len(ids))

	identities, _, err := s.admin.IdentityAPI.ListIdentities(ctx).Ids(ids).Execute()
	if err != nil {
		return nil, fmt.Errorf("%w: %w", GetIdentitiesError, err)
	}

	out := make(map[string]Identity, len(identities))
	for _, i := range identities {
		info := Identity{ID: i.GetId()}
		traits, ok := i.GetTraitsOk()
		if !ok || traits == nil {
			out[i.GetId()] = info
			continue
		}
		m, ok := (*traits).(map[string]any)
		if !ok {
			out[i.GetId()] = info
			continue
		}
		if e, ok := m["email"].(string); ok {
			info.Email = e
		}
		if n, ok := m["name"].(map[string]any); ok {
			if f, ok := n["first"].(string); ok {
				info.FirstName = f
			}
			if l, ok := n["last"].(string); ok {
				info.LastName = l
			}
		}
		out[i.GetId()] = info
	}

	logger.Logger.Debug("Fetched identities", "requested", len(ids), "found", len(out))
	return out, nil
}

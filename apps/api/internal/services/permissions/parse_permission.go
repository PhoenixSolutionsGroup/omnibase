package permissions

import (
	"errors"
	"fmt"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

var ParsePermissionError = errors.New("Failed to parse permission")

func ParsePermission(permission, tenantID string) (namespace, resourceID, relation string, err error) {
	titler := cases.Title(language.English)
	parts := strings.Split(permission, "#")
	if len(parts) != 2 {
		return "", "", "", fmt.Errorf("%w: invalid format: %s", ParsePermissionError, permission)
	}
	relation = parts[1]
	resourceParts := strings.Split(parts[0], ":")
	if len(resourceParts) == 1 {
		return titler.String(resourceParts[0]), tenantID, relation, nil
	}
	namespace = titler.String(resourceParts[0])
	resourceID = resourceParts[1]
	if strings.Contains(resourceID, "*") {
		return "", "", "", fmt.Errorf("%w: wildcards not supported: %s", ParsePermissionError, permission)
	}
	return
}

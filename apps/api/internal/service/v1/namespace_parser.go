package services_v1

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"regexp"
	"strings"

	"api/internal/logger"
)

// RelationMetadata contains enriched metadata for a single relation
type RelationMetadata struct {
	Name        string   `json:"name"`                  // e.g., can_view_db_secret_key
	DisplayName string   `json:"display_name"`          // e.g., Can View Db Secret Key
	Group       *string  `json:"group"`                 // e.g., "Secrets" or null
	SubGroup    *string  `json:"sub_group"`             // e.g., "Database" or null
	Roles       []string `json:"roles"`                 // e.g., ["owner", "admin"]
	Subjects    []string `json:"subjects"`              // e.g., ["User", "ApiKey"]
}

type ParsedNamespaceDefinition struct {
	Namespace         string              `json:"namespace"`
	Relations         []string            `json:"relations"`                    // Keep for backwards compat
	RelationsMetadata []RelationMetadata  `json:"relations_metadata,omitempty"` // New enriched data
	SubjectRelations  map[string][]string `json:"subject_relations"`            // subject -> relations that accept this subject
}

type ParsedRoleConfig struct {
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

type RolesConfig struct {
	Roles []ParsedRoleConfig `json:"roles"`
}

type NamespaceParserService struct{}

func NewNamespaceParserService() *NamespaceParserService {
	return &NamespaceParserService{}
}

// ParseNamespaceFiles extracts namespace definitions from zipped .ts files
func (s *NamespaceParserService) ParseNamespaceFiles(zipBytes []byte) ([]ParsedNamespaceDefinition, error) {
	logger.Logger.Info("Starting namespace file parsing", "zip_size", len(zipBytes))

	reader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		logger.Logger.Error("Failed to read zip file", "error", err)
		return nil, fmt.Errorf("failed to read zip: %w", err)
	}

	var definitions []ParsedNamespaceDefinition
	logger.Logger.Debug("Processing zip contents", "file_count", len(reader.File))

	for _, file := range reader.File {
		if !strings.HasSuffix(file.Name, ".ts") || file.Name == "types.ts" {
			logger.Logger.Debug("Skipping non-namespace file", "file", file.Name)
			continue
		}

		logger.Logger.Debug("Processing namespace file", "file", file.Name)

		rc, err := file.Open()
		if err != nil {
			logger.Logger.Warn("Failed to open file in zip", "file", file.Name, "error", err)
			continue
		}
		defer rc.Close()

		content, err := io.ReadAll(rc)
		if err != nil {
			logger.Logger.Warn("Failed to read file content", "file", file.Name, "error", err)
			continue
		}

		logger.Logger.Debug("Parsing file content", "file", file.Name, "content_length", len(content))
		defs := s.parseNamespaceContent(string(content))
		for _, def := range defs {
			logger.Logger.Info("Successfully parsed namespace definition",
				"file", file.Name,
				"namespace", def.Namespace,
				"relations_count", len(def.Relations),
				"relations", def.Relations)
			definitions = append(definitions, def)
		}
	}

	logger.Logger.Info("Namespace parsing completed", "total_definitions", len(definitions))
	return definitions, nil
}

// ParseRolesConfig extracts role configurations from roles.config.json in zip
func (s *NamespaceParserService) ParseRolesConfig(zipBytes []byte) (*RolesConfig, error) {
	logger.Logger.Info("Starting roles config parsing", "zip_size", len(zipBytes))

	reader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		logger.Logger.Error("Failed to read zip file for roles config", "error", err)
		return nil, fmt.Errorf("failed to read zip: %w", err)
	}

	logger.Logger.Debug("Looking for roles.config.json in zip", "file_count", len(reader.File))

	for _, file := range reader.File {
		if file.Name != "roles.config.json" {
			continue
		}

		logger.Logger.Info("Found roles.config.json", "file", file.Name)

		rc, err := file.Open()
		if err != nil {
			logger.Logger.Error("Failed to open roles.config.json", "error", err)
			return nil, fmt.Errorf("failed to open roles.config.json: %w", err)
		}
		defer rc.Close()

		content, err := io.ReadAll(rc)
		if err != nil {
			logger.Logger.Error("Failed to read roles.config.json content", "error", err)
			return nil, fmt.Errorf("failed to read roles.config.json: %w", err)
		}

		logger.Logger.Debug("Parsing roles config JSON", "content_length", len(content))

		var rolesConfig RolesConfig
		if err := json.Unmarshal(content, &rolesConfig); err != nil {
			logger.Logger.Error("Failed to unmarshal roles config JSON", "error", err)
			return nil, fmt.Errorf("failed to parse roles.config.json: %w", err)
		}

		logger.Logger.Info("Successfully parsed roles config",
			"roles_count", len(rolesConfig.Roles))

		for _, role := range rolesConfig.Roles {
			logger.Logger.Debug("Parsed role",
				"role", role.Role,
				"permissions_count", len(role.Permissions))
		}

		return &rolesConfig, nil
	}

	logger.Logger.Debug("No roles.config.json found in zip")
	return nil, nil
}

// parseNamespaceContent extracts namespace definitions from TypeScript
// Parses relations with any subject type: "relation: Subject[]" or "relation: (Subject1 | Subject2)[]"
func (s *NamespaceParserService) parseNamespaceContent(content string) []ParsedNamespaceDefinition {
	logger.Logger.Debug("Parsing namespace content", "content_preview", content[:min(200, len(content))])

	// Find all "related: { ... }" blocks with their content
	relatedRegex := regexp.MustCompile(`related:\s*\{([^}]+)\}`)
	relatedMatches := relatedRegex.FindAllStringSubmatchIndex(content, -1)

	logger.Logger.Debug("Found related blocks", "count", len(relatedMatches))
	for i, match := range relatedMatches {
		if len(match) >= 4 {
			logger.Logger.Debug("Related block details",
				"index", i,
				"start", match[0],
				"end", match[1],
				"content_preview", content[match[2]:min(match[3], match[2]+100)])
		}
	}

	// Find all class declarations
	classRegex := regexp.MustCompile(`class\s+(\w+)\s+implements\s+Namespace`)
	classMatches := classRegex.FindAllStringSubmatch(content, -1)

	logger.Logger.Debug("Found class declarations", "count", len(classMatches))
	for i, classMatch := range classMatches {
		if len(classMatch) >= 2 {
			className := classMatch[1]
			classPos := strings.Index(content, classMatch[0])
			logger.Logger.Debug("Class details", "index", i, "name", className, "position", classPos)
		}
	}

	var allDefinitions []ParsedNamespaceDefinition

	// Regex to match JSDoc comment followed by relation
	// Matches: /** ... */ relationName: (Type1 | Type2)[] or /** ... */ relationName: Type[]
	// Also matches relations without JSDoc
	jsdocRelationRegex := regexp.MustCompile(`(?s)(/\*\*.*?\*/)?\s*(\w+):\s*(?:\(([^)]+)\)|(\w+))\[\]`)

	// Match each related block to its class
	for i, relatedMatch := range relatedMatches {
		relatedStart := relatedMatch[0]
		relatedBlock := content[relatedMatch[2]:relatedMatch[3]]

		logger.Logger.Debug("Processing related block",
			"index", i,
			"start_position", relatedStart,
			"block_content", relatedBlock)

		// Find which class this related block belongs to
		var belongsToClass string
		var lastClassPos int = -1

		for _, classMatch := range classMatches {
			if len(classMatch) < 2 {
				continue
			}
			className := classMatch[1]
			classPos := strings.Index(content, classMatch[0])

			logger.Logger.Debug("Checking class match",
				"class", className,
				"class_pos", classPos,
				"related_start", relatedStart,
				"is_before", classPos < relatedStart,
				"is_nearest", classPos > lastClassPos)

			// The related block belongs to the nearest class before it
			if classPos < relatedStart && classPos > lastClassPos {
				belongsToClass = className
				lastClassPos = classPos
				logger.Logger.Debug("Matched related block to class", "class", className)
			}
		}

		if belongsToClass == "" {
			logger.Logger.Warn("Could not match related block to class", "related_block_preview", relatedBlock[:min(50, len(relatedBlock))])
			continue
		}

		// Build subject -> relations map and relations metadata
		subjectRelations := make(map[string][]string)
		var allRelations []string
		var relationsMetadata []RelationMetadata

		// Extract all relations with their JSDoc comments
		jsdocMatches := jsdocRelationRegex.FindAllStringSubmatch(relatedBlock, -1)

		for _, match := range jsdocMatches {
			jsdocContent := match[1]    // JSDoc comment (may be empty)
			relationName := match[2]    // Relation name
			unionSubjects := match[3]   // Union subjects like "User | ApiKey" (may be empty)
			singleSubject := match[4]   // Single subject like "User" (may be empty)

			// Determine subjects
			var subjects []string
			if unionSubjects != "" {
				subjects = s.parseUnionSubjects(unionSubjects)
			} else if singleSubject != "" {
				subjects = []string{singleSubject}
			}

			// Parse JSDoc tags
			var group, subGroup, displayName *string
			var roles []string
			if jsdocContent != "" {
				group, subGroup, displayName, roles = s.parseJSDocTags(jsdocContent)
			}

			// Generate default display name if not provided
			finalDisplayName := s.generateDisplayName(relationName)
			if displayName != nil {
				finalDisplayName = *displayName
			}

			logger.Logger.Debug("Extracted relation with JSDoc",
				"class", belongsToClass,
				"relation", relationName,
				"subjects", subjects,
				"group", group,
				"subGroup", subGroup,
				"displayName", finalDisplayName,
				"roles", roles)

			allRelations = append(allRelations, relationName)
			for _, subject := range subjects {
				subjectRelations[subject] = append(subjectRelations[subject], relationName)
			}

			// Build relation metadata
			relationsMetadata = append(relationsMetadata, RelationMetadata{
				Name:        relationName,
				DisplayName: finalDisplayName,
				Group:       group,
				SubGroup:    subGroup,
				Roles:       roles,
				Subjects:    subjects,
			})
		}

		if len(allRelations) > 0 {
			logger.Logger.Info("Successfully parsed namespace",
				"namespace", belongsToClass,
				"relations_count", len(allRelations),
				"subject_count", len(subjectRelations),
				"metadata_count", len(relationsMetadata))

			for subject, relations := range subjectRelations {
				logger.Logger.Debug("Subject relations",
					"namespace", belongsToClass,
					"subject", subject,
					"relations", relations)
			}

			allDefinitions = append(allDefinitions, ParsedNamespaceDefinition{
				Namespace:         belongsToClass,
				Relations:         allRelations,
				RelationsMetadata: relationsMetadata,
				SubjectRelations:  subjectRelations,
			})
		} else {
			logger.Logger.Warn("No relations found in related block", "class", belongsToClass)
		}
	}

	logger.Logger.Info("Parsing complete", "total_namespaces_found", len(allDefinitions))
	return allDefinitions
}

// parseUnionSubjects parses "User | ApiKey | Foo" into ["User", "ApiKey", "Foo"]
func (s *NamespaceParserService) parseUnionSubjects(unionStr string) []string {
	var subjects []string
	parts := strings.Split(unionStr, "|")
	for _, part := range parts {
		subject := strings.TrimSpace(part)
		if subject != "" {
			subjects = append(subjects, subject)
		}
	}
	return subjects
}

// generateDisplayName converts relation name to display format
// e.g., "can_view_db_secret_key" -> "Can View Db Secret Key"
func (s *NamespaceParserService) generateDisplayName(relationName string) string {
	words := strings.Split(relationName, "_")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(string(word[0])) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, " ")
}

// parseJSDocTags extracts @group, @subGroup, @displayName, and @role tags from JSDoc content
func (s *NamespaceParserService) parseJSDocTags(jsdocContent string) (group *string, subGroup *string, displayName *string, roles []string) {
	// Clean up the JSDoc content - remove * at start of lines
	cleaned := regexp.MustCompile(`(?m)^\s*\*\s?`).ReplaceAllString(jsdocContent, " ")
	cleaned = strings.TrimSpace(cleaned)

	// Extract @group
	groupRegex := regexp.MustCompile(`@group\s+([^@\n]+)`)
	if match := groupRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		g := strings.TrimSpace(match[1])
		if g != "" {
			group = &g
		}
	}

	// Extract @subGroup
	subGroupRegex := regexp.MustCompile(`@subGroup\s+([^@\n]+)`)
	if match := subGroupRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		sg := strings.TrimSpace(match[1])
		if sg != "" {
			// Only set subGroup if group is also set
			if group != nil {
				subGroup = &sg
			} else {
				logger.Logger.Warn("@subGroup found without @group, ignoring", "subGroup", sg)
			}
		}
	}

	// Extract @displayName
	displayNameRegex := regexp.MustCompile(`@displayName\s+([^@\n]+)`)
	if match := displayNameRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		dn := strings.TrimSpace(match[1])
		if dn != "" {
			displayName = &dn
		}
	}

	// Extract all @role tags
	roleRegex := regexp.MustCompile(`@role\s+(\w+)`)
	roleMatches := roleRegex.FindAllStringSubmatch(cleaned, -1)
	for _, match := range roleMatches {
		if len(match) >= 2 {
			role := strings.ToLower(strings.TrimSpace(match[1]))
			if role != "" {
				roles = append(roles, role)
			}
		}
	}

	return group, subGroup, displayName, roles
}

// BuildRolesFromMetadata aggregates role->permissions mapping from parsed namespace definitions
func (s *NamespaceParserService) BuildRolesFromMetadata(definitions []ParsedNamespaceDefinition) []ParsedRoleConfig {
	rolePermissions := make(map[string][]string)

	for _, def := range definitions {
		namespace := strings.ToLower(def.Namespace)
		for _, rel := range def.RelationsMetadata {
			for _, role := range rel.Roles {
				permission := fmt.Sprintf("%s#%s", namespace, rel.Name)
				rolePermissions[role] = append(rolePermissions[role], permission)
			}
		}
	}

	var roles []ParsedRoleConfig
	for role, permissions := range rolePermissions {
		roles = append(roles, ParsedRoleConfig{
			Role:        role,
			Permissions: permissions,
		})
	}

	logger.Logger.Info("Built roles from metadata", "role_count", len(roles))
	for _, r := range roles {
		logger.Logger.Debug("Role permissions", "role", r.Role, "permissions_count", len(r.Permissions))
	}

	return roles
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

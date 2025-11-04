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

type ParsedNamespaceDefinition struct {
	Namespace string   `json:"namespace"`
	Relations []string `json:"relations"`
}

type ParsedRoleConfig struct {
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
	Immutable   bool     `json:"immutable"`
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
				"permissions_count", len(role.Permissions),
				"immutable", role.Immutable)
		}

		return &rolesConfig, nil
	}

	logger.Logger.Debug("No roles.config.json found in zip")
	return nil, nil
}

// parseNamespaceContent extracts namespace and User[] relations from TypeScript
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

		// Extract only User[] relations from the related block
		relationRegex := regexp.MustCompile(`(\w+):\s*User\[\]`)
		relationMatches := relationRegex.FindAllStringSubmatch(relatedBlock, -1)

		logger.Logger.Debug("Searching for User[] relations", "class", belongsToClass, "matches_found", len(relationMatches))

		var relations []string
		for _, match := range relationMatches {
			if len(match) >= 2 {
				relation := match[1]
				logger.Logger.Debug("Extracted relation", "class", belongsToClass, "relation", relation)
				relations = append(relations, relation)
			}
		}

		if len(relations) > 0 {
			logger.Logger.Info("Successfully parsed namespace",
				"namespace", belongsToClass,
				"relations", relations)

			allDefinitions = append(allDefinitions, ParsedNamespaceDefinition{
				Namespace: belongsToClass,
				Relations: relations,
			})
		} else {
			logger.Logger.Warn("No User[] relations found in related block", "class", belongsToClass)
		}
	}

	logger.Logger.Info("Parsing complete", "total_namespaces_found", len(allDefinitions))
	return allDefinitions
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

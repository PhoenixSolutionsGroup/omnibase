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
	Namespace        string              `json:"namespace"`
	Relations        []string            `json:"relations"`
	SubjectRelations map[string][]string `json:"subject_relations"` // subject -> relations that accept this subject
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

	// Regex patterns for relation extraction
	// Matches: "relationName: SubjectType[]"
	singleSubjectRegex := regexp.MustCompile(`(\w+):\s*(\w+)\[\]`)
	// Matches: "relationName: (SubjectType1 | SubjectType2 | ...)[]"
	unionSubjectRegex := regexp.MustCompile(`(\w+):\s*\(([^)]+)\)\[\]`)

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

		// Build subject -> relations map
		subjectRelations := make(map[string][]string)
		var allRelations []string

		// First, extract union type relations: "(User | ApiKey)[]"
		unionMatches := unionSubjectRegex.FindAllStringSubmatch(relatedBlock, -1)
		processedRelations := make(map[string]bool)

		for _, match := range unionMatches {
			if len(match) >= 3 {
				relationName := match[1]
				subjectsStr := match[2]
				processedRelations[relationName] = true

				// Parse subjects from union: "User | ApiKey" -> ["User", "ApiKey"]
				subjects := s.parseUnionSubjects(subjectsStr)

				logger.Logger.Debug("Extracted union relation",
					"class", belongsToClass,
					"relation", relationName,
					"subjects", subjects)

				allRelations = append(allRelations, relationName)
				for _, subject := range subjects {
					subjectRelations[subject] = append(subjectRelations[subject], relationName)
				}
			}
		}

		// Then, extract single subject relations: "User[]"
		singleMatches := singleSubjectRegex.FindAllStringSubmatch(relatedBlock, -1)
		for _, match := range singleMatches {
			if len(match) >= 3 {
				relationName := match[1]
				subject := match[2]

				// Skip if already processed as union type
				if processedRelations[relationName] {
					continue
				}

				logger.Logger.Debug("Extracted single-subject relation",
					"class", belongsToClass,
					"relation", relationName,
					"subject", subject)

				allRelations = append(allRelations, relationName)
				subjectRelations[subject] = append(subjectRelations[subject], relationName)
			}
		}

		if len(allRelations) > 0 {
			logger.Logger.Info("Successfully parsed namespace",
				"namespace", belongsToClass,
				"relations_count", len(allRelations),
				"subject_count", len(subjectRelations))

			for subject, relations := range subjectRelations {
				logger.Logger.Debug("Subject relations",
					"namespace", belongsToClass,
					"subject", subject,
					"relations", relations)
			}

			allDefinitions = append(allDefinitions, ParsedNamespaceDefinition{
				Namespace:        belongsToClass,
				Relations:        allRelations,
				SubjectRelations: subjectRelations,
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

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

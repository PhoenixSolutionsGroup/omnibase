package permissions

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"regexp"
	"strings"

	"api/internal/logger"
)

var ParseError = errors.New("Failed to parse namespace files")

type RelationMetadata struct {
	Name        string   `json:"name"`
	DisplayName string   `json:"display_name"`
	Group       *string  `json:"group"`
	SubGroup    *string  `json:"sub_group"`
	Roles       []string `json:"roles"`
	Subjects    []string `json:"subjects"`
}

type ParsedNamespaceDefinition struct {
	Namespace         string              `json:"namespace"`
	Relations         []string            `json:"relations"`
	RelationsMetadata []RelationMetadata  `json:"relations_metadata,omitempty"`
	SubjectRelations  map[string][]string `json:"subject_relations"`
}

type ParsedRoleConfig struct {
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

func ParseNamespaceZip(zipBytes []byte) ([]ParsedNamespaceDefinition, error) {
	logger.Logger.Info("Starting namespace file parsing", "zip_size", len(zipBytes))

	reader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ParseError, err)
	}

	var definitions []ParsedNamespaceDefinition

	for _, file := range reader.File {
		if !strings.HasSuffix(file.Name, ".ts") || file.Name == "types.ts" {
			continue
		}

		rc, err := file.Open()
		if err != nil {
			logger.Logger.Warn("Failed to open file in zip", "file", file.Name, "error", err)
			continue
		}

		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			logger.Logger.Warn("Failed to read file content", "file", file.Name, "error", err)
			continue
		}

		definitions = append(definitions, parseNamespaceContent(string(content))...)
	}

	logger.Logger.Info("Namespace parsing completed", "total_definitions", len(definitions))
	return definitions, nil
}

var (
	relatedRegex         = regexp.MustCompile(`related:\s*\{([^}]+)\}`)
	classRegex           = regexp.MustCompile(`class\s+(\w+)\s+implements\s+Namespace`)
	jsdocRelationRegex   = regexp.MustCompile(`(?s)(/\*\*.*?\*/)?\s*(\w+):\s*(?:\(([^)]+)\)|(\w+))\[\]`)
	groupRegex           = regexp.MustCompile(`@group\s+([^@\n]+)`)
	subGroupRegex        = regexp.MustCompile(`@subGroup\s+([^@\n]+)`)
	displayNameRegex     = regexp.MustCompile(`@displayName\s+([^@\n]+)`)
	roleRegex            = regexp.MustCompile(`@role\s+(\w+)`)
	jsdocStarPrefixRegex = regexp.MustCompile(`(?m)^\s*\*\s?`)
)

func parseNamespaceContent(content string) []ParsedNamespaceDefinition {
	relatedMatches := relatedRegex.FindAllStringSubmatchIndex(content, -1)
	classMatches := classRegex.FindAllStringSubmatch(content, -1)

	var defs []ParsedNamespaceDefinition

	for _, relatedMatch := range relatedMatches {
		relatedStart := relatedMatch[0]
		relatedBlock := content[relatedMatch[2]:relatedMatch[3]]

		var owner string
		lastClassPos := -1
		for _, cm := range classMatches {
			if len(cm) < 2 {
				continue
			}
			pos := strings.Index(content, cm[0])
			if pos < relatedStart && pos > lastClassPos {
				owner = cm[1]
				lastClassPos = pos
			}
		}
		if owner == "" {
			continue
		}

		subjectRelations := map[string][]string{}
		var relations []string
		var metas []RelationMetadata

		for _, m := range jsdocRelationRegex.FindAllStringSubmatch(relatedBlock, -1) {
			jsdocBody := m[1]
			relationName := m[2]
			unionSubjects := m[3]
			singleSubject := m[4]

			var subjects []string
			switch {
			case unionSubjects != "":
				subjects = parseUnionSubjects(unionSubjects)
			case singleSubject != "":
				subjects = []string{singleSubject}
			}

			var group, subGroup, displayName *string
			var roles []string
			if jsdocBody != "" {
				group, subGroup, displayName, roles = parseJSDocTags(jsdocBody)
			}

			finalDisplay := generateDisplayName(relationName)
			if displayName != nil {
				finalDisplay = *displayName
			}

			relations = append(relations, relationName)
			for _, subj := range subjects {
				subjectRelations[subj] = append(subjectRelations[subj], relationName)
			}

			if roles == nil {
				roles = []string{}
			}
			metas = append(metas, RelationMetadata{
				Name:        relationName,
				DisplayName: finalDisplay,
				Group:       group,
				SubGroup:    subGroup,
				Roles:       roles,
				Subjects:    subjects,
			})
		}

		if len(relations) == 0 {
			continue
		}

		defs = append(defs, ParsedNamespaceDefinition{
			Namespace:         owner,
			Relations:         relations,
			RelationsMetadata: metas,
			SubjectRelations:  subjectRelations,
		})
	}

	return defs
}

func parseUnionSubjects(union string) []string {
	parts := strings.Split(union, "|")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		s := strings.TrimSpace(p)
		if s != "" {
			out = append(out, s)
		}
	}
	return out
}

func generateDisplayName(relationName string) string {
	words := strings.Split(relationName, "_")
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(string(w[0])) + strings.ToLower(w[1:])
		}
	}
	return strings.Join(words, " ")
}

func parseJSDocTags(jsdoc string) (group, subGroup, displayName *string, roles []string) {
	cleaned := jsdocStarPrefixRegex.ReplaceAllString(jsdoc, " ")
	cleaned = strings.TrimSpace(cleaned)

	if match := groupRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		if g := strings.TrimSpace(match[1]); g != "" {
			group = &g
		}
	}

	if match := subGroupRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		if sg := strings.TrimSpace(match[1]); sg != "" && group != nil {
			subGroup = &sg
		}
	}

	if match := displayNameRegex.FindStringSubmatch(cleaned); len(match) >= 2 {
		if dn := strings.TrimSpace(match[1]); dn != "" {
			displayName = &dn
		}
	}

	for _, match := range roleRegex.FindAllStringSubmatch(cleaned, -1) {
		if len(match) >= 2 {
			role := strings.ToLower(strings.TrimSpace(match[1]))
			if role != "" {
				roles = append(roles, role)
			}
		}
	}

	return group, subGroup, displayName, roles
}

func BuildRolesFromMetadata(definitions []ParsedNamespaceDefinition) []ParsedRoleConfig {
	rolePerms := map[string][]string{}

	for _, def := range definitions {
		ns := strings.ToLower(def.Namespace)
		for _, rel := range def.RelationsMetadata {
			for _, role := range rel.Roles {
				rolePerms[role] = append(rolePerms[role], fmt.Sprintf("%s#%s", ns, rel.Name))
			}
		}
	}

	out := make([]ParsedRoleConfig, 0, len(rolePerms))
	for role, perms := range rolePerms {
		out = append(out, ParsedRoleConfig{Role: role, Permissions: perms})
	}
	return out
}

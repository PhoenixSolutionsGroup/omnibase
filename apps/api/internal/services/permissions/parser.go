package permissions

import (
	"archive/zip"
	"bytes"
	"errors"
	"fmt"
	"io"
	"path"
	"regexp"
	"sort"
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
	File              string              `json:"file"`
	Relations         []string            `json:"relations"`
	Permits           []string            `json:"permits"`
	RelationsMetadata []RelationMetadata  `json:"relations_metadata,omitempty"`
	SubjectRelations  map[string][]string `json:"subject_relations"`
}

type ParsedRoleConfig struct {
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

type MissingRequirement struct {
	Namespace        string   `json:"namespace"`
	MissingNamespace bool     `json:"missing_namespace"`
	Relations        []string `json:"relations,omitempty"`
	Permits          []string `json:"permits,omitempty"`
}

func ParseNamespaceZip(zipBytes []byte) ([]ParsedNamespaceDefinition, error) {
	logger.Logger.Info("Starting namespace file parsing", "zip_size", len(zipBytes))

	reader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ParseError, err)
	}

	files := map[string]string{}
	for _, file := range reader.File {
		if !strings.HasSuffix(file.Name, ".ts") || path.Base(file.Name) == "types.ts" {
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

		files[path.Base(file.Name)] = string(content)
	}

	definitions := ParseNamespaceFiles(files)
	logger.Logger.Info("Namespace parsing completed", "total_definitions", len(definitions))
	return definitions, nil
}

func ParseNamespaceFiles(files map[string]string) []ParsedNamespaceDefinition {
	names := make([]string, 0, len(files))
	for name := range files {
		names = append(names, name)
	}
	sort.Strings(names)

	definitions := []ParsedNamespaceDefinition{}
	for _, name := range names {
		if path.Base(name) == "types.ts" {
			continue
		}
		for _, def := range parseNamespaceContent(files[name]) {
			def.File = path.Base(name)
			definitions = append(definitions, def)
		}
	}
	return definitions
}

func ValidateRequirements(supplied, required []ParsedNamespaceDefinition) []MissingRequirement {
	byNamespace := map[string]ParsedNamespaceDefinition{}
	for _, def := range supplied {
		byNamespace[def.Namespace] = def
	}

	var missing []MissingRequirement
	for _, req := range required {
		def, ok := byNamespace[req.Namespace]
		if !ok {
			missing = append(missing, MissingRequirement{
				Namespace:        req.Namespace,
				MissingNamespace: true,
			})
			continue
		}

		relations := missingKeys(req.Relations, def.Relations)
		permits := missingKeys(req.Permits, def.Permits)
		if len(relations) == 0 && len(permits) == 0 {
			continue
		}
		missing = append(missing, MissingRequirement{
			Namespace: req.Namespace,
			Relations: relations,
			Permits:   permits,
		})
	}
	return missing
}

func FormatMissing(missing []MissingRequirement) string {
	parts := make([]string, 0, len(missing))
	for _, m := range missing {
		var details []string
		if m.MissingNamespace {
			details = append(details, "namespace missing")
		}
		if len(m.Relations) > 0 {
			details = append(details, "relations missing: "+strings.Join(m.Relations, ", "))
		}
		if len(m.Permits) > 0 {
			details = append(details, "permits missing: "+strings.Join(m.Permits, ", "))
		}
		parts = append(parts, fmt.Sprintf("%s (%s)", m.Namespace, strings.Join(details, "; ")))
	}
	return "namespace requirements not met: " + strings.Join(parts, ", ")
}

func missingKeys(required, supplied []string) []string {
	present := make(map[string]struct{}, len(supplied))
	for _, key := range supplied {
		present[key] = struct{}{}
	}
	var missing []string
	for _, key := range required {
		if _, ok := present[key]; !ok {
			missing = append(missing, key)
		}
	}
	return missing
}

var (
	classRegex           = regexp.MustCompile(`\bclass\s+(\w+)\s+implements\s+Namespace\s*\{`)
	jsdocRelationRegex   = regexp.MustCompile(`(?s)(/\*\*.*?\*/)?\s*(\w+):\s*(?:\(([^)]+)\)|(\w+))\[\]`)
	groupRegex           = regexp.MustCompile(`@group\s+([^@\n]+)`)
	subGroupRegex        = regexp.MustCompile(`@subGroup\s+([^@\n]+)`)
	displayNameRegex     = regexp.MustCompile(`@displayName\s+([^@\n]+)`)
	roleRegex            = regexp.MustCompile(`@role\s+(\w+)`)
	jsdocStarPrefixRegex = regexp.MustCompile(`(?m)^\s*\*\s?`)
)

func parseNamespaceContent(content string) []ParsedNamespaceDefinition {
	var defs []ParsedNamespaceDefinition

	for _, match := range classRegex.FindAllStringSubmatchIndex(content, -1) {
		if len(match) < 4 {
			continue
		}
		owner := content[match[2]:match[3]]
		body, ok := matchBlock(content, match[1]-1)
		if !ok {
			continue
		}

		relations := []string{}
		permits := []string{}
		metas := []RelationMetadata{}
		subjectRelations := map[string][]string{}

		for _, block := range findBlocks(body, "related") {
			for _, m := range jsdocRelationRegex.FindAllStringSubmatch(block, -1) {
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
		}

		for _, block := range findBlocks(body, "permits") {
			permits = append(permits, parsePermitKeys(block)...)
		}

		defs = append(defs, ParsedNamespaceDefinition{
			Namespace:         owner,
			Relations:         relations,
			Permits:           permits,
			RelationsMetadata: metas,
			SubjectRelations:  subjectRelations,
		})
	}

	return defs
}

func findBlocks(content, name string) []string {
	re := regexp.MustCompile(`\b` + regexp.QuoteMeta(name) + `\s*[:=]\s*\{`)
	matches := re.FindAllStringIndex(content, -1)

	blocks := make([]string, 0, len(matches))
	for _, m := range matches {
		block, ok := matchBlock(content, m[1]-1)
		if ok {
			blocks = append(blocks, block)
		}
	}
	return blocks
}

func matchBlock(content string, open int) (string, bool) {
	if open < 0 || open >= len(content) || content[open] != '{' {
		return "", false
	}

	depth := 0
	for i := open; i < len(content); i++ {
		switch content[i] {
		case '"', '\'', '`':
			i = skipString(content, i)
		case '/':
			i = skipComment(content, i)
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return content[open+1 : i], true
			}
		}
	}
	return "", false
}

func skipString(content string, start int) int {
	quote := content[start]
	for i := start + 1; i < len(content); i++ {
		if content[i] == '\\' {
			i++
			continue
		}
		if content[i] == quote {
			return i
		}
	}
	return len(content) - 1
}

func skipComment(content string, start int) int {
	if start+1 >= len(content) {
		return start
	}
	switch content[start+1] {
	case '/':
		for i := start + 2; i < len(content); i++ {
			if content[i] == '\n' {
				return i
			}
		}
		return len(content) - 1
	case '*':
		for i := start + 2; i+1 < len(content); i++ {
			if content[i] == '*' && content[i+1] == '/' {
				return i + 1
			}
		}
		return len(content) - 1
	}
	return start
}

func parsePermitKeys(block string) []string {
	var keys []string
	depthBrace, depthParen, depthBracket := 0, 0, 0
	var prev byte
	i := 0

	for i < len(block) {
		c := block[i]

		switch c {
		case '"', '\'', '`':
			i = skipString(block, i) + 1
			prev = c
			continue
		case '/':
			if i+1 < len(block) && (block[i+1] == '/' || block[i+1] == '*') {
				i = skipComment(block, i) + 1
				continue
			}
		case '{':
			depthBrace++
		case '}':
			depthBrace--
		case '(':
			depthParen++
		case ')':
			depthParen--
		case '[':
			depthBracket++
		case ']':
			depthBracket--
		}

		topLevel := depthBrace == 0 && depthParen == 0 && depthBracket == 0
		if topLevel && isIdentStart(c) && (prev == 0 || prev == ',') {
			j := i + 1
			for j < len(block) && isIdentPart(block[j]) {
				j++
			}
			k := j
			for k < len(block) && (block[k] == ' ' || block[k] == '\t' || block[k] == '\n' || block[k] == '\r') {
				k++
			}
			if k < len(block) && block[k] == ':' {
				keys = append(keys, block[i:j])
				i = k + 1
				prev = ':'
				continue
			}
			prev = block[j-1]
			i = j
			continue
		}

		if !isSpace(c) {
			prev = c
		}
		i++
	}

	return keys
}

func isIdentStart(c byte) bool {
	return c == '_' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')
}

func isIdentPart(c byte) bool {
	return isIdentStart(c) || (c >= '0' && c <= '9')
}

func isSpace(c byte) bool {
	return c == ' ' || c == '\t' || c == '\n' || c == '\r'
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

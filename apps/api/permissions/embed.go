package permissions

import (
	"embed"
	"sort"
	"strings"
	"sync"

	permsvc "api/internal/services/permissions"
)

//go:embed *.ts
var namespaceFiles embed.FS

type File struct {
	Name     string `json:"name"`
	Contents string `json:"contents"`
}

type Requirements struct {
	Files      []File                              `json:"files"`
	Namespaces []permsvc.ParsedNamespaceDefinition `json:"namespaces"`
}

var loadRequirements = sync.OnceValues(func() (*Requirements, error) {
	entries, err := namespaceFiles.ReadDir(".")
	if err != nil {
		return nil, err
	}

	names := make([]string, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".ts") {
			names = append(names, entry.Name())
		}
	}
	sort.Strings(names)

	files := make([]File, 0, len(names))
	contents := make(map[string]string, len(names))
	for _, name := range names {
		raw, err := namespaceFiles.ReadFile(name)
		if err != nil {
			return nil, err
		}
		contents[name] = string(raw)
		files = append(files, File{Name: name, Contents: string(raw)})
	}

	definitions := permsvc.ParseNamespaceFiles(contents)
	sort.Slice(definitions, func(i, j int) bool {
		return definitions[i].Namespace < definitions[j].Namespace
	})

	return &Requirements{Files: files, Namespaces: definitions}, nil
})

func Load() (*Requirements, error) {
	return loadRequirements()
}

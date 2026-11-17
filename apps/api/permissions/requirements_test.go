package permissions

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	permsvc "api/internal/services/permissions"

	"github.com/stretchr/testify/require"
)

func TestEmbeddedNamespaceKeys(t *testing.T) {
	requirements, err := Load()
	require.NoError(t, err)

	byNamespace := map[string]struct {
		relations []string
		permits   []string
	}{}
	for _, def := range requirements.Namespaces {
		byNamespace[def.Namespace] = struct {
			relations []string
			permits   []string
		}{relations: def.Relations, permits: def.Permits}
	}

	tenant, ok := byNamespace["Tenant"]
	require.True(t, ok)
	require.Len(t, tenant.relations, 13)
	require.Len(t, tenant.permits, 13)
	require.Contains(t, tenant.relations, "can_manage_email_templates")
	require.Contains(t, tenant.permits, "manage_email_templates")
	require.Contains(t, tenant.relations, "can_manage_billing")
	require.Contains(t, tenant.permits, "manage_billing")

	storage, ok := byNamespace["StorageObject"]
	require.True(t, ok)
	require.ElementsMatch(t, []string{"read", "delete", "make_public"}, storage.permits)
	require.ElementsMatch(t, []string{"owner", "can_read", "can_delete", "can_make_public", "tenant"}, storage.relations)

	_, ok = byNamespace["User"]
	require.True(t, ok)
}

func TestAPIUsageMatchesEmbeddedNamespaces(t *testing.T) {
	requirements, err := Load()
	require.NoError(t, err)

	byNamespace := map[string]struct {
		relations map[string]struct{}
		permits   map[string]struct{}
	}{}
	for _, def := range requirements.Namespaces {
		require.NotNil(t, def.Relations)
		require.NotNil(t, def.Permits)
		entry := struct {
			relations map[string]struct{}
			permits   map[string]struct{}
		}{relations: map[string]struct{}{}, permits: map[string]struct{}{}}
		for _, relation := range def.Relations {
			entry.relations[relation] = struct{}{}
		}
		for _, permit := range def.Permits {
			entry.permits[permit] = struct{}{}
		}
		byNamespace[def.Namespace] = entry
	}

	var failures []string
	checkPermit := func(namespace, relation string, pos token.Position) {
		def, ok := byNamespace[namespace]
		if !ok {
			failures = append(failures, pos.String()+": namespace "+namespace+" is not embedded in the API")
			return
		}
		if _, ok := def.permits[relation]; !ok {
			failures = append(failures, pos.String()+": permit "+namespace+"#"+relation+" is not in the embedded namespaces")
		}
	}
	checkRelation := func(namespace, relation string, pos token.Position) {
		def, ok := byNamespace[namespace]
		if !ok {
			failures = append(failures, pos.String()+": namespace "+namespace+" is not embedded in the API")
			return
		}
		if _, ok := def.relations[relation]; !ok {
			failures = append(failures, pos.String()+": relation "+namespace+"#"+relation+" is not in the embedded namespaces")
		}
	}

	fset := token.NewFileSet()
	err = filepath.WalkDir("../internal", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
			return nil
		}

		file, err := parser.ParseFile(fset, path, nil, 0)
		if err != nil {
			return err
		}

		ast.Inspect(file, func(node ast.Node) bool {
			call, ok := node.(*ast.CallExpr)
			if !ok {
				return true
			}
			pos := fset.Position(call.Pos())

			switch fun := call.Fun.(type) {
			case *ast.Ident:
				if fun.Name == "tenantPermission" && len(call.Args) == 1 {
					if relation, ok := stringLiteral(call.Args[0]); ok {
						checkPermit("Tenant", relation, pos)
					}
				}
			case *ast.SelectorExpr:
				if fun.Sel.Name == "Check" && isIdent(fun.X, "authz") && len(call.Args) >= 8 {
					namespace, nsOK := stringLiteral(call.Args[5])
					relation, relOK := stringLiteral(call.Args[7])
					if nsOK && relOK {
						checkPermit(namespace, relation, pos)
					}
				}
				if (fun.Sel.Name == "Create" || fun.Sel.Name == "Delete") && isPermsReceiver(fun.X) && len(call.Args) >= 4 {
					namespace, nsOK := stringLiteral(call.Args[1])
					relation, relOK := stringLiteral(call.Args[3])
					if nsOK && relOK {
						checkRelation(namespace, relation, pos)
					}
				}
			}
			return true
		})
		return nil
	})
	require.NoError(t, err)
	require.Empty(t, failures, strings.Join(failures, "\n"))
}

func isIdent(expr ast.Expr, name string) bool {
	ident, ok := expr.(*ast.Ident)
	return ok && ident.Name == name
}

func isPermsReceiver(expr ast.Expr) bool {
	selector, ok := expr.(*ast.SelectorExpr)
	return ok && selector.Sel.Name == "perms"
}

func stringLiteral(expr ast.Expr) (string, bool) {
	lit, ok := expr.(*ast.BasicLit)
	if !ok || lit.Kind != token.STRING {
		return "", false
	}
	value, err := strconv.Unquote(lit.Value)
	if err != nil {
		return "", false
	}
	return value, true
}

func TestKetoTestFixtureMatchesEmbeddedNamespaces(t *testing.T) {
	fixturePath := filepath.Join("..", "tests", "fixtures", "keto-namespaces", "permissions.ts")
	content, err := os.ReadFile(fixturePath)
	require.NoError(t, err)

	embedded, err := Load()
	require.NoError(t, err)

	fixture := permsvc.ParseNamespaceFiles(map[string]string{"permissions.ts": string(content)})

	byNamespace := func(definitions []permsvc.ParsedNamespaceDefinition) map[string]permsvc.ParsedNamespaceDefinition {
		out := make(map[string]permsvc.ParsedNamespaceDefinition, len(definitions))
		for _, def := range definitions {
			out[def.Namespace] = def
		}
		return out
	}

	required := byNamespace(embedded.Namespaces)
	supplied := byNamespace(fixture)

	require.Len(t, supplied, len(required), "test fixture namespaces differ from the embedded files")
	for namespace, requiredDef := range required {
		suppliedDef, ok := supplied[namespace]
		require.Truef(t, ok, "test fixture is missing namespace %s", namespace)

		require.ElementsMatchf(t, requiredDef.Relations, suppliedDef.Relations, "namespace %s relations differ", namespace)
		require.ElementsMatchf(t, requiredDef.Permits, suppliedDef.Permits, "namespace %s permits differ", namespace)

		requiredMeta := metadataByName(requiredDef.RelationsMetadata)
		suppliedMeta := metadataByName(suppliedDef.RelationsMetadata)
		require.Len(t, suppliedMeta, len(requiredMeta), "namespace %s relation metadata differs", namespace)
		for name, requiredRelation := range requiredMeta {
			suppliedRelation, ok := suppliedMeta[name]
			require.Truef(t, ok, "test fixture is missing relation metadata for %s#%s", namespace, name)
			require.Equalf(t, requiredRelation.DisplayName, suppliedRelation.DisplayName, "namespace %s relation %s display name differs", namespace, name)
			require.Equalf(t, requiredRelation.Group, suppliedRelation.Group, "namespace %s relation %s group differs", namespace, name)
			require.Equalf(t, requiredRelation.SubGroup, suppliedRelation.SubGroup, "namespace %s relation %s subgroup differs", namespace, name)
			require.ElementsMatchf(t, requiredRelation.Roles, suppliedRelation.Roles, "namespace %s relation %s roles differ", namespace, name)
			require.ElementsMatchf(t, requiredRelation.Subjects, suppliedRelation.Subjects, "namespace %s relation %s subjects differ", namespace, name)
		}
	}
}

func metadataByName(metadata []permsvc.RelationMetadata) map[string]permsvc.RelationMetadata {
	out := make(map[string]permsvc.RelationMetadata, len(metadata))
	for _, relation := range metadata {
		out[relation.Name] = relation
	}
	return out
}

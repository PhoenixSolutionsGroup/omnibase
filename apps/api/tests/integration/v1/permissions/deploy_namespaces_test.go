package permissions_test

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

func cleanupNamespaceFixtures(t *testing.T, env *testenv.Env) {
	t.Helper()
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, env.PostgresDSN)
	require.NoError(t, err)
	defer pool.Close()

	_, err = pool.Exec(ctx, `DELETE FROM permissions.role_templates WHERE role_name IN ('doc_owner','doc_editor')`)
	require.NoError(t, err)
	_, err = pool.Exec(ctx, `DELETE FROM permissions.definitions WHERE namespace = 'Doc'`)
	require.NoError(t, err)
}

func buildNamespaceZip(t *testing.T, exclude ...string) []byte {
	t.Helper()

	excluded := map[string]struct{}{}
	for _, name := range exclude {
		excluded[name] = struct{}{}
	}

	entries := map[string][]byte{}
	namespacesDir := filepath.Join("..", "..", "..", "..", "permissions")
	files, err := os.ReadDir(namespacesDir)
	require.NoError(t, err)
	for _, file := range files {
		if file.IsDir() || !strings.HasSuffix(file.Name(), ".ts") {
			continue
		}
		if _, skip := excluded[file.Name()]; skip {
			continue
		}
		content, err := os.ReadFile(filepath.Join(namespacesDir, file.Name()))
		require.NoError(t, err)
		entries[file.Name()] = content
	}

	doc, err := os.ReadFile(filepath.Join("..", "..", "..", "fixtures", "namespaces", "doc.ts"))
	require.NoError(t, err)
	entries["doc.ts"] = doc

	var buf bytes.Buffer
	zw := zip.NewWriter(&buf)
	for name, content := range entries {
		f, err := zw.Create(name)
		require.NoError(t, err)
		_, err = f.Write(content)
		require.NoError(t, err)
	}
	require.NoError(t, zw.Close())
	return buf.Bytes()
}

func postMultipart(t *testing.T, path string, fieldName, filename string, content []byte) *http.Response {
	t.Helper()
	var body bytes.Buffer
	w := multipart.NewWriter(&body)

	if content != nil {
		fw, err := w.CreateFormFile(fieldName, filename)
		require.NoError(t, err)
		_, err = fw.Write(content)
		require.NoError(t, err)
	}
	require.NoError(t, w.Close())

	return testenv.APIRequest(t, http.MethodPost, path, body.Bytes(), map[string]string{
		"Content-Type": w.FormDataContentType(),
	})
}

func TestDeployNamespaces(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	t.Cleanup(func() { cleanupNamespaceFixtures(t, env) })

	t.Run("valid zip returns 200 with parsed roles", func(t *testing.T) {
		zipBytes := buildNamespaceZip(t)
		resp := postMultipart(t, "/api/v1/permissions/namespaces", "namespaces", "namespaces.zip", zipBytes)
		defer resp.Body.Close()
		require.Equal(t, http.StatusOK, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var out struct {
			Message     string `json:"message"`
			TenantID    string `json:"tenant_id"`
			Path        string `json:"path"`
			ManagedMode bool   `json:"managed_mode"`
			RolesSynced *int   `json:"roles_synced"`
		}
		require.NoError(t, json.Unmarshal(body, &out))
		assert.Equal(t, "Namespaces deployed successfully", out.Message)
		assert.NotEmpty(t, out.TenantID)
		assert.Equal(t, "internal/permissions.zip", out.Path)
		require.NotNil(t, out.RolesSynced, "roles_synced set when @role annotations present")
		assert.GreaterOrEqual(t, *out.RolesSynced, 2, "owner + admin synced")
	})

	t.Run("missing required namespace returns 400 naming it", func(t *testing.T) {
		zipBytes := buildNamespaceZip(t, "storage.ts")
		resp := postMultipart(t, "/api/v1/permissions/namespaces", "namespaces", "namespaces.zip", zipBytes)
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
		assert.Contains(t, string(body), "StorageObject")
		assert.Contains(t, string(body), "namespace missing")
	})

	t.Run("missing file returns 422", func(t *testing.T) {
		resp := postMultipart(t, "/api/v1/permissions/namespaces", "namespaces", "", nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("non-zip file returns 400", func(t *testing.T) {
		resp := postMultipart(t, "/api/v1/permissions/namespaces", "namespaces", "notes.txt", []byte("hello"))
		defer resp.Body.Close()
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

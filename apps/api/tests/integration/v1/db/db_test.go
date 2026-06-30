package db_test

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"api/tests/testenv"
)

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

func TestDBMigrationsStatus(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("status returns array", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/database/migrations/status", nil, nil)
		defer resp.Body.Close()
		require.Equal(t, http.StatusOK, resp.StatusCode)

		body, err := io.ReadAll(resp.Body)
		require.NoError(t, err)

		var out []map[string]any
		require.NoError(t, json.Unmarshal(body, &out), "response is JSON array")
	})
}

func TestDBMigrationsApplyValidation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("missing file returns 422", func(t *testing.T) {
		resp := postMultipart(t, "/api/v1/database/migrations", "migrations", "", nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("empty file returns 400", func(t *testing.T) {
		resp := postMultipart(t, "/api/v1/database/migrations", "migrations", "empty.zip", []byte{})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

func TestDBMigrationsDownValidation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("missing steps returns 422", func(t *testing.T) {
		resp := postMultipart(t, "/api/v1/database/migrations/down", "migrations", "noop.zip", []byte{1, 2})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})

	t.Run("non-numeric steps returns 400", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		fw, err := w.CreateFormFile("migrations", "noop.zip")
		require.NoError(t, err)
		_, err = fw.Write([]byte{1, 2})
		require.NoError(t, err)
		require.NoError(t, w.WriteField("steps", "abc"))
		require.NoError(t, w.Close())
		resp := testenv.APIRequest(t, http.MethodPost, "/api/v1/database/migrations/down", body.Bytes(), map[string]string{
			"Content-Type": w.FormDataContentType(),
		})
		defer resp.Body.Close()
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)
	})
}

func TestDBTypegenValidation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in -short")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)

	t.Run("unsupported language returns 422", func(t *testing.T) {
		resp := testenv.APIRequest(t, http.MethodGet, "/api/v1/database/typegen?language=cobol", nil, nil)
		defer resp.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, resp.StatusCode)
	})
}

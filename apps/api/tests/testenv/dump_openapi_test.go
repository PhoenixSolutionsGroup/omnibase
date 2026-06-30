package testenv_test

import (
	"io"
	"net/http"
	"os"
	"testing"

	"api/tests/testenv"
)

func TestDumpOpenAPI(t *testing.T) {
	out := os.Getenv("OPENAPI_DUMP_PATH")
	if out == "" {
		t.Skip("set OPENAPI_DUMP_PATH=<file> to dump spec")
	}

	env := testenv.Start(t)
	testenv.StartAPI(t, env)
	resp := testenv.APIRequest(t, http.MethodGet, "/openapi.json", nil, nil)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("openapi.json status=%d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}
	if err := os.WriteFile(out, body, 0644); err != nil {
		t.Fatalf("write %s: %v", out, err)
	}
}

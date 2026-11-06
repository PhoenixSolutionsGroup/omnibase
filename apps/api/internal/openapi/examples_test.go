package openapi

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/danielgtaylor/huma/v2"
)

func exampleBody(t *testing.T, example any) map[string]any {
	t.Helper()

	raw, err := json.Marshal(example)
	if err != nil {
		t.Fatalf("marshal example: %v", err)
	}

	var body map[string]any
	if err := json.Unmarshal(raw, &body); err != nil {
		t.Fatalf("unmarshal example: %v", err)
	}

	return body
}

func TestAddErrorExamplesMatchesErrorModelOutput(t *testing.T) {
	doc := &huma.OpenAPI{
		Paths: map[string]*huma.PathItem{
			"/things": {
				Post: &huma.Operation{
					Responses: map[string]*huma.Response{
						"200": {Description: "OK"},
						"404": {
							Description: "Not Found",
							Content: map[string]*huma.MediaType{
								"application/problem+json": {},
							},
						},
						"422": {
							Description: "Unprocessable Entity",
							Content: map[string]*huma.MediaType{
								"application/problem+json": {},
							},
						},
					},
				},
			},
		},
	}

	AddErrorExamples(doc)

	notFound := exampleBody(t, doc.Paths["/things"].Post.Responses["404"].Content["application/problem+json"].Example)
	if notFound["status"].(float64) != http.StatusNotFound {
		t.Fatalf("expected status 404, got %v", notFound["status"])
	}
	if notFound["title"] != "Not Found" {
		t.Fatalf("expected title Not Found, got %v", notFound["title"])
	}
	for _, omitted := range []string{"type", "instance", "errors"} {
		if _, ok := notFound[omitted]; ok {
			t.Fatalf("expected %q to be omitted, got %v", omitted, notFound[omitted])
		}
	}

	validation := exampleBody(t, doc.Paths["/things"].Post.Responses["422"].Content["application/problem+json"].Example)
	details, ok := validation["errors"].([]any)
	if !ok || len(details) == 0 {
		t.Fatalf("expected 422 example to include error details, got %v", validation["errors"])
	}
}

func TestAddErrorExamplesSkipsSuccessResponses(t *testing.T) {
	doc := &huma.OpenAPI{
		Paths: map[string]*huma.PathItem{
			"/things": {
				Get: &huma.Operation{
					Responses: map[string]*huma.Response{
						"200": {
							Description: "OK",
							Content: map[string]*huma.MediaType{
								"application/json": {},
							},
						},
					},
				},
			},
		},
	}

	AddErrorExamples(doc)

	if doc.Paths["/things"].Get.Responses["200"].Content["application/json"].Example != nil {
		t.Fatal("expected success responses to be left unchanged")
	}
}

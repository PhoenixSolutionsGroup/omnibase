package openapi

import (
	"net/http"
	"strconv"

	"github.com/danielgtaylor/huma/v2"
)

var errorMessages = map[int]string{
	http.StatusBadRequest:          "The request could not be processed.",
	http.StatusUnauthorized:        "Authentication required.",
	http.StatusForbidden:           "Insufficient permissions.",
	http.StatusNotFound:            "The requested resource was not found.",
	http.StatusConflict:            "The resource already exists.",
	http.StatusUnprocessableEntity: "Validation failed.",
	http.StatusTooManyRequests:     "Rate limit exceeded.",
	http.StatusInternalServerError: "Internal server error.",
}

func AddErrorExamples(doc *huma.OpenAPI) {
	for _, path := range doc.Paths {
		for _, operation := range operations(path) {
			if operation == nil {
				continue
			}

			for status, response := range operation.Responses {
				code, err := strconv.Atoi(status)
				if err != nil || code < http.StatusBadRequest || response == nil {
					continue
				}

				example := errorExample(code)
				for _, media := range response.Content {
					if media != nil && media.Example == nil {
						media.Example = example
					}
				}
			}
		}
	}
}

func errorExample(code int) huma.StatusError {
	message := errorMessages[code]
	if message == "" {
		message = http.StatusText(code)
	}

	if code == http.StatusUnprocessableEntity {
		return huma.NewError(code, message, &huma.ErrorDetail{
			Message:  "expected required property path to be present",
			Location: "body.path",
		})
	}

	return huma.NewError(code, message)
}

func operations(path *huma.PathItem) []*huma.Operation {
	return []*huma.Operation{
		path.Get,
		path.Put,
		path.Post,
		path.Delete,
		path.Options,
		path.Head,
		path.Patch,
		path.Trace,
	}
}

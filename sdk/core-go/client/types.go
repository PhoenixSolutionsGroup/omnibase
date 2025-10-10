package omnibase

// ApiResponse represents the standard API response structure
type ApiResponse[T any] struct {
	// Data contains the response payload (present only on successful operations)
	Data *T `json:"data,omitempty"`

	// Status is the HTTP status code
	Status int `json:"status"`

	// Error contains the error message (present only when operation fails)
	Error string `json:"error,omitempty"`
}

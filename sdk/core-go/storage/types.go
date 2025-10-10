package storage

// UploadOptions contains options for uploading files
type UploadOptions struct {
	// Metadata is custom metadata to attach to the file
	// This will be stored in the JSONB metadata column
	Metadata map[string]any
}

// UploadResult contains the result of an upload operation
type UploadResult struct {
	// UploadURL is the pre-signed URL for uploading the file
	UploadURL string `json:"upload_url"`

	// Path is the full path where the file will be stored (includes tenant_id prefix)
	Path string `json:"path"`
}

// DownloadResult contains the result of a download operation
type DownloadResult struct {
	// DownloadURL is the pre-signed URL for downloading the file
	DownloadURL string `json:"download_url"`
}

// uploadRequest is the request body for requesting an upload URL
type UploadRequest struct {
	Bucket   string         `json:"bucket"`
	Path     string         `json:"path"`
	Metadata map[string]any `json:"metadata"`
}

// downloadRequest is the request body for requesting a download URL
type DownloadRequest struct {
	Bucket string `json:"bucket"`
	Path   string `json:"path"`
}

// deleteRequest is the request body for deleting a file
type DeleteRequest struct {
	Bucket string `json:"bucket"`
	Path   string `json:"path"`
}

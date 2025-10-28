package permissions

// Common types and helpers for permissions operations
// Most types are provided by the Ory Keto Go client SDK

// RelationTuple represents a relationship between a subject and an object
// This is an alias for the Keto RelationQuery type used in queries
type RelationQuery struct {
	// Namespace of the relationship
	Namespace string
	// Object of the relationship
	Object string
	// Relation of the relationship
	Relation string
	// SubjectID for direct subject relationships
	SubjectID *string
	// SubjectSet for subject set relationships
	SubjectSet *SubjectSet
}

// SubjectSet represents a subject set in a relationship
type SubjectSet struct {
	// Namespace of the subject set
	Namespace string
	// Object of the subject set
	Object string
	// Relation of the subject set
	Relation string
}

// PermissionCheck represents a permission check query
type PermissionCheck struct {
	// Namespace of the relationship
	Namespace string
	// Object of the relationship
	Object string
	// Relation to check
	Relation string
	// SubjectID to check permission for
	SubjectID *string
	// SubjectSet to check permission for (alternative to SubjectID)
	SubjectSet *SubjectSet
	// MaxDepth limits the depth of the permission tree expansion
	MaxDepth *int64
}

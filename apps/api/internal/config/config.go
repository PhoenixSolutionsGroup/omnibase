package config

import (
	"api/internal/logger"
	"os"
	"strconv"
)

type Config struct {
	Port                 string
	S3Config             S3Config
	Database             DatabaseConfig
	StripeConfig         StripeConfig
	AuthConfig           AuthConfig
	SMTPConfig           SMTPConfig
	PermissionsConfig    PermissionsConfig
	ManagedHostingConfig ManagedHostingConfig
	PostgRESTURL         string
	JWTSecret            string
	EncryptionMasterKey  string
}

type ManagedHostingConfig struct {
	IsManaged            bool
	ManagedHostingAPIURL string
	InternalServiceToken string
	TenantID             string
}

type PermissionsConfig struct {
	ReadURL  string
	WriteURL string
}

type S3Config struct {
	Endpoint       string
	PublicEndpoint string
	AccessKey      string
	SecretKey      string
	BucketName     string
	Region         string
	UseSSL         bool
	ForcePathStyle bool
}

type DatabaseConfig struct {
	Host       string
	Port       string
	User       string
	SigningKey string
	Password   string
	SSLMode    string
	Name       string
}

type StripeConfig struct {
	SecretKey          string
	StripeAccountID    string
	PlatformFeePercent float64
	WebhookSecret      string
}

type AuthConfig struct {
	AuthURL      string
	AuthAdminURL string
	AuthJWTJWKS  string
}

type SMTPConfig struct {
	ConnectionURI string
	FromEmail     string
	FrontendURL   string
}

func New() *Config {
	logger.Logger.Info("Loading application configuration from environment variables")

	return &Config{
		Port: getEnvOrDefault("PORT", "8080"),
		S3Config: S3Config{
			Endpoint:       os.Getenv("S3_ENDPOINT"),
			PublicEndpoint: getEnvOrDefault("S3_PUBLIC_ENDPOINT", os.Getenv("S3_ENDPOINT")),
			AccessKey:      os.Getenv("S3_ACCESS_KEY"),
			SecretKey:      os.Getenv("S3_SECRET_KEY"),
			BucketName:     os.Getenv("S3_BUCKET_NAME"),
			Region:         os.Getenv("S3_REGION"),
			UseSSL:         os.Getenv("S3_USE_SSL") == "true",
			ForcePathStyle: os.Getenv("S3_FORCE_PATH_STYLE") == "true",
		},
		Database: DatabaseConfig{
			Host:       os.Getenv("DB_HOST"),
			Port:       os.Getenv("DB_PORT"),
			User:       os.Getenv("DB_USER"),
			Password:   os.Getenv("DB_PASSWORD"),
			SigningKey: os.Getenv("JWT_SIGNING_KEY"),
			SSLMode:    getEnvOrDefault("DB_SSLMODE", "disable"),
			Name:       getEnvOrDefault("DB_NAME", "db"),
		},
		StripeConfig: StripeConfig{
			SecretKey:          os.Getenv("STRIPE_SECRET_KEY"),
			StripeAccountID:    os.Getenv("STRIPE_ACCOUNT_ID"),
			PlatformFeePercent: getFloat64Env("PLATFORM_FEE_PERCENT", 0),
		},
		AuthConfig: AuthConfig{
			AuthURL:      os.Getenv("AUTH_URL"),
			AuthAdminURL: os.Getenv("AUTH_ADMIN_URL"),
			AuthJWTJWKS:  os.Getenv("AUTH_JWT_JWKS"),
		},
		SMTPConfig: SMTPConfig{
			ConnectionURI: os.Getenv("SMTP_CONNECTION_URI"),
			FromEmail:     os.Getenv("SMTP_FROM_EMAIL"),
			FrontendURL:   os.Getenv("FRONTEND_URL"),
		},
		PermissionsConfig: PermissionsConfig{
			ReadURL:  os.Getenv("PERMISSIONS_READ_URL"),
			WriteURL: os.Getenv("PERMISSIONS_WRITE_URL"),
		},
		ManagedHostingConfig: ManagedHostingConfig{
			IsManaged:            os.Getenv("OMNIBASE_MANAGED") == "true",
			ManagedHostingAPIURL: os.Getenv("MANAGED_HOSTING_API_URL"),
			InternalServiceToken: os.Getenv("INTERNAL_SERVICE_TOKEN"),
			TenantID:             getEnvOrDefault("MANAGED_TENANT_ID", "local"),
		},
		PostgRESTURL:        getEnvOrDefault("POSTGREST_URL", "http://localhost:3000"),
		JWTSecret:           os.Getenv("JWT_SECRET"),
		EncryptionMasterKey: os.Getenv("ENCRYPTION_MASTER_KEY"),
	}
}

func getEnvOrDefault(key string, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		logger.Logger.Trace("Loaded config from environment", "key", key)
		return value
	}
	logger.Logger.Debug("Using default value for config", "key", key, "default", defaultValue)
	return defaultValue
}

func getFloat64Env(key string, defaultValue float64) float64 {
	envValue := os.Getenv(key)
	value, err := strconv.ParseFloat(envValue, 64)
	if err != nil {
		logger.Logger.Debug("Failed to parse float64 env var, using default", "key", key, "value", envValue, "default", defaultValue, "error", err)
		return defaultValue
	}
	logger.Logger.Trace("Loaded float64 config from environment", "key", key, "value", value)
	return value
}

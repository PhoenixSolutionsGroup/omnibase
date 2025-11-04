package database

import (
	"api/internal/config"
	"api/internal/logger"
	"fmt"
	"sync"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	instance *gorm.DB
	once     sync.Once
	initErr  error
)

func GetConnection(cfg config.DatabaseConfig) (*gorm.DB, error) {
	once.Do(func() {
		logger.Logger.Info("Initializing database connection")
		instance, initErr = newConnection(cfg)
		if initErr != nil {
			logger.Logger.Error("Failed to initialize database connection", "error", initErr)
			panic(initErr)
		}
		logger.Logger.Info("Database connection established successfully")

		db, _ := instance.DB()
		logger.Logger.Debug("Configuring database connection pool",
			"max_idle_conns", 10,
			"max_open_conns", 100,
			"conn_max_lifetime", time.Hour,
			"conn_max_idle_time", 10*time.Minute)
		db.SetMaxIdleConns(10)
		db.SetMaxOpenConns(100)
		db.SetConnMaxLifetime(time.Hour)
		db.SetConnMaxIdleTime(10 * time.Minute)
		logger.Logger.Info("Database connection pool configured")
	})

	return instance, initErr
}

func newConnection(cfg config.DatabaseConfig) (*gorm.DB, error) {
	logger.Logger.Debug("Creating database connection",
		"host", cfg.Host,
		"port", cfg.Port,
		"user", cfg.User,
		"database", cfg.Name,
		"sslmode", cfg.SSLMode)

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Logger.Error("Failed to open database connection", "host", cfg.Host, "database", cfg.Name, "error", err)
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	logger.Logger.Info("Database connection opened successfully", "database", cfg.Name)
	return db, nil
}

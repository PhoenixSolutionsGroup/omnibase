package main

import (
	"api/internal/config"
	"api/internal/logger"
	"api/internal/server"
)

func main() {
	logger.Logger.Info("Starting API server")

	logger.Logger.Debug("Loading configuration")
	cfg := config.New()

	r := server.New(cfg)

	logger.Logger.Info("Starting HTTP server", "port", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		logger.Logger.Error("Failed to start server", "port", cfg.Port, "error", err)
		panic(err)
	}
}

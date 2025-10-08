package logger

import (
	"log/slog"
	"os"
)

var Logger *slog.Logger

func init() {
	var level slog.Level
	switch os.Getenv("LOG_LEVEL") {
	case "DEBUG":
		level = slog.LevelDebug
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{Level: level}
	Logger = slog.New(slog.NewJSONHandler(os.Stdout, opts))
}

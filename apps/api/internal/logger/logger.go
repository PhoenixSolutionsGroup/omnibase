package logger

import (
	"context"
	"fmt"
	"io"
	"log"
	"log/slog"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var Logger *slog.Logger

// Custom level for TRACE (lower than DEBUG)
const LevelTrace = slog.Level(-8)

// PrettyHandler wraps a JSON handler and provides human-readable console output
type PrettyHandler struct {
	jsonHandler slog.Handler
	opts        *slog.HandlerOptions
	groups      []string
}

func NewPrettyHandler(w io.Writer, opts *slog.HandlerOptions) *PrettyHandler {
	if opts == nil {
		opts = &slog.HandlerOptions{}
	}
	return &PrettyHandler{
		jsonHandler: slog.NewJSONHandler(w, opts),
		opts:        opts,
	}
}

func (h *PrettyHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.jsonHandler.Enabled(ctx, level)
}

func (h *PrettyHandler) Handle(ctx context.Context, r slog.Record) error {
	// Print pretty format to stderr for console viewing
	h.printPretty(r)

	// Don't write JSON when using pretty handler
	return nil
}

func (h *PrettyHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return &PrettyHandler{
		jsonHandler: h.jsonHandler.WithAttrs(attrs),
		opts:        h.opts,
		groups:      h.groups,
	}
}

func (h *PrettyHandler) WithGroup(name string) slog.Handler {
	return &PrettyHandler{
		jsonHandler: h.jsonHandler.WithGroup(name),
		opts:        h.opts,
		groups:      append(h.groups, name),
	}
}

func (h *PrettyHandler) printPretty(r slog.Record) {
	// Color codes for different log levels
	var levelColor string
	var levelStr string
	switch {
	case r.Level < slog.LevelDebug:
		levelColor = "\033[90m" // Gray for TRACE
		levelStr = "TRACE"
	case r.Level == slog.LevelDebug:
		levelColor = "\033[36m" // Cyan
		levelStr = "DEBUG"
	case r.Level == slog.LevelInfo:
		levelColor = "\033[32m" // Green
		levelStr = "INFO"
	case r.Level == slog.LevelWarn:
		levelColor = "\033[33m" // Yellow
		levelStr = "WARN"
	case r.Level >= slog.LevelError:
		levelColor = "\033[31m" // Red
		levelStr = "ERROR"
	default:
		levelColor = "\033[0m" // Reset
		levelStr = r.Level.String()
	}
	reset := "\033[0m"

	// Extract source and other attributes
	var source string
	var attrs []string

	r.Attrs(func(a slog.Attr) bool {
		// Extract source information if AddSource was enabled
		if a.Key == slog.SourceKey {
			if src, ok := a.Value.Any().(*slog.Source); ok {
				// Get just the function name (last part after last dot)
				funcParts := strings.Split(src.Function, ".")
				if len(funcParts) > 0 {
					source = funcParts[len(funcParts)-1]
				}
			}
		} else {
			// Collect other attributes for inline display
			attrs = append(attrs, fmt.Sprintf("%s=%v", a.Key, a.Value))
		}
		return true
	})

	// Build the pretty output
	var sb strings.Builder

	// [LEVEL]
	sb.WriteString(fmt.Sprintf("%s[%-5s]%s ", levelColor, levelStr, reset))

	// [SOURCE]
	if source != "" {
		sb.WriteString(fmt.Sprintf("[%s] ", source))
	}

	// Message
	sb.WriteString(r.Message)

	// Add attributes inline
	if len(attrs) > 0 {
		sb.WriteString(" ")
		sb.WriteString(strings.Join(attrs, " "))
	}

	fmt.Fprintln(os.Stderr, sb.String())
}

func init() {
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found or error loading it: %v", err)
	}

	var level slog.Level
	switch os.Getenv("LOG_LEVEL") {
	case "TRACE":
		level = LevelTrace
	case "DEBUG":
		level = slog.LevelDebug
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level:     level,
		AddSource: true, // Enable source tracking for [MODULE/FN]
	}

	// Use pretty handler if running in development, JSON only in production
	if os.Getenv("LOG_FORMAT") == "pretty" || os.Getenv("ENV") == "development" {
		Logger = slog.New(NewPrettyHandler(os.Stdout, opts))
	} else {
		Logger = slog.New(slog.NewJSONHandler(os.Stdout, opts))
	}
}

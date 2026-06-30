package main

import (
	"encoding/json"
	"fmt"
	"os"

	"api/internal/config"
	"api/internal/server"
	v1_routes "api/internal/routes/v1"

	"github.com/gin-gonic/gin"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "usage: openapi <out.json>")
		os.Exit(1)
	}
	out := os.Args[1]

	gin.SetMode(gin.ReleaseMode)

	if os.Getenv("SMTP_CONNECTION_URI") == "" {
		os.Setenv("SMTP_CONNECTION_URI", "smtp://localhost")
	}

	r := gin.New()
	api := server.BuildAPI(r, v1_routes.Deps{Cfg: config.New(), Pool: nil})

	spec, err := json.MarshalIndent(api.OpenAPI(), "", "  ")
	if err != nil {
		fmt.Fprintf(os.Stderr, "marshal openapi: %v\n", err)
		os.Exit(1)
	}
	if err := os.WriteFile(out, spec, 0644); err != nil {
		fmt.Fprintf(os.Stderr, "write %s: %v\n", out, err)
		os.Exit(1)
	}
	fmt.Printf("✓ wrote %s\n", out)
}

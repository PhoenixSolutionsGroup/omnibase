ARG VERSION=local

# Build stage
FROM golang:1.25.5-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

COPY sdk/core/go /sdk/core/go

COPY apps/api/go.mod apps/api/go.sum ./
RUN go mod download

COPY apps/api ./

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /build/api \
    ./cmd/server

# Final stage
FROM scratch

# Copy ca-certificates from builder (needed for HTTPS requests)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy timezone data (if your app needs it)
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copy the binary
COPY --from=builder /build/api /api

# Copy static files (schemas)
COPY --from=builder /build/internal/static /internal/static

ARG VERSION=local
ENV API_VERSION=$VERSION

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["/api"]

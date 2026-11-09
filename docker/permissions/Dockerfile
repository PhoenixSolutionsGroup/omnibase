FROM oryd/keto:v25.4.0

USER root

# Install AWS CLI for S3-compatible storage (R2) and unzip
RUN apk add --no-cache aws-cli unzip

# Build from the repo root so the API-owned namespace files are the only copy.
COPY docker/permissions/permissions.yml /etc/config/permissions/permissions.yml
COPY apps/api/permissions/*.ts /etc/config/permissions/namespaces/
RUN rm -f /etc/config/permissions/namespaces/types.ts

# Copy entrypoint script
COPY docker/permissions/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R ory:ory /etc/config/permissions

USER ory

# Expose ports
EXPOSE 4466 4467

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command (can be overridden)
CMD ["serve", "--config", "/etc/config/permissions/permissions.yml"]

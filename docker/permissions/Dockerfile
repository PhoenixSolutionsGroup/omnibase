FROM oryd/keto:v25.4.0

USER root

# Install AWS CLI for S3-compatible storage (R2) and unzip
RUN apk add --no-cache aws-cli unzip

# Build from the repo root so the API-owned namespace files are the only copy.
COPY docker/permissions/permissions.yml /etc/config/permissions/permissions.yml
COPY apps/api/permissions/*.ts /tmp/namespaces/
RUN mkdir -p /etc/config/permissions/namespaces && \
    for f in /tmp/namespaces/*.ts; do \
      [ "$(basename "$f")" = "types.ts" ] && continue; \
      sed -e '/^import type .* from .*$/d' -e '/^import .* from .*$/d' -e 's/^export class /class /' "$f" >> /etc/config/permissions/namespaces/permissions.ts; \
      printf '\n\n' >> /etc/config/permissions/namespaces/permissions.ts; \
    done && \
    rm -rf /tmp/namespaces

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

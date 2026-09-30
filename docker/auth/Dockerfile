FROM oryd/kratos:v25.4.0

# Install envsubst (part of gettext package), curl for template downloads,
# and yq to hand the rendered config to kratos as env vars
USER root
RUN apk add --no-cache gettext curl yq-go

# Copy default config (can be overridden via volume mounts)
COPY auth.tmpl.yml /etc/config/auth/auth.tmpl.yml
COPY oidc/ /etc/config/auth/oidc/
COPY identity.schema.json /etc/config/auth/identity.schema.json

COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

USER 10000

# Expose ports
EXPOSE 4433 4434

# Use custom entrypoint for config templating/initialization
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["serve", "--config", "/etc/config/auth/auth.yml"]
